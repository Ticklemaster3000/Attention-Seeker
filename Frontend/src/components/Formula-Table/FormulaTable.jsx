import "./FormulaTable.css";
import formulaImg from "../../assets/formula.png";
import gammaImg from "../../assets/gamma.png";
import betaImg from "../../assets/beta.png";

const FormulaTable = ({ alpha, beta, style }) => {
  const constants = [
    { label: "Alpha", img: gammaImg, value: alpha },
    { label: "Beta", img: betaImg, value: beta },
  ];

  return (
    <div className="table-wrapper" style={style}>
      <table className="formula-table">
        <thead>
          <tr className="row-title">
            <th colSpan="2">FORMULAS AND CONSTANTS</th>
          </tr>
        </thead>
        <tbody>
          <tr className="row-formula-img">
            <td colSpan="2">
              <img src={formulaImg} alt="Formula" />
            </td>
          </tr>
          {constants.map(({ label, img, value }) => (
            <tr key={label} className="row-constant">
              <td className="cell-img">
                <img src={img} alt={label} />
              </td>
              <td className="cell-number">
                {Number(value || 0).toFixed(5)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FormulaTable;