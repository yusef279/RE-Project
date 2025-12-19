import { Module, Global } from '@nestjs/common';
import { AgeGatingService } from './services/age-gating.service';

@Global()
@Module({
  providers: [AgeGatingService],
  exports: [AgeGatingService],
})
export class CommonModule {}
