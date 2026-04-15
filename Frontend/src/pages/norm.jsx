import React, { useEffect, useState, useContext } from 'react';
import { useParams } from "react-router-dom";
import { fetchNorm, fetchNormLen } from '../services';
import { BackgroundControl } from '../contexts';
import NavBar from '../containers/Nav-Bar/NavBar';
import NavBarElement from '../components/Nav-Bar-Element/NavBarElement';
import VerticalLayout from '../containers/Vertical-Layout/VerticalLayout';
import Histogram from '../components/Histogram/Histogram';
import HorizontalLayout from "../containers/Horizontal-Layout/HorizontalLayout";
import FormulaTable from '../components/Formula-Table/FormulaTable';
import Background from "../components/Background/Background";

const LayerNorm = () => {
  const { setExpanding, setAnimation, first, setFirst } = useContext(BackgroundControl);
  const { id, type, num } = useParams();

  const [input, setInput] = useState([]);
  const [output, setOutput] = useState([]);
  const [n, setN] = useState(0);
  const [alpha, setAlpha] = useState(0);
  const [beta, setBeta] = useState(0);
  const [stepN, setStepN] = useState(0);
  const [id1, setID1] = useState(0);
  const [step, setStep] = useState(0);
  const [word, setWord] = useState("");

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const data = await fetchNormLen();
        setN(data.n);
        setStepN(data.maxStep);

        if (!first) {
          setExpanding(false);
          setAnimation(true);
        } else {
          setFirst(false);
        }
      } catch (err) {
        console.error("Failed to fetch metadata:", err);
      }
    };
    fetchMetadata();
  }, [first, setExpanding, setAnimation, setFirst]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchNorm(type, id, num, id1, step);
        setAlpha(data.gamma);
        setBeta(data.beta);
        setInput(data.input);
        setOutput(data.output);
        setWord(data.word);
      } catch (err) {
        console.error("Failed to fetch norm data:", err);
      }
    };
    fetchData();
  }, [type, id, num, id1, step]);

  return (
    <VerticalLayout>
      <NavBar prevPage={type === "0" ? "/encoder" : "/decoder"}>
        {Number(type) === 1 && (
          <NavBarElement type={0} label="STEP" value={step} setter={setStep} max={stepN} />
        )}
        <NavBarElement type={0} label="WORD" value={id1} setter={setID1} max={n} />
        <NavBarElement type={2} label="CURRENT" value={word} />
      </NavBar>

      <HorizontalLayout height="75vh">
        <Histogram 
          Input={input} 
          Output={output} 
          style={{ flex: 2, minWidth: 0 }} 
        />
        <FormulaTable 
          alpha={alpha} 
          beta={beta} 
          style={{ flex: 1 }} 
        />
      </HorizontalLayout>
      <Background />
    </VerticalLayout>
  );
};

export default LayerNorm;