import { stranger_tune, song2} from "../tunes";
import { useState } from "react";
import './SelectTune.css';

// the value from seclect the songs imported are added into a dictionary and then those dictionary 
export function SelectTune({ value, onChange }) {

    const tuneoptions = [{ name: "Stranger Tune", value: stranger_tune }, { name: "Song2", value: song2 }];

    //this can then be added to the select and the correct song text can be processed
    const options = tuneoptions.map((tune, index) => (
        <option key={tune.name} value={index}>
            {tune.name}
        </option>
    ));
    

    return (
        <select className="select-layout" value={value} onChange={onChange}>
            {options}
        </select>

    )
}