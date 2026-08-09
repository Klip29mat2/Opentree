import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three"; 

function TreeModel(){


const geometry = new THREE.CylinderGeometry(
    1,    // rayon du haut
    1,    // rayon du bas
    length={tree.length},    // hauteur
    32    // nombre de segments
);

    return (

    <mesh>
        <cylinderGeometry
            args={[1, 1, 5, 32]}
        />

        <meshStandardMaterial
            color="#795548"
        />
    </mesh>


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