import { Routes, Route } from "react-router-dom";
import { BackgroundProvider } from './contexts';

import Home from "./pages/home";
import Embedding from "./pages/embedding";
import Positional from "./pages/positional";
import Encoder from "./pages/encoder";
import Decoder from "./pages/decoder";
import LayerNorm from "./pages/norm";
import FeedForward from "./pages/feedforward";
import Projection from "./pages/projection";
import AttentionViewer from "./pages/attention";
import SoftmaxViewer from "./pages/softmax";

import './App.css';

const App = () => {
  return (
    <BackgroundProvider>
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/embedding/:id" element={<Embedding />} />
          <Route path="/positional" element={<Positional />} />
          <Route path="/encoder" element={<Encoder />} />
          <Route path="/decoder" element={<Decoder />} />
          <Route path="/projection" element={<Projection />} />
          <Route path="/softmax" element={<SoftmaxViewer />} />
          
          {/* Parameterized Routes */}
          <Route path="/feedforward/:type/:layerId" element={<FeedForward />} />
          <Route path="/layerNorm/:type/:id/:num" element={<LayerNorm />} />
          <Route path="/attention/:type/:layer" element={<AttentionViewer />} />
        </Routes>
      </div>
    </BackgroundProvider>
  );
};

export default App;