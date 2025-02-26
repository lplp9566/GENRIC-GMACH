import { UserRole } from "src/types/userTypes";
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { PaymentDetailsEntity } from "./payment-details/payment_details.entity";

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
    phone_number:string

    @Column()
    role : UserRole

    @Column()
    is_admin :boolean

    @OneToOne(() => PaymentDetailsEntity, (paymentDetails) => paymentDetails.user, { cascade: true })
    payment_details: PaymentDetailsEntity;
}
