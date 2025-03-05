import { ChatPromptTemplate } from "@langchain/core/prompts";

export const typeValidationPrompt =  ChatPromptTemplate.fromMessages([
    ['system', `仔细分析用户输入的内容是单词、句子还是无效的胡乱输入。
      
请注意，常见的语气词、网络用语和感叹词都是有效的单词，例如：
- "lol"（laugh out loud，大声笑）
- "haha"（表示笑声）
- "emmm"/"hmm"（表示思考或犹豫）
- "oh"、"wow"、"yay"等感叹词
- "brb"（be right back，马上回来）等网络缩写

无效输入的特征包括：
- 重复字符（如"xxxxx"）
- 随机字母组合（没有实际含义的字符）
- 键盘连续字符（如"asdfgh"、"qwerty"）
- 无意义的特殊字符组合
- 随机数字或字母数字组合

请返回以下三种类型之一：
- word：单个有意义的词汇（包括语气词、感叹词和网络用语）
- sentence：包含多个词的句子或短语
- invalid：无意义或胡乱的输入`],
    ['human', '内容:{input}']
  ]);

export const createWordPrompt = (source: string, target: string) => {
  return ChatPromptTemplate.fromMessages([
    [
      'system',
      `你是一位精通${source}和${target}的双语专家，拥有两种语言的native speaker水平。请将用户输入单词进行翻译，并按照不同词性详细分类。
对于每个词性，请提供：
1. 准确的${target}翻译（包括常用和不常用的多种可能性）
2. 地道的例句（${source}原句及其自然流畅的${target}翻译）
3. 如有特殊用法、俚语表达或文化差异，请特别说明

以JSON格式返回结果：
{{
  "type": "word",
  "meanings": [
    {{
      "pos": "词性缩写1(n./v./adj./int.等)",
      "meaning": "翻译1"
    }},
    {{
      "pos": "词性缩写2",
      "meaning": "翻译2"
    }}
  ]
}}

确保JSON格式正确无误。
注意：
1.JSON中的第一个type只能是"word" `
    ],
    ['human', '单词:{input}']
  ]);
};

export const createSentencePrompt = (source: string, target: string) => {
  return ChatPromptTemplate.fromMessages([
    [
      'system',
      `你是一位精通${source}和${target}的双语专家，拥有两种语言的native speaker水平。请将用户输入的内容进行翻译，并以JSON格式返回：

{{
  "type": "sentence",
  "meanings": "翻译结果"
}}`
    ],
    ['human', '内容:{input}']
  ]);
}; 
export const languageDetectionPrompt = ChatPromptTemplate.fromMessages([
  ['system', `你是一位精通多语言的语言学家。请分析用户输入的文本，判断它属于哪种语言，并返回该语言的语言代码。
  
  只需要返回语言代码
  `],
  ['human', '内容:{input}']
]);