import { UsersService } from "./../users.service";
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable()
export class CurrentUserInterceptor implements NestInterceptor {
  constructor(private usersService: UsersService) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    console.log("currentUser ", request.session.userId);
    const { userId } = request.session || {};
    if (userId) {
      const user = this.usersService.findOne(parseInt(userId));
      request.currentUser = user;
    }
    return next.handle();
  }
}
