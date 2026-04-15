import React, { useState, useEffect, useContext } from 'react';
import { BackgroundControl } from '../contexts';
import { lastInput, translate } from '../services';

import matrixImg from '../assets/matrix.png';
import radarImg from "../assets/radar.png";
import mlpImg from "../assets/deep-learning.png";
import barImg from "../assets/bar-chart.png";

import Card from "../components/Card/Card";
import Background from '../components/Background/Background';
import EncoderBlock from "../components/Coder-Block/EncoderBlock";
import DecoderBlock from "../components/Coder-Block/DecoderBlock";
import HorizontalLayout from '../containers/Horizontal-Layout/HorizontalLayout';
import Module from "../containers/Module/Module";
import "../main.css";

const Home = () => {
  const { first, setFirst, setExpanding, setAnimation } = useContext(BackgroundControl);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!first) {
        setExpanding(false);
        setAnimation(true);
      } else {
        setFirst(false);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [first, setExpanding, setAnimation, setFirst]);

  return (
    <div className="main-viewport">
      <Background />
      <HorizontalLayout>
        <TranslationConsole />
        <div className="home-canvas">
          <Module xshift>
            <EncoderBlock id={-1} title="ENCODER BLOCK X N" />
            <InitialEncoding text="SOURCE ENCODING" lang="en" />
          </Module>

          <Module xshift>
            <ProjectionLayer />
            <DecoderBlock id={-1} title="DECODER BLOCK X N" />
            <InitialEncoding text="TARGET ENCODING" lang="fr" />
          </Module>
        </div>
      </HorizontalLayout>
    </div>
  );
};

const InitialEncoding = ({ text, lang }) => {
  const blocks = [
    {
      image: radarImg,
      text: "Adds Information about position",
      title: "POSITIONAL ENCODING",
      color: "#ffdfba",
      url: "/positional",
      id: ""
    },
    {
      image: matrixImg,
      text: "Converts Tokens to Embeddings",
      title: "EMBEDDING LAYER",
      color: "#ffe2e6",
      url: "/embedding",
      id: lang
    }
  ];

  return (
    <Module title={text} border>
      {blocks.map((block, i) => <Card key={i} object={block} />)}
    </Module>
  );
};

const ProjectionLayer = () => {
  const layers = [
    {
      image: barImg,
      text: "Convert to Probability Distribution",
      title: "SOFT-MAX",
      color: "#eecbff",
      url: "/softmax",
      id: ""
    },
    {
      image: mlpImg,
      text: "Standard Multi Layer Perceptron",
      title: "FEED FORWARD",
      color: "#bae1ff",
      url: "/projection",
      id: ""
    }
  ];

  return (
    <Module title="PROJECTION LAYER" border>
      {layers.map((layer, i) => <Card key={i} object={layer} />)}
    </Module>
  );
};

const TranslationConsole = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    lastInput().then(data => {
      if (data) {
        setInput(data.input);
        setOutput(data.output);
      }
    });
  }, []);

  const handleTranslate = async () => {
    if (!input || isLoading) return;
    setIsLoading(true);
    try {
      const data = await translate(input);
      if (data) setOutput(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="translation-container">
      <h3 className="console-header">Translation Engine</h3>
      <input
        className="input-field"
        type="text"
        placeholder="English Input..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isLoading}
      />
      <button 
        className={`translate-btn ${isLoading ? 'loading' : ''}`} 
        onClick={handleTranslate}
        disabled={isLoading || !input}
      >
        {isLoading ? <span className="spinner">TRANSLATING...</span> : "TRANSLATE →"}
      </button>
      <div className="output-display">
        {output || <span className="placeholder-text">French Output...</span>}
      </div>
    </div>
  );
};

export default Home;