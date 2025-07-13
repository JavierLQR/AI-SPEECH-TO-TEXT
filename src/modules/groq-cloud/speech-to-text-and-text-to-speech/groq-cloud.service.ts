import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as fs from 'fs'
import Groq from 'groq-sdk'
import { join } from 'path'

@Injectable()
export class GroqCloudService {
  private readonly groq: Groq
  private readonly logger = new Logger(GroqCloudService.name)

  constructor(private readonly configService: ConfigService) {
    this.groq = new Groq({
      apiKey: this.configService.getOrThrow<string>('GROQ_CLOUD_API_KEY'),
    })
  }

  async textToSpeech(text: string): Promise<string> {
    try {
      const safeText = text.split(' ').slice(0, 800).join(' ') // ~menos de 1200 tokens
      const response = await this.groq.audio.speech.create({
        model: 'playai-tts', // También puedes probar 'playai-tts-arabic'
        input: safeText,
        voice: 'Fritz-PlayAI', // Puedes probar otras voces como 'shimmer', 'echo', etc.
        response_format: 'wav', // Formato de respuesta, puede ser 'mp3' o 'wav'
      })

      const outputPath = join(__dirname, '../../outputs', `${Date.now()}.wav`)
      const buffer = Buffer.from(await response.arrayBuffer())
      await fs.promises.writeFile(outputPath, buffer)

      this.logger.log(`TTS generado en: ${outputPath}`)
      return outputPath
    } catch (error) {
      this.logger.error('Error al generar TTS:', error)
      throw new Error('Text-to-Speech failed')
    }
  }

  /**
   * Transcribes audio from a file path using Groq's audio transcription service.
   * @param filePath The path to the audio file to transcribe.
   * @returns The transcribed text.
   * @throws Error if transcription fails.
   * */
  async transcribeFromPath(filePath: string): Promise<string> {
    try {
      const transcription = await this.groq.audio.transcriptions.create({
        file: fs.createReadStream(filePath), // Use the file stream directly
        model: 'whisper-large-v3-turbo',
        prompt: 'Specify context or spelling', // Optional
        response_format: 'verbose_json', // Optional
        timestamp_granularities: ['word', 'segment'], // Optional
        language: 'es', // Optional
        temperature: 0.0, // Optional
      })
      this.logger.log('Transcription successful:', transcription.text)
      return transcription.text || 'No transcription returned'
    } catch (error) {
      this.logger.error('Error during transcription:', error)
      throw new Error('Transcription failed')
    }
  }
  /**
   * Sends a text prompt to the chat model and returns the response.
   * @param text The text to send to the chat model.
   * @returns The response from the chat model.
   */
  async sendToChatModel(text: string): Promise<string> {
    const response = await this.groq.chat.completions.create({
      messages: [{ role: 'user', content: text }],
      model: 'llama3-70b-8192',
    })

    return response.choices[0].message.content || 'No response from model'
  }
}
