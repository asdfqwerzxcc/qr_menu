
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->
# 신입_백엔드개발자_이재진
NestJS를 활용한 사용자 인증과 권한 관리 시스템 구현
## API 명세서
https://documenter.getpostman.com/view/30957527/2s9YyvC1Zi

## Description
NodeJS, TypeScript

FrameWork : NestJs

Database : Sqlite 

각 중요 정보는 config를 통해 각각 저장을 하였다.
## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```
## 진행여부
### 요구사항
1. 회원가입 API : 구현 완료
2. 로그인 API : 구현 완료
3. 비밀번호 변경 API : 구현 완료
4. 회원목록 조회 API : 구현 완료

### 선택적 도전 과제
1. 회원가입시 이메일 인증 기능 : 구현 완료
2. Refresh토큰을 사용하여 토큰 재발급 기능을 추가 : 구현 완료
3. 로그인 시도 제한 추가 : 미구현
4. 중복 로그인 기능 : 구현 완료

## 각 기능 별 설명

### 회원가입 API
```Javascript
@Entity('user')
export class User{
    @PrimaryGeneratedColumn()
    index:number;

    @Column({name:'email',length:50,nullable:false,unique:true})
    email:string;

    @Column({name:'password',length:50,nullable:false})
    password:string;
    @BeforeInsert()
    private beforeInsert(){
        this.password=bcrypt.hashSync(this.password,10)
    }

    @Column({name:'status',length:50,nullable:false,default:"MEMBER"})
    status: UserStatus;
}
```
유저 엔티티에서 Typeorm을 사용하여 비밀번호는 저장되거전 beforeInsert()를 통해  bcrypt로 해싱하여 들어가고, 
회원의 상태(일반 or 관리자)를 enum형식의 UserStatus를 통해 형식을 지정해줘 MEMBER 또는 ADMIN만 들어오게 지정을 해주었다. 또헌 default값을 멤버로 지정을 해줘 일반 회원은 자연스럽게 MEMBER로 지정되고 개발자가 직접 만들어준 계정만 관리자가 된다.
email에는 unique를 주어서 중복이 되는것을 방지하였다.

### 로그인 API

```Javascript
 if (signInUser && (await bcrypt.compare(password, (signInUser).password)))
        {
            // 세션 등록
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
        }
```
받은 email의 정보를 받아 데이터베이스의 password와 입력받은 passwrod를 bcrypt를 통해 비교하여 일치하면 AccessToken과 RefreshToken을 발급해준다.
### 비밀번호 변경 API
```Javascript
@Post('/newpswd')
@UseGuards(AuthGuard('jwt'))
authTest(@Body(ValidationPipe) password:updateUserDto, @Req() req){
      this.logger.log(`${req.user.email}에 대한 비밀번호 변경 요청`);
      this.logger.log(`userService의 chagePassword 호출`);
      return this.userService.changePassword(password,req.user);
    }
```
먼저 비밀번호를 변경전 가드를 통해 토큰을 검증을 하고 검증이 되면 비밀번호 변경을 요청한다.
```Javascript
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
```
입력받은 비밀번호를 데이터베이스로 들어가기전에 bcrypt를 통해 해싱 후 데이터베이스에 저장하도록 하였다.

### 회원목록 조회 API
```Javascript
    @Get('/list')
    @UseGuards(AuthGuard('jwt'),AdminGuard)
    @Roles(UserStatus.ADMIN)   
    async viewMember(){
        this.logger.log(`관리자의 회원목록 조회 요청`);
        this.logger.log(`userService의 getAllList 호출`);
        return await this.userService.getAllList();
    }
```
JWT토큰을 검사해주고 검증된 유저를 adminGuard를 통해 관리자인지 판별 후 관리자인 경우에만 통과되도록 설정을 해주었다.

<br>

 ### 회원가입 시 이메일 인증
회원가입 시 이메일 인증을 하기 위해 사용자가 이메일 인증 버튼을 누르면 입력받은 이메일에 인증메시지를 보내는 형식으로 구성하였다.
이메일 전송은 nodemailer를 사용하여 전송을 하였다.
```Javascript
//user.service
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


//email.service
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
```
이메일 인증을 하기위해 userService에서 이메일을 JWT(5분)토큰을 생성해 해당이메일에 토큰을 포함한 인증버튼을 보내준다.

인증버튼 클릭시 서버내 인증API를 실행한다.

```Javascript
    //이메일 인증메일 확인
    @Post('/email-verify/:email')
    async verifyEmail(@Param() email:verifyEmailDto, @Query() dto:verifyEmailDto){
        this.logger.log(`${email.email}의 이메일 인증요청`);
        const signupVerifyToken  = dto;
        return await this.userService.verifyEmail(email,signupVerifyToken);
    }
```
인증API에서는 입력받은 토큰과 전송받은 이메일이 같으면 성공하는 형식으로 지정하였다.
```Javascript
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
```
성공하면 서버내에서 인증성공 메세지를 보내준다.
 ### Refresh토큰을 사용하여 토큰 재발급 기능
```Javascript
    //access토큰 재발급
    @Post('/refresh')
    @UseGuards(AuthGuard('refresh'))
    async createAccessToken(@Req() req){
        this.logger.log(`${req.user.email}의 액세스 토큰 재발급 요청`);
        this.logger.log(`userService의 reAccessToken 호출`);
        return this.userService.reAccessToken(req.user)
    }
```
사용자가 AccessToken이 만료되어 리프레쉬 토큰을 보내면 가드를 통해 RefreshToken검증을 하여 검증을 성공하면 RegfreshToken에 담겨있는 정보로 다시 AccessToken을 발급해준다.

 ### 중복 로그인 기능 
중복 로그인을 서버내에서 세션을 통해 검증을 한다.

현재는 중복 로그인을 데이터베이스를 통해 검증이 아닌 서버내 세션을 통해 저장을 함으로
서버 종료시 중복 로그인 정보가 사라질 수 있어 데이터베이스로 이전해야 할 것 이다.
 ```Javascript
 //세션을 통한 중복 로그인 검사
        this.logger.log(`로그인 전 ${email}의 로그인 중복 검사`);
        const isAlreadyLoggedIn = this.sessionService.isUserLoggedIn(email);

        if (isAlreadyLoggedIn) {
            // 중복 로그인이 감지됨
            this.logger.log(`${email}은 이미 로그인 중입니다.`);
            throw new UnauthorizedException(`${email}은 이미 로그인 중입니다.`);
        }   
        this.logger.log(`${email}의 중복검사후 로그인 시도`);
        
        if (signInUser && (await bcrypt.compare(password, (signInUser).password)))
        {
            // 세션 등록
            this.sessionService.registerUser(email);
        }
 ```
 ```javascript
 import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class SessionService{
    private readonly logger=new Logger(SessionService.name)

    private loggedInUsers: Set<string>=new Set()
    isUserLoggedIn(username:string): boolean {
        this.logger.log(`${username}의 세션 유무 검사`);

        return this.loggedInUsers.has(username);
    }
    
    registerUser(username:string): void {
        this.logger.log(`${username}의 로그인 완료 및 세션등록`);
        this.loggedInUsers.add(username);
    }
    
    removeUser(username:string): void {
        this.logger.log(`${username}의 로그아웃 및 세션삭제`);
        this.loggedInUsers.delete(username);
    }

}
 ```
이처럼 로그인전에 세션 검사를 통해 유무를 검사하고 통과하면 세션에 등록을 하는 형식으로 구현하였다.
