import { Injectable } from '@nestjs/common'
import { GoogleGenAI } from '@google/genai'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class GeminiSpeechService {
  private readonly ai: GoogleGenAI
  constructor(private readonly configService: ConfigService) {
    this.ai = new GoogleGenAI({
      apiKey: this.configService.getOrThrow('GOOGLE_GENAI_API_KEY'),
    })
  }

  async speech() {
    const config = {
      temperature: 1,
      responseModalities: ['audio'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: 'Zephyr',
          },
        },
      },
    }
    const model = 'gemini-2.5-pro-preview-tts'
    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: `como estas`,
          },
        ],
      },
    ]
    const response = await this.ai.models.generateContentStream({
      model,
      config,
      contents,
    })
    console.log({
      response,
    })
  }
}
