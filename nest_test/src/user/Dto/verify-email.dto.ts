import { IsEmail, IsEmpty, IsEnum, IsNotEmpty, IsOptional, IsString, Matches } from "class-validator";

export class verifyEmailDto{   
    @IsOptional(null)
    @IsEmail()
    email: string;
    
    @IsOptional(null)
    signupVerifyToken
 
}