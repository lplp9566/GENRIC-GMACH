// src/Hooks/UserHooks/useNewUserForm.ts
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AppDispatch } from "../../../store/store";
import { IAddUserFormData, MembershipType, payment_method_enum } from "../../components/Users/UsersDto";
import { createUser } from "../../../store/features/admin/adminUsersSlice";
import { SelectChangeEvent } from "@mui/material";

export const useNewUserForm = (navigateParam?: ReturnType<typeof useNavigate>) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = navigateParam ?? useNavigate();

  const [activeStep, setActiveStep] = useState(0);
  const [data, setData] = useState<IAddUserFormData>({
    userData: {
      first_name: "",
      last_name: "",
      id_number: "",
      join_date: null,
      password: "",
      email_address: "",
      phone_number: "",
      is_admin: false,
      current_role: null,
      membership_type: MembershipType.MEMBER,
    },
    paymentData: {
      bank_number: null,
      bank_branch: null,
      bank_account_number: null,
      charge_date: null,
      payment_method: payment_method_enum.direct_debit,
    },
  });

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleUserChange = (key: keyof IAddUserFormData["userData"]) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>
  ) => {
    setData((prev) => ({
      ...prev,
      userData: { ...prev.userData, [key]: e.target.value },
    }));
  };
  const handleOuter = (name:string ,value:any)=>{
    console.log(name,value);
    
    setData((prev) => ({
      ...prev,
      paymentData: { ...prev.paymentData, [name]: value },
    }))

  }
  
  const handleBankFieldChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
  const { name, value } = e.target;
  setData(prev => ({
    ...prev,
    paymentData: {
      ...prev.paymentData,
      [name]: Number(value),
    },
  }));
};

  const handlePaymentFieldChange = (
    e: React.ChangeEvent<HTMLInputElement> | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target as { name: string; value: unknown };
    console.log(name, value);
    let parsed: unknown = value;
    // ממיר למספר את השדות הרצויים
    if (["bank_number", "bank_branch", "bank_account_number", "charge_date"].includes(name)) {
      parsed = Number(value);
    }
    setData(prev => ({
      ...prev,
      paymentData: {
        ...prev.paymentData,
        [name]: parsed,
      },
    }));
  };

 const handleSubmit = (e: React.FormEvent,stepsCount: number) => {
  console.table(data);
  
  e.preventDefault();
if (activeStep < stepsCount - 1) {
    setActiveStep((prev) => prev + 1);
    return;
  }

  const requiredUserFields  = data.userData.membership_type === MembershipType.MEMBER ? ["first_name", "last_name", "id_number", "join_date", "password", "email_address", "phone_number"]as const : [
    "first_name",
    "last_name",
    "id_number",
    "password",
    "phone_number"
  ] as const;

  const missingFields = requiredUserFields.filter(
    (field) => !data.userData[field]
  );

  if (missingFields.length > 0) {
    toast.warn("אנא מלא את כל השדות החובה לפני ההגשה");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.userData.email_address)) {
    toast.warn("כתובת האימייל לא תקינה");
    return;
  }

  if (
    data.paymentData.bank_number != null && data.paymentData.bank_number <= 0 ||
    data.paymentData.bank_branch != null && data.paymentData.bank_branch  <= 0 ||
    data.paymentData.bank_account_number != null && data.paymentData.bank_account_number <= 0
  ) {
    toast.warn("נא למלא את פרטי הבנק באופן תקין");
    return;
  }
  if (
    data.userData.membership_type === MembershipType.MEMBER 

  ) {

    data.paymentData.charge_date === null ||
    data.paymentData.charge_date! > 31 ||
    data.paymentData.charge_date! < 1
   {
    toast.warn("נא למלא את תאריך החיוב באופן תקין");
    return;
  }
  }

  const promise = dispatch(createUser(data));
  toast.promise(
    promise,
    {
      pending: "יוצר את המשתמש…",
      success: "המשתמש נוצר בהצלחה! 👌",
      error: "שגיאה ביצירת המשתמש 💥",
    },
    { autoClose: 3000 }
  ).then(() => {
    // איפוס רק אם נוצר בהצלחה
    setData({
      userData: {
        first_name: "",
        last_name: "",
        id_number: "",
        join_date: "",
        password: "",
        email_address: "",
        phone_number: "",
        is_admin: false,
        current_role: 1,
        membership_type: MembershipType.FRIEND
      },
      paymentData: {
        bank_number: 0,
        bank_branch: 0,
        bank_account_number: 0,
        charge_date: null,
        payment_method: payment_method_enum.direct_debit,
      },
    });
    setActiveStep(0);
    navigate("/users");
  });
};

  return {
    activeStep,
    data,
    setData,
    handleUserChange,
    handleBankFieldChange,
    handleSubmit,
    handleNext,
    handleBack,
    handleOuter,
    handlePaymentFieldChange
  };
};

export default useNewUserForm;
