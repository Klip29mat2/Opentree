import { Handle, Position } from "@xyflow/react";

export default function SeedNode() {

    return (
        <div style={{
            background:"#4caf50",
            color:"white",
            padding:"10px",
            borderRadius:"8px"
        }}>

            🌱 Seed

            <Handle
                type="source"
                position={Position.Right}
            />

        </div>
    );
}
