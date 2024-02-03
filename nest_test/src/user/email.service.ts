import { ConflictException, Injectable, Logger } from "@nestjs/common";
import Mail from "nodemailer/lib/mailer";
import * as nodemailer from 'nodemailer';
import * as config from 'config';

interface EmailOptions{
    to: string;
    subject:string;
    html:string;
}
const emailConfig=config.get('mail');

@Injectable()
export class EmailService{
    private readonly logger=new Logger(EmailService.name)

    private transporter:Mail

    constructor(){
        this.transporter=nodemailer.createTransport({
            service:'Gmail',
            auth:{
                user:emailConfig.id,
                pass:emailConfig.secret,
            }
        });
    }
    async sendMemberJoinVerification(emailAddress,signupVerifyToken){
        const baseurl='http://localhost:3000';
        const url = `${baseurl}/user/email-verify/${emailAddress.email}?signupVerifyToken=${signupVerifyToken}`;
        this.logger.log(`${emailAddress.email}의 인증메일 발송 요청`);

        const mailOptions: EmailOptions = {
            to: emailAddress.email,
            subject: '가입 인증 메일',
            html: `
              가입확인 버튼를 누르시면 가입 인증이 완료됩니다.<br/>
              <form action="${url}" method="Post">
                <button>가입확인</button>
              </form>
            `
        }
        try{
            this.logger.log(`${emailAddress.email}에게 인증메일 발송`);
            await this.transporter.sendMail(mailOptions);
            this.logger.log(`${emailAddress.email}의 인증메일 발송 성공`);
            return {
                statusCode:201,
                message:"이메일 전송 성공",
            }
        }catch(error){
            this.logger.log(`${emailAddress}의 이메일 전송 실패`);
            throw new ConflictException("이메일 전송 실패")
        }
        
    }
}