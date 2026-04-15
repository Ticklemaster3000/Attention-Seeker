import "./Module.css"

const Module = ({ children, title, border, xshift }) => {
  return (
    <div className="layout-vertical">
        <div className="stack-sidebar-title">
            {title}
        </div>

        <div className={`stack-body ${border ? 'bordered' : ''} ${xshift ? 'xshift' : ''}`}>
            {children}
        </div>
    </div>
  );
};

export default Module;