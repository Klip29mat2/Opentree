import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";


function TreeModel(){


    const { scene } = useGLTF(
        "/models/tree.glb"
    );


    return (

        <primitive

            object={scene}

            scale={1}

        />

    );

}



export default function Viewport3D(){


    return (

        <Canvas

            camera={{

                position:[
                    0,
                    2,
                    5
                ]

            }}

        >


            <ambientLight
                intensity={1}
            />


            <directionalLight

                position={[
                    5,
                    5,
                    5
                ]}

            />


            <TreeModel/>


            <OrbitControls/>


        </Canvas>

    );

}