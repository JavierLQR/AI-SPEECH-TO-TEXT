import { StringOutputParser } from '@langchain/core/output_parsers'
import { ChatPromptTemplate } from '@langchain/core/prompts'

export const GetPrompt = () =>
  ChatPromptTemplate.fromTemplate(`
A continuación tienes el historial de la conversación entre el usuario y el asistente de productos. Usa este historial para responder correctamente.

Historial:
{chat_history}

Usuario: {question}
Asistente:
`)

export const GetParsed = () => new StringOutputParser()
