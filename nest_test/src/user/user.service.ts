import { ConflictException, ConsoleLogger, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { CreateUserDto } from './Dto/create-user.dto';
import * as bcrypt from "bcrypt";

@Injectable()
export class UserService {
    constructor(@InjectRepository(User) private userRepository:Repository<User>){}

    async createUser(userDetail:CreateUserDto){
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
    async signIn(userDetail:CreateUserDto){
        const{email,password}=userDetail
        const signInUser=await this.userRepository.findOne({where:{email}});
        if (signInUser && (await bcrypt.compare(password, (signInUser).password)))
        {
            return{
                statusCode:201,
                message:"로그인 성공",
                
            }
        }else{
            throw new UnauthorizedException('로그인 실패')
        }

    }



}
