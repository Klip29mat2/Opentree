export default function NodeContextMenu({
    menu,
    createNode
}) {


    if (!menu) {

        return null;

    }


    return (

        <div

            style={{

                position: "absolute",

                left: menu.x,

                top: menu.y,

                background: "#222",

                color: "white",

                padding: "10px",

                borderRadius: "8px",

                zIndex: 1000,

                display: "flex",

                flexDirection: "column",

                gap: "5px"

            }}

        >

            <button onClick={() => createNode("seed")}>
                🌱 Seed
            </button>


            <button onClick={() => createNode("trunk")}>
                🌲 Trunk
            </button>


            <button onClick={() => createNode("branch")}>
                🌿 Branch
            </button>


            <button onClick={() => createNode("leaf")}>
                🍃 Leaf
            </button>


            <button onClick={() => createNode("output")}>
                📤 Output
            </button>


        </div>

    );

}