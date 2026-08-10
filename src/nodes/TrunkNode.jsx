import { useTree } from "../context/TreeContext.jsx";
import { Handle, Position } from "@xyflow/react";

export default function TrunkNode() {

    const { tree, setTree } = useTree();


    function updateLength(event) {

        setTree({
            ...tree,
            trunklength: Number(event.target.value)
        });

    }


    function updateRadius(event) {

        setTree({
            ...tree,
            trunkradius: Number(event.target.value)
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

            {/* INPUT */}

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


            {/* HEADER */}

            <div
                style={{
                    padding: "10px 12px",
                    background: "#795548",
                    fontWeight: "600",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                }}
            >

                <span>🌳</span>

                <span>Trunk</span>

            </div>


            {/* CONTENT */}

            <div
                style={{
                    padding: "12px"
                }}
            >

                {/* LENGTH */}

                <div
                    style={{
                        marginBottom: "10px"
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
                        Length
                    </label>

                    <input
                        type="number"
                        min={0}
                        step="0.1"
                        value={tree.trunklength}
                        onChange={updateLength}
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


                {/* RADIUS */}

                <div>

                    <label
                        style={{
                            display: "block",
                            marginBottom: "5px",
                            color: "#aaaaaa",
                            fontSize: "12px"
                        }}
                    >
                        Radius
                    </label>

                    <input
                        type="number"
                        min={0}
                        max="20"
                        step="0.1"
                        value={tree.trunkradius}
                        onChange={updateRadius}
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


            {/* OUTPUT */}

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