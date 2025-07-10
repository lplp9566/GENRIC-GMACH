import { payment_method } from "../../Admin/components/Users/UsersDto";

export const revertPaymentMethod = (paymentMethod:payment_method) => {
    switch (paymentMethod) {
        case "cash":
            return "מזומן";
        case "direct_debit":
            return "הוראת קבע";
        case "credit_card":
            return "כרטיס אשראי";
        case "bank_transfer":
            return "העברה בנקאית";
        case "other":
            return "אחר";
        default:
            return paymentMethod;
    }
};