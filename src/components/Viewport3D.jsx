import { Canvas } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import { useTree } from "../context/TreeContext.jsx";

function TreeModel() {

    const { tree } = useTree();

    const texture = useTexture("/textures/palmtrunk.jpg");

    return (
        <mesh
            rotation={[
                tree.rotation.x * Math.PI / 180,
                tree.rotation.y * Math.PI / 180,
                tree.rotation.z * Math.PI / 180
            ]}
            scale={[
                tree.scale.x,
                tree.scale.y,
                tree.scale.z
            ]}
        >

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