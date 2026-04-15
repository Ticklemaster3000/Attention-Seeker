import './Card.css';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackgroundControl } from '../../contexts';

const Card = ({ object }) => {
    const navigate = useNavigate();
    const { setImage, setTitle, setDesc, setColor, setExpanding, setAnimation } = useContext(BackgroundControl);

    const handleToggle = (e) => {
        e.stopPropagation();
        
        setImage(object.image);
        setTitle(object.title);
        setDesc(object.text);
        setColor(object.color);
        setExpanding(true);
        setAnimation(true);

        setTimeout(() => {
            setAnimation(false);
            navigate(`${object.url}/${object.id}`);
        }, 500);
    };

    const dynamicStyle = {
        '--base-color': object.color || '#f5f5f5',
    };

    return (
        <div 
            className="card" 
            style={dynamicStyle} 
            onClick={handleToggle}
        >
            <img src={object.image} alt="icon" className="card-icon" />
            <div className="card-content">
                <p className="text-title">{object.title}</p>
                <p className="text-body">{object.text}</p>
            </div>
        </div>
    );
};

export default Card;