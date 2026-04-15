import { useRef, useEffect } from "react";
import "./VectorVis.css";

export const MeasureScale = () => (
  <>
    <p className="heatmap-label">Value Scale</p>
    <div className="gradient-bar" />
    <div className="measure-container">
      {["-1.0", "-0.5", "0.0", "0.5", "1.0"].map((m) => (
        <span key={m} className="measure-text">{m}</span>
      ))}
    </div>
  </>
);

const getIntensityColor = (val) => {
  const clamped = Math.max(-1, Math.min(1, val));
  if (clamped === 0) return "#4a4a4a";

  const intensity = Math.floor(Math.abs(clamped) * 255);
  const inverse = 255 - intensity;

  // Positive: Red scale | Negative: Blue scale
  return clamped > 0 
    ? `rgb(255, ${inverse}, ${inverse})` 
    : `rgb(${inverse}, ${inverse}, 255)`;
};

export const VectorVis = ({ vector = [], width, height, title }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const len = vector.length || 1;
    const segmentWidth = canvas.width / len;

    // Clear and batch draw
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    vector.forEach((val, i) => {
      ctx.fillStyle = getIntensityColor(val);
      // Use +1 to avoid sub-pixel gaps between segments
      ctx.fillRect(i * segmentWidth, 0, segmentWidth + 1, canvas.height);
    });
  }, [vector]);

  return (
    <div className="dna-strip-horizontal-container">
      {title && <h3 className="dna-title">{title}</h3>}
      <canvas
        ref={canvasRef}
        width={1024} 
        height={60}
        className="dna-bar-horizontal-wrapper"
        style={{ width, height, display: "block" }}
      />
    </div>
  );
};