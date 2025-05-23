import { UserRole } from "../NavBar/Users/UsersDto"

export interface ILoan {
    id:number ,
    user:{
        id :number ,
        first_name:string 
        last_name :string
        id_number:string
        join_date: Date
        password:string
        email_address:string
        phone_number:string
        role:UserRole
        is_admin:boolean
    },
    loan_amount:number
    loan_date:string
    monthly_payment:number
    isActive:boolean
    remaining_balance:number
    initialMonthlyPayment:number
    total_installments:number
}


