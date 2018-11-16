import React from 'react';
import {AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Label, Legend, ReferenceLine} from 'recharts';

const renderLegend = (props) => {
    const { payload } = props;
    return (
      <ul>
        {
          payload.map((entry, index) => (
            <li key={`item-${index}`}>{entry.value}</li>
          ))
        }
      </ul>
    );
  }

const CustomTooltip = (props) =>{
    if (!props.active) return null;
    const data = props.payload[0].payload;    
    return (
        <div className="tooltip">
            <table>
                <thead>
                    <tr>
                        <th></th>
                        <th>距離</th>
                        <th>時間</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="acceleration">
                        <th>加速区間</th>
                        <td>{data.acc_dis.toFixed(2)} m</td>
                        <td>{data.acc_sec.toFixed(2)} 秒</td>
                    </tr>
                    <tr className="brake">
                        <th>減速区間</th>
                        <td>{data.brk_dis.toFixed(2)} m</td>
                        <td>{data.brk_sec.toFixed(2)} 秒</td>
                    </tr>
                    {data.cru_dis > 0 ? 
                    <tr className="cruise">
                        <th>巡航区間</th>
                        <td>{data.cru_dis.toFixed(2)} m</td>
                        <td>{data.cru_sec.toFixed(2)} 秒</td>
                    </tr> 
                    : null
                    }
                    
                </tbody>
                <tfoot>
                    <tr>
                        <th>累計</th>
                        <td>{data.ttl_dis.toFixed(2)} m</td>
                        <td>{data.ttl_sec.toFixed(2)} 秒</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
}

const renderDistancebaseGraph = (props) => {
    const {train} = props;
    return (
        <div className="graphView">
            <h2>グラフ（データ検証中）</h2>
            <AreaChart width={600} height={400} margin={{bottom:20, left:15}} data={train.GraphData} >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ttl_dis" name="距離" unit="m" type="number" scale="linear" tickFormatter={v=>v.toFixed(2)} >
                    <Label value="運行距離 [m]" position="insideBottom" offset={-15}/>
                </XAxis>
                <YAxis name="時間" unit="秒">
                    <Label value="所要時間 [sec]" position="insideLeft" angle={-90} offset={0} />
                </YAxis>
                <Legend verticalAlign="top"></Legend>
                <Tooltip content={CustomTooltip}/>
                <Area dataKey='acc_sec' stackId="1" name="加速区間" unit="秒" stroke='#8884d8' fill='#8884d8' />
                <Area dataKey='brk_sec' stackId="1" name="減速区間" unit="秒" stroke='#ffc658' fill='#ffc658' />
                <Area dataKey='cru_sec' stackId="1" name="巡航区間" unit="秒" stroke='#82ca9d' fill='#82ca9d' />                
                <ReferenceLine x={train.maxspd_total_distance}  stroke="red" />
            </AreaChart>
        </div>
    );
}

const renderTimebaseGraph = (props) => {
    const {data, maxspd_distance} = props;
    return (
        <div className="graphView">
            <AreaChart width={600} height={400} margin={{bottom:20, left:15}} data={data} >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ttl_sec" name="時間" unit="秒" type="number" >
                    <Label value="所要時間 [sec]" position="insideBottom" offset={-15}/>
                </XAxis>
                <YAxis name="距離" unit="m">
                    <Label value="運行距離 [m]" position="insideLeft" angle={-90} offset={0} />
                </YAxis>
                <Legend verticalAlign="top"></Legend>
                <Tooltip content={CustomTooltip}/>
                <Area dataKey='acc_dis' stackId="1" name="加速区間" unit="秒" stroke='#8884d8' fill='#8884d8' />
                <Area dataKey='cru_dis' stackId="1" name="巡航区間" unit="秒" stroke='#82ca9d' fill='#82ca9d' />
                <Area dataKey='brk_dis' stackId="1" name="減速区間" unit="秒" stroke='#ffc658' fill='#ffc658' />
                
                <ReferenceLine x={maxspd_distance}  stroke="red" />
            </AreaChart>
        </div>
    );
}

export default renderDistancebaseGraph;