
import type { ButtonCustomProps } from '../../Interface/CustomComp.interface';
import './ButtonCustom.scss';

function ButtonCustom(props: ButtonCustomProps) {
  const { label, onClick, type, className, bordered, disabled, tabIndex, id } = props;
  return (
    <button
      className={`customButton ${className ? className : ''} ${bordered ? 'customButton-bordered' : ''}`}
      onClick={onClick}
      type={type}
      disabled={disabled}
      tabIndex={tabIndex}
      id={id}>
      {label}
    </button>
  );
}

export default ButtonCustom;
