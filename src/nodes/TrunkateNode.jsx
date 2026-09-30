import { useTree } from "../context/TreeContext.jsx";
import { Handle, Position } from "@xyflow/react";

export default function TrunkateNode() {

    const { tree, setTree } = useTree();

    function updateTrunkate(value) {

        setTree({
            ...tree,
            trunkate: Number(value)
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
            />

            <div
                style={{
                    padding: "10px 12px",
                    background: "#562800",
                    fontWeight: "600",
                    fontSize: "14px"
                }}
            >
                ✂️ Trunkate
            </div>

            <div style={{ padding: "12px" }}>

                <label
                    style={{
                        display: "block",
                        marginBottom: "4px",
                        color: "#aaaaaa",
                        fontSize: "12px"
                    }}
                >
                    Trunkate
                </label>

                <input
                    type="number"
                    min="0"
                    max="100"
                    value={tree.trunkate ?? 0}
                    onChange={(event) =>
                        updateTrunkate(event.target.value)
                    }
                    style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "7px 8px",
                        background: "#121212",
                        color: "#ffffff",
                        border: "1px solid #444",
                        borderRadius: "5px"
                    }}
                />

            </div>

            <Handle
                type="source"
                position={Position.Right}
            />

        </div>

    );

}