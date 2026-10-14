import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import { useTree } from "../context/TreeContext.jsx";
import * as THREE from "three";

function BranchMeshes({ tree, points, texture }) {
    const branches = tree.branches ?? [];
    const meshes = useMemo(() => {
        let state = ((Number(tree.seed) >>> 0) ^ 0x9e3779b9) || 1;
        const random = () => {
            state ^= state << 13;
            state ^= state >>> 17;
            state ^= state << 5;
            return (state >>> 0) / 4294967296;
        };
        const result = [];
        const divisions = points.length - 1;
        const goldenAngle = Math.PI * (3 - Math.sqrt(5));

        branches.forEach((config, configIndex) => {
            const count = Math.min(40, Math.max(1, Math.floor(Number(config.count) || 1)));
            const startHeight = Math.min(0.85, Math.max(0, Number(config.startHeight) || 0));
            const phase = random() * Math.PI * 2;

            for (let index = 0; index < count && result.length < 300; index += 1) {
                const progress = startHeight + (0.92 - startHeight) * ((index + 1) / (count + 1));
                const segment = Math.min(divisions - 1, Math.floor(progress * divisions));
                const segmentProgress = progress * divisions - segment;
                const center = points[segment].clone().lerp(points[segment + 1], segmentProgress);
                const around = phase + (index + configIndex * 0.5) * goldenAngle;
                const radial = new THREE.Vector3(Math.cos(around), 0, Math.sin(around));
                const trunkRadius = tree.trunkradius * (1 - progress * (tree.trunkate ?? 30) / 100);
                const start = center.clone().addScaledVector(radial, trunkRadius * 0.92);
                const angle = THREE.MathUtils.degToRad(Number(config.angle) + (random() - 0.5) * 8);
                const direction = new THREE.Vector3(
                    radial.x * Math.cos(angle),
                    Math.sin(angle),
                    radial.z * Math.cos(angle),
                ).normalize();
                const length = Number(config.length) * (0.88 + random() * 0.24);
                const middle = start.clone().addScaledVector(direction, length / 2);
                const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);

                result.push({
                    key: `${configIndex}-${index}`,
                    position: middle,
                    quaternion,
                    length,
                    radius: Number(config.radius),
                });
            }
        });
        return result;
    }, [branches, points, tree.seed, tree.trunklength, tree.trunkradius, tree.trunkate]);

    return meshes.map((branch) => (
        <mesh key={branch.key} position={branch.position} quaternion={branch.quaternion}>
            <cylinderGeometry args={[branch.radius * 0.12, branch.radius, branch.length, 10]} />
            <meshStandardMaterial map={texture} />
        </mesh>
    ));
}

function CoconutMeshes({ tree, points }) {
    const clusters = tree.coconuts ?? [];
    const fruits = useMemo(() => {
        const result = [];
        const divisions = points.length - 1;
        const goldenAngle = Math.PI * (3 - Math.sqrt(5));

        clusters.forEach((cluster, clusterIndex) => {
            const count = Math.min(12, Math.max(1, Math.floor(Number(cluster.count) || 1)));
            const size = Number(cluster.size) || 1.2;
            const height = Math.min(0.99, Math.max(0.5, Number(cluster.height) || 0.9));
            const phase = (Number(tree.seed) * 0.61803398875 + clusterIndex * 1.7) % (Math.PI * 2);

            for (let index = 0; index < count && result.length < 100; index += 1) {
                const around = phase + index * goldenAngle;
                const radial = new THREE.Vector3(Math.cos(around), 0, Math.sin(around));
                const progress = Math.min(0.99, Math.max(0.5, height + (index - (count - 1) / 2) * 0.012));
                const segment = Math.min(divisions - 1, Math.floor(progress * divisions));
                const segmentProgress = progress * divisions - segment;
                const center = points[segment].clone().lerp(points[segment + 1], segmentProgress);
                const trunkRadius = tree.trunkradius * (1 - progress * (tree.trunkate ?? 30) / 100);
                const position = center
                    .addScaledVector(radial, trunkRadius * 0.7 + size * 0.32)
                    .add(new THREE.Vector3(0, Math.sin(index * 2.1) * size * 0.16, 0));
                const longAxis = new THREE.Vector3(radial.x * 0.55, 0.72, radial.z * 0.55).normalize();
                const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), longAxis);
                const color = cluster.color === "yellow" ? "#efc84b" : "#704329";

                result.push({
                    key: `${clusterIndex}-${index}`,
                    position,
                    quaternion,
                    size,
                    color,
                });
            }
        });
        return result;
    }, [clusters, points, tree.seed, tree.trunkradius, tree.trunkate]);

    return fruits.map((fruit) => (
        <mesh key={fruit.key} position={fruit.position} quaternion={fruit.quaternion} scale={[fruit.size * 0.58, fruit.size * 0.78, fruit.size * 0.58]}>
            <sphereGeometry args={[1, 20, 16]} />
            <meshStandardMaterial color={fruit.color} roughness={0.88} />
        </mesh>
    ));
}

