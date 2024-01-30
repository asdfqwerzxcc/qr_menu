import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import * as config from 'config';
import { User } from "src/user/entity/user.entity";

const dbConfig= config.get('db');

export const typeORMConfig: TypeOrmModuleOptions={
    type: dbConfig.type,
    database:dbConfig.database,
    synchronize:dbConfig.synchronize,
    entities: [User],

}
