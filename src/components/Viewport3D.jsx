import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import { useTree } from "../context/TreeContext.jsx";
import * as THREE from "three";

function createTubeGeometry(curve, radiusAt, tubularSegments, radialSegments, radialNoise = 0) {
    const frames = curve.computeFrenetFrames(tubularSegments, false);
    const length = curve.getLength();
    const positions = [];
    const uvs = [];
    const indices = [];

    for (let ring = 0; ring <= tubularSegments; ring += 1) {
        const progress = ring / tubularSegments;
        const center = curve.getPointAt(progress);
        const radius = radiusAt(progress);
        for (let side = 0; side <= radialSegments; side += 1) {
            const around = side / radialSegments * Math.PI * 2;
            const wobble = 1 + radialNoise * (Math.sin(around * 3 + ring * 0.19) + Math.sin(around * 7 - ring * 0.11)) * 0.5;
            const normal = frames.normals[ring].clone().multiplyScalar(-Math.cos(around))
                .addScaledVector(frames.binormals[ring], Math.sin(around));
            const vertex = center.clone().addScaledVector(normal, radius * wobble);
            positions.push(vertex.x, vertex.y, vertex.z);
            uvs.push(side / radialSegments, progress * length / 6);
        }
    }

    for (let ring = 0; ring < tubularSegments; ring += 1) {
        for (let side = 0; side < radialSegments; side += 1) {
            const a = ring * (radialSegments + 1) + side;
            const b = a + radialSegments + 1;
            indices.push(a, b, a + 1, b, b + 1, a + 1);
        }
    }

    const addCap = (ring, isTop) => {
        const progress = ring / tubularSegments;
        const center = curve.getPointAt(progress);
        const centerIndex = positions.length / 3;
        positions.push(center.x, center.y, center.z);
        uvs.push(0.5, 0.5);
        const rimStart = positions.length / 3;
        const radius = radiusAt(progress);
        for (let side = 0; side < radialSegments; side += 1) {
            const around = side / radialSegments * Math.PI * 2;
            const normal = frames.normals[ring].clone().multiplyScalar(-Math.cos(around))
                .addScaledVector(frames.binormals[ring], Math.sin(around));
            const wobble = 1 + radialNoise * (Math.sin(around * 3 + ring * 0.19) + Math.sin(around * 7 - ring * 0.11)) * 0.5;
            const vertex = center.clone().addScaledVector(normal, radius * wobble);
            positions.push(vertex.x, vertex.y, vertex.z);
            uvs.push(0.5 + Math.cos(around) * 0.5, 0.5 + Math.sin(around) * 0.5);
        }
        for (let side = 0; side < radialSegments; side += 1) {
            const current = rimStart + side;
            const next = rimStart + (side + 1) % radialSegments;
            if (isTop) indices.push(centerIndex, next, current);
            else indices.push(centerIndex, current, next);
        }
    };
    addCap(0, false);
    addCap(tubularSegments, true);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
}

function getTrunkFrame(curve, progress, angle) {
    const tangent = curve.getTangentAt(progress).normalize();
    const reference = Math.abs(tangent.y) > 0.95 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
    const axisA = reference.addScaledVector(tangent, -reference.dot(tangent)).normalize();
    const axisB = tangent.clone().cross(axisA).normalize();
    const radial = axisA.multiplyScalar(Math.cos(angle)).addScaledVector(axisB, Math.sin(angle)).normalize();
    return { center: curve.getPointAt(progress), tangent, radial };
}

