import React from 'react';
import defs from '../defines';

export default (props) => {
    const train = props.train;
    const varr = props.train.vehicles.concat();
    const length = varr.reduce((c, v) => c + v);

    if (50 < length) {
        return (<span>超長い車列</span>)
    }

    const formation = [];
    formation.push(<img src="img/goto-icon.png" />);
    if (varr[train.leader] != 0) {
        varr[train.leader]--;
        formation.push(<img className="vehicle" key="leader" src={"img/"+defs.vehicles[train.leader].img} />);
    }

    [0,2,3,1].forEach(i => {
        for (let j = 0; j < varr[i]; j++) {
            formation.push(<img className="vehicle" key={i + "_" + j} src={"img/"+defs.vehicles[i].img} />);
        }
    });
    
    return formation.reverse();
}