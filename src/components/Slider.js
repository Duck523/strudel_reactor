import { useState, useEffect, useRef } from "react";
import { initAudioOnFirstClick, getAudioContext } from "@strudel/web";


//Slider that adjusts the gain of the entire music file 
export function VolumeSlider({ value, onChange }) {
    //the volume silder works with a 0 100 range but gain in strudle works with 0.0 to 1 
    const volume = value * 100;

    const handleChange = (e) => {
        const newVolume = parseFloat(e.target.value) / 100;
        onChange(newVolume);
    }

    return (
        <div className="d-flex align-items-center">
            <label id="volumeSlider" className="me-2">Adjust Volume: </label>
            <input id="volumeSlider" type="range" min="0" max="100" value={volume} onChange={handleChange} />
        </div>
    );
}