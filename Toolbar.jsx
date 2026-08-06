export default function Toolbar({ onSettings }) {
    return (
        <div style={{
            height: "40px",
            background: "#222",
            color: "white",
            display: "flex",
            alignItems: "center",
            padding: "0 15px",
            gap: "20px"
        }}>
            <b>🌳 TreeForge</b>

            <button onClick={onSettings}>
                ⚙ Settings
            </button>
        </div>
    );
}