function BranchMeshes({ tree, curve, texture }) {
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
        const goldenAngle = Math.PI * (3 - Math.sqrt(5));

        branches.forEach((config, configIndex) => {
            const count = Math.min(40, Math.max(1, Math.floor(Number(config.count) || 1)));
            const startHeight = Math.min(0.85, Math.max(0, Number(config.startHeight) || 0));
            const phase = random() * Math.PI * 2;

            for (let index = 0; index < count && result.length < 300; index += 1) {
                const progress = startHeight + (0.92 - startHeight) * ((index + 1) / (count + 1));
                const around = phase + (index + configIndex * 0.5) * goldenAngle;
                const { center, tangent, radial } = getTrunkFrame(curve, progress, around);
                const trunkRadius = tree.trunkradius * (1 - progress * (tree.trunkate ?? 30) / 100);
                const start = center.clone().addScaledVector(radial, trunkRadius * 0.92);
                const angle = THREE.MathUtils.degToRad(Number(config.angle) + (random() - 0.5) * 8);
                const direction = radial.clone().multiplyScalar(Math.cos(angle)).addScaledVector(tangent, Math.sin(angle)).normalize();
                const length = Number(config.length) * (0.88 + random() * 0.24);
                const end = start.clone().addScaledVector(direction, length);
                const branchCurve = new THREE.CatmullRomCurve3([
                    start,
                    start.clone().addScaledVector(direction, length * 0.32).addScaledVector(tangent, length * 0.09),
                    start.clone().addScaledVector(direction, length * 0.72).addScaledVector(tangent, length * 0.04),
                    end,
                ]);
                const geometry = createTubeGeometry(branchCurve, (t) => Number(config.radius) * (1 - t * 0.9), 14, 9, 0.025);

                result.push({
                    key: `${configIndex}-${index}`,
                    geometry,
                });
            }
        });
        return result;
    }, [branches, curve, tree.seed, tree.trunkradius, tree.trunkate]);

    return meshes.map((branch) => (
        <mesh key={branch.key} geometry={branch.geometry} castShadow receiveShadow>
            <meshStandardMaterial map={texture} />
        </mesh>
    ));
}

function CoconutMeshes({ tree, curve }) {
    const clusters = tree.coconuts ?? [];
    const fruits = useMemo(() => {
        const result = [];
        const goldenAngle = Math.PI * (3 - Math.sqrt(5));

        clusters.forEach((cluster, clusterIndex) => {
            const count = Math.min(12, Math.max(1, Math.floor(Number(cluster.count) || 1)));
            const size = Number(cluster.size) || 1.2;
            const height = Math.min(0.99, Math.max(0.5, Number(cluster.height) || 0.9));
            const phase = (Number(tree.seed) * 0.61803398875 + clusterIndex * 1.7) % (Math.PI * 2);

            for (let index = 0; index < count && result.length < 100; index += 1) {
                const around = phase + index * goldenAngle;
                const progress = Math.min(0.99, Math.max(0.5, height + (index - (count - 1) / 2) * 0.012));
                const { center, tangent, radial } = getTrunkFrame(curve, progress, around);
                const trunkRadius = tree.trunkradius * (1 - progress * (tree.trunkate ?? 30) / 100);
                const position = center
                    .addScaledVector(radial, trunkRadius * 0.7 + size * 0.32)
                    .add(new THREE.Vector3(0, Math.sin(index * 2.1) * size * 0.16, 0));
                const longAxis = radial.clone().multiplyScalar(0.55).addScaledVector(tangent, 0.72).normalize();
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
    }, [clusters, curve, tree.seed, tree.trunkradius, tree.trunkate]);

    return fruits.map((fruit) => (
        <mesh key={fruit.key} position={fruit.position} quaternion={fruit.quaternion} scale={[fruit.size * 0.58, fruit.size * 0.78, fruit.size * 0.58]} castShadow receiveShadow>
            <sphereGeometry args={[1, 20, 16]} />
            <meshStandardMaterial color={fruit.color} roughness={0.88} />
        </mesh>
    ));
}

function createFrondGeometry(config) {
    const vertices = [];
    const colors = [];
    const indices = [];
    const addStrip = (centers, axes, widths, color = new THREE.Color("#ffffff")) => {
        const first = vertices.length / 3;
        centers.forEach((center, index) => {
            const offset = axes[index].clone().multiplyScalar(widths[index]);
            const left = center.clone().sub(offset);
            const right = center.clone().add(offset);
            vertices.push(left.x, left.y, left.z, right.x, right.y, right.z);
            const shade = 0.94 + index / Math.max(1, centers.length - 1) * 0.1;
            colors.push(color.r * shade, color.g * shade, color.b * shade,
                color.r * shade, color.g * shade, color.b * shade);
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

    for (let index = 1; index <= 20; index += 1) {
        const progress = 0.1 + index * 0.041;
        const base = rachisPoint(progress);
        const leafletLength = length * 0.3 * (1 - progress * 0.58);
        for (const side of [-1, 1]) {
            const sweep = 0.1 + (index % 4) * 0.018;
            const centers = [0, 0.25, 0.5, 0.76, 1].map((t) => base.clone().add(new THREE.Vector3(
                leafletLength * (0.12 * t + sweep * t * t),
                -leafletLength * (0.08 * t + (0.18 + droop * 0.2) * t * t),
                side * leafletLength * t,
            )));
            const axes = centers.map((_, station) => new THREE.Vector3(
                -side * (0.12 + station * 0.025),
                0.97,
                -0.18 - station * 0.025,
            ).normalize());
            const width = config.width * (1 - progress * 0.48) * (0.78 + (index % 3) * 0.08);
            const color = new THREE.Color(config.leafColors[(index + (side > 0 ? 1 : 0)) % config.leafColors.length]);
            addStrip(centers, axes, [0, width * 0.62, width, width * 0.58, 0], color);
        }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
}

function LeafMeshes({ tree, curve }) {
    const configs = tree.leaves ?? [];
    const fronds = useMemo(() => {
        const result = [];
        const colors = { green: "#286b35", lime: "#64a83c", yellow: "#a7a83d" };
        let state = ((Number(tree.seed) >>> 0) ^ 0x85ebca6b) || 1;
        const random = () => {
            state ^= state << 13;
            state ^= state >>> 17;
            state ^= state << 5;
            return (state >>> 0) / 4294967296;
        };
        configs.forEach((config, configIndex) => {
            const count = Math.min(24, Math.max(1, Math.floor(Number(config.count) || 1)));
            const height = Math.min(0.99, Math.max(0.65, Number(config.height) || 0.94));
            const phase = random() * Math.PI * 2 + configIndex * 1.13;
            const leafColors = [colors[config.color] ?? colors.green, "#397b3d", "#4a8540"];
            for (let index = 0; index < count && result.length < 80; index += 1) {
                const progress = Math.min(0.99, Math.max(0.65, height + (index - (count - 1) / 2) * 0.012 + (random() - 0.5) * 0.018));
                const around = phase + index * 2.399963229728653 + (random() - 0.5) * 0.26;
                const { center: position, tangent, radial } = getTrunkFrame(curve, progress, around);
                const geometry = createFrondGeometry({
                    length: (Number(config.length) || 18) * (0.84 + random() * 0.32),
                    width: Number(config.width) || 0.55,
                    droop: Math.max(0, (Number(config.droop) || 0) + (random() - 0.5) * 0.24),
                    leafColors,
                });
                const side = radial.clone().cross(tangent).normalize();
                const orientation = new THREE.Matrix4().makeBasis(radial, tangent, side);
                const rotation = new THREE.Quaternion().setFromRotationMatrix(orientation);
                result.push({
                    key: `${configIndex}-${index}`,
                    geometry,
                    position,
                    rotation,
                });
            }
        });
        return result;
    }, [configs, curve, tree.seed]);

    return fronds.map((frond) => (
        <mesh key={frond.key} geometry={frond.geometry} position={frond.position} quaternion={frond.rotation} castShadow>
            <meshStandardMaterial vertexColors side={THREE.DoubleSide} roughness={0.88} />
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

    const barkTexture = useMemo(() => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(2, 1);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.needsUpdate = true;
        return texture;
    }, [texture]);


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

    const trunkCurve = useMemo(
        () => new THREE.CatmullRomCurve3(points, false, "centripetal", 0.5),
        [points],
    );
    const trunkGeometry = useMemo(() => createTubeGeometry(
        trunkCurve,
        (progress) => tree.trunkradius * (1 - progress * trunkate / 100) * (1 + 0.12 * Math.exp(-progress * 18)),
        Math.max(64, Math.min(512, subdivisions * 8)),
        24,
        0.008,
    ), [trunkCurve, tree.trunkradius, trunkate, subdivisions]);


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

            <mesh geometry={trunkGeometry} castShadow receiveShadow>
                <meshStandardMaterial map={barkTexture} roughness={0.88} />
            </mesh>

            <BranchMeshes tree={tree} curve={trunkCurve} texture={barkTexture} />
            <CoconutMeshes tree={tree} curve={trunkCurve} />
            <LeafMeshes tree={tree} curve={trunkCurve} />

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
            receiveShadow
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
            shadows
            camera={{
                position: [42, 34, 62],
                fov: 42,
                near: 0.1,
                far: 300,
            }}
        >

            <hemisphereLight args={["#dcebd8", "#30271e", 0.8]} />

            <directionalLight
                position={[-25, 55, 30]}
                intensity={2.2}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-left={-65}
                shadow-camera-right={65}
                shadow-camera-top={75}
                shadow-camera-bottom={-65}
                shadow-camera-far={180}
                shadow-bias={-0.0002}
            />

            <directionalLight position={[30, 24, -35]} intensity={0.55} />

            <TreeModel />

            <Ground />

            <OrbitControls target={[0, 25, 0]} minDistance={12} maxDistance={220} />

        </Canvas>
    );
}
