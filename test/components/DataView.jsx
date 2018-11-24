import React from 'react';

const ObjectTable = (props) => {
    const { data, header } = props;
    return (
        <table>
            <thead>
                <tr>
                    {header.map((v, i) => <th key={"th" + i}>{v}</th>)}
                </tr>
            </thead>
            <tbody>
                {data.map((r, i) =>
                    <tr key={"tr" + i}>
                        {header.map((h, j) =>{
                            let cls  = h.split("_")[0];
                            if (cls == "dif") {
                                cls += r[h] > 0 ? " perr" : " nerr";
                            }
                            return <td className={cls} key={"td" + j}>{r[h].toFixed(5)}</td>
                        }
                            
                        )}
                    </tr>
                )}
            </tbody>
        </table>
    );
}

export default (props) => {
    const { data, header, isLoaded } = props;
    return (
        <div className="component dataView">
            <h2>データビュー</h2>
            {isLoaded ? <ObjectTable data={data} header={header} /> : <span>読み込み中</span>}
        </div>
    );
};