import { IUser, payment_method } from "../Users/UsersDto"

export  interface  IMonthlyPayment {
     id:number
     user:IUser
     amount:number
     deposit_date:string
     month:number
     year:number
     description?:string
     payment_method:payment_method
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