import ResidualWrapper from "../../containers/Residual-wrapper/ResidualWrapper";
import Card from "../Card/Card";
import AttentionWrapper from "../../containers/Attention-Wrapper/AttentionWrapper";
import Module from "../../containers/Module/Module";

import brainImg from "../../assets/brain.png";
import normalImg from "../../assets/normal-distribution.png";
import mlpImg from "../../assets/deep-learning.png";

const DecoderBlock = ({ id, title }) => {
    const isBase = id === -1;
    const baseUrl = isBase ? "/decoder" : "";

    const attentionBlock1 = {
        image: brainImg,
        text: "Adds Information about Context",
        title: "MULTI HEAD ATTENTION",
        color: "#ffffba",
        url: isBase ? "/decoder" : "/attention",
        id: isBase ? "" : `decoder-self/${id}`
    };

    const attentionBlock2 = {
        image: brainImg,
        text: "Adds Information about Context",
        title: "MULTI HEAD ATTENTION",
        color: "#ffffba",
        url: isBase ? "/decoder" : "/attention",
        id: isBase ? "" : `decoder-cross/${id}`
    };

    const layerNorm1 = {
        image: normalImg,
        text: "Normalization of vectors",
        title: "LAYER NORMALIZATION",
        color: "#baffc9",
        url: isBase ? "/decoder" : "/layerNorm",
        id: isBase ? "" : `1/${id}/1`
    };

    const layerNorm2 = {
        image: normalImg,
        text: "Normalization of vectors",
        title: "LAYER NORMALIZATION",
        color: "#baffc9",
        url: isBase ? "/decoder" : "/layerNorm",
        id: isBase ? "" : `1/${id}/2`
    };

    const layerNorm3 = {
        image: normalImg,
        text: "Normalization of vectors",
        title: "LAYER NORMALIZATION",
        color: "#baffc9",
        url: isBase ? "/decoder" : "/layerNorm",
        id: isBase ? "" : `1/${id}/3`
    };

    const feedForward = {
        image: mlpImg,
        text: "Standard Multi Layer Perceptron",
        title: "FEED FORWARD",
        color: "#bae1ff",
        url: isBase ? "/decoder" : "/feedForward",
        id: isBase ? "" : `1/${id}`
    };

    return (
        <Module title={title} border={true}>
            <ResidualWrapper>
                <Card object={layerNorm3} />
                <Card object={feedForward} />
            </ResidualWrapper>

            <ResidualWrapper swap={true}>
                <Card object={layerNorm2} />
                <AttentionWrapper multi={true}>
                    <Card object={attentionBlock2} />
                </AttentionWrapper>
            </ResidualWrapper>

            <ResidualWrapper>
                <Card object={layerNorm1} />
                <AttentionWrapper>
                    <Card object={attentionBlock1} />
                </AttentionWrapper>
            </ResidualWrapper>
        </Module>
    );
};

export default DecoderBlock;