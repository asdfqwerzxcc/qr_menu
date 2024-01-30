import { IsEmail, IsNotEmpty, IsString, Matches } from "class-validator";
import { UserStatus } from "../user-status.enum";

export class CreateUserDto{
    @IsNotEmpty({ message: '이메일은 비워둘 수 없습니다.' })
    @IsEmail()
    @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
      message: '유효한 이메일 주소를 입력하세요.',
    })
    email: string;

    @IsNotEmpty()
    @IsString({message:'유효한 비밀번호를 입력하세요'})
    password:string;

    status:UserStatus;
}