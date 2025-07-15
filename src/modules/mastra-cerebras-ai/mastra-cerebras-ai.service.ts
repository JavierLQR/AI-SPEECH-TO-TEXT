import { cerebras } from '@ai-sdk/cerebras'
import { Mastra } from '@mastra/core'
import { Agent } from '@mastra/core/agent'
import { Injectable, Logger, OnModuleInit } from '@nestjs/common'

@Injectable()
export class MastraCerebrasAiService implements OnModuleInit {
  private readonly agent: Agent
  private readonly logger: Logger = new Logger(MastraCerebrasAiService.name)
  readonly mastra: Mastra

  constructor() {
    this.agent = new Agent({
      name: 'Soporte IA',
      instructions: 'Responde de forma precisa y amable',
      model: cerebras('llama-3.3-70b'),
    })

    this.mastra = new Mastra({
      agents: { agent: this.agent },
    })
  }

  onModuleInit() {
    console.log('Iniciando MastraCerebrasAiService...')
  }

  public async responseStream(pregunta: string) {
    const respuesta = await this.agent.stream(pregunta, {
      maxTokens: 200,
      temperature: 0.2,
    })
    for await (const chunk of respuesta.textStream) {
      console.log(chunk)
    }
  }

  public async responderText(pregunta: string) {
    const respuesta = await this.agent.generate([
      {
        role: 'user',
        content: pregunta,
      },
    ])

    this.logger.debug({
      respuesta,
    })
    console.log({
      respuesta: respuesta.text,
    })
  }
}
