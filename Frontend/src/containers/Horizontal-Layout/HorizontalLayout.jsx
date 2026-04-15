import './HorizontalLayout.css'

const HorizontalLayout = ({ children, height = '450px' }) => {
  return (
    <div 
      className="layout-horizontal" 
      style={{ '--layout-height': height }}
    >
      {children}
    </div>
  );
};

export default HorizontalLayout;