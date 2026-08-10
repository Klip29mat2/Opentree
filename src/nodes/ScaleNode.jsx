import { useTree } from "../context/TreeContext.jsx";
import { Handle, Position } from "@xyflow/react";

export default function ScaleNode() {

    const { tree, setTree } = useTree();

    function updateScale(axis, event) {

        const value = Number(event.target.value);

        setTree({
            ...tree,

            scale: {
                ...tree.scale,
                [axis]: value
            }
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
                boxShadow: "0 6px 20px rgba(0,0,0,0.35)"
            }}
        >

            <Handle
                type="target"
                position={Position.Left}
                style={{
                    width: "10px",
                    height: "10px",
                    background: "#81c784",
                    border: "2px solid #1e1e1e"
                }}
            />

            <div
                style={{
                    padding: "10px 12px",
                    background: "#42a5f5",
                    fontWeight: "600",
                    fontSize: "14px"
                }}
            >
                📐 Scale
            </div>

            <div style={{ padding: "12px" }}>

                {["x", "y", "z"].map((axis) => (

                    <div
                        key={axis}
                        style={{
                            marginBottom: "8px"
                        }}
                    >

                        <label
                            style={{
                                display: "block",
                                marginBottom: "4px",
                                color: "#aaaaaa",
                                fontSize: "12px"
                            }}
                        >
                            Scale {axis.toUpperCase()}
                        </label>

                        <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={tree.scale[axis]}
                            onChange={(event) =>
                                updateScale(axis, event)
                            }
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

                ))}

            </div>

            <Handle
                type="source"
                position={Position.Right}
                style={{
                    width: "10px",
                    height: "10px",
                    background: "#64b5f6",
                    border: "2px solid #1e1e1e"
                }}
            />

        </div>
    );
}