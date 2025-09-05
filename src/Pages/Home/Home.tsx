import { useNavigate } from 'react-router-dom';
import ButtonCustom from '../../Common/Components/ButtonCustom/ButtonCustom';
import Path from '../../Routing/Constant/RoutePaths';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="">
      <ButtonCustom
        label="Sign up with email"
        type="button"
      />
    </div>
  );
}

export default Home;
