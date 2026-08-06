export default function Settings({ close }) {
    return (
        <div style={{
            position: "absolute",
            top: "50px",
            right: "20px",
            width: "300px",
            background: "#333",
            color: "white",
            padding: "20px",
            borderRadius: "10px"
        }}>
            <h2>Settings</h2>

            <label>
                Theme :
                <select>
                    <option>Dark</option>
                    <option>Light</option>
                </select>
            </label>

            <br/><br/>

            <button onClick={close}>
                Close
            </button>
        </div>
    );
}
