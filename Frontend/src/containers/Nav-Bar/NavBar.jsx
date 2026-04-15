import "./NavBar.css"
import Card from "../../components/Card/Card"
import backImg from "../../assets/back.png"

const NavBar = ({ children, prevPage, floating=false }) => {
    const backButton = { image: backImg, title: "Back", color: "#ffe2e6", url: prevPage, id:"" };

    if (floating) {
        return (
            <div className="floating-button">
                <Card object={backButton} />
            </div>
        );
    }

    return (
        <div className="top-nav-wrapper">
            <Card object={backButton} />
            <div className="search-navbar-container">
                {children}
            </div>
        </div>
    );
};

export default NavBar;