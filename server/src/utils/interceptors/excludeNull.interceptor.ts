import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map } from 'rxjs';

@Injectable()
export class ExcludeNullInterceptor implements NestInterceptor {
  private recursivelyStripNullValues = (value: unknown): unknown => {
    if (Array.isArray(value)) {
      return value.map(this.recursivelyStripNullValues);
    }

    if (value instanceof Date) {
      return value;
    }

    if (value !== null && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value).map(([key, value]) => [
          key,
          this.recursivelyStripNullValues(value),
        ]),
      );
    }

    if (value !== null) return value;
  };

  intercept(context: ExecutionContext, next: CallHandler) {
    return next
      .handle()
      .pipe(map((value) => this.recursivelyStripNullValues(value)));
  }
}
