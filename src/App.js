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

    const [gains, setGains] = useState({
        drums : 0.6,
        drums2Stack : 0.6,
        drums2S: 0.1,
    })
    const pickInstruments = (instrument, newGain) => {
        setGains(newValue => ({ ...newValue, [instrument]: newGain }));

        let newText = songText;

        Object.keys(gains).forEach(inst => {
            const regex = new RegExp(`const ${inst} = [0-9.]+;`);
            newText = newText.replace(regex, `const ${inst} = ${gains[inst]};`);
        });

        setSongText(newText);
        if (globalEditor) {
            globalEditor.setCode(newText);
        }
            }
        

    useEffect(() => {

        if (!hasRun.current) {
            document.addEventListener("d3Data", handleD3Data);
            console_monkey_patch();
            hasRun.current = true;
            //Code copied from example: https://codeberg.org/uzu/strudel/src/branch/main/examples/codemirror-repl
            //init canvas
            const canvas = document.getElementById('roll');
            canvas.width = canvas.width * 2;
            canvas.height = canvas.height * 2;
            const drawContext = canvas.getContext('2d');
            const drawTime = [-2, 2]; // time window of drawn haps
            globalEditor = new StrudelMirror({
                defaultOutput: webaudioOutput,
                getTime: () => getAudioContext().currentTime,
                transpiler,
                root: document.getElementById('editor'),
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

            document.getElementById('proc').value = stranger_tune
            //SetupButtons()
            //Proc()
        }
        globalEditor.setCode(songText);
    }, [songText]);


    return (
        <div>
            <h2>Strudel Demo</h2>
            <main>

                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-8" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                            <PreprocessText value={songText} onChange={(e) => setSongText(e.target.value)} />
                        </div>
                        <div className="col-md-4">

                            <nav>
                                <br />
                                <StartStopButton OnPlay={handlePlay} OnStop={handleStop} />
                                <div className="col-md-4">
                                    <VolumeSlider value={volume} onChange={changeVolume} />
                                 
                                </div>
                                <div className="col-md-4">
                                    
                                    <PickSounds values={gains} onClick={pickInstruments} />
                                </div>
                            </nav>
                            <SelectTune value={tuneIndex} onChange={pickSong } />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-8" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                            <div id="editor" />
                            <div id="output" />
                        </div>
                        <div className="col-md-4">
                            <div className="form-check">
                              
                                <label className="form-check-label" htmlFor="flexRadioDefault1">
                                    p1: ON
                                </label>
                            </div>
                            <div className="form-check">
                             
                                <label className="form-check-label" htmlFor="flexRadioDefault2">
                                    p1: HUSH
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                <canvas id="roll"></canvas>
            </main >
        </div >
    );


}