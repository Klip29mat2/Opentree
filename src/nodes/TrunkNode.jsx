import { useTree } from "../context/TreeContext.jsx";

export default function TrunkNode() {

    const { tree, setTree } = useTree();


    function updateLength(event) {

        setTree({
            ...tree,
            trunklength: Number(event.target.value)
        });

    }


    function updateRadius(event) {

        setTree({
            ...tree,
            trunkradius: Number(event.target.value)
        });

    }


    return (

        <div
            style={{
                width: "220px",
                background: "#1e1e1e",
                border: "1px solid #3a3a3a",
                borderRadius: "10px",
                overflow: "hidden",
                color: "#eeeeee",
                fontFamily: "Inter, sans-serif",
                boxShadow: "0 6px 20px rgba(0, 0, 0, 0.35)"
            }}
        >

            {/* Header */}

            <div
                style={{
                    padding: "10px 12px",
                    background: "#795548",
                    fontWeight: "600",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                }}
            >

                <span>🌳</span>

                <span>Trunk</span>

            </div>


            {/* Content */}

            <div
                style={{
                    padding: "12px"
                }}
            >

                {/* Length */}

                <div
                    style={{
                        marginBottom: "10px"
                    }}
                >

                    <label
                        style={{
                            display: "block",
                            marginBottom: "5px",
                            color: "#aaaaaa",
                            fontSize: "12px"
                        }}
                    >
                        Length
                    </label>

                    <input
                        type="number"
                        min={0}
                        step="0.1"
                        value={tree.trunklength}
                        onChange={updateLength}
                        style={{
                            width: "100%",
                            boxSizing: "border-box",
                            padding: "7px 8px",
                            background: "#121212",
                            color: "#ffffff",
                            border: "1px solid #444",
                            borderRadius: "5px",
                            outline: "none"
                        }}
                    />

                </div>


                {/* Radius */}

                <div>

                    <label
                        style={{
                            display: "block",
                            marginBottom: "5px",
                            color: "#aaaaaa",
                            fontSize: "12px"
                        }}
                    >
                        Radius
                    </label>

                    <input
                        type="number"
                        min={0}
                        step="0.1"
                        value={tree.trunkradius}
                        onChange={updateRadius}
                        style={{
                            width: "100%",
                            boxSizing: "border-box",
                            padding: "7px 8px",
                            background: "#121212",
                            color: "#ffffff",
                            border: "1px solid #444",
                            borderRadius: "5px",
                            outline: "none"
                        }}
                    />

                </div>

            </div>

        </div>

    );

}
