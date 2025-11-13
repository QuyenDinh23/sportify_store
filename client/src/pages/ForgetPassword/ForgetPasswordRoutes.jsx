import MailForget from "./MailForget";
import { AuthFlowProvider, useAuthFlow } from "../../hooks/AuthFlowContext";
import OtpScreen from "./OtpScreen";
import ResetPasswordScreen from "./ResetPasswordScreen";
import { Routes,Route, Navigate } from "react-router-dom";

function OtpRoute() {
  const { step } = useAuthFlow();
  return step >= 2 ? <OtpScreen /> : <Navigate to="/force-reset-password" />;
}
// Route Guard cho Reset Password
function ResetRoute() {
  const { step } = useAuthFlow();
  return step >= 3 ? (
    <ResetPasswordScreen />
  ) : (
    <Navigate to="/force-reset-password" />
  );
}
const ForgetPasswordRoutes = () => {
  return (
    <AuthFlowProvider>
      <Routes>
        <Route path="/force-reset-password" element={<MailForget />} />
        <Route path="/otp" element={<OtpRoute />} />
        <Route path="/reset-password" element={<ResetRoute />} />
      </Routes>
    </AuthFlowProvider>
  );
};

export default ForgetPasswordRoutes;
