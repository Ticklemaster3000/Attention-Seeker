import { createContext, useState, useMemo } from 'react';

export const BackgroundControl = createContext();

export const BackgroundProvider = ({ children }) => {
  const [image, setImage] = useState(null);
  const [title, setTitle] = useState(null);
  const [desc, setDesc] = useState(null);
  const [color, setColor] = useState(null);
  const [expanding, setExpanding] = useState(false);
  const [animation, setAnimation] = useState(false);
  const [first, setFirst] = useState(true);

  const value = useMemo(() => ({
    image, setImage,
    title, setTitle,
    desc, setDesc,
    color, setColor,
    expanding, setExpanding,
    animation, setAnimation,
    first, setFirst
  }), [image, title, desc, color, expanding, animation, first]);

  return (
    <BackgroundControl.Provider value={value}>
      {children}
    </BackgroundControl.Provider>
  );
};