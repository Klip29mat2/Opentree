import { Handle, Position } from "@xyflow/react";


export default function TrunkNode() {


    return (

        <div

            style={{

                background:"#795548",

                color:"white",

                padding:"12px 20px",

                borderRadius:"8px",

                border:"2px solid #a1887f",

                fontWeight:"bold",

                minWidth:"120px",

                textAlign:"center"

            }}

        >

            {/* Entrée depuis Seed */}

            <Handle

                type="target"

                position={Position.Left}

                style={{
                    background:"#4caf50"
                }}

            />


            🌲 Trunk



            {/* Sortie vers Branch */}

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
