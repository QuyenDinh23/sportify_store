import FacebookLogin from "@greatsumini/react-facebook-login";
import PropTypes from "prop-types";

MyFacebookBtn.propTypes = {
  onFbSuccess: PropTypes.func.isRequired,
  onFbFail: PropTypes.func,
};

export default function MyFacebookBtn({ onFbSuccess, onFbFail }) {
  return (
    <FacebookLogin
      appId={import.meta.env.VITE_FB_APP_ID}
      scope="public_profile,email"
      onSuccess={(response) => {
        console.log("Login Success!", response);
      }}
      onFail={(error) => {
        console.log("Login Failed!", error);
        onFbFail?.(error);
      }}
      onProfileSuccess={onFbSuccess} // dùng callback từ cha
      render={({ onClick }) => (
        <button
          className="w-full border border-gray-300 py-2 flex items-center justify-center hover:bg-gray-200"
          onClick={onClick}
        >
          <img
            src="https://www.svgrepo.com/show/448224/facebook.svg"
            alt="Facebook"
            className="h-5 mr-2"
          />
          Đăng nhập với Facebook
        </button>
      )}
    />
  );
}
