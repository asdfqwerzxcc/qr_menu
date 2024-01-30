import { IsEmail, IsEmpty, IsNotEmpty, IsOptional, IsString, Matches } from "class-validator";
import { UserStatus } from "../user-status.enum";

export class updateUserDto{
    index:number;
    
    @IsOptional(null)
    @IsEmail()
    email: string;
    @IsOptional(null)
    @IsString({message:'유효한 비밀번호를 입력하세요'})
    password:string;

    status:UserStatus;
}