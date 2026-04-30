import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { MuralService } from './mural.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('mural')
export class MuralController {
  constructor(private readonly muralService: MuralService) {}

  @Get()
  async findAll() {
    return this.muralService.getLatestItems(100);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async create(@Body() body: { title: string; content: string; type: string }) {
    return this.muralService.createItem(body);
  }

  // Adding generic methods to mural service for full CRUD
  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async update(@Param('id') id: string, @Body() body: any) {
    // We'll need to add this to MuralService
    return (this.muralService as any).updateItem(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async remove(@Param('id') id: string) {
    // We'll need to add this to MuralService
    return (this.muralService as any).deleteItem(id);
  }
}
