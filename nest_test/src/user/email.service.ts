import { Injectable } from "@nestjs/common";
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
        
        const url = `${baseurl}/user/email-verify?signupVerifyToken=${signupVerifyToken.email}`;
        const mailOptions: EmailOptions = {
            to: emailAddress.email,
            subject: '가입 인증 메일',
            html: `
              가입확인 버튼를 누르시면 가입 인증이 완료됩니다.<br/>
              <form action="${url}" method="POST">
                <button>가입확인</button>
              </form>
            `
        }
        try{
            return await this.transporter.sendMail(mailOptions);
        }catch(error){
            console.log(error)
        }
        
    }
}