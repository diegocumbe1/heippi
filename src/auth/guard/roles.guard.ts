import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Console } from 'console';
import { Observable } from 'rxjs';
import { PayloadToken } from 'src/user/dto/user.dto';
import { Role } from 'src/user/entities/User.entity';
import { UserService } from 'src/user/user.service';
import { inspect } from 'util';
import { ROLES_KEY } from '../decorator/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  jwtService: any;
  constructor(private reflector: Reflector, private userService: UserService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<Role[]>(ROLES_KEY, context.getHandler());
    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.replace('Bearer ', '');
    if (token) {
      const userRole = this.userService.decodeToken(token);

      const isAuth = roles.some((role) => role === userRole);
      if (!isAuth) {
        throw new UnauthorizedException('💥Role invalid!!💥');
      }
      return isAuth;
    }
    throw new BadRequestException(`please send token`);
  }
}
