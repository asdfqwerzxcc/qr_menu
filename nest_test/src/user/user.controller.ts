import { Body, Controller, Get, Post, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './Dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { updateUserDto } from './Dto/update-user.dto';
import { AdminGuard } from './guard/admin.guard';
import { UserStatus } from './user-status.enum';
import { Roles } from './decorator/roles.decorator';

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
    @UseGuards(AuthGuard('jwt'))
    authTest(@Body(ValidationPipe) password:updateUserDto, @Req() req){

        return this.userService.changePassword(password,req.user)
    }
 
    @Get('/list')
    @UseGuards(AuthGuard('jwt'),AdminGuard)
    @Roles(UserStatus.ADMIN)   
    async viewMember(){
        return await this.userService.getAllList();
    }

    @Post('/refresh')
    @UseGuards(AuthGuard('refresh'))
    async createAccessToken(@Req() req){
        return this.userService.reAccessToken(req.user)
    }
}
