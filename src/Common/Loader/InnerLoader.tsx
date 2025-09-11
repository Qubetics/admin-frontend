import Lottie from 'lottie-react'
import datajson from "../../assets/Json/loaderFile.json"

function InnerLoader() {
  return (
    <div
      style={{
        height: "400px",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "35px",
      }}
    >
      <div className="lottieIcon">
        <Lottie animationData={datajson} loop={true} style={{ width: "100px", height: "100px" }} />
        {/* <Spin size="large" /> */}
      </div>
    </div>
  )
}

export default InnerLoader