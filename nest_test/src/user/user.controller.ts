import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(private userService: UserService){}

    @Post()
    async createUser(@Body('id') id:number){
        return this.userService.getTest(id);


    }
}
