import { plainToInstance } from 'class-transformer'

import { MapperResponseHistoryChatDto } from '../dto/history-chat-mapper.dto'
import { PartialHistoryChat } from '../interfaces/partial-history-chat.interface'

export const HistoryChatMapper = (
  chatsHistory: PartialHistoryChat[],
): MapperResponseHistoryChatDto[] => {
  return plainToInstance(MapperResponseHistoryChatDto, chatsHistory, {
    excludeExtraneousValues: true, // ya no es necesario si usas SerializeOptions
    strategy: 'excludeAll', // Solo incluye campos con @Expose
    enableImplicitConversion: true,
  })
}
