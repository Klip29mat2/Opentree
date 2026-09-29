import { Canvas } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import { useTree } from "../context/TreeContext.jsx";

function TreeModel() {

    const { tree } = useTree();

    const texture = useTexture("/textures/palmtrunk.jpg");

    const subdivisions = tree.subdivisions ?? 1;

    const segmentLength =
        tree.trunklength / subdivisions;

    const percentage =
        tree.randomPercentage ?? 0;

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

                    // Est-ce que ce cylindre doit bouger ?
                    const random =
                        Math.random() * 100;

                    const shouldMove =
                        random < percentage;

                    // Déplacement aléatoire
                    const x =
                        shouldMove
                            ? (Math.random() - 0.5) * 2
                            : 0;

                    const z =
                        shouldMove
                            ? (Math.random() - 0.5) * 2
                            : 0;

                    return (
                        <mesh
                            key={index}
                            position={[x, y, z]}
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