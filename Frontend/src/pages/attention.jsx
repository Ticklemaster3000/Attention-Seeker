import React, { useState, useEffect, useMemo, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { BackgroundControl } from '../contexts';
import NavBar from "../containers/Nav-Bar/NavBar";
import NavBarElement from "../components/Nav-Bar-Element/NavBarElement";
import VerticalLayout from '../containers/Vertical-Layout/VerticalLayout';
import HorizontalLayout from '../containers/Horizontal-Layout/HorizontalLayout';
import Background from '../components/Background/Background';
import "../main.css";

const ROW_HEIGHT = 45;
const GAP = 5;
const BASE_URL = "http://localhost:8000";

const TokenColumn = ({ tokens, hoveredIdx, setHoveredIdx, side }) => (
  <div className="token-column">
    {tokens.map((token, i) => (
      <div
        key={`${side}-${i}`}
        className={`token ${hoveredIdx === i ? 'active' : ''}`}
        style={{ height: ROW_HEIGHT, marginBottom: GAP }}
        onMouseEnter={() => setHoveredIdx(i)}
        onMouseLeave={() => setHoveredIdx(null)}
      >
        {token}
      </div>
    ))}
  </div>
);

const AttentionViewer = () => {
  const { layer, type } = useParams();
  const { setExpanding, setAnimation, first, setFirst } = useContext(BackgroundControl);

  const [head, setHead] = useState(0);
  const [maxHead, setMaxHead] = useState(0);
  const [hoveredSrc, setHoveredSrc] = useState(null);
  const [hoveredTgt, setHoveredTgt] = useState(null);
  const [data, setData] = useState({ weights: [], src_tokens: [], tgt_tokens: [] });

  useEffect(() => {
    const controller = new AbortController();
    const query = `layer_id=${layer}&type_l=${type}`;

    const fetchData = async () => {
      try {
        const [attRes, metaRes] = await Promise.all([
          fetch(`${BASE_URL}/attention/?${query}`, { signal: controller.signal }),
          fetch(`${BASE_URL}/attentionMeta/?${query}`, { signal: controller.signal })
        ]);
        const [attJson, metaJson] = await Promise.all([attRes.json(), metaRes.json()]);
        setData(attJson);
        setMaxHead(metaJson);
      } catch (err) {
        if (err.name !== 'AbortError') console.error(err);
      }
    };

    fetchData();

    const timer = setTimeout(() => {
      if (!first) {
        setExpanding(false);
        setAnimation(true);
      } else {
        setFirst(false);
      }
    }, 500);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [layer, type]);

  const activeWeights = useMemo(() => data.weights[head] || [], [data.weights, head]);
  
  const layoutHeight = useMemo(() => {
    const srcH = data.src_tokens.length * (ROW_HEIGHT + GAP) - GAP;
    const tgtH = data.tgt_tokens.length * (ROW_HEIGHT + GAP) - GAP;
    return Math.max(srcH, tgtH, 0);
  }, [data.src_tokens, data.tgt_tokens]);

  const focusLabel = hoveredSrc !== null ? data.src_tokens[hoveredSrc] : (hoveredTgt !== null ? data.tgt_tokens[hoveredTgt] : "None");

  return (
    <VerticalLayout>
      <NavBar prevPage={type === "encoder" ? "/encoder" : "/decoder"}>
        <NavBarElement type={0} label="Head" value={head} setter={setHead} max={maxHead} />
        <NavBarElement type={2} label="Focus" value={focusLabel} />
      </NavBar>

      <div className="item-container main-scroll-area">
        <div className="scroll-viewport">
          <HorizontalLayout>
            <TokenColumn side="src" tokens={data.src_tokens} hoveredIdx={hoveredSrc} setHoveredIdx={setHoveredSrc} />
            
            <div className="svg-wrapper">
              <svg viewBox={`0 0 100 ${layoutHeight}`} className="attention-svg" style={{ height: layoutHeight }} preserveAspectRatio="none">
                {activeWeights.map((row, tgtIdx) => 
                  row.map((weight, srcIdx) => {
                    if (weight < 0.01) return null;
                    const isFocused = hoveredSrc === srcIdx || hoveredTgt === tgtIdx;
                    const isDimmed = (hoveredSrc !== null || hoveredTgt !== null) && !isFocused;
                    const ySrc = srcIdx * (ROW_HEIGHT + GAP) + (ROW_HEIGHT / 2);
                    const yTgt = tgtIdx * (ROW_HEIGHT + GAP) + (ROW_HEIGHT / 2);

                    return (
                      <path 
                        key={`${srcIdx}-${tgtIdx}`}
                        d={`M 0 ${ySrc} C 50 ${ySrc}, 50 ${yTgt}, 100 ${yTgt}`}
                        stroke={`hsl(${head * 45}, 70%, 60%)`}
                        strokeWidth={isFocused ? weight * 6 : weight * 3}
                        strokeOpacity={isDimmed ? 0.02 : weight + 0.1}
                        fill="none"
                      />
                    );
                  })
                )}
              </svg>
            </div>

            <TokenColumn side="tgt" tokens={data.tgt_tokens} hoveredIdx={hoveredTgt} setHoveredIdx={setHoveredTgt} />
          </HorizontalLayout>
        </div>
      </div>
      <Background />
    </VerticalLayout>
  );
};

export default AttentionViewer;