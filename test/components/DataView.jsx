import React from 'react';

const CsvTable = (props) => {
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
                        {r.map((d, j) =>
                            <td key={"td" + j}>{d}</td>
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
            {isLoaded ? <CsvTable data={data} header={header} /> : <span>読み込み中</span>}
        </div>
    );
};