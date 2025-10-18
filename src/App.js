import './cors-redirect';
import './App.css';
import { useEffect, useRef } from "react";
import {initStrudel, evalScope, getAudioContext, webaudioOutput, registerSynthSounds, initAudioOnFirstClick, transpiler} from "@strudel/web";
import { StrudelMirror } from "@strudel/codemirror";
import { registerSoundfonts } from "@strudel/soundfonts";
import { stranger_tune } from "./tunes";
import { StartStopButton, ProcessButton } from "./components/Buttons";

let globalEditor = null;
window.globalEditor = null;

export function ProcessText() {
    return document.getElementById("flexRadioDefault2").checked ? "_" : "";
}

export function Proc() {
    const procText = document.getElementById("proc").value;
    const replacedText = procText.replaceAll("<p1_Radio>", ProcessText());
    globalEditor?.setCode(replacedText);
}

export function ProcAndPlay() {
    if (globalEditor?.repl?.state?.started) {
        Proc();
        globalEditor.evaluate();
    }
}

export default function StrudelDemo() {
    const hasRun = useRef(false);
    const editorRef = useRef(null);
    const procRef = useRef(null);

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;

        (async () => {
                await initStrudel();

                if (!editorRef.current) {
                    console.error("Editor DOM not found yet.");
                    return;
                }

                const editor = new StrudelMirror({
                    defaultOutput: webaudioOutput,
                    getTime: () => getAudioContext().currentTime,
                    transpiler,
                    root: editorRef.current,
                    prebake: async () => {
                        initAudioOnFirstClick();
                        const loadModules = evalScope(
                            import("@strudel/core"),
                            import("@strudel/draw"),
                            import("@strudel/mini"),
                            import("@strudel/tonal"),
                            import("@strudel/webaudio")
                        );
                        await Promise.all([loadModules, registerSynthSounds(), registerSoundfonts()]);
                    },
                });
                requestAnimationFrame(() => {
                    globalEditor = editor;
                    window.globalEditor = editor;

                    const procEl = document.getElementById("proc");
                    if (procEl) {
                        procEl.value = stranger_tune;
                        Proc();
                    } else {
                        console.warn("Proc textarea not found.");
                    }
                });
        })();
    }, []);


    return (
        <div>
            <h2>Strudel Demo</h2>
            <main>
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-8" style={{ maxHeight: "50vh", overflowY: "auto" }}>
                            <label htmlFor="proc" className="form-label">
                                Text to preprocess:
                            </label>
                            <textarea ref={procRef} className="form-control" rows="15" id="proc"></textarea>
                        </div>
                        <div className="col-md-4">
                            <nav>
                                <ProcessButton editorRef={{ current: globalEditor }} procRef={procRef} />
                                <StartStopButton editorRef={{ current: globalEditor }} />
                            </nav>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-8" style={{ maxHeight: "50vh", overflowY: "auto" }}>
                            <div ref={editorRef} id="editor" />
                        </div>
                        <div className="col-md-4">
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="flexRadioDefault"
                                    id="flexRadioDefault1"
                                    onChange={ProcAndPlay}
                                    defaultChecked
                                />
                                <label className="form-check-label" htmlFor="flexRadioDefault1">
                                    p1: ON
                                </label>
                            </div>
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="flexRadioDefault"
                                    id="flexRadioDefault2"
                                    onChange={ProcAndPlay}
                                />
                                <label className="form-check-label" htmlFor="flexRadioDefault2">
                                    p1: HUSH
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
