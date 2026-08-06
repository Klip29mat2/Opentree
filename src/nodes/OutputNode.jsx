import { Handle, Position } from "@xyflow/react";


export default function OutputNode(){

    return (

        <div
            style={{
                background:"#1565c0",
                color:"white",
                padding:"12px 20px",
                borderRadius:"8px",
                border:"2px solid #64b5f6"
            }}
        >

            <Handle
                type="target"
                position={Position.Left}
            />

            📤 Output

        </div>

    );

}