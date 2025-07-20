import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

@Schema({
  timestamps: true,
  collection: 'chat_messages',
})
export class ChatMessage extends Document {
  @Prop({ required: true, type: String })
  sessionId: string

  @Prop({ required: true, type: String })
  userId: string

  @Prop({ required: true, type: String })
  content: string

  @Prop({ required: true, default: 'assistant' })
  role: 'user' | 'assistant'

  @Prop({ default: false, type: Boolean })
  isUser: boolean

  @Prop()
  parentMessageId?: string

  @Prop()
  embedding?: number[]

  @Prop()
  latencyMs?: number

  @Prop()
  modelName?: string

  @Prop()
  retrievedProducts?: {
    name: string
    score: number
  }[]
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage)
