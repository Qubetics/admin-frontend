import Lottie from 'lottie-react'
import datajson from "../../assets/Json/loaderFile.json"

function Loader() {
  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        backgroundColor: "#181919",
        overflow: "hidden",
        zIndex: 10000000000,
        position: "fixed",
        top: 0,
        left: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "35px",
      }}
    >
      <div className="lottieIcon">
        <Lottie animationData={datajson} loop={true} style={{ width: "500px", height: "500px" }} />
        {/* <Spin size="large" /> */}
      </div>
    </div>
  )
}

export default Loader