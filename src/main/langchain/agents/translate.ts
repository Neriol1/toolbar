import { ChatConfig, createLLM, LLMType } from "..";
import { z } from "zod";
import { createSentencePrompt, createWordPrompt, languageDetectionPrompt, typeValidationPrompt } from "../tools/translatePrompts";
import zodToJsonSchema from "zod-to-json-schema"
import { RunnableSequence, RunnablePassthrough, RunnableBranch } from "@langchain/core/runnables";
import { JsonOutputToolsParser } from "langchain/output_parsers";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { app } from "electron";

export interface TranslateParams  {
  text: string
  targetLang: string
}

type TextType = 'word' | 'sentence' | 'invalid'
type WordResponse = {
  type: 'word',
  meanings:{pos:string,meaning:string}[]
}
type SentenceResponse = {
  type: 'sentence',
  meanings:string
}
type InvalidResponse = {
  type: 'invalid',
  meanings:string
}
type ErrorResponse = {
  type: 'error'
  meanings: '翻译服务暂时不可用'
}

export class TranslateManager {
  private readonly model: LLMType;
  private readonly translateModel:LLMType;
  private readonly languageDetectionModel: LLMType

  constructor(public config: ChatConfig){
    this.model = createLLM({...config, temperature: 0.3});

    this.languageDetectionModel = createLLM({...config, temperature: 0.3});

    // 初始化翻译模型（更精确的翻译需要低温度）
    this.translateModel = createLLM({...config, temperature: 0});
  }

  private async getLanguageDetection(input:string){
    const chain = RunnableSequence.from([
      languageDetectionPrompt,
      this.languageDetectionModel,
      new StringOutputParser()
    ])

    try {
      const res = await chain.invoke({ input })
      return res
    } catch (error) {
      console.log(error,'----');
      return 'zh'
    }
  }

  private createValidationChain(){
    const validSchema = z.object({
      type: z.enum(['word','sentence','invalid']).describe('用户的输入是单词、句子还是无效输入')
    })

    const isWordPrompt = typeValidationPrompt
    const modelWithTools = this.model.bind({
      tools:[
        {
          type:'function',
          function:{
            name:'isWord',
            description:'判断用户的输入是单词还是句子还是无效输入',
            parameters:zodToJsonSchema(validSchema)
          }
        }
      ],
      tool_choice:{
        type:'function',
        function:{
          name:'isWord'
        }
      }
    })

    return RunnableSequence.from([
      new RunnablePassthrough(),
      {
        text: new RunnablePassthrough(),
        type: RunnableSequence.from([
          (input) => ({ input: input.input }),
          isWordPrompt,
          modelWithTools,
          new JsonOutputToolsParser(),
          (input) => {
            const type = input[0]?.args?.type;
            console.log(`输入 "${input.text?.input}" 被判断为: ${type}`);
            return type
          }
        ])
      },
    ])
  }

  private createWordChain(source:string,target:string){
    const wordPrompt = createWordPrompt(source,target)

    return RunnableSequence.from([
      wordPrompt,
      this.translateModel,
      new StringOutputParser(),
      (output) => {
        console.log(output,'---word-chain-output')
        try {
          return JSON.parse(output);
        } catch(e) {
          console.error('解析JSON失败:', e);
          return { type: 'error', meanings:'翻译解析失败' };
        }
      },
    ])
  }

  private createSentenceChain(source:string,target:string){
    const sentencePrompt = createSentencePrompt(source,target)
    return RunnableSequence.from([
      sentencePrompt,
      this.translateModel,
      new StringOutputParser(),
      (output) => {
        try {
          return JSON.parse(output);
        } catch(e) {
          console.error('解析JSON失败:', e);
          return { type: 'error', meanings: '翻译解析失败' };
        }
      }
    ])
  }
  
  private buildProcessingChain(source:string,target:string){
    const validChain = this.createValidationChain()
    const wordChain = this.createWordChain(source,target)
    const sentenceChain = this.createSentenceChain(source,target)

    const branch = RunnableBranch.from([
      [
        (input)=>input.type === 'word',
        RunnableSequence.from([
          (input) => input.text,
          wordChain
        ])
      ],
      [
        (input)=>input.type === 'sentence',
        RunnableSequence.from([
          (input) => input.text,
          sentenceChain
        ])
      ],
      (input) => {
        return {
          type: "invalid",
          message: input.text
        };
      }
    ])

    return RunnableSequence.from([
      validChain,
      branch
    ])
  }

  public async invoke(params:TranslateParams){
    const lanuage = await this.getLanguageDetection(params.text)
    const systemLocale = app.getSystemLocale()
    let sourceLang = lanuage
    let targetLang = params.targetLang

    if(sourceLang.includes(targetLang)){
      targetLang = systemLocale
    }
    
    if(!lanuage.includes(targetLang) && !systemLocale.includes(lanuage)){
      targetLang = systemLocale
    }
    
    const chain = this.buildProcessingChain(sourceLang,targetLang)
    return chain.invoke({input:params.text})
  }
}

export const translate = async (params:TranslateParams, config: ChatConfig) =>{
  console.log(params);
  console.log(config);

  try {
    const manager = new TranslateManager(config);
    const result = await manager.invoke(params)
    console.log("翻译结果:", result);
    return result as WordResponse | SentenceResponse | InvalidResponse;
  } catch (error) {
    console.error("翻译过程发生错误:", error);
    // 返回一个友好的错误响应
    return { 
      type: 'error',
      meanings: '翻译服务暂时不可用' 
    } as ErrorResponse;
  }
}
export type TranslateResponse = ReturnType<typeof translate>