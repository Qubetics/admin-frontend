import "./Footer.scss";
import LogoFooter from "../../assets/Logo.svg";
import x from "../../assets/x.svg";
import Telegram from "../../assets/Telegram.svg";
import Discord from "../../assets/Discord.svg";
import YouTube from "../../assets/YouTube.svg";
import Instagram from "../../assets/Instagram.svg";
import TickTok from "../../assets/TickTok.svg";
import coinmarketcap from "../../assets/coinmarketcap.svg";
import { envConstants } from "../../Constant/envConstants";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__container container">
        <div className="footer__content">
          {/* Brand */}
          <div className="footer__brand">
            <div className="footer__logo">
              <img src={LogoFooter} alt="" />
            </div>
            <p className="footer__description">
              Build without limits. Qubetics an interoperable <br /> ecosystem
              uniting all leading networks.
            </p>
          </div>
          {/* Quick Links */}
          <div className="footer__section">
            <h5 className="footer__section-title">Quick Links</h5>
            <ul className="footer__links">
              <li>
                <a
                  target="_blank"
                  href={`${envConstants.explorer_link}/token`}
                  className="footer__link"
                >
                  Tokens
                </a>
              </li>
              <li>
                <a
                  target="_blank"
                  href={`${envConstants.explorer_link}/blocks`}
                  className="footer__link"
                >
                  Blockchain
                </a>
              </li>
              <li>
                <a
                  target="_blank"
                  href={`${envConstants.explorer_link}/validators`}
                  className="footer__link"
                >
                  Validators
                </a>
              </li>
              <li>
                <a
                  target="_blank"
                  href={`${envConstants.explorer_link}/nodes`}
                  className="footer__link"
                >
                  Nodes
                </a>
              </li>
            </ul>
          </div>
          {/* About Us */}
          <div className="footer__section">
            <h5 className="footer__section-title">About Us</h5>
            <ul className="footer__links">
              <li>
                <a
                  target="_blank"
                  href={envConstants.privacy_policy_link}
                  className="footer__link"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  target="_blank"
                  href={envConstants.terms_of_service_link}
                  className="footer__link"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Products & Services */}
          <div className="footer__section">
            <h5 className="footer__section-title">Products & Services</h5>
            <ul className="footer__links">
              <li>
                <a
                  target="_blank"
                  href={envConstants.qubetics_validator_app_link}
                  className="footer__link"
                >
                  Qubetics Validator App
                </a>
              </li>
              <li>
                <a
                  target="_blank"
                  href={envConstants.qubetics_delegator_app_link}
                  className="footer__link"
                >
                  Qubetics Delegator App
                </a>
              </li>
              {/* <li>
                <a target="blank" href="#" className="footer__link">
                  Qubetics DEX
                </a>
              </li>
              <li>
                <a target="blank" href="#" className="footer__link">
                  Qubetics App
                </a>
              </li> */}
              <li>
                <a
                  target="_blank"
                  href={envConstants.qubetics_ide_link}
                  className="footer__link"
                >
                  Qubetics IDE
                </a>
              </li>
              <li>
                <a
                  target="_blank"
                  href={envConstants.qubeqode_link}
                  className="footer__link"
                >
                  QubeQode
                </a>
              </li>
              <li>
                <a
                  target="_blank"
                  href={envConstants.app_link}
                  className="footer__link"
                >
                  Qubetics dVPN
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="footer__section">
            <h5 className="footer__section-title">Resources</h5>
            <ul className="footer__links">
              <li>
                <a
                  target="_blank"
                  href={envConstants.web_link}
                  className="footer__link"
                >
                  Official Web
                </a>
              </li>
              <li>
                <a
                  target="_blank"
                  href={envConstants.network_documentation_link}
                  className="footer__link"
                >
                  Qubetics Network Documentation
                </a>
              </li>
              <li>
                <a
                  target="_blank"
                  href={envConstants.qubetics_documentation_link}
                  className="footer__link"
                >
                  Qubetics Documentation
                </a>
              </li>
              <li>
                <a
                  target="_blank"
                  href={envConstants.github_link}
                  className="footer__link"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer__social">
          <h4>Get in touch!</h4>
          <div className="footer__social__items">
            <a
              target="_blank"
              href={envConstants.x_link}
              className="footer__social-link"
            >
              <img src={x} alt="" />
            </a>
            <a
              target="_blank"
              href={envConstants.telegram_link}
              className="footer__social-link"
            >
              <img src={Telegram} alt="" />
            </a>
            <a
              target="_blank"
              href={envConstants.discord_link}
              className="footer__social-link"
            >
              <img src={Discord} alt="" />
            </a>
            <a
              target="_blank"
              href={envConstants.youtube_link}
              className="footer__social-link"
            >
              <img src={YouTube} alt="" />
            </a>
            <a
              target="_blank"
              href={envConstants.instagram_link}
              className="footer__social-link"
            >
              <img src={Instagram} alt="" />
            </a>{" "}
            <a
              target="_blank"
              href={envConstants.tiktok_link}
              className="footer__social-link"
            >
              <img src={TickTok} alt="" />
            </a>{" "}
            <a
              target="_blank"
              href={envConstants.coinmarketcap_link}
              className="footer__social-link"
            >
              <img src={coinmarketcap} alt="" />
            </a>
          </div>
        </div>

        <div className="footer__bottom">
          <h5 className="footer__copyright">
            ©2025 Copyright Qubetics. All rights reserved.
          </h5>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
