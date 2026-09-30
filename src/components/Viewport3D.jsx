import { Canvas } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import { useTree } from "../context/TreeContext.jsx";
import * as THREE from "three";


function TreeModel() {

    const { tree } = useTree();

    const texture =
        useTexture("/textures/palmtrunk.jpg");

    const subdivisions =
        tree.subdivisions ?? 1;

    const segmentLength =
        tree.trunklength / subdivisions;

    const percentage =
        tree.randomPercentage ?? 0;

    const coefficient =
        tree.randomCoefficient ?? 1;

    // 30 = le haut fait 70% du rayon
    const trunkate =
        tree.trunkate ?? 30;

    return (
        <group
            position={[
                tree.move.x,
                tree.move.y,
                tree.move.z
            ]}
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


                    // 0 = bas
                    // 1 = haut
                    const progress =
                        index / subdivisions;


                    // Rayon en bas du cylindre
                    const bottomRadius =
                        tree.trunkradius *
                        (1 - (progress * trunkate / 100));


                    // Rayon en haut du cylindre
                    const topProgress =
                        (index + 1) / subdivisions;

                    const topRadius =
                        tree.trunkradius *
                        (1 - (topProgress * trunkate / 100));


                    // Randomize

                    const random =
                        Math.random() * 100;

                    const shouldMove =
                        random < percentage;

                    const x =
                        shouldMove
                            ? (Math.random() - 0.5) * coefficient
                            : 0;

                    const z =
                        shouldMove
                            ? (Math.random() - 0.5) * coefficient
                            : 0;


                    return (
                        <mesh
                            key={index}
                            position={[x, y, z]}
                        >

                            <cylinderGeometry
                                args={[
                                    topRadius,
                                    bottomRadius,
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

function Ground() {

    const gridTexture =
        useTexture("/textures/grid.png");


    gridTexture.wrapS =
        THREE.RepeatWrapping;

    gridTexture.wrapT =
        THREE.RepeatWrapping;

    gridTexture.repeat.set(20, 20);


    return (

        <mesh
            position={[0, 0, 0]}
        >

            <boxGeometry
                args={[100, 0.1, 100]}
            />

            <meshStandardMaterial
                map={gridTexture}
                transparent={true}
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

            <Ground />

            <OrbitControls />

        </Canvas>

    );
}