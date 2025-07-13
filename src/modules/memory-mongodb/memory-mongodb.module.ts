import { Module } from '@nestjs/common'
import { MemoryMongodbService } from './memory-mongodb.service'
import { MemoryMongodbController } from './memory-mongodb.controller'
import { ConfigService } from '@nestjs/config'
import { MongoClient } from 'mongodb'
import { GetModelService } from './model/model.service'

@Module({
  imports: [],
  controllers: [MemoryMongodbController],
  providers: [
    MemoryMongodbService,
    {
      async useFactory(configService: ConfigService) {
        const client = new MongoClient(
          configService.getOrThrow<string>('DATABASE_MONGO_URI'),
          {
            driverInfo: {
              name: 'Langchaing',
            },
            ssl: true,
          },
        )
        console.log('Connecting to MongoDB...')
        await client.connect()
        console.log('Connected to MongoDB')
        return client
      },
      inject: [ConfigService],
      provide: MongoClient.name,
    },
    GetModelService,
  ],
})
export class MemoryMongodbModule {}
