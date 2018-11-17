export default (props) => {
    return (
        <div className="component testSelectorForm">
            <select
                id="selectedTest"
                value={props.selectedTest}
                onChange={e => props.onChange("selectedTest", e.target.value)}
            >
                {props.tests.map((t, i) => (
                    <option key={t.name} value={i}>{t.name}</option>
                ))}
            </select>
        </div>
    );
};