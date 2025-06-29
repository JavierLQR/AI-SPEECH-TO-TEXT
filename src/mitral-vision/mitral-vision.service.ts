import { Mistral } from '@mistralai/mistralai'
import { Inject, Injectable, Logger } from '@nestjs/common'

@Injectable()
export class MitralVisionService {
  private readonly logger: Logger = new Logger(MitralVisionService.name)

  constructor(@Inject(Mistral.name) private readonly mistral: Mistral) {
    this.logger.verbose('MistralVisionService initialized')
  }

  /**
   *
   * @returns
   */
  public async describeImage() {
    const chatResponse = await this.mistral.chat.complete({
      model: 'pixtral-12b',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: "What's in this image?" },
            {
              type: 'image_url',
              imageUrl:
                'https://tripfixers.com/wp-content/uploads/2019/11/eiffel-tower-with-snow.jpeg',
            },
          ],
        },
      ],
    })
    return {
      responseText: chatResponse.choices[0].message.content,
    }
  }
}
