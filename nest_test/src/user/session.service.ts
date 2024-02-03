import { Injectable } from "@nestjs/common";

@Injectable()
export class SessionService{
    private loggedInUsers: Set<string>=new Set()
    isUserLoggedIn(username): boolean {
        return this.loggedInUsers.has(username);
    }
    
    registerUser(username): void {
        this.loggedInUsers.add(username);
    }
    
    removeUser(username): void {
        this.loggedInUsers.delete(username);
    }

}