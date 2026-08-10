
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useTree } from "../context/TreeContext.jsx";


function TreeModel() {

    const { tree } = useTree();

    return (
        <mesh>

            <cylinderGeometry
                args={[
                    tree.trunkradius,
                    tree.trunkradius,
                    tree.trunklength,
                    32
                ]}
            />

            <meshStandardMaterial
                color="#795548"
            />

        </mesh>
    );

}


export default function Viewport3D() {

    return (
        <Canvas
            camera={{
                position: [0, 2, 5]
            }}
        >

            <ambientLight
                intensity={1}
            />

            <directionalLight
                position={[5, 5, 5]}
            />

            <TreeModel />

            <OrbitControls />

        </Canvas>
    );

}
