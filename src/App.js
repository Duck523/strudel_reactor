import './App.css';
import { Component, useEffect, useRef, useState } from "react";
import { StrudelMirror } from '@strudel/codemirror';
import { evalScope } from '@strudel/core';
import { drawPianoroll } from '@strudel/draw';
import { initAudioOnFirstClick } from '@strudel/webaudio';
import { transpiler } from '@strudel/transpiler';
import { getAudioContext, webaudioOutput, registerSynthSounds } from '@strudel/webaudio';
import { registerSoundfonts } from '@strudel/soundfonts';
import { stranger_tune, tunes } from './tunes';
import console_monkey_patch, { getD3Data } from './console-monkey-patch';
import { StartStopButton, ProcessButton } from './components/Buttons'
import { PreprocessText } from './components/SongText'
import { SelectTune } from './components/SelectTune'
import { VolumeSlider } from './components/Slider';
import { PickSounds } from './components/CheckBox';

let globalEditor = null;

const handleD3Data = (event) => {
    console.log(event.detail);
};

//export function SetupButtons() {

//    document.getElementById('play').addEventListener('click', () => globalEditor.evaluate());
//    document.getElementById('stop').addEventListener('click', () => globalEditor.stop());
//    document.getElementById('process').addEventListener('click', () => {
//        Proc()
//    }
//    )
//    document.getElementById('process_play').addEventListener('click', () => {
//        if (globalEditor != null) {
//            Proc()
//            globalEditor.evaluate()
//        }
//    }
//    )
//}



//export function ProcAndPlay() {
//    if (globalEditor != null && globalEditor.repl.state.started == true) {
//        console.log(globalEditor)
//        Proc()
//        globalEditor.evaluate();
//    }
//}

//export function Proc() {

//    let proc_text = document.getElementById('proc').value
//    let proc_text_replaced = proc_text.replaceAll('<p1_Radio>', ProcessText);
//    ProcessText(proc_text);
//    globalEditor.setCode(proc_text_replaced)
//}

//export function ProcessText(match, ...args) {

//    let replace = ""
//    if (document.getElementById('flexRadioDefault2').checked) {
//        replace = "_"
//    }

//    return replace
//}

export default function StrudelDemo() {

    const hasRun = useRef(false);
    const editorRef = useRef(null);
    const canvasRef = useRef(null);

    const handlePlay = () => {
        if (globalEditor) {
            globalEditor.evaluate()
        }
    }

    const handleStop = () => {
        if (globalEditor) {
            globalEditor.stop()
        }
    }
   
    const [songText, setSongText] = useState(stranger_tune);
    const [orginalText] = useState(songText);
    const [tuneIndex, setTuneIndex] = useState(0);

    const pickSong = (e) => {
        const index = parseInt(e.target.value);
        const newSongText = tunes[index]

        setTuneIndex(index);
        setSongText(newSongText);

        if (globalEditor) {
            globalEditor.setCode(newSongText);
        }
    }

    const [volume, setVolume] = useState(0.5);
    const changeVolume = (newVolume) => {
        setVolume(newVolume);

        const newText = songText.replace(
            /const masterGain = [0-9.]+;/,
            `const masterGain = ${newVolume};`
        );

        setSongText(newText);

        globalEditor.setCode(newText);

    }

    const [instruments, setInstrument] = useState({
        drums : true,
        drums2Stack : true,
        drums2S: true,
    })

    const pickInstruments = (instrument) => {
        setInstrument((prev) => {
            const isOn = prev[instrument];
            const newStatus = { ...prev, [instrument]: !isOn };

            let newText = songText;

            if (isOn) {
                const regex = new RegExp(`${instrument}:([\\s\\S]*?)(?=\\n\\w+:|$)`);
                newText = newText.replace(regex, `${instrument}:\n  s("-")\n`);
            } else {
                const orginal = orginalText.match(new RegExp(`${instrument}:([\\s\\S]*?)(?=\\n\\w+:|$)`));

                if (orginal) {
                    newText = newText.replace(new RegExp(`${instrument}:([\\s\\S]*?)(?=\\n\\w+:|$)`), orginal[0]);
                }
            }

            setSongText(newText);
            if (globalEditor) {
                globalEditor.setCode(newText);
            }

            return newStatus;
        });
    };


        

    useEffect(() => {

        if (!hasRun.current) {
            document.addEventListener("d3Data", handleD3Data);
            console_monkey_patch();
            hasRun.current = true;
            //Code copied from example: https://codeberg.org/uzu/strudel/src/branch/main/examples/codemirror-repl
            //init canvas
            const canvas = canvasRef.current;
            if (!canvas) {
                return;
            }
            canvas.width = canvas.width * 2;
            canvas.height = canvas.height * 2;
            const drawContext = canvas.getContext('2d');
            const drawTime = [-2, 2]; // time window of drawn haps
            if (editorRef.current) { 
            globalEditor = new StrudelMirror({
                defaultOutput: webaudioOutput,
                getTime: () => getAudioContext().currentTime,
                transpiler,
                root: editorRef.current,
                drawTime,
                onDraw: (haps, time) => drawPianoroll({ haps, time, ctx: drawContext, drawTime, fold: 0 }),
                prebake: async () => {
                    initAudioOnFirstClick(); // needed to make the browser happy (don't await this here..)
                    const loadModules = evalScope(
                        import('@strudel/core'),
                        import('@strudel/draw'),
                        import('@strudel/mini'),
                        import('@strudel/tonal'),
                        import('@strudel/webaudio'),
                    );
                    await Promise.all([loadModules, registerSynthSounds(), registerSoundfonts()]);
                },
            });
        }
            const procElem = document.getElementById('proc');
            if (procElem) procElem.value = stranger_tune;
            //SetupButtons()
            //Proc()
        }
        if (globalEditor) { 
            globalEditor.setCode(songText);
        }
    }, [songText]);


    return (
            <div className="App">
                <h2>Strudel Demo</h2>
                <div className="background">
                <main>
                    <div className="container-fluid">
                        <div className="row col-md-8"></div>

                        <div className="row">
                            <div className="col-md-8">
                                <div className="textarea-container">
                                    <PreprocessText value={songText} onChange={(e) => setSongText(e.target.value)} />
                                </div>
                            </div>

                            <div className="col-md-4">
                            <div className="button-container">
                                <nav>
                                    <br />
                                    <StartStopButton
                                        OnPlay={handlePlay}
                                        OnStop={handleStop}
                                    />
                                    <div className="col-md-4">
                                        <VolumeSlider
                                            value={volume}
                                            onChange={changeVolume}
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <PickSounds
                                            values={instruments}
                                            onToggle={pickInstruments}
                                        />
                                    </div>
                                </nav>

                                <SelectTune
                                    value={tuneIndex}
                                    onChange={pickSong}
                                />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-12" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                            <div ref={editorRef} id="editor" style={{ marginBottom: '1rem' }}/>
                            <div id="output" />
                            <div className="canvas-container">
                                    <canvas ref={canvasRef}  id="roll" style={{ width: '100%', height: '200px', border: '1px solid #ccc', }} />
                            </div>
                        </div>
                        </div>
                </main>
            </div>
        </div>
    );

        

}