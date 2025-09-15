import Card from "./card";
import "./LandingPage.scss";

const LandingPage = () => {
  const cardsData = [
    {
      title: "Become a Provider",
      description:
        "Run a node with Qubelets, offer no-logs privacy, unlimited bandwidth, and global access as a dVPN provider.",
    },
    {
      title: "Lease Your Node",
      description:
        "Lease your node(s) as a provider and empower users to join the Qubelets dVPN ecosystem.",
    },
    {
      title: "Earn Effortlessly",
      description:
        "Earn effortlessly in TICS while powering the Qubelets dVPN.",
    },
  ];

  return (
    <section className="hero">
      <div className="hero__container">
        <div className="hero__content">
          <h1 className="hero__title">Secure Your Digital Freedom</h1>
          <p>
            Experience the next generation of decentralized VPN technology.
            Connect anonymously, browse securely,
            <br /> and maintain your privacy across the global network.
          </p>
        </div>
      </div>
      <section className="hero_ecosystem">
        <div className="container">
          <div className="hero__content">
            <h1 className="hero__title">Qubetics Ecosystem</h1>
            <p>
              Join the Qubetics ecosystem by running your own dVPN node. Lease
              your node, earn rewards, or launch your own provider service all
              while powering a secure, decentralized network. Setup is simple,
              rewards are real, and your contribution strengthens global privacy
            </p>
          </div>

          <div className="cards-wrapper">
            {cardsData.map((card, index) => (
              <Card
                key={index}
                title={card.title}
                description={card.description}
              />
            ))}
          </div>
        </div>
      </section>
    </section>
  );
};

export default LandingPage;
