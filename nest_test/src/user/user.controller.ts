import { Body, Controller, Get, Post, Req, UseGuards, ValidationPipe,Logger, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './Dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { updateUserDto } from './Dto/update-user.dto';
import { AdminGuard } from './guard/admin.guard';
import { UserStatus } from './user-status.enum';
import { Roles } from './decorator/roles.decorator';
import { verifyEmailDto } from './Dto/verify-email.dto';

@Controller('user')
export class UserController {
    private readonly logger=new Logger(UserController.name)
    constructor(private userService: UserService){}
    //회원가입
    @Post('/signup')
    async createUser(@Body(ValidationPipe) createUser:CreateUserDto){
        this.logger.log("회원가입 api가 호출되었습니다.")
        this.logger.log("userService를 호출합니다.")
        return this.userService.createUser(createUser);
    }
    //로그인
    @Post('/signin')
    async signInUser(@Body(ValidationPipe) userInfo:CreateUserDto){
        return this.userService.signIn(userInfo)
    }
    //회원 비밀번호 변경
    @Post('/newpswd')
    @UseGuards(AuthGuard('jwt'))
    authTest(@Body(ValidationPipe) password:updateUserDto, @Req() req){

        return this.userService.changePassword(password,req.user)
    }
    //관리자 회원목록 조회
    @Get('/list')
    @UseGuards(AuthGuard('jwt'),AdminGuard)
    @Roles(UserStatus.ADMIN)   
    async viewMember(){
        return await this.userService.getAllList();
    }
    //access토큰 재발급
    @Post('/refresh')
    @UseGuards(AuthGuard('refresh'))
    async createAccessToken(@Req() req){
        return this.userService.reAccessToken(req.user)
    }
    //이메일 인증메일 확인
    @Post('/email-verify')
    async verifyEmail(@Query() dto:verifyEmailDto){
        const { signupVerifyToken } = dto;
        return await this.userService.verifyEmail(signupVerifyToken);
        // return true
}
    //이메일 인증메일 발송
    @Post('/email-check')
    async checkEmail(@Body() email:verifyEmailDto){
        return this.userService.sendMemberJoinEmail(email);
    }
}
