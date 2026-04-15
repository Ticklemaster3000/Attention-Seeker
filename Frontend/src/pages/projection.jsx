import React, { useState, useEffect, useContext, useMemo } from 'react';
import { BackgroundControl } from '../contexts';
import VerticalLayout from '../containers/Vertical-Layout/VerticalLayout';
import NavBar from '../containers/Nav-Bar/NavBar';
import Background from '../components/Background/Background';
import { fetchProjectionData } from '../services'; 
import '../main.css';

const ProjectionHorizontal = () => {
  const [data, setData] = useState(null);
  const { first, setFirst, setExpanding, setAnimation } = useContext(BackgroundControl);

  useEffect(() => {
    const getData = async () => {
      const json = await fetchProjectionData();
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
  }, [first, setExpanding, setAnimation, setFirst]);

  const dims = useMemo(() => {
    if (!data) return null;
    const hGap = 45;
    const vGap = 300;
    const padSide = 100;
    const padTop = 150;

    const widthIn = (data.input_labels.length - 1) * hGap;
    const widthOut = (data.output_labels.length - 1) * hGap;
    const maxWidth = Math.max(widthIn, widthOut);

    return {
      hGap, vGap, padSide, padTop, maxWidth,
      leftOffsetIn: (maxWidth - widthIn) / 2 + padSide,
      leftOffsetOut: (maxWidth - widthOut) / 2 + padSide,
      svgWidth: maxWidth + padSide * 2,
      svgHeight: vGap + padTop * 2 + 100
    };
  }, [data]);

  if (!data || !dims) return <div className="proj-loader">Aligning Vocabulary...</div>;

  const { hGap, vGap, padSide, padTop, maxWidth, leftOffsetIn, leftOffsetOut, svgWidth, svgHeight } = dims;

  return (
    <div className="item-container">
      <div className="ffn-box">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="proj-svg">
          <g className="column-labels" textAnchor="middle" fill="currentColor">
            <text x={(maxWidth / 2) + padSide} y={40} className="proj-header">
              VOCABULARY LOGITS ({data.totals.out} TOKENS)
            </text>
            <text x={(maxWidth / 2) + padSide} y={vGap + padTop + 140} className="proj-header">
              PROJECTION INPUT ({data.totals.in} DIMS)
            </text>
          </g>

          <g className="projection-edges">
            {data.weights.map((row, outIdx) => row.map((weight, inIdx) => (
              <line 
                key={`edge-${outIdx}-${inIdx}`}
                x1={outIdx * hGap + leftOffsetOut} y1={padTop}
                x2={inIdx * hGap + leftOffsetIn} y2={vGap + padTop}
                stroke={weight > 0 ? "#3b82f6" : "#ef4444"}
                strokeWidth={Math.abs(weight) * 7 + 0.5}
                strokeOpacity={Math.abs(weight) + 0.15}
              />
            )))}
          </g>

          <g className="layer-output">
            {data.output_labels.map((word, i) => (
              <g key={`out-${i}`} transform={`translate(${i * hGap + leftOffsetOut}, ${padTop})`}>
                <circle r="5" fill="#6366f1" stroke="#fff" strokeWidth="1.5" />
                <text transform="rotate(-90)" x="12" y="4" className="rotated-label-bottom">"{word}"</text>
              </g>
            ))}
          </g>

          <g className="layer-input">
            {data.input_labels.map((label, i) => (
              <g key={`in-${i}`} transform={`translate(${i * hGap + leftOffsetIn}, ${vGap + padTop})`}>
                <circle r="4" fill="#475569" />
                <text transform="rotate(90)" x="12" y="4" className="rotated-label-top">{label}</text>
              </g>
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
};

const Projection = () => (
  <VerticalLayout>
    <NavBar floating prevPage="/" />
    <ProjectionHorizontal />
    <Background />
  </VerticalLayout>
);

export default Projection;