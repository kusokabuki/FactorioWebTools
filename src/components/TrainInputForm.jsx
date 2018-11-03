import React from 'react';
import defs from '../defines';

export default (props) => {
    return (<div>
        <p>
            <label>燃料：</label>
            <select 
                value={props.state.fuel}
                onChange={e => props.onChange("fuel", e.target.value)}
            >
                {defs.fuels.map((f, i) =>
                    <option key={f.name} value={i}>{f.name}</option>
                )}
            </select>
        </p>
        <p>
            <label>制動力ボーナス：</label>
            <select
                value={props.state.braking_bonus}
                onChange={e => 
                    props.onChange("braking_bonus", Number.parseFloat(e.target.value))
                }
            >
                {defs.braking_bonuses.map((f, i) =>
                    <option key={f} value={f}>{Math.round(f * 100)} %</option>
                )}
            </select>
        </p>
        <ul>
            {defs.vehicles.map((v, i) =>
                <li key={v.id}>
                    <label>{v.name}：
                        <input 
                            type='number' 
                            min={v.min} 
                            value={props.state[v.id]}
                            onChange={e => props.onChange(v.id, Number.parseInt(e.target.value))} >
                        </input>
                    </label>
                </li>
            )}
        </ul>
        <p>
            <label>先頭車両の種類：</label>
            {defs.vehicles.map((v, i) =>
                <span key={i}>
                    <input id={"rd"+i} type="radio" value={i} checked={props.state.leader === i}
                        onChange={e => props.onChange("leader", i)} />
                    <label htmlFor={"rd"+i}>{v.name}</label>
                </span>
            )}
        </p>
    </div>);
}