import './VerticalLayout.css'

const VerticalLayout = ({ children }) => {
  return (
    <div className="vertical-container">
        {children}
    </div>
  );
};

export default VerticalLayout;