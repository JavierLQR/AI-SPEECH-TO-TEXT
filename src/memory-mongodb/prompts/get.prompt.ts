import { StringOutputParser } from '@langchain/core/output_parsers'
import { ChatPromptTemplate } from '@langchain/core/prompts'

export const GetPrompt = () =>
  ChatPromptTemplate.fromTemplate(`
        {chat_history}
        Usuario: {question}
        Asistente: {response}
      `)

export const GetParsed = () => new StringOutputParser()
