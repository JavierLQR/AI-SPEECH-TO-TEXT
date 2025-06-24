import { Module } from '@nestjs/common'
import { IaLanchaingService } from './ia-lanchaing.service'
import { IaLanchaingController } from './ia-lanchaing.controller'

@Module({
  controllers: [IaLanchaingController],
  providers: [IaLanchaingService],
})
export class IaLanchaingModule {}
