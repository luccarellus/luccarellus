import { Controller, Get, Query } from '@nestjs/common';
import { RankingService } from './ranking.service';

@Controller('ranking')
export class RankingController {

  constructor(private readonly rankingService: RankingService) {}

  @Get()
  async getTopUsers(@Query('limit') limit: string = '15') {
    return this.rankingService.getTopUsers(Number(limit));
  }

  @Get('all')
  async getAllUsers() {
    return this.rankingService.getAllUsers();
  }
}