function createFrondGeometry(config) {
    const vertices = [];
    const indices = [];
    const addStrip = (centers, axes, widths) => {
        const first = vertices.length / 3;
        centers.forEach((center, index) => {
            const offset = axes[index].clone().multiplyScalar(widths[index]);
            const left = center.clone().sub(offset);
            const right = center.clone().add(offset);
            vertices.push(left.x, left.y, left.z, right.x, right.y, right.z);
        });
        for (let index = 0; index < centers.length - 1; index += 1) {
            const a = first + index * 2;
            const b = a + 1;
            const c = a + 2;
            const d = a + 3;
            indices.push(a, b, c, b, d, c);
        }
    };

    const length = config.length;
    const droop = config.droop;
    const rachisPoint = (progress) => new THREE.Vector3(
        length * progress,
        length * (Math.sin(0.28) * progress - droop * progress * progress * 0.52),
        0,
    );
    const rachisCenters = [];
    const rachisAxes = [];
    const rachisWidths = [];
    for (let index = 0; index <= 12; index += 1) {
        const progress = index / 12;
        rachisCenters.push(rachisPoint(progress));
        rachisAxes.push(new THREE.Vector3(0, 0, 1));
        rachisWidths.push(Math.max(0.018, config.width * 0.1 * (1 - progress * 0.65)));
    }
    addStrip(rachisCenters, rachisAxes, rachisWidths);

    for (let index = 1; index <= 17; index += 1) {
        const progress = 0.12 + index * 0.046;
        const base = rachisPoint(progress);
        const leafletLength = length * 0.28 * (1 - progress * 0.48);
        for (const side of [-1, 1]) {
            const middle = base.clone().add(new THREE.Vector3(leafletLength * 0.08, -leafletLength * 0.1, side * leafletLength * 0.55));
            const tip = base.clone().add(new THREE.Vector3(leafletLength * 0.2, -leafletLength * (0.22 + droop * 0.18), side * leafletLength));
            const centers = [base, middle, tip];
            const axes = centers.map(() => new THREE.Vector3(-side * 0.2, 0.96, -0.18).normalize());
            const width = config.width * (1 - progress * 0.5);
            addStrip(centers, axes, [0, width, 0]);
        }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
}

function LeafMeshes({ tree, points }) {
    const configs = tree.leaves ?? [];
    const fronds = useMemo(() => {
        const result = [];
        const divisions = points.length - 1;
        const colors = { green: "#286b35", lime: "#64a83c", yellow: "#a7a83d" };
        configs.forEach((config, configIndex) => {
            const count = Math.min(24, Math.max(1, Math.floor(Number(config.count) || 1)));
            const height = Math.min(0.99, Math.max(0.65, Number(config.height) || 0.94));
            const phase = ((Number(tree.seed) || 1) * 0.754877666 + configIndex * 1.13) % (Math.PI * 2);
            const geometry = createFrondGeometry({
                length: Number(config.length) || 18,
                width: Number(config.width) || 0.55,
                droop: Number(config.droop) || 0,
            });
            for (let index = 0; index < count && result.length < 80; index += 1) {
                const progress = Math.min(0.99, height + (index - (count - 1) / 2) * 0.006);
                const segment = Math.min(divisions - 1, Math.floor(progress * divisions));
                const segmentProgress = progress * divisions - segment;
                const position = points[segment].clone().lerp(points[segment + 1], segmentProgress);
                result.push({
                    key: `${configIndex}-${index}`,
                    geometry,
                    position,
                    rotation: phase + index * Math.PI * 2 / count,
                    color: colors[config.color] ?? colors.green,
                });
            }
        });
        return result;
    }, [configs, points, tree.seed]);

    return fronds.map((frond) => (
        <mesh key={frond.key} geometry={frond.geometry} position={frond.position} rotation={[0, frond.rotation, 0]}>
            <meshStandardMaterial color={frond.color} side={THREE.DoubleSide} roughness={0.9} />
        </mesh>
    ));
}

function TreeModel() {

    const { tree } = useTree();

    const texture =
        useTexture("/textures/palmtrunk.jpg");

    const subdivisions =
        Math.min(100, Math.max(1, Math.floor(Number(tree.subdivisions) || 1)));

    const segmentLength =
        tree.trunklength / subdivisions;

    const percentage =
        tree.randomPercentage ?? 0;

    const coefficient =
        tree.randomCoefficient ?? 1;

    const trunkate =
        tree.trunkate ?? 30;


    // Génération aléatoire stable
    const points = useMemo(() => {

        const generatedPoints = [];

        // Seeded PRNG keeps a tree unchanged until the seed or its inputs change.
        let state = (Number(tree.seed) >>> 0) || 1;
        const random = () => {
            state ^= state << 13;
            state ^= state >>> 17;
            state ^= state << 5;
            return (state >>> 0) / 4294967296;
        };

        for (let index = 0; index <= subdivisions; index++) {

            const y =
                -tree.trunklength / 2
                + index * segmentLength;


            // Premier point toujours au centre
            if (index === 0) {

                generatedPoints.push(
                    new THREE.Vector3(
                        0,
                        y,
                        0
                    )
                );

                continue;
            }


            const chance = random() * 100;


            const shouldMove =
                chance < percentage;


            const x =
                shouldMove
                    ? (random() - 0.5) * coefficient
                    : 0;


            const z =
                shouldMove
                    ? (random() - 0.5) * coefficient
                    : 0;


            generatedPoints.push(
                new THREE.Vector3(
                    x,
                    y,
                    z
                )
            );
        }


        return generatedPoints;

    }, [
        subdivisions,
        tree.trunklength,
        percentage,
        coefficient,
        tree.seed
    ]);


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

                    const start =
                        points[index];

                    const end =
                        points[index + 1];


                    if (!start || !end) {
                        return null;
                    }


                    // Direction du segment
                    const direction =
                        end.clone().sub(start);


                    const length =
                        direction.length();


                    if (length === 0) {
                        return null;
                    }


                    // Direction normalisée
                    const normalizedDirection =
                        direction
                            .clone()
                            .divideScalar(length);


                    // Longueur minimale
                    const finalLength =
                        Math.max(
                            length,
                            segmentLength
                        );


                    // Nouveau point de fin
                    const finalEnd =
                        start.clone().add(
                            normalizedDirection
                                .clone()
                                .multiplyScalar(finalLength)
                        );


                    // Centre du cylindre
                    const middle =
                        start.clone()
                            .add(finalEnd)
                            .multiplyScalar(0.5);


                    // Taper du bas
                    const progress =
                        index / subdivisions;


                    const bottomRadius =
                        tree.trunkradius *
                        (
                            1 -
                            progress *
                            trunkate /
                            100
                        );


                    // Taper du haut
                    const topProgress =
                        (index + 1) / subdivisions;


                    const topRadius =
                        tree.trunkradius *
                        (
                            1 -
                            topProgress *
                            trunkate /
                            100
                        );


                    // Rotation du cylindre
                    const quaternion =
                        new THREE.Quaternion();


                    quaternion.setFromUnitVectors(
                        new THREE.Vector3(0, 1, 0),
                        normalizedDirection
                    );


                    return (
                        <mesh
                            key={index}
                            position={middle}
                            quaternion={quaternion}
                        >

                            <cylinderGeometry
                                args={[
                                    topRadius,
                                    bottomRadius,
                                    finalLength,
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

            <BranchMeshes tree={tree} points={points} texture={texture} />
            <CoconutMeshes tree={tree} points={points} />
            <LeafMeshes tree={tree} points={points} />

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
            className="viewport-canvas"
            camera={{
                position: [0, 2, 5]
            }}
        >

            <ambientLight intensity={1} />

            <directionalLight
                position={[5, 5, 5]}
            />

            <TreeModel />

            <Ground />

            <OrbitControls />

        </Canvas>
    );
}
