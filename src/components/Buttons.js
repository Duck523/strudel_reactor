import { useState } from "react";

export function StartStopButton({ OnPlay, OnStop }) {
    //const [started, setStart] = useState(false);

    //start and stop button use the onPlay and Onstop varaibels to evlaute and play the strudle text
    return (
        <>
            <div className="d-flex gap-2">
                <button className="btn btn-success btn-lg shadow-sm" onClick={OnPlay}>
                    ▶︎ Start
                </button>

                <button className="btn btn-danger btn-lg shadow-sm" onClick={OnStop}>
                    ⏹ Stop
                </button>
            </div>
        </>
    );
}

export function ProcessButton({ editorInstance, procRef }) {
    const process = () => {
        if (!procRef.current || !editorInstance) {
            return;
        }
        const musicText = procRef.current.value;
        const newText = musicText.replaceAll('<p1_Radio>', "_");
        editorInstance.setCode(newText);
    };

    return (
        <button onClick={process} className="btn btn-primary">
            Process
        </button>
    );
}