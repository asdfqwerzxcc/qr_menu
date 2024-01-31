import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "./entity/user.entity";
import { Repository } from "typeorm";
import * as config from 'config';

const JwtConfig=config.get('jwt')

@Injectable()

export class RefreshStrategy  extends PassportStrategy(Strategy,'refresh'){
    constructor(@InjectRepository(User) 
    private userRepository:Repository<User>){
        super({
            secretOrKey:JwtConfig.refresh_secret,
            jwtFromRequest:ExtractJwt.fromAuthHeaderAsBearerToken()
        })
    }
    async validate(payload){
        const {email}=payload;
        const user: User= await this.userRepository.findOne({where:{email}});

        if(!user){
            throw new UnauthorizedException();
        }

        return user
    }

}