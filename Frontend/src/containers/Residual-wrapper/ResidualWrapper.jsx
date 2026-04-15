import "./ResidualWrapper.css"
import addImg from "../../assets/add.png"

const ResidualWrapper = ({ children, swap }) => {
    return (
        <div className={swap ? "reverse-residual-wrapper" : "residual-wrapper"}>
            <img src={addImg} alt="icon" className="add-icon" />
            {children}
        </div>
    )
}

export default ResidualWrapper;