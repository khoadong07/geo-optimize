import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Industry, IndustrySchema } from './industry.schema';
import { IndustriesController } from './industries.controller';
import { IndustriesService } from './industries.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Industry.name, schema: IndustrySchema }])],
  controllers: [IndustriesController],
  providers: [IndustriesService],
  exports: [IndustriesService],
})
export class IndustriesModule {}
