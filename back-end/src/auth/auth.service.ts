// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import { UsersService } from 'src/users/users.service';

// @Injectable()
// export class AuthService {
//     constructor(
//         private readonly usersService: UsersService,
//         private readonly jwtService: JwtService,
//     ){}

//     async validateUser(id_number: string, password: string): Promise<any> {
//         const user = await this.usersService.getUserByIdNumber(id_number);
//         if (user && user.password === password) {
//             const { password, ...result } = user;
//             return result;
//         }
//         throw new UnauthorizedException('Invalid credentials');
// }
// }