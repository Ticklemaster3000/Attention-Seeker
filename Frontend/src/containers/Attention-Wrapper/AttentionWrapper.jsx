import "./AttentionWrapper.css"

const AttentionWrapper = ({ children, multi }) => {
    return (
        <div className={multi ? "attention-multi" : "attention-self"}>
            {children}
        </div>
    );
}

export default AttentionWrapper;