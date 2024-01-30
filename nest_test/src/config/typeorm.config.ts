import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import * as config from 'config';

const dbConfig= config.get('db');

export const typeORMConfig: TypeOrmModuleOptions={
    type: dbConfig.type,
    database:dbConfig.database,
    synchronize:dbConfig.synchronize,
    entities: [__dirname + '/../**/*.entity.{js,ts'],

}
