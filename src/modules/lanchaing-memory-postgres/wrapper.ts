import { BaseMessage } from '@langchain/core/messages'
import { PostgresChatMessageHistory } from '@langchain/community/stores/message/postgres'
import Redis from 'ioredis'
import { BaseChatMessageHistory } from '@langchain/core/chat_history'

export class CachedPostgresChatMessageHistory
  extends PostgresChatMessageHistory
  implements BaseChatMessageHistory
{
  private cacheKey: string

  constructor(
    sessionId: string,
    private readonly redis: Redis,
    private readonly ttlSeconds = 3600,
    config: ConstructorParameters<typeof PostgresChatMessageHistory>[0],
  ) {
    super({ ...config, sessionId })
    this.cacheKey = `chat:messages:${sessionId}`
  }

  async getMessages(): Promise<BaseMessage[]> {
    const cached = await this.redis.get(this.cacheKey)

    if (cached) {
      return JSON.parse(cached) as BaseMessage[]
    }

    const messages = await super.getMessages()

    await this.redis.set(
      this.cacheKey,
      JSON.stringify(messages),
      'EX',
      this.ttlSeconds,
    )

    return messages
  }

  async addMessage(message: BaseMessage): Promise<void> {
    await super.addMessage(message)

    const messages = await super.getMessages()
    await this.redis.set(
      this.cacheKey,
      JSON.stringify(messages),
      'EX',
      this.ttlSeconds,
    )
  }

  async clear(): Promise<void> {
    await super.clear()
    await this.redis.del(this.cacheKey)
  }
}
