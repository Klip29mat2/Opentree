import { Handle, Position } from "@xyflow/react";
import { useState } from "react";

export default function BranchNode() {
    const [scale, setScale] = useState(100);

    return (
        <div
            style={{
                position: "relative",
                background: "#512454",
                color: "white",
                padding: "12px 20px",
                borderRadius: "8px",
                border: "2px solid #512454",
                fontWeight: "bold",
                minWidth: "120px",
                textAlign: "center"
            }}
        >


            <div>Subdivide</div>

            <label
                style={{
                    display: "block",
                    marginTop: "10px",
                    fontSize: "12px"
                }}
            >
                Scale
            </label>

            <input
                type="number"
                min="0"
                max="1000"
                step="1"
                value={scale}
                onChange={(event) => setScale(Number(event.target.value))}
                style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "7px 8px",
                    background: "#121212",
                    color: "#ffffff",
                    border: "1px solid #444",
                    borderRadius: "5px",
                    outline: "none"
                }}
            />

        </div>
    );
}