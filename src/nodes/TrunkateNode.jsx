import { Handle, Position } from "@xyflow/react";
import { useTree } from "../context/TreeContext.jsx";

export default function SubdivideNode() {
    const { tree, setTree } = useTree();

    function updateDivisions(event) {
        setTree({
            ...tree,
            subdivisions: Number(event.target.value)
        });
    }

    return (
        <div
            style={{
                position: "relative",
                width: "220px",
                background: "#1e1e1e",
                border: "1px solid #3a3a3a",
                borderRadius: "10px",
                overflow: "hidden",
                color: "#eeeeee",
                fontFamily: "Inter, sans-serif",
                boxShadow: "0 6px 20px rgba(0, 0, 0, 0.35)"
            }}
        >


            {/* HEADER */}

            <div
                style={{
                    padding: "10px 12px",
                    background: "#512454",
                    fontWeight: "600",
                    fontSize: "14px"
                }}
            >
                <span>Subdivide</span>
            </div>

            {/* CONTENT */}

            <div
                style={{
                    padding: "12px"
                }}
            >

                <label
                    style={{
                        display: "block",
                        marginBottom: "5px",
                        color: "#aaaaaa",
                        fontSize: "12px"
                    }}
                >
                    Divisions
                </label>

                <input
                    type="number"
                    min={1}
                    max={100}
                    step={1}
                    value={tree.subdivisions ?? 5}
                    onChange={updateDivisions}
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



        </div>
    );
}