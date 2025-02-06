import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence, RunnableBranch } from "@langchain/core/runnables";
import { agentPrompt } from "../tools/prompts";
import { SerpAPI } from "@langchain/community/tools/serpapi";
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { AgentExecutor, createReactAgent } from 'langchain/agents';
import { createLLM,ChatConfig, LLMType } from "..";
import { JsonOutputToolsParser } from '@langchain/core/output_parsers/openai_tools'

export class WebSearchManager {
  private readonly model: LLMType;
  private readonly tools: SerpAPI[];
  private readonly agentPrompt: ChatPromptTemplate = agentPrompt;

  constructor(public config: ChatConfig) {
    // 初始化模型
    this.model = createLLM(config)

    // 初始化工具
    this.tools = [new SerpAPI(import.meta.env.VITE_SERPAPI_KEY)];

  }

  // 创建验证链
  private createValidationChain() {
    const validSchema = z.object({
      needSearch: z.boolean().describe("是否需要联网搜索")
    });
    
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", `仔细思考，你有足够的时间进行严谨的思考，分析用户的问题是否需要联网搜索（当问题涉及时效信息或需要验证时）`],
      ["human", `问题：{input}`]
    ])
    
    return RunnableSequence.from([
      prompt,
      this.model.bind({
      // model.bind({
        tools: [{
          type: 'function',
          function: {
            name: 'search_validator',
            description: '搜索验证器',
            parameters: zodToJsonSchema(validSchema)
          }
        }],
        tool_choice: { 
          type: 'function', 
          function: { name: 'search_validator' } 
        }
      }),
      
      new JsonOutputToolsParser(),
      (input) => {
        console.log(input,'----valid-chain-input');
        return input[0]?.args?.needSearch ?? false
      }
    ]);
  }

  // 创建搜索链
  private async createSearchChain() {
    const answerModel = createLLM({...this.config,temperature:0.4})
    const agent = await createReactAgent({
      llm: answerModel,
      tools: this.tools,
      prompt: this.agentPrompt
    });
    const executor = new AgentExecutor({ agent, tools: this.tools })

    return RunnableSequence.from([
      executor,
      (input) => {
        console.log('搜索结果:', input);
        return input.output;
      },
      new StringOutputParser()
    ]);
  }

  // 创建完整处理链
  public async buildProcessingChain() {
    const validationChain = this.createValidationChain();
     
    const searchChain = await this.createSearchChain();
    const normalPrompt = PromptTemplate.fromTemplate(`
      请回答以下一般问题，尽可能提供全面和有深度的答案
      
      问题:{input}
      回答:
      `)
    // const normalModel = createLLM(this.config)
    const normalChain = RunnableSequence.from([
      normalPrompt,
      this.model,
      // normalModel,
      (input)=>{
        console.log(input,'---not-search-chain-input')
        return input
      },
      new StringOutputParser()
    ]);

    const branch = RunnableBranch.from([
      [
        (input) => {
          console.log(input,'----branch-input')
          return input.type
        },
        searchChain
      ],
      normalChain
    ])
    return RunnableSequence.from([
      {
        type:validationChain,
        input: input=>{
          console.log(input,'----final-chain-input')
          return input.input
        }
      },
      branch,
    ])
  }
}
