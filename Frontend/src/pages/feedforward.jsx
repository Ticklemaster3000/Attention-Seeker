import React, { useState, useEffect, useContext, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { BackgroundControl } from '../contexts';
import VerticalLayout from '../containers/Vertical-Layout/VerticalLayout';
import NavBar from '../containers/Nav-Bar/NavBar';
import NavBarElement from "../components/Nav-Bar-Element/NavBarElement";
import Background from '../components/Background/Background';
import { fetchFeedForwardData } from '../services';
import '../main.css';

const NeuronLayer = ({ list, x, offset, vGap, label, total }) => (
  <g>
    <text 
      x={x} 
      y={60} 
      textAnchor="middle" 
      fill="currentColor" 
      className="column-labels"
      style={{ fontWeight: '800', fontSize: "1em" }}
    >
      {label} ({total})
    </text>
    {list.map((_, i) => (
      <circle key={i} cx={x} cy={i * vGap + offset} r="4.5" fill="#1e293b" />
    ))}
    <text x={x} y={list.length * vGap + offset + 18} textAnchor="middle" className="ellipses">...</text>
  </g>
);

const WeightLines = ({ weights, x1, x2, off1, off2, vGap, onHover }) => (
  <g>
    {weights.map((row, idxOut) => row.map((w, idxIn) => (
      <line
        key={`${idxOut}-${idxIn}`}
        x1={x1} y1={idxIn * vGap + off1}
        x2={x2} y2={idxOut * vGap + off2}
        stroke={w > 0 ? "#3b82f6" : "#ef4444"}
        strokeWidth={Math.abs(w) * 7 + 0.4}
        strokeOpacity={Math.abs(w) + 0.2}
        className="weight-line"
        onMouseEnter={() => onHover(w.toFixed(4))}
        onMouseLeave={() => onHover(null)}
      />
    )))}
  </g>
);

const FFNFullGraph = ({ layerId, type, onWeightHover }) => {
  const [data, setData] = useState(null);
  const [containerWidth, setContainerWidth] = useState(window.innerWidth);
  const containerRef = useRef(null);
  const { setExpanding, setAnimation, first, setFirst } = useContext(BackgroundControl);

  // Resize Listener to update container width
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const getData = async () => {
      const json = await fetchFeedForwardData(layerId, type);
      if (json) {
        setData(json);
        setTimeout(() => {
          if (!first) {
            setExpanding(false);
            setAnimation(true);
          } else {
            setFirst(false);
          }
        }, 1000);
      }
    };
    getData();
  }, [layerId, type, first, setExpanding, setAnimation, setFirst]);

  const dims = useMemo(() => {
    if (!data) return null;
    
    const vGap = 25;
    const padTop = 80;
    const padSide = 0;
    
    // Dynamically calculate hGap to use full container width
    // (Container width - side paddings) / 2 gaps
    const hGap = Math.max(100, (containerWidth - (padSide * 2)) / 2);

    const heights = {
      hid: data.labels.hid.length * vGap,
      in: data.labels.in.length * vGap,
      out: data.labels.out.length * vGap
    };

    return {
      vGap, hGap, padSide,
      offIn: (heights.hid - heights.in) / 2 + padTop,
      offHid: padTop,
      offOut: (heights.hid - heights.out) / 2 + padTop,
      svgWidth: containerWidth,
      svgHeight: heights.hid + padTop + 50
    };
  }, [data, containerWidth]);

  if (!data || !dims) return <div className="ffn-loader">Loading Weights...</div>;

  const { vGap, hGap, padSide, offIn, offHid, offOut, svgWidth, svgHeight } = dims;

  return (
    <div className="item-container" ref={containerRef} style={{ height: '500px', width: '100%', overflow: 'hidden' }}>
      <svg 
        viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
        preserveAspectRatio="xMidYMid meet" 
        className="ffn-svg-full"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <WeightLines 
          weights={data.w1} x1={padSide} x2={hGap + padSide} 
          off1={offIn} off2={offHid} vGap={vGap} 
          onHover={onWeightHover} 
        />
        <WeightLines 
          weights={data.w2} x1={hGap + padSide} x2={hGap * 2 + padSide} 
          off1={offHid} off2={offOut} vGap={vGap} 
          onHover={onWeightHover}
        />
        <NeuronLayer list={data.labels.in} x={padSide} offset={offIn} vGap={vGap} label="INPUT" total={data.totals.in} />
        <NeuronLayer list={data.labels.hid} x={hGap + padSide} offset={offHid} vGap={vGap} label="HIDDEN" total={data.totals.hid} />
        <NeuronLayer list={data.labels.out} x={hGap * 2 + padSide} offset={offOut} vGap={vGap} label="OUTPUT" total={data.totals.out} />
      </svg>
    </div>
  );
};

const FeedForward = () => {
  const { layerId, type } = useParams();
  const [hoveredWeight, setHoveredWeight] = useState(null);

  return (
    <VerticalLayout>
      <NavBar floating={false} prevPage={type === "0" ? "/encoder" : "/decoder"}>
        <NavBarElement type={2} value={hoveredWeight || "0.0000"} label="WEIGHT"/>
      </NavBar>

      <div className="ffn-responsive-viewport" style={{ width: '100%', padding: '0 0px' }}>
        <FFNFullGraph 
          layerId={layerId} 
          type={type} 
          onWeightHover={setHoveredWeight} 
        />
      </div>

      <Background />
    </VerticalLayout>
  );
};

export default FeedForward;