import { Module } from '@nestjs/common'
import { MitralVisionService } from './mitral-vision.service'
import { MitralVisionController } from './mitral-vision.controller'
import { Mistral } from '@mistralai/mistralai'
import { ConfigService } from '@nestjs/config/dist/config.service'
@Module({
  controllers: [MitralVisionController],
  providers: [
    MitralVisionService,
    {
      provide: Mistral.name,
      useFactory: (configService: ConfigService) =>
        new Mistral({
          apiKey: configService.getOrThrow<string>('MISTRAL_API_KEY'),
        }),
      inject: [ConfigService],
    },
  ],
})
export class MitralVisionModule {}
