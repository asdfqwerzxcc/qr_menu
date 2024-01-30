import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import * as config from 'config'
import { JwtStrategy } from './jwt.strategy';

const jwtConfig=config.get('jwt');

@Module({
  imports : [
    PassportModule.register({defaultStrategy:'jwt'}),
    JwtModule.register({
      secret:jwtConfig.secret,
      signOptions:{
        expiresIn:jwtConfig.expiresIn
      }
    }),
    TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService,JwtStrategy],
  exports:[JwtStrategy,PassportModule]
})
export class UserModule {}
