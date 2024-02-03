import { ConflictException, ConsoleLogger, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { CreateUserDto } from './Dto/create-user.dto';
import * as bcrypt from "bcrypt";
import { JwtService } from '@nestjs/jwt';
import { updateUserDto } from './Dto/update-user.dto';
import * as config from 'config'
import { EmailService } from './email.service';
import { verifyEmailDto } from './Dto/verify-email.dto';
import { SessionService } from './session.service';

const jwtConfig=config.get('jwt');


@Injectable()
export class UserService {
    private readonly logger=new Logger(UserService.name)

    constructor(@InjectRepository(User) 
        private userRepository:Repository<User>, 
        private jwtService:JwtService,
        private emailService:EmailService,
        private sessionService:SessionService

    ){}
    //회원가입
    async createUser(userDetail:CreateUserDto): Promise<{statusCode: number, message: string, data: User}>{
        this.logger.log("UserService가 호출되었습니다.")
        const {email,password,status}=userDetail
        this.logger.log(`email: ${email}에대한 회원가입을 시도합니다`)
        const newUser=this.userRepository.create({email,password,status});
        try{
            const successjoin=await this.userRepository.save(newUser)
            this.logger.log(`email: ${email}에대한 회원가입이 성공했습니다`)
            return{
                statusCode:201,
                message:"회원가입 성공",
                data:successjoin
            }
        }catch(error){
            this.logger.error(`email: ${email}에대한 회원가입이 실패했습니다`)
            if(error.code==="SQLITE_CONSTRAINT")
            {
                this.logger.log(`${email}은 중복된 이메일 입니다.`);
                throw new ConflictException('중복된 이메일입니다')
            }
        }
        // return await this.userRepository.save(newUser)
    }
    //로그인
    async signIn(userDetail:CreateUserDto): Promise<{accessToken: string,refreshToken:string}> {
        const{email,password}=userDetail
        this.logger.log(`${email}의 로그안 요청`);
        const signInUser=await this.userRepository.findOne({where:{email}});

        //세션을 통한 중복 로그인 검사
        this.logger.log(`로그인 전 ${email}의 로그인 중복 검사`);
        const isAlreadyLoggedIn = this.sessionService.isUserLoggedIn(email);

        if (isAlreadyLoggedIn) {
            // 중복 로그인이 감지됨
            this.logger.log(`${email}은 이미 로그인 중입니다.`);
            throw new UnauthorizedException(`${email}은 이미 로그인 중입니다.`);
        }   
        this.logger.log(`${email}의 중복검사후 로그인 시도`);
        // 세션 등록
        
        if (signInUser && (await bcrypt.compare(password, (signInUser).password)))
        {
            this.sessionService.registerUser(email);

            this.logger.log(`${email}의 로그인 통과 후 JWT토큰 발급`);
            const payload={email};
            const accessToken=await this.jwtService.sign(payload);
            const refreshToken=await this.jwtService.sign(payload,{
                secret:jwtConfig.refresh_secret,
                expiresIn:jwtConfig.refresh_expiresIn
                });
            this.logger.log(`${email}의 로그인 성공 및 리프레쉬 토큰 및 액세스 토큰 발급`);
            return{accessToken,refreshToken};
        } else {
            this.logger.log(`${email}의 로그인 실패`);
            throw new UnauthorizedException('로그인 실패');
        }
    }
    //비밀번호 변경
    async changePassword(newpswd:updateUserDto,updateUser:updateUserDto): Promise<{statusCode:number,message:string}>{
        this.logger.log(`${updateUser.email}에 대한 비밀번호 변경요청(userService)`);
        const pswd={password : await bcrypt.hashSync(newpswd.password,10)};
        this.logger.log(`${updateUser.email}에 대한 비밀번호 해쉬 성공`);
        try{    
            
            await this.userRepository.update(updateUser.index,pswd)
            this.logger.log(`${updateUser.email}에 대한 비밀번호 변경성공`);

            return{
                statusCode:201,
                message:"업데이트 성공",
            }
        }catch(error){
            this.logger.log(`${updateUser.email}의 비밀번호 변경 실패`);
            throw new ConflictException('비밀번호 변경 실패')
        }
    }
    //회원목록 조회
    async getAllList(){
        this.logger.log(`userService gerAllList 요청`)

        const allBoard=await this.userRepository.find({
            order: {
                index: 'DESC'
            }
        })
        this.logger.log(`회원목록 조회 성공`)
        return allBoard
    }
    //refresh_token을 통한 재발급
    async reAccessToken(userDetail:CreateUserDto):Promise<{accessToken:string}>{
        const{email}=userDetail
        this.logger.log(`${email}의 AccessToken 재발급 요청`);
        const payload={email};
        const accessToken=await this.jwtService.sign(payload);
        this.logger.log(`${email}의 AccessToken 발급 성공`);
        return{accessToken}
    }
    //이메일 유효성검사
    async verifyEmail(email:verifyEmailDto,signupVerifyToken:verifyEmailDto){
        // const emailverify={email:signupVerifyToken};
        this.logger.log(`${email.email} 의 이메일 인증 요청 실행`)

        try{
            const decode=await this.jwtService.verify(signupVerifyToken.signupVerifyToken,{            
                secret:jwtConfig.email_secret,
                });
            this.logger.log(`${email.email}의 이메일 인증 유효성 검사`)

            if(decode.email===email.email){
                this.logger.log(`${email.email}의 이메일 인증 성공`)
                return {
                    statusCode:201,
                    message:"이메일 인증 성공",
                } 
            }
            else{
                this.logger.log(`${email.email}의 이메일 인증 실패`)

                return{
                    statusCode:202,
                    message:"이메일 인증 실패",
                }
            }
        }catch(error){
            this.logger.log(`${email.email}의 권한이 없습니다.`);
            throw new UnauthorizedException("권한이 없습니다.")
        }

    }
    // 회원가입 이메일 발송
    async sendMemberJoinEmail(email:verifyEmailDto) {
        this.logger.log(`${email.email}의 이메일 인증요청 실행`);
        this.logger.log(`${email.email}의 토큰발행`);
        const payload=email
        const signupVerifyToken=await this.jwtService.sign(payload,{
            secret:jwtConfig.email_secret,
            expiresIn:jwtConfig.email_expiresIn
            });
        this.logger.log(`${email.email}의 토큰 발행 성공`);
    
        try{
            this.logger.log(`${email.email}의 이메일 발송 요청`);
            const message=await this.emailService.sendMemberJoinVerification(email, signupVerifyToken);
            this.logger.log(`${email.email}의 이메일 발송 성공`);

            return message;
        }catch(error){ 
            this.logger.log(`${email.email}의 이메일 전송 실패`);
            throw new ConflictException("userSevice 이메일전송실패")
        }   
    }
}
