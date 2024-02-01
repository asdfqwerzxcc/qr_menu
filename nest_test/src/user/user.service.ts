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

const jwtConfig=config.get('jwt');


@Injectable()
export class UserService {
    private readonly logger=new Logger(UserService.name)

    constructor(@InjectRepository(User) 
        private userRepository:Repository<User>, 
        private jwtService:JwtService,
        private emailService:EmailService
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
                throw new ConflictException('중복된 이메일입니다')
            }
        }
        // return await this.userRepository.save(newUser)
    }
    //로그인
    async signIn(userDetail:CreateUserDto): Promise<{accessToken: string,refreshToken:string}> {
        const{email,password}=userDetail
        const signInUser=await this.userRepository.findOne({where:{email}});
        if (signInUser && (await bcrypt.compare(password, (signInUser).password)))
        {
            const payload={email};
            const accessToken=await this.jwtService.sign(payload);
            const refreshToken=await this.jwtService.sign(payload,{
                secret:jwtConfig.refresh_secret,
                expiresIn:jwtConfig.refresh_expiresIn
                });
            return{accessToken,refreshToken};
        } else {
            throw new UnauthorizedException('로그인 실패');
        }
    }
    //비밀번호 변경
    async changePassword(newpswd:updateUserDto,updateUser:updateUserDto): Promise<{statusCode:number,message:string}>{
        const pswd={password : await bcrypt.hashSync(newpswd.password,10)};
        try{    
            await this.userRepository.update(updateUser.index,pswd)
            return{
                statusCode:201,
                message:"업데이트 성공",
            }
        }catch(error){
            throw new ConflictException('비밀번호 변경 실패')
        }
    }
    //회원목록 조회
    async getAllList(){
        const allBoard=await this.userRepository.find({
            order: {
                index: 'DESC'
            }
        })
        return allBoard
    }
    //refresh_token을 통한 재발급
    async reAccessToken(userDetail:CreateUserDto):Promise<{accessToken:string}>{
        const{email}=userDetail
        const payload={email};
        const accessToken=await this.jwtService.sign(payload);
        return{accessToken}
    }
    // 회원가입 이메일 발송
    async sendMemberJoinEmail(email:verifyEmailDto) {
        const signupVerifyToken=email;
        return await this.emailService.sendMemberJoinVerification(email, signupVerifyToken);
    }
    //이메일 유효성검사
    async verifyEmail(signupVerifyToken:verifyEmailDto){
        const email={email:signupVerifyToken};
        return email;
    }
}
