
import ButtonCustom from '../../Common/ButtonCustom/ButtonCustom';
import "./Login.scss"

export default function Login() {

  // Login form handling using formik
  return (
    <form  className="loginForm">
      
      <h3>Login</h3>
      <div className='connectBtn'>
      <ButtonCustom
        label="Connect Wallet"
        type="submit"
        tabIndex={3}
      />
      </div>
    </form>
  );
}
