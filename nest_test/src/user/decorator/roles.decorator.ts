import { SetMetadata } from '@nestjs/common';
import { UserStatus } from '../user-status.enum';

export const Roles = (role: UserStatus) => 
    SetMetadata('roles', role);
