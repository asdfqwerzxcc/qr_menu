import { BaseEntity, BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import * as bcrypt from 'bcrypt';
import { UserStatus } from "../user-status.enum";


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

    @Column({name:'status',length:50,nullable:false,default:"Public"})
    status: UserStatus;
}