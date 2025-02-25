import { UserRole } from "src/types/userTypes";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
export class UserEntity {
    @PrimaryGeneratedColumn()
    id :number

    @Column()
    first_name :string ;

    @Column()
    last_name :string ;

    @Column()
    join_data :string ;

    @Column()
    password :string ;

    @Column()
    bank_number : number ;

    @Column()
    bank_branch :number;

    @Column()
    bank_account_number:number

    @Column()
    phone_number:string

    @Column()
    role : UserRole

    @Column()
    is_admin :boolean
}
