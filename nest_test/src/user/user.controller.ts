import { Body, Controller, Post, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './Dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { updateUserDto } from './Dto/update-user.dto';

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

    @Post('/newpswd')
    @UseGuards(AuthGuard())
    authTest(@Body(ValidationPipe) password:updateUserDto, @Req() req){

        return this.userService.changePassword(password,req.user)
    }
}
