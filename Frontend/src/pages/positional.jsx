import { useRef, useEffect, useMemo, useState, useContext, useCallback } from 'react';
import { BackgroundControl } from "../contexts";
import { fetchPositionalGradient } from "../services";
import NavBar from "../containers/Nav-Bar/NavBar";
import NavBarElement from "../components/Nav-Bar-Element/NavBarElement";
import VerticalLayout from "../containers/Vertical-Layout/VerticalLayout";
import Background from "../components/Background/Background";
import { MeasureScale, VectorVis } from "../components/Vector-Vis/VectorVis";
import encodingEven from "../assets/encoding_even.png";
import encodingOdd from "../assets/encoding_odd.png";

const Positional = () => {
  const { setExpanding, setAnimation, first, setFirst } = useContext(BackgroundControl);
  const [matrix, setMatrix] = useState([]);
  const [vector, setVector] = useState([]);
  const [pos, setPos] = useState(0);
  const [dmodel, setDmodel] = useState(512);

  useEffect(() => {
    const getData = async () => {
      const data = await fetchPositionalGradient();
      if (data) setMatrix(data);
      
      if (!first) {
        setExpanding(false);
        setAnimation(true);
      } else {
        setFirst(false);
      }
    };
    getData();
  }, [first, setExpanding, setAnimation, setFirst]);

  const makePositionalEncoding = useCallback(() => {
    const p = Number(pos);
    const d = Math.min(Number(dmodel) || 0, 2048);
    if (d <= 0) return;

    const peVector = new Array(d);
    for (let i = 0; i < d; i += 2) {
      const denominator = Math.pow(10000, i / d);
      peVector[i] = Math.sin(p / denominator);
      if (i + 1 < d) peVector[i + 1] = Math.cos(p / denominator);
    }
    setVector(peVector);
  }, [pos, dmodel]);

  useEffect(() => {
    makePositionalEncoding();
  }, [makePositionalEncoding]);

  return (
    <VerticalLayout>
      <NavBar prevPage="/">
        <NavBarElement type={0} label="POS" value={pos} setter={setPos} max={1024} />
        <NavBarElement type={1} label="D_MODEL" value={dmodel} setter={setDmodel} />
      </NavBar>

      <div className="item-container">
        <div className="encoding-image-container">
          <img src={encodingEven} alt="Even Formula" />
          <img src={encodingOdd} alt="Odd Formula" />
        </div>
        <MeasureScale />
        <VectorVis vector={vector} width="100%" height="40px" title />
      </div>
      
      <div className='item-container'>
        <PositionalGradient matrix={matrix} />
      </div>
      <Background />
    </VerticalLayout>
  );
};

const PositionalGradient = ({ matrix }) => {
  const canvasRef = useRef(null);
  const seqLen = matrix?.length || 0;
  const dModel = matrix?.[0]?.length || 0;

  const imageDataArray = useMemo(() => {
    if (!matrix || seqLen === 0 || dModel === 0) return null;
    const data = new Uint8ClampedArray(seqLen * dModel * 4);
    
    const mapColor = (val) => {
      const v = Math.max(-1, Math.min(1, val));
      return v < 0 
        ? [255 * (v + 1), 255 * (v + 1), 255] 
        : [255, 255 * (1 - v), 255 * (1 - v)];
    };

    matrix.forEach((row, rIdx) => {
      row.forEach((val, cIdx) => {
        const [r, g, b] = mapColor(val);
        const i = (rIdx * dModel + cIdx) * 4;
        data[i] = r; data[i + 1] = g; data[i + 2] = b; data[i + 3] = 255;
      });
    });
    return data;
  }, [matrix, seqLen, dModel]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx && imageDataArray) {
      canvasRef.current.width = dModel;
      canvasRef.current.height = seqLen;
      ctx.putImageData(new ImageData(imageDataArray, dModel, seqLen), 0, 0);
    }
  }, [imageDataArray, seqLen, dModel]);

  return (
    <div className="gradient-container">
      <div className="gradient-header">
        <h3>POSITIONAL ENCODING MATRIX ({seqLen} x {dModel})</h3>
      </div>
      <div className="canvas-wrapper">
        <canvas ref={canvasRef} className="positional-canvas" />
      </div>
    </div>
  );
};

export default Positional;