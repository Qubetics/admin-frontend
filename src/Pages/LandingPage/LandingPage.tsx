import { Col, Row } from "antd";
import Card from "./card";
import "./LandingPage.scss";

const LandingPage = () => {
  const cardsData = [
    {
      title: "Become a Provider",
      description:
        "Run a node with Qubetics offer no-logs privacy, unlimited bandwidth, and global access as a dVPN provider",
    },
    {
      title: "Lease Your Node",
      description:
        "Lease node(s) as a provider and empower users to join the Qubetics dVPN ecosystem",
    },
    {
      title: "Earn Effortlessly",
      description:
        "Earn Effortlessly in TICS While Powering the Qubetics dVPN",
    },
  ];

  return (
    <section className="hero">
      <div className="hero__container">
        <div className="hero__content">
          <h2 className="hero__title big">Secure Your Digital Freedom</h2>
          <h5 className="top_text">
            Experience the next generation of decentralized VPN technology. Connect anonymously, browse securely, and maintain your
            privacy across the global network
          </h5>
        </div>
      </div>
      <section className="hero_ecosystem container">
        <div className="hero__content">
          <h2 className="hero__title">Qubetics Ecosystem</h2>
          <h5 className="ecosystem_text">
            Join the Qubetics ecosystem by running your own dVPN node. Lease node, earn rewards, or launch your own provider service all while powering a
            secure, decentralized network. Setup is simple, rewards are real, and your contribution strengthens global privacy
          </h5>
        </div>
        <div className="cards-wrapper">
          <Row gutter={[25, 20]} className="card-row">
            {cardsData.map((card, index) => (
              <Col className="gutter-row" lg={8} md={8} sm={12} xs={24}>
                <Card
                  key={index}
                  title={card.title}
                  description={card.description}
                />
              </Col>
            ))}
          </Row>
        </div>
      </section>
    </section>
  );
};

export default LandingPage;
