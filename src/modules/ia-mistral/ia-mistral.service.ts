import { Injectable, Logger } from '@nestjs/common'
import { Mistral } from '@mistralai/mistralai'
import { PrismaService } from 'nestjs-prisma'
@Injectable()
export class IaMistralService {
  private readonly mistral: Mistral
  private readonly logger = new Logger(IaMistralService.name)

  constructor(private readonly prismaService: PrismaService) {
    this.mistral = new Mistral({
      apiKey: process.env.MISTRAL_API_KEY,
    })
  }

  async findAllProducts(page: number = 1, limit: number = 10) {
    const produycts = await this.prismaService.products.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        id: 'asc',
      },
    })
    return produycts
  }

  async findAll() {
    const chatResponse = await this.mistral.chat.complete({
      model: 'mistral-large-latest',
      temperature: 0.2,
      messages: [
        {
          role: 'user',
          content: 'Entiendes el idioma español o solo english?',
        },
      ],
    })
    const responseText = chatResponse.choices[0].message.content
    this.logger.log('Response from Mistral:', { chatResponse })
    return {
      responseText,
    }
  }
}
