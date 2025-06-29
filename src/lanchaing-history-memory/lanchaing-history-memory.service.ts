import { Injectable } from '@nestjs/common'
import { BufferMemory } from 'langchain/memory'
import { RedisChatMessageHistory } from '@langchain/redis'
import { ChatMistralAI } from '@langchain/mistralai'
import { ConversationChain } from 'langchain/chains'
import { StringOutputParser } from '@langchain/core/output_parsers'
@Injectable()
export class LanchaingHistoryMemoryService {
  /**
   * Memory for the conversation
   * @private
   * @type {BufferMemory}
   * @memberof LanchaingHistoryMemoryService
   * @description Memory for the conversation
   */
  private readonly memory: BufferMemory = new BufferMemory({
    chatHistory: new RedisChatMessageHistory({
      sessionId: new Date().toISOString(), // Or some other unique identifier for the conversation
      sessionTTL: 300, // 5 minutes, omit this parameter to make sessions never expire
      config: {
        url: process.env.REDIS_URL,
      },
    }),
  })

  private readonly model: ChatMistralAI = new ChatMistralAI({
    model: 'mistral-large-latest',
    apiKey: process.env.MISTRAL_API_KEY,
    temperature: 0,
    maxTokens: 100,
  })

  private readonly chain = new ConversationChain({
    llm: this.model,
    memory: this.memory,
    outputParser: new StringOutputParser(),
  })

  async conversation(message: string) {
    // const res1 = await this.chain.invoke({ input: "Hi! I'm Rodrigo." })
    // console.log({ res1 })

    const res2 = await this.chain.invoke({
      input: message,
    })

    return {
      message: res2,
    }
  }
}
