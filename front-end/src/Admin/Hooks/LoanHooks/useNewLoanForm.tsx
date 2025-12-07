import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { toast } from "react-toastify";
import { ICreateLoan } from "../../components/Loans/LoanDto";

export const NEW_LOAN_STEPS = [
  "פרטי ההלוואה הבסיסיים",
  "פרטי הלוואה והערבויות",
  "סיכום ואישור",
];

export function useNewLoanForm() {
  const allUsers = useSelector(
    (s: RootState) => s.AdminUsers.allUsers ?? []
  );
  const selectedUser = useSelector(
    (s: RootState) => s.AdminUsers.selectedUser
  );
  const today = new Date().toISOString().split("T")[0];
  const [activeStep, setActiveStep] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [newLoan, setNewLoan] = useState<
    Omit<ICreateLoan, "guarantor1" | "guarantor2">
  >({
    user: selectedUser?.id ?? 0,
    loan_amount: 0,
    purpose: "",
    loan_date: today,
    monthly_payment: 0,
    payment_date: 1,
  });
  const [guarantors, setGuarantors] = useState<
    { id: number; firstName: string; lastName: string }[]
  >([]);

  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setNewLoan((prev) => ({
      ...prev,
      [name]:
        name === "purpose" || name === "loan_date"
          ? value
          : Number(value),
    }));
  };

  const handleUserChange = (id: number) =>
    setNewLoan((prev) => ({ ...prev, user: id }));

  const addGuarantor = () => {
    if (guarantors.length >= 2) return;
    setGuarantors((prev) => [
      ...prev,
      { id: 0, firstName: "", lastName: "" },
    ]);
  };

  const onGuarantorChange = (idx: number, userId: number) => {
    if (
      guarantors.some((g, i) => g.id === userId && i !== idx)
    ) {
      toast.warn("ערב זה כבר נוסף");
      return;
    }
    const u = allUsers.find((u) => u.id === userId);
    if (!u) return;
    setGuarantors((prev) => {
      const copy = [...prev];
      copy[idx] = {
        id: userId,
        firstName: u.first_name,
        lastName: u.last_name,
      };
      return copy;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeStep < NEW_LOAN_STEPS.length - 1) {
      setActiveStep((s) => s + 1);
      return;
    }
    if (
      !newLoan.user ||
      newLoan.loan_amount <= 0 ||
      newLoan.monthly_payment <= 0 ||
      !newLoan.loan_date ||
      !newLoan.purpose ||
      newLoan.payment_date < 1 
    ) {
      toast.warn(
        "נא למלא את כל הפריטים החובה ולוודא יום תשלום תקין"
      );
      if(newLoan.payment_date < 1 || newLoan.payment_date > 31) toast.warn("תאריך תשלום לא תקין");
      return;
    }
    setOpenModal(true);
  };

  const closeModal = () => setOpenModal(false);

  const borrower = allUsers.find((u) => u.id === newLoan.user);
  const borrowerName = borrower
    ? `${borrower.first_name} ${borrower.last_name}`
    : "";
  const handleBack = () => {
    setActiveStep((s) => Math.max(s - 1, 0));
  };
  const guarantor1 =
    guarantors[0] !== undefined
      ? `${guarantors[0].firstName} ${guarantors[0].lastName}`
      : null;
  const guarantor2 =
    guarantors[1] !== undefined
      ? `${guarantors[1].firstName} ${guarantors[1].lastName}`
      : null;

  const modalLoan: ICreateLoan = {
    ...newLoan,
    guarantor1,
    guarantor2,
  };

  return {
    activeStep,
    newLoan,
    guarantors,
    openModal,
    allUsers,

    handleFieldChange,
    handleUserChange,
    addGuarantor,
    onGuarantorChange,
    handleSubmit,
    closeModal,
    handleBack,
    borrowerName,
    modalLoan,
  };
}
