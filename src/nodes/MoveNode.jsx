import { useTree } from "../context/TreeContext.jsx";
import { Handle, Position } from "@xyflow/react";

export default function MoveNode() {
    const { tree, setTree } = useTree();

    const move = tree.move ?? {
        x: 0,
        y: 0,
        z: 0
    };

    const updateMove = (axis, event) => {
        const value = Number(event.target.value);

        setTree({
            ...tree,
            move: {
                ...move,
                [axis]: value
            }
        });
    };

    return (
        <div
            style={{
                background: "#42a5f5",
                padding: "10px",
                borderRadius: "8px",
                width: "180px"
            }}
        >
            <Handle
                type="target"
                position={Position.Left}
            />

            <div
                style={{
                    fontWeight: "bold",
                    marginBottom: "10px"
                }}
            >
                ↔️ Move
            </div>

            {["x", "y", "z"].map((axis) => (
                <div
                    key={axis}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "5px"
                    }}
                >
                    <label
                        style={{
                            width: "60px"
                        }}
                    >
                        Move {axis.toUpperCase()}
                    </label>

                    <input
                        type="number"
                        step="0.1"
                        value={move[axis]}
                        onChange={(event) => updateMove(axis, event)}
                        style={{
                            width: "80px"
                        }}
                    />
                </div>
            ))}

            <Handle
                type="source"
                position={Position.Right}
            />
        </div>
    );
}