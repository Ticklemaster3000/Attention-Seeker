import { useState, useEffect, useContext, useCallback } from "react";
import { useParams } from "react-router-dom";
import { fetchEmbeddingByID, fetchEmbeddingByWord, fetchEmbeddingPageWise } from "../services";
import { BackgroundControl } from "../contexts";
import VerticalLayout from "../containers/Vertical-Layout/VerticalLayout";
import HorizontalLayout from "../containers/Horizontal-Layout/HorizontalLayout";
import NavBarElement from "../components/Nav-Bar-Element/NavBarElement";
import Background from "../components/Background/Background";
import NavBar from "../containers/Nav-Bar/NavBar";
import { MeasureScale, VectorVis } from "../components/Vector-Vis/VectorVis";
import leftImg from "../assets/left-arrow.png";
import rightImg from "../assets/right-arrow.png";
import "../main.css";

const Embedding = () => {
  const { setExpanding, setAnimation, first, setFirst } = useContext(BackgroundControl);
  const { id } = useParams();

  const [vector, setVector] = useState([]);
  const [tokenInfo, setTokenInfo] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [tokenId, setTokenId] = useState(0);

  const updateStates = (data) => {
    if (data?.vector) {
      setVector(data.vector);
      setTokenId(data.token_id);
      setTokenInfo(data.word);
      setInputValue(data.word);
    }
  };

  const handleSearchByID = useCallback(async (targetId) => {
    const cleanId = Math.min(Math.max(Number(targetId), 0), 29999);
    const data = await fetchEmbeddingByID(cleanId, id);
    updateStates(data);
  }, [id]);

  const handleSearchByWord = useCallback(async (word) => {
    if (!word) return;
    const data = await fetchEmbeddingByWord(word, id);
    if (data?.vector) {
      setVector(data.vector);
      setTokenId(data.token_id);
      setTokenInfo(data.word);
    }
  }, [id]);

  useEffect(() => {
    handleSearchByID(0);
    const timer = setTimeout(() => {
      if (!first) {
        setExpanding(false);
        setAnimation(true);
      } else {
        setFirst(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [handleSearchByID, first, setExpanding, setAnimation, setFirst]);

  return (
    <VerticalLayout>
      <NavBar prevPage="/">
        <NavBarElement type={0} label="ID" value={tokenId} setter={handleSearchByID} max={30000} />
        <NavBarElement type={1} label="WORD" value={inputValue} setter={(val) => { setInputValue(val); handleSearchByWord(val); }} />
        <NavBarElement type={2} label="CURRENT" value={tokenInfo} />
      </NavBar>

      <div className="item-container">
        <MeasureScale />
        <VectorVis vector={vector} width="100%" height="40px" title />
      </div>

      <EmbeddingGallery />
      <Background />
    </VerticalLayout>
  );
};

const EmbeddingGallery = () => {
  const { id } = useParams();
  const [tokens, setTokens] = useState([]);
  const [page, setPage] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    fetchEmbeddingPageWise(page, pageSize, id)
      .then(setTokens)
      .catch(console.error);
  }, [page, id]);

  return (
    <div className="item-container">
      <HorizontalLayout>
        <button className="gallery-button" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
          <img src={leftImg} alt="Prev" />
        </button>

        <div className="embedding-canvas">
          <VerticalLayout>
            {tokens.map((item) => (
              <div key={item.token_id} className="gallery-item">
                <span className="gallery-id">{item.token_id}</span>
                <span className="gallery-word">{item.word}</span>
                <div className="gallery-strip-wrapper">
                  <VectorVis vector={item.vector} height="20px" />
                </div>
              </div>
            ))}
          </VerticalLayout>
        </div>

        <button className="gallery-button" onClick={() => setPage(p => p + 1)}>
          <img src={rightImg} alt="Next" />
        </button>
      </HorizontalLayout>
    </div>
  );
};

export default Embedding;