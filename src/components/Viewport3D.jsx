import { Canvas } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import { useTree } from "../context/TreeContext.jsx";

function TreeModel() {

    const { tree } = useTree();

    const texture = useTexture("/textures/palmtrunk.jpg");

    const subdivisions = tree.subdivisions ?? 1;

    const segmentLength =
        tree.trunklength / subdivisions;

    return (
        <group
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

            {Array.from(
                { length: subdivisions },
                (_, index) => {

                    const y =
                        -tree.trunklength / 2
                        + segmentLength / 2
                        + index * segmentLength;

                    return (
                        <mesh
                            key={index}
                            position={[0, y, 0]}
                        >

                            <cylinderGeometry
                                args={[
                                    tree.trunkradius,
                                    tree.trunkradius,
                                    segmentLength,
                                    32
                                ]}
                            />

                            <meshStandardMaterial
                                map={texture}
                            />

                        </mesh>
                    );

                }
            )}

        </group>
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