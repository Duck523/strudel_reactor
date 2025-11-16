import React, { useRef } from 'react';
//process the song text live from the textarea

//also added the json function to the process text allowing the user to save and upload their strudle music
export function PreprocessText({ value, onChange }) {
    const saveJson = () => {

        //text value is saved and then turned into a json string 
        const saveData = { songText: value };


        const jsonData = JSON.stringify(saveData, null, 2);

        const blob = new Blob([jsonData], { type: 'application/json' });

        //the url is thengrabbed to make the save file name 
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `strudel-song-${Date.now()}.json`

        //on the click the the file is savedd
        document.body.appendChild(link);
        link.click();


        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const fileRef = React.useRef(null);

    //load json funtion if it has been clicked the filUpload method is called
    const loadJson = () => {
        fileRef.current?.click();
    }

    //file exploer is opened the user is abke to select a file whici is then read if the text is a json the text is updated to be the file text
    const fileUpload = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const jsonData = JSON.parse(e.target.result);
            if (jsonData.songText) {
                onChange({ target: { value: jsonData.songText } });
            }
        }

        reader.readAsText(file);
        event.target.value = '';
    };

    //save and load buttons calling the required methods 
    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label htmlFor="exampleFormControlTextarea1" className="form-label">Text to preprocess:</label>

                <div>
                    <button onClick={saveJson} className="btn btn-primary" style={{ marginRight: '0.5rem' }}> Save file</button>
                    <button onClick={loadJson} className="btn btn-warning">Load Json</button>
                </div>

                <input ref={fileRef} type="file" accept=".json" onChange={fileUpload} style={{display: "none"}} />
            </div>
            <textarea className="form-control" value={value} onChange={onChange} rows="15" id="proc" ></textarea>
        </>
    )
}