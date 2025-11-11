import React, { useRef } from 'react';
//process the song text live from the textarea
export function PreprocessText({ value, onChange }) {
    const saveJson = () => {

        const saveData = { songText: value };


        const jsonData = JSON.stringify(saveData, null, 2);

        const blob = new Blob([jsonData], { type: 'application/json' });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `strudel-song-${Date.now()}.json`

        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const fileRef = React.useRef(null);

    const loadJson = () => {
        fileRef.current?.click();
    }

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