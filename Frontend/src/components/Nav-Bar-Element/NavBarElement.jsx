import leftImg from "../../assets/left-arrow.png";
import rightImg from "../../assets/right-arrow.png";
import "./NavBarElement.css";

const NavBarElement = ({ type, label, value, setter, max }) => {
  const handleChange = (e) => {
    const val = type === 0 ? Number(e.target.value) : e.target.value;
    setter(val);
  };

  const adjustValue = (delta) => {
    const newVal = Math.min(Math.max(0, value + delta), max - 1);
    setter(newVal);
  };

  const renderContent = () => {
    switch (type) {
      case 0:
        return (
          <div className="input-row">
            <button 
              className="nav-icon-btn" 
              disabled={value <= 0} 
              onClick={() => adjustValue(-1)}
            >
              <img src={leftImg} alt="Prev" />
            </button>
            <input
              type="number"
              value={value}
              className="rounded-input"
              onChange={handleChange}
            />
            <button 
              className="nav-icon-btn" 
              disabled={value >= max - 1} 
              onClick={() => adjustValue(1)}
            >
              <img src={rightImg} alt="Next" />
            </button>
          </div>
        );

      case 1:
        return (
          <div className="input-row">
            <input
              value={value}
              className="rounded-input word-display"
              onChange={handleChange}
            />
          </div>
        );

      case 2:
      default:
        return (
          <input
            value={value}
            readOnly
            className="rounded-input word-display"
            placeholder="Word..."
          />
        );
    }
  };

  return (
    <div className="control-group">
      <label className="control-label">{label}</label>
      {renderContent()}
    </div>
  );
};

export default NavBarElement;