import { IUser, payment_method_enum } from "../Users/UsersDto"

export  interface  IMonthlyPayment {
     id:number
     user:IUser
     amount:number
     deposit_date:string
     month:number
     year:number
     description?:string
     payment_method:payment_method_enum
}
export interface INewMonthlyPayment {
    user:number
    amount:number
    deposit_date:string
    description?:string
    payment_method:payment_method_enum
}
export interface IUpdateMonthlyPayment {
    id:number
    user:number
    amount:number
    deposit_date:string
    description?:string
    payment_method:payment_method_enum
}
export const paymentMethod = [
    {
        label:'כרטיס אשראי',
        value :"credit_card"
    },
    {
        label:'הוראת קבע',
        value : "direct_debit"
    },
    {
        label:'מזומן',
        value : "cash"
    },
    {
        label:'אחר',
        value : "other"
        
    },
    {
        label:'הבערה בנקאית',
        value : "bank_transfer"
    }
]

 export const hebrewMonthNames = [
  "ינואר",
  "פברואר",
  "מרץ",
  "אפריל",
  "מאי",
  "יוני",
  "יולי",
  "אוגוסט",
  "ספטמבר",
  "אוקטובר",
  "נובמבר",
  "דצמבר",
];