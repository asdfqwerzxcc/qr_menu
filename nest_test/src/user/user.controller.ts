import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './Dto/create-user.dto';

@Controller('user')
export class UserController {
    constructor(private userService: UserService){}

    @Post('/signup')
    async createUser(@Body(ValidationPipe) createUser:CreateUserDto){
        return this.userService.createUser(createUser);
    }

    @Post('/signin')
    async signInUser(@Body(ValidationPipe) userInfo:CreateUserDto){
        return this.userService.signIn(userInfo)
    }
}
