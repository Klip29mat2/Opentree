import { Handle, Position } from "@xyflow/react";


export default function BranchNode() {


    return (

        <div

            style={{

                background:"#2e7d32",

                color:"white",

                padding:"12px 20px",

                borderRadius:"8px",

                border:"2px solid #81c784",

                fontWeight:"bold",

                minWidth:"120px",

                textAlign:"center"

            }}

        >

            {/* Entrée depuis Trunk */}

            <Handle

                type="target"

                position={Position.Left}

                style={{
                    background:"#795548"
                }}

            />


            🌿 Branch


            {/* Sortie vers Leaf */}

            <Handle

                type="source"

                position={Position.Right}

                style={{
                    background:"#66bb6a"
                }}

            />


        </div>

    );

}
