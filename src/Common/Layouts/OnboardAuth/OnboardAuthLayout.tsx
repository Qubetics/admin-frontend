import "./OnboardAuthLayout.scss";
import Header from "../../Header/Header";
import Footer from "../../Footer/Footer";
import type { OnboardAuthLayoutProps } from "../../../utils/Interfaces";

function OnboardAuthLayout({ children }: OnboardAuthLayoutProps) {
  return (
    <div className="onboarding-layout">
      <header className="onboarding-header">
        <Header />
      </header>
      <main className="onboarding-main">
        <div className="login-container">{children}</div>
      </main>
      <footer className="onboarding-footer">
        <Footer />
      </footer>
    </div>
  );
}

export default OnboardAuthLayout;
