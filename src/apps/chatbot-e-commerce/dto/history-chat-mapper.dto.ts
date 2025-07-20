import { SerializeOptions } from '@nestjs/common'
import { Expose } from 'class-transformer'

// hace la conversión de la clase a JSON y lo serializa
// @SerializeOptions()
/**
 * MapperResponseHistoryChatDto
 * @description Mapea la clase a JSON
 * @exports MapperResponseHistoryChatDto
 * @class MapperResponseHistoryChatDto
 * @implements {MapperResponseHistoryChatDto}
 * @exports MapperResponseHistoryChatDto
 * @see MapperResponseHistoryChatDto
 *
 */
@SerializeOptions({
  strategy: 'excludeAll', //Solo incluye campos con @Expose.
  enableImplicitConversion: true,
  version: 2,
})
export class MapperResponseHistoryChatDto {
  @Expose({ name: '_id' })
  id: string

  @Expose({ name: 'sessionId' })
  session_id: string

  @Expose({ name: 'userQuestion' })
  user_question: string

  @Expose({ name: 'assistantResponse' })
  assistant_response: string

  @Expose({ name: 'userId' })
  user_id: number

  @Expose({ name: 'messageId' })
  message_id: string
}
