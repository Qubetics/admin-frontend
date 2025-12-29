import { useNavigate } from "react-router-dom";
import Footer from "../../Common/Footer/Footer";
import Header from "../../Common/Header/Header";
import "./NotFound.scss";
import ButtonCustom from "../../Common/ButtonCustom/ButtonCustom";

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <>
      <div className="pagenotfound_Header">
        <Header />
      </div>
      <div className="notFound">
        <div className="notFound__decoration notFound__decoration--top"></div>
        <div className="notFound__decoration notFound__decoration--bottom"></div>

        <div className="notFound__container">
          <h3 className="notFound__code">404</h3>
          <h4 className="notFound__title">Page Not Found</h4>
          <p className="notFound__description">
            Oops! The page you're looking for doesn't exist. It might have been
            moved or deleted.
          </p>
          <div className="notFound__buttonWrapper">
            <ButtonCustom label="Back to Home" onClick={handleGoHome} />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};
export default NotFound;
