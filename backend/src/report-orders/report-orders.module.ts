import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MailModule } from '../mail/mail.module';
import { ReportsModule } from '../reports/reports.module';
import { ReportOrder, ReportOrderSchema } from './report-order.schema';
import { ReportOrdersController } from './report-orders.controller';
import { ReportOrdersService } from './report-orders.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: ReportOrder.name, schema: ReportOrderSchema }]), ReportsModule, MailModule],
  controllers: [ReportOrdersController],
  providers: [ReportOrdersService],
})
export class ReportOrdersModule {}
