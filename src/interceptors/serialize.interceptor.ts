import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { Observable, map } from 'rxjs';
import { UserDto } from 'src/users/dto/user.dto';

//Serilizer to exclude users sensitive information before returning the response.

export class SerializeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
    return handler.handle().pipe(
      map((data: any) =>
        plainToClass(UserDto, data, {
          excludeExtraneousValues: true,
        }),
      ),
    );
  }
}
