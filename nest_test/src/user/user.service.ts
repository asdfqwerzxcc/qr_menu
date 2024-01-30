import { ConflictException, ConsoleLogger, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { CreateUserDto } from './Dto/create-user.dto';
import * as bcrypt from "bcrypt";
import { JwtService } from '@nestjs/jwt';
import { updateUserDto } from './Dto/update-user.dto';

@Injectable()
export class UserService {
    constructor(@InjectRepository(User) 
        private userRepository:Repository<User>, 
        private jwtService:JwtService
    ){}

    async createUser(userDetail:CreateUserDto): Promise<{statusCode: number, message: string, data: User}>{
        const {email,password,status}=userDetail
        const newUser=this.userRepository.create({email,password,status});
        try{
            const successjoin=await this.userRepository.save(newUser)
            return{
                statusCode:201,
                message:"회원가입 성공",
                data:successjoin
            }
        }catch(error){
            if(error.code==="SQLITE_CONSTRAINT")
            {
                throw new ConflictException('중복된 이메일입니다')
            }
        }
        // return await this.userRepository.save(newUser)
    }

    async signIn(userDetail:CreateUserDto): Promise<{accessToken: string}> {
        const{email,password}=userDetail
        const signInUser=await this.userRepository.findOne({where:{email}});
        if (signInUser && (await bcrypt.compare(password, (signInUser).password)))
        {
            const payload={email};
            const accessToken=await this.jwtService.sign(payload);
            return{accessToken};
        } else {
            throw new UnauthorizedException('로그인 실패');
        }
    }

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

}
