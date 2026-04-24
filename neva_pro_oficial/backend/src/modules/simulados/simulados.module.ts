import { Module } from '@nestjs/common';
import { EnemApiService } from '../questions/enem-api.service';
import { SimuladoService } from './simulado.service';
import { SimuladosController } from './simulados.controller';

@Module({
  controllers: [SimuladosController],
  providers: [SimuladoService, EnemApiService],
  exports: [SimuladoService],
})
export class SimuladoModule {}
