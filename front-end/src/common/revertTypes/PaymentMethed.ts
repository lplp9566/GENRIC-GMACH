import { payment_method_enum } from "../../Admin/components/Users/UsersDto";

export const revertPaymentMethod = (paymentMethod:payment_method_enum) => {
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