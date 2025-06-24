import {
  Controller,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { GroqCloudService } from './groq-cloud.service'
import { diskStorage } from 'multer'
import { extname } from 'path'
import * as fs from 'fs/promises'
import { Response } from 'express'

@Controller('groq-cloud')
export class GroqCloudController {
  constructor(private readonly groqCloudService: GroqCloudService) {}

  @Post('transcribe-audio')
  @UseInterceptors(
    FileInterceptor('audio', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_, file, cb) => {
          const uniqueName = Date.now() + extname(file.originalname)
          cb(null, uniqueName)
        },
      }),
    }),
  )
  async transcribeAudio(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    const transcribedText = await this.groqCloudService.transcribeFromPath(
      file.path,
    )

    const chatResponse =
      await this.groqCloudService.sendToChatModel(transcribedText)
    await fs.unlink(file.path)

    const safeText = chatResponse.split(' ').slice(0, 10).join(' ')
    console.log({
      transcribedText,
      safeText,
    })
    // Generate TTS from the chat response
    const ttsPath = await this.groqCloudService.textToSpeech(safeText)
    res.download(ttsPath, 'response.wav', (err) => {
      if (err) {
        console.error('Error downloading file:', err)
        res.status(500).send('Error downloading file')
      } else {
        console.log('File downloaded successfully:', ttsPath)
        // Delete the TTS file after download
        fs.unlink(ttsPath).catch((unlinkErr) => {
          console.error('Error deleting TTS file:', unlinkErr)
        })
      }
    })
  }
}
