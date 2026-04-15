import { useEffect, useState, useContext } from 'react';
import { BackgroundControl } from "../contexts";
import { fetchLayers } from "../services";
import NavBar from "../containers/Nav-Bar/NavBar";
import HorizontalLayout from "../containers/Horizontal-Layout/HorizontalLayout";
import Module from "../containers/Module/Module";
import DecoderBlock from "../components/Coder-Block/DecoderBlock";
import Background from '../components/Background/Background';
import "../main.css";

const Decoder = () => {
  const { setExpanding, setAnimation, first, setFirst } = useContext(BackgroundControl);
  const [n, setN] = useState(0);

  useEffect(() => {
    const getData = async () => {
      const data = await fetchLayers();
      setN(data);

      if (!first) {
        setExpanding(false);
        setAnimation(true);
      } else {
        setFirst(false);
      }
    };
    getData();
  }, [first, setExpanding, setAnimation, setFirst]);

  return (
    <div className="main-viewport">
      <NavBar floating prevPage="/" />
      <div className="coder-canvas">
        <HorizontalLayout>
          {[...Array(n)].map((_, i) => (
            <Module key={i} xshift>
              <DecoderBlock id={i} title={`DECODER BLOCK - ${i + 1}`} />
            </Module>
          ))}
        </HorizontalLayout>
      </div>
      <Background />
    </div>
  );
};

export default Decoder;