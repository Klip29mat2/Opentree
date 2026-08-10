import { Handle, Position } from "@xyflow/react";
import { useTree } from "../context/TreeContext.jsx";

export default function TrunkNode({ data }) {


    return (

        <div

            style={{

                background:"#795548",

                color:"white",

                padding:"12px 20px",

                borderRadius:"8px",

                border:"2px solid #a1887f",

                fontWeight:"bold",

                minWidth:"160px",

                textAlign:"center"

            }}

        >


            <Handle

                type="target"

                position={Position.Left}

                style={{
                    background:"#4caf50"
                }}

            />



            <div>
                🌲 Trunk
            </div>


            <hr/>



            <label>
                Length
            </label>

            <input

                type="number"

                value={data.length}

                onChange={(e)=>
                    
                    data.update(
                        "length",
                        Number(e.target.value)
                    )

                }

            />



            <label>
                Radius
            </label>

            <input

                type="number"

                value={data.radius}

                onChange={(e)=>
                    
                    data.update(
                        "radius",
                        Number(e.target.value)
                    )

                }

            />



            <label>
                Branches
            </label>

            <input

                type="number"

                value={data.branches}

                onChange={(e)=>
                    
                    data.update(
                        "branches",
                        Number(e.target.value)
                    )

                }

            />


            <input

                type="number"

                value={data.seed}

                onChange={(e)=>
                    
                    data.update(
                        "seed",
                        Number(e.target.value)
                    )

                }

            />

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