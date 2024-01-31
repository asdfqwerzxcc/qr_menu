import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { UserStatus } from "../user-status.enum";

@Injectable()
export class AdminGuard implements CanActivate{
    constructor(private readonly reflector:Reflector){}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
         const roles=this.reflector.get<UserStatus[]>('roles',context.getHandler());
         if(!roles || roles.length===0){
            return true;
         }
         const request=context.switchToHttp().getRequest();
         const user =request.user

         return user &&user.status &&roles.includes(user.status)
    }
}