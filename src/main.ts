import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    snapshot: true,
  })
  app.useLogger(
    process.env.NODE_ENV === 'production'
      ? ['error', 'warn']
      : ['log', 'error', 'warn', 'debug', 'verbose'],
  )

  app.useGlobalFilters(new HttpExceptionFilter())

  await app.listen(process.env.PORT ?? 4000)
  console.log(`Application is running on: ${await app.getUrl()}`)
}
bootstrap()
  .then(() => console.log('NestJS application started successfully'))
  .catch((error) => console.error('Error starting NestJS application:', error))
