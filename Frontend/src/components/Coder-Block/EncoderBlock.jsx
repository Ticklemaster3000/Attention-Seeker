import ResidualWrapper from "../../containers/Residual-wrapper/ResidualWrapper";
import Card from "../Card/Card";
import AttentionWrapper from "../../containers/Attention-Wrapper/AttentionWrapper";
import Module from "../../containers/Module/Module";

import brainImg from "../../assets/brain.png";
import normalImg from "../../assets/normal-distribution.png";
import mlpImg from "../../assets/deep-learning.png";

const EncoderBlock = ({ id, title }) => {
    const isBase = id === -1;
    const typePath = "0"; // Encoder type constant

    const attentionBlock = {
        image: brainImg,
        text: "Adds Information about Context",
        title: "MULTI HEAD ATTENTION",
        color: "#ffffba",
        url: isBase ? "/encoder" : "/attention",
        id: isBase ? "" : `encoder/${id}`
    };

    const layerNorm1 = {
        image: normalImg,
        text: "Normalization of vectors",
        title: "LAYER NORMALIZATION",
        color: "#baffc9",
        url: isBase ? "/encoder" : "/layerNorm",
        id: isBase ? "" : `${typePath}/${id}/1`
    };

    const feedForward = {
        image: mlpImg,
        text: "Standard Multi Layer Perceptron",
        title: "FEED FORWARD",
        color: "#bae1ff",
        url: isBase ? "/encoder" : "/feedForward",
        id: isBase ? "" : `${typePath}/${id}`
    };

    const layerNorm2 = {
        image: normalImg,
        text: "Normalization of vectors",
        title: "LAYER NORMALIZATION",
        color: "#baffc9",
        url: isBase ? "/encoder" : "/layerNorm",
        id: isBase ? "" : `${typePath}/${id}/2`
    };

    return (
        <Module title={title} border={true}>
            <ResidualWrapper>
                <Card object={layerNorm2} />
                <Card object={feedForward} />
            </ResidualWrapper>

            <ResidualWrapper>
                <Card object={layerNorm1} />
                <AttentionWrapper>
                    <Card object={attentionBlock} />
                </AttentionWrapper>
            </ResidualWrapper>
        </Module>
    );
};

export default EncoderBlock;