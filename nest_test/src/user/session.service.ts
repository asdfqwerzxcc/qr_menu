import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class SessionService{
    private readonly logger=new Logger(SessionService.name)

    private loggedInUsers: Set<string>=new Set()
    isUserLoggedIn(username:string): boolean {
        this.logger.log(`${username}의 세션 유무 검사`);

        return this.loggedInUsers.has(username);
    }
    
    registerUser(username:string): void {
        this.logger.log(`${username}의 로그인 완료 및 세션등록`);
        this.loggedInUsers.add(username);
    }
    
    removeUser(username:string): void {
        this.logger.log(`${username}의 로그아웃 및 세션삭제`);
        this.loggedInUsers.delete(username);
    }

}