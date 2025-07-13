import { Controller, Get } from '@nestjs/common'
import { ChatService } from './chat.service'

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * Endpoint para obtener una respuesta de la IA a partir de un texto de entrada.
   * Este endpoint utiliza el servicio de chat para procesar el texto y generar una respuesta.
   *
   * @returns La respuesta generada por la IA.
   */

  @Get()
  getResponse() {
    return this.chatService.getResponse(
      'Maria Flores, 21 años, DNI: 70612345, Tiene ansiedad leve. Es la quinta consulta hoy 13/06/2025.',
    )
    // return this.chatService.getResponse(
    //   'Respondeme en español, a partir de estos datos, son de una persona masculina o femenina, Maria Flores, 21 años, Tiene ansiedad leve. Primera consulta hoy 13/06/2025.',
    // )
  }
}
