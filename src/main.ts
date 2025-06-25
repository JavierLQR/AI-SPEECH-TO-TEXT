import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useLogger(
    process.env.NODE_ENV === 'production'
      ? ['error', 'warn']
      : ['log', 'error', 'warn', 'debug', 'verbose'],
  )
  await app.listen(process.env.PORT ?? 4000)
  console.log(`Application is running on: ${await app.getUrl()}`)
}
bootstrap()
  .then(() => console.log('NestJS application started successfully'))
  .catch((error) => console.error('Error starting NestJS application:', error))
