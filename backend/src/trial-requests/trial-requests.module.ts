import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MailModule } from '../mail/mail.module';
import { UsersModule } from '../users/users.module';
import { TrialRequest, TrialRequestSchema } from './trial-request.schema';
import { TrialRequestsController } from './trial-requests.controller';
import { TrialRequestsService } from './trial-requests.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: TrialRequest.name, schema: TrialRequestSchema }]), UsersModule, MailModule],
  controllers: [TrialRequestsController],
  providers: [TrialRequestsService],
})
export class TrialRequestsModule {}
