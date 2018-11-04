import React from 'react';
import defs from '../defines';

export default (props) => {
    return (<div className="inputForm">
        <h2>列車情報</h2>
        <ul>
            <li>
                <label htmlFor="fuel">燃料</label>
                <select
                    id="fuel"
                    value={props.state.fuel}
                    onChange={e => props.onChange("fuel", e.target.value)}
                >
                    {defs.fuels.map((f, i) =>
                        <option key={f.name} value={i}>{f.name}</option>
                    )}
                </select>
            </li>
            <li>
                <label htmlFor="brake">制動力ボーナス</label>
                <select
                    id="brake"
                    value={props.state.braking_bonus}
                    onChange={e =>
                        props.onChange("braking_bonus", Number.parseFloat(e.target.value))
                    }
                >
                    {defs.braking_bonuses.map((f, i) =>
                        <option key={f} value={f}>{Math.round(f * 100)} %</option>
                    )}
                </select>
            </li>
            {defs.vehicles.map((v, i) =>
                <li key={v.id}>
                    <label htmlFor={"vh" + i} >{v.name}</label>
                    <input
                        id={"vh" + i}
                        type='number'
                        min={v.min}
                        size={3}
                        value={props.state[v.id]}
                        onChange={e => props.onChange(v.id, Number.parseInt(e.target.value))} >
                    </input>
                </li>
            )}
            <li>
                <label htmlFor="leader">先頭車両の種類</label>
                <select 
                    id="leader"
                    value={props.state.leader}
                    onChange={e =>
                        props.onChange("leader", e.target.value)
                    }
                >
                {defs.vehicles.map((v, i) =>
                    <option key={i} value={i} >{v.name}</option>
                )}
                </select>
                
            </li>
        </ul>
    </div>);
}