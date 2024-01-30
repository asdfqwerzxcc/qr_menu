import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
    private User=[]

    getTest(id:number):string{
        return "hello"+String(id);
    }
}
