import { Handle, Position } from "@xyflow/react";
import { useTree } from "../context/TreeContext.jsx";

export default function RandomizeNode() {

    const { tree, setTree } = useTree();

    function updatePercentage(event) {
        setTree({
            ...tree,
            randomPercentage: Number(event.target.value)
        });
    }

    function updateCoefficient(event) {
        setTree({
            ...tree,
            randomCoefficient: Number(event.target.value)
        });
    }

    return (
        <div
            style={{
                background: "#1e1e1e",
                color: "white",
                padding: "12px",
                borderRadius: "8px",
                width: "180px"
            }}
        >
            <Handle
                type="target"
                position={Position.Left}
            />

            <b>🎲 Randomize</b>

            <br />

            <label>Percentage</label>

            <input
                type="number"
                min="0"
                max="100"
                value={tree.randomPercentage ?? 50}
                onChange={updatePercentage}
            />

            <label>Coefficient</label>

            <input
                type="number"
                min="0"
                max="10"
                value={tree.randomCoefficient ?? 1}
                onChange={updateCoefficient}
            />

            <Handle
                type="source"
                position={Position.Right}
            />

        </div>
    );
}