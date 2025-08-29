import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import type { AppDispatch } from "../store/store";
import { selectAuth, selectIsAuthenticated, validate } from "../store/features/auth/authSlice";

const ProtectedRoute = () => {
  const isAuth = useSelector(selectIsAuthenticated);
  const status  = useSelector(selectAuth);
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();

  useEffect(() => {
    // בכל כניסה למסלול מוגן מוודאים cookie מול השרת
    // לא זורק שגיאה למשתמש; רק יעדכן state.user אם תקין
    dispatch(validate());
  }, [dispatch]);

  // בזמן בדיקה ראשונית אפשר להחזיר null/ספינר
  if (!isAuth && status.status === "pending") return null;

  return isAuth ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
};

export default ProtectedRoute;
