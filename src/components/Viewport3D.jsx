import { Canvas } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import { useTree } from "../context/TreeContext.jsx";
import * as THREE from "three";

function TreeModel() {

    const texture = useTexture("/textures/palmtrunk.jpg");
    const { tree } = useTree();


    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 10);
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
                map={texture}
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

            <ambientLight intensity={1} />

            <directionalLight
                position={[5, 5, 5]}
            />

            <TreeModel />

            <OrbitControls />

        </Canvas>
    );
}