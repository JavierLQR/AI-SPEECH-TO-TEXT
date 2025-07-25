export class SendMessagePusherDto {
  channelName: string
  eventName: string
  data: {
    id: string
    message: string
    userId: string
    timestamp: string
  }
  userId: string
  socket_id?: string
}
