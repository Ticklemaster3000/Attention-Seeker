import './Background.css';
import { useContext } from 'react';
import { BackgroundControl } from '../../contexts';

const Background = () => {
    const { image, title, desc, color, expanding, animation } = useContext(BackgroundControl);

    const dynamicStyle = {
        '--base-color': color || '#f5f5f5',
    };

    let statusClass = expanding ? "background" : "collapsed";

    if (animation) {
        statusClass += expanding ? " animate-grow" : " animate-shrink";
    }

    return (
        <div className={statusClass} style={dynamicStyle}>
            <img src={image} alt="icon" className="card-icon" />
            <div className="card-content">
                <p className="text-title">{title}</p>
                <p className="text-body">{desc}</p>
            </div>
            <div className="loader"></div>
        </div>
    );
};

export default Background;