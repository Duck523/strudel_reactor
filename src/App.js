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
import  D3VolumeChart  from './components/D3';

//globalEditior starts off as null
let globalEditor = null;

const handleD3Data = (event) => {
    console.log(event.detail);
};

export default function StrudelDemo() {
    //using hasRun editorRef and canvasRef to swithc from DOM to react implmentation 
    const hasRun = useRef(false);
    const editorRef = useRef(null);
    const canvasRef = useRef(null);

    //setting the globalEditor to either evlautate the studel text or stop 
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

    //these values are for the strudle text if the user switches which song is being played  orginal text is for when the insturments are muted savinf the orginal state.
    const [songText, setSongText] = useState(stranger_tune);
    const [orginalText] = useState(songText);
    const [tuneIndex, setTuneIndex] = useState(0);

    //getting the index of the song in the tunes list passed from the tunes.js
    const pickSong = (e) => {
        const index = parseInt(e.target.value);
        const newSongText = tunes[index]

        //once the correct index is retreived the songText and index is set 

        setTuneIndex(index);
        setSongText(newSongText);

        if (globalEditor) {
            globalEditor.setCode(newSongText);
        }
    }

    //The volume is started at 50 percent and once the slider is used it is updated depedning on the slider amount
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

    //This will work better once I include every instrument in the values but it will search the text for these varaibles and change all values - to silience that section 
    const [instruments, setInstrument] = useState({
        drums : true,
        drums2 : true,
        bassline: true,
    })

    const pickInstruments = (instrument) => {
        setInstrument((prev) => {
            const isOn = prev[instrument];
            const newStatus = { ...prev, [instrument]: !isOn };

            let newText = songText;

            //searches for the part that matches the intrument in the regex and replaces the text woth - else if the box is checked it reverts back to the orgnial format 
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
            <div className="background">
                <main>
                    <h2>Strudel Editor</h2>
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
                                        <StartStopButton OnPlay={handlePlay} OnStop={handleStop}/>
                                        <div className="col-md-4">
                                            <VolumeSlider value={volume} onChange={changeVolume}/>
                                        </div>
                                        <div className="col-md-4">
                                            <PickSounds values={instruments} onToggle={pickInstruments}/>
                                        </div>
                                    </nav>

                                    <SelectTune value={tuneIndex} onChange={pickSong}/>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-4">
                            <D3VolumeChart data={[{ label: 'volume', value: volume}]}/>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-12" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                            <div ref={editorRef} id="editor" style={{ marginBottom: '1rem' }} />
                            <div id="output" />
                        </div>

                        <div className="canvas-container">
                            <canvas ref={canvasRef} id="roll" style={{ width: '100%', height: '200px', border: '1px solid #ccc' }} />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );

        

}