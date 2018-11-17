import React from 'react';

export default (props) => {
    const {data, isLoaded} = props;
    
    return (
        <div className="component dataView">
            <h2>データビュー</h2>
            {isLoaded ? <span>読み込み完了</span> : <span>読み込み中</span>}
            <table>
                <tbody>

                </tbody>
            </table>
        </div>
    )
}