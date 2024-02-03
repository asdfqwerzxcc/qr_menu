import { Body, Controller, Get, Post, Req, UseGuards, ValidationPipe,Logger, Query, Param } from '@nestjs/common';
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
        this.logger.log("회원가입 api가 호출되었습니다.");
        this.logger.log("userService를 호출합니다.");
        return this.userService.createUser(createUser);
    }
    //로그인
    @Post('/signin')
    async signInUser(@Body(ValidationPipe) userInfo:CreateUserDto){
        this.logger.log(`${userInfo.email}의 로그인 요청`);
        this.logger.log(`userService의 signIn 호출`);
        return this.userService.signIn(userInfo)
    }
    //회원 비밀번호 변경
    @Post('/newpswd')
    @UseGuards(AuthGuard('jwt'))
    authTest(@Body(ValidationPipe) password:updateUserDto, @Req() req){
        this.logger.log(`${req.user.email}에 대한 비밀번호 변경 요청`);
        this.logger.log(`userService의 chagePassword 호출`);
        return this.userService.changePassword(password,req.user);
    }
    //관리자 회원목록 조회
    @Get('/list')
    @UseGuards(AuthGuard('jwt'),AdminGuard)
    @Roles(UserStatus.ADMIN)   
    async viewMember(){
        this.logger.log(`관리자의 회원목록 조회 요청`);
        this.logger.log(`userService의 getAllList 호출`);
        return await this.userService.getAllList();
    }
    //access토큰 재발급
    @Post('/refresh')
    @UseGuards(AuthGuard('refresh'))
    async createAccessToken(@Req() req){
        this.logger.log(`${req.user.email}의 액세스 토큰 재발급 요청`);
        this.logger.log(`userService의 reAccessToken 호출`);
        return this.userService.reAccessToken(req.user)
    }
    //이메일 인증메일 확인
    @Post('/email-verify/:email')
    async verifyEmail(@Param() email:verifyEmailDto, @Query() dto:verifyEmailDto){
        this.logger.log(`${email.email}의 이메일 인증요청`);
        const signupVerifyToken  = dto;
        return await this.userService.verifyEmail(email,signupVerifyToken);
}
    //이메일 인증메일 발송
    @Post('/email-check')
    async checkEmail(@Body() email:verifyEmailDto){
        this.logger.log(`${email.email}의 이메일 인증메일 발송 요청`);
        this.logger.log(`발송 요청 실행`);
        return this.userService.sendMemberJoinEmail(email);
    }
}
