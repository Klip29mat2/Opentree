import React from "react";


const NODES = [

    {
        key:"new",

        label:"New Project",

        glyph:"+",

        hint:"Create a new procedural tree graph",

        accent:"#5B8DEF",

        prop:"newProject"

    },


    {
        key:"open",

        label:"Open Project",

        glyph:"▶",

        hint:"Load an existing OpenTree project",

        accent:"#E3A857",

        prop:"openProject"

    }

];



export default function StartMenu({

    newProject,

    openProject

}) {



    const actions = {

        newProject,

        openProject

    };



    return (


        <div className="launcher">


            <style>{`

            .launcher {

                width:100vw;
                height:100vh;

                background:#0A0E16;

                background-image:
                linear-gradient(#1C2536 1px, transparent 1px),
                linear-gradient(90deg,#1C2536 1px,transparent 1px);

                background-size:28px 28px;

                display:flex;

                justify-content:center;

                align-items:center;

                color:white;

                font-family:Inter, sans-serif;

            }



            .content {

                display:flex;

                flex-direction:column;

                align-items:center;

                gap:40px;

            }



            h1 {

                margin:0;

                font-size:38px;

                font-family:"Space Grotesk",sans-serif;

            }



            .sub {

                color:#7C8AA3;

            }



            .nodes {

                display:flex;

                gap:30px;

            }



            button.node {

                width:240px;

                padding:0;

                border-radius:10px;

                overflow:hidden;

                border:1px solid #1C2536;

                background:#121826;

                cursor:pointer;

                color:white;

                transition:.2s;

            }



            button.node:hover {

                transform:translateY(-5px);

                background:#161E2E;

            }



            .title {

                padding:12px;

                color:#0A0E16;

                font-weight:bold;

                display:flex;

                gap:10px;

                align-items:center;

            }



            .body {

                padding:16px;

                text-align:left;

            }



            .hint {

                color:#7C8AA3;

                font-size:13px;

            }



            .pin {

                margin-top:15px;

                display:flex;

                justify-content:flex-end;

                align-items:center;

                gap:8px;

                color:#7C8AA3;

                font-size:11px;

            }



            .circle {

                width:10px;

                height:10px;

                border-radius:50%;

            }



            .wire {

                width:30px;

                height:2px;

                background:#555;

            }



            `}</style>





            <div className="content">


                <div>

                    <div style={{
                        color:"#5B8DEF",
                        fontSize:"12px"
                    }}>

                    // project graph

                    </div>


                    <h1>
                        OpenTree
                    </h1>


                    <p className="sub">

                    Choose your entry point

                    </p>


                </div>






                <div className="nodes">


                {
                    NODES.map((node)=>(


                        <button

                            className="node"

                            key={node.key}

                            onClick={
                                actions[node.prop]
                            }

                        >


                            <div

                            className="title"

                            style={{
                                background:node.accent
                            }}

                            >


                                <span>

                                {node.glyph}

                                </span>


                                {node.label}


                            </div>




                            <div className="body">


                                <div className="hint">

                                {node.hint}

                                </div>



                                <div className="pin">


                                    EXEC


                                    <span

                                    className="circle"

                                    style={{
                                        background:node.accent
                                    }}

                                    />


                                    <span className="wire"/>


                                </div>


                            </div>



                        </button>


                    ))

                }


                </div>


            </div>



        </div>


    );

}
