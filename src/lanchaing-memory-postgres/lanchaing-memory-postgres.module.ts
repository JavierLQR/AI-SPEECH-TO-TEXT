import { Module } from '@nestjs/common'
import { LanchaingMemoryPostgresService } from './lanchaing-memory-postgres.service'
import { LanchaingMemoryPostgresController } from './lanchaing-memory-postgres.controller'

@Module({
  controllers: [LanchaingMemoryPostgresController],
  providers: [LanchaingMemoryPostgresService],
})
export class LanchaingMemoryPostgresModule {}
