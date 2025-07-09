// src/Hooks/UserHooks/useNewUserForm.ts
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AppDispatch } from "../../../../store/store";
import { IAddUserFormData, payment_method } from "../../../components/Users/UsersDto";
import { createUser } from "../../../../store/features/admin/adminUsersSlice";
import { NEW_USER_STEPS } from "../../../components/Users/AddNewUser/AddNewUser";

export const useNewUserForm = (navigateParam?: ReturnType<typeof useNavigate>) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = navigateParam ?? useNavigate();

  const [activeStep, setActiveStep] = useState(0);

  const [data, setData] = useState<IAddUserFormData>({
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
    },
    paymentData: {
      bank_number: 0,
      bank_branch: 0,
      bank_account_number: 0,
      charge_date: "",
      payment_method: payment_method.direct_debit,
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

  const handlePaymentChange = (key: keyof IAddUserFormData["paymentData"]) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>
  ) => {
    setData((prev) => ({
      ...prev,
      paymentData: { ...prev.paymentData, [key]: e.target.value },
    }));
  };

 const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  // מעבר שלבים
  if (activeStep < NEW_USER_STEPS.length - 1) {
    setActiveStep((prev) => prev + 1);
    return;
  }

  // ולידציה רק בשלב האחרון
  const requiredUserFields = [
    "first_name",
    "last_name",
    "id_number",
    "join_date",
    "password",
    "email_address",
    "phone_number"
  ] as const;

  const missingFields = requiredUserFields.filter(
    (field) => !data.userData[field]
  );

  if (missingFields.length > 0) {
    toast.warn("אנא מלא את כל השדות החובה לפני ההגשה");
    return;
  }

  // בדיקות נוספות לדוגמה
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.userData.email_address)) {
    toast.warn("כתובת האימייל לא תקינה");
    return;
  }

  if (
    data.paymentData.bank_number <= 0 ||
    data.paymentData.bank_branch <= 0 ||
    data.paymentData.bank_account_number <= 0
  ) {
    toast.warn("נא למלא את פרטי הבנק באופן תקין");
    return;
  }

  // רק אחרי שכל הבדיקות עברו, מבצע יצירה
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
      },
      paymentData: {
        bank_number: 0,
        bank_branch: 0,
        bank_account_number: 0,
        charge_date: "",
        payment_method: payment_method.direct_debit,
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
    handlePaymentChange,
    handleSubmit,
    handleNext,
    handleBack,
  };
};

export default useNewUserForm;
