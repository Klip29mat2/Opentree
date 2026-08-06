import { Handle, Position } from "@xyflow/react";

export default function LeafNode() {

    return (
        <div style={{
            background:"#66bb6a",
            color:"white",
            padding:"10px",
            borderRadius:"8px"
        }}>

            <Handle
                type="target"
                position={Position.Left}
            />

            🍃 Leaf

        </div>
    );
}
