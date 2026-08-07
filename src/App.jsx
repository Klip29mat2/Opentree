import { 
    useState,
    useCallback,
    useEffect
} from "react";
import Viewport3D from "./components/Viewport3D.jsx";

import {
    ReactFlow,
    Background,
    Controls,
    applyNodeChanges,
    applyEdgeChanges,
    addEdge
} from "@xyflow/react";

import TreeCompiler from "./Engine/TreeCompiler.js";

import "@xyflow/react/dist/style.css";


import {
    nodes as initialNodes,
    nodeTypes
} from "./nodes/treeNodes.jsx";


import NodeContextMenu from "./components/NodeContextMenu.jsx";

import StartMenu from "./components/StartMenu.jsx";



export default function App() {


    const [screen, setScreen] = useState("home");


    const [nodes, setNodes] = useState(initialNodes);


    const [edges, setEdges] = useState([]);


    const [menu, setMenu] = useState(null);

    const compiler = new TreeCompiler();



    // déplacement des nodes

    const onNodesChange = useCallback((changes)=>{


        setNodes((nds)=>

            applyNodeChanges(
                changes,
                nds
            )

        );


    },[]);




useEffect(()=>{

    const tree = compiler.compile(
        nodes,
        edges
    );


    console.log(tree);


},[nodes, edges]);


    // déplacement des edges

    const onEdgesChange = useCallback((changes)=>{


        setEdges((eds)=>

            applyEdgeChanges(
                changes,
                eds
            )

        );


    },[]);




function updateNode(key,value){


    setNodes(nodes =>

        nodes.map(node=>{


            if(node.type !== "trunk")
                return node;



            return {

                ...node,

                data:{

                    ...node.data,

                    [key]:value

                }

            };


        })

    );


}



    // création des connexions

    const onConnect = useCallback((connection)=>{


        setEdges((eds)=>

            addEdge(

                {
                    ...connection,

                    animated:true,

                    style:{
                        stroke:"#81c784"
                    }

                },

                eds

            )

        );


    },[]);









    // nouveau projet

    async function newProject(){


        const project =
            await window.electronAPI.createProject();



        if(project){


            console.log(
                "PROJECT CREATED:",
                project
            );


            setNodes([]);


            setEdges([]);


            setScreen("editor");


        }


    }









    // ouvrir projet Electron

    async function openProject(){


        console.log(
            "OPEN PROJECT CLICK"
        );



        if(!window.electronAPI){


            console.error(
                "Electron API absente"
            );


            return;

        }





        const folder =
            await window.electronAPI.openProject();




        console.log(
            "DOSSIER CHOISI :",
            folder
        );





        if(folder){


            setScreen("editor");


        }


    }









    // création node

    function createNode(type){



        const newNode = {


            id:crypto.randomUUID(),


            type:type,


            position:{


                x:menu.x,


                y:menu.y


            },


            data:{}



        };




        setNodes((nds)=>[

            ...nds,

            newNode

        ]);




        setMenu(null);



    }









    // Shift + A

    useEffect(()=>{


        function shortcut(event){



            if(

                event.shiftKey &&

                event.key.toLowerCase()==="a"

            ){


                event.preventDefault();



                setMenu({

                    x:window.innerWidth / 2,

                    y:window.innerHeight / 2

                });


            }


        }




        window.addEventListener(
            "keydown",
            shortcut
        );




        return()=>{


            window.removeEventListener(
                "keydown",
                shortcut
            );


        };



    },[]);









    // menu démarrage

    if(screen==="home"){


        return (

            <StartMenu

                newProject={newProject}

                openProject={openProject}

            />

        );


    }









    // éditeur

    return (


        <div

            style={{

                display:"flex",


                width:"100vw",

                height:"100vh",

                background:"#121212"

            }}

        >

        <Viewport3D/>

            <ReactFlow


                nodes={nodes}


                edges={edges}


                nodeTypes={nodeTypes}


                onNodesChange={onNodesChange}


                onEdgesChange={onEdgesChange}


                onConnect={onConnect}


                fitView


                colorMode="dark"


            >


                <Background color="#333"/>


                <Controls/>


            </ReactFlow>





            <NodeContextMenu

                menu={menu}

                createNode={createNode}

            />


        </div>


    );

}
