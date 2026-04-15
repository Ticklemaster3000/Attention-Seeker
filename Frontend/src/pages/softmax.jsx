import React, { useState, useEffect, useContext } from 'react';
import NavBar from "../containers/Nav-Bar/NavBar";
import NavBarElement from "../components/Nav-Bar-Element/NavBarElement";
import VerticalLayout from '../containers/Vertical-Layout/VerticalLayout';
import Background from '../components/Background/Background';
import { BackgroundControl } from '../contexts';
import { fetchSoftmaxSteps } from '../services';
import "../main.css";

const SoftmaxViewer = () => {
    const { first, setFirst, setExpanding, setAnimation } = useContext(BackgroundControl);
    const [steps, setSteps] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        const loadData = async () => {
            const data = await fetchSoftmaxSteps();
            setSteps(data);
            setCurrentStep(0);
        };

        loadData();

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

    if (steps.length === 0) {
        return <div className="loading">Perform a translation first...</div>;
    }

    const activeData = steps[currentStep];

    return (
        <VerticalLayout>
            <NavBar prevPage="/">
                <NavBarElement 
                    type={0} 
                    label="Timestep" 
                    value={currentStep} 
                    setter={setCurrentStep} 
                    max={steps.length - 1} 
                />
                <NavBarElement 
                    type={2} 
                    label="Actual Pick" 
                    value={activeData.actual_selection || "End"} 
                />
            </NavBar>

            <div className="item-container">
                <h3>Input Context</h3>
                <div className="tokens-line">
                    {activeData.subsentence.map((t, i) => (
                        <span key={i} className="token-chip history">{t}</span>
                    ))}
                    <span className="token-chip prediction-target">?</span>
                </div>
            </div>

            <div className="item-container">
                <h3>Top Candidates</h3>
                <div className="vertical-chart">
                    {activeData.candidates.map((cand, i) => {
                        const isChosen = cand.token === activeData.actual_selection;
                        const percentage = (cand.prob * 100).toFixed(1);
                        
                        return (
                            <div key={i} className={`v-bar-wrapper ${isChosen ? 'chosen' : ''}`}>
                                <div className="v-bar-label top">{percentage}%</div>
                                <div className="v-bar-bg">
                                    <div 
                                        className="v-bar-fill" 
                                        style={{ height: `${percentage}%` }} 
                                    />
                                </div>
                                <div className="v-bar-token">{cand.token}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <Background />
        </VerticalLayout>
    );
};

export default SoftmaxViewer;