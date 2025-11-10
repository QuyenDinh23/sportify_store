// AuthFlowContext.js
import { createContext, useContext, useState } from "react";

const AuthFlowContext = createContext();

export const AuthFlowProvider = ({ children }) => {
  const [email, setEmail] = useState(""); // lưu email
  const [step, setStep] = useState(1); // step: 1-email, 2-otp, 3-reset

  return (
    <AuthFlowContext.Provider value={{ email, setEmail, step, setStep }}>
      {children}
    </AuthFlowContext.Provider>
  );
};

export const useAuthFlow = () => useContext(AuthFlowContext);
