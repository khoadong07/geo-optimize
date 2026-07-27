import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { MailModule } from '../mail/mail.module';
import { PlanOrder, PlanOrderSchema } from './plan-order.schema';
import { PlanOrdersController } from './plan-orders.controller';
import { PlanOrdersService } from './plan-orders.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: PlanOrder.name, schema: PlanOrderSchema }]), AuthModule, MailModule],
  controllers: [PlanOrdersController],
  providers: [PlanOrdersService],
})
export class PlanOrdersModule {}
