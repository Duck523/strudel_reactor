import { react } from 'react';


//Pick which instruments to play the values are passed in from App.js and once click all values will be switched to -
export function PickSounds({ values = {}, onToggle }) {
    return (
        <div>
            {Object.keys(values).map((key) => (
                <div className="form-check" key={key}>
                    <input className="form-check-input" type="checkbox" id={`checkbox-${key}`} checked={values[key]} onChange={() => onToggle(key)} />
                    <label className="form-check-label" htmlFor={`checkbox-${key}`}> {key} </label>
                </div>
            ))}
        </div>
            );
        }

  