import { useEffect, useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import { useTree } from "../context/TreeContext.jsx";
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

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

function BranchMeshes({ tree, curve, texture, wireframe }) {
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
            <meshStandardMaterial map={texture} wireframe={wireframe} />
        </mesh>
    ));
}

function CoconutMeshes({ tree, curve, wireframe }) {
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
            <meshStandardMaterial color={fruit.color} roughness={0.88} wireframe={wireframe} />
        </mesh>
    ));
}

function createFrondGeometry(config) {
    const vertices = [];
    const colors = [];
    const indices = [];
    const section = [-1, -0.5, 0, 0.5, 1];
    const addBlade = (centers, axes, widths, shade = 1, bulge = 0.06) => {
        const first = vertices.length / 3;
        centers.forEach((center, row) => {
            const previous = centers[Math.max(0, row - 1)];
            const next = centers[Math.min(centers.length - 1, row + 1)];
            const tangent = next.clone().sub(previous).normalize();
            const axis = axes[row].clone().normalize();
            const lift = tangent.clone().cross(axis).normalize();
            const alongShade = 0.94 + row / Math.max(1, centers.length - 1) * 0.1;
            section.forEach((across) => {
                const crown = 1 - Math.abs(across);
                const point = center.clone()
                    .addScaledVector(axis, widths[row] * across)
                    .addScaledVector(lift, widths[row] * bulge * crown);
                vertices.push(point.x, point.y, point.z);
                const vertexShade = Math.min(1, shade * alongShade * (across === 0 ? 0.94 : 1));
                colors.push(vertexShade, vertexShade, vertexShade);
            });
        });
        for (let row = 0; row < centers.length - 1; row += 1) {
            for (let across = 0; across < section.length - 1; across += 1) {
                const a = first + row * section.length + across;
                const b = a + section.length;
                indices.push(a, b, a + 1, a + 1, b, b + 1);
            }
        }
    };

    const length = config.length;
    const droop = config.droop;
    const random = config.random;
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
    addBlade(rachisCenters, rachisAxes, rachisWidths, 0.42, 0.12);

    for (let index = 0; index < 22; index += 1) {
        const progress = 0.09 + index * 0.039 + (random() - 0.5) * 0.012;
        const base = rachisPoint(progress);
        const leafletLength = length * 0.31 * (1 - progress * 0.62) * (0.88 + random() * 0.24);
        for (const side of [-1, 1]) {
            const sideLength = leafletLength * (0.9 + random() * 0.2);
            const sweep = 0.07 + random() * 0.1;
            const sideDroop = droop + (random() - 0.5) * 0.2;
            const centers = [0, 0.22, 0.48, 0.74, 1].map((t) => base.clone().add(new THREE.Vector3(
                sideLength * (0.12 * t + sweep * t * t),
                -sideLength * (0.07 * t + (0.16 + sideDroop * 0.2) * t * t),
                side * sideLength * t,
            )));
            const axes = centers.map((_, station) => new THREE.Vector3(
                -side * (0.1 + station * 0.035),
                0.96,
                -0.16 - station * 0.035,
            ).normalize());
            const width = config.width * (1 - progress * 0.48) * (0.82 + random() * 0.24);
            const shade = 0.78 + random() * 0.28;
            addBlade(centers, axes, [0, width * 0.64, width, width * 0.54, 0], shade);
        }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
}

function LeafMeshes({ tree, curve, wireframe }) {
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
            for (let index = 0; index < count && result.length < 80; index += 1) {
                const progress = Math.min(0.99, Math.max(0.65, height + (index - (count - 1) / 2) * 0.012 + (random() - 0.5) * 0.018));
                const around = phase + index * 2.399963229728653 + (random() - 0.5) * 0.26;
                const { center: position, tangent, radial } = getTrunkFrame(curve, progress, around);
                const geometry = createFrondGeometry({
                    length: (Number(config.length) || 18) * (0.84 + random() * 0.32),
                    width: Number(config.width) || 0.55,
                    droop: Math.max(0, (Number(config.droop) || 0) + (random() - 0.5) * 0.24),
                    random,
                });
                const side = radial.clone().cross(tangent).normalize();
                const orientation = new THREE.Matrix4().makeBasis(radial, tangent, side);
                const rotation = new THREE.Quaternion().setFromRotationMatrix(orientation);
                result.push({
                    key: `${configIndex}-${index}`,
                    geometry,
                    position,
                    rotation,
                    color: colors[config.color] ?? colors.green,
                });
            }
        });
        return result;
    }, [configs, curve, tree.seed]);

    return fronds.map((frond) => (
        <mesh key={frond.key} geometry={frond.geometry} position={frond.position} quaternion={frond.rotation} castShadow>
            <meshStandardMaterial color={frond.color} vertexColors side={THREE.DoubleSide} roughness={0.88} wireframe={wireframe} />
        </mesh>
    ));
}

function DriedFrondMeshes({ tree, curve, wireframe }) {
    const geometry = useMemo(() => {
        const positions = [];
        const colors = [];
        const indices = [];
        let state = ((Number(tree.seed) >>> 0) ^ 0xc2b2ae35) || 1;
        const random = () => {
            state ^= state << 13;
            state ^= state >>> 17;
            state ^= state << 5;
            return (state >>> 0) / 4294967296;
        };
        const appendFiber = (fiberCurve, radius, color) => {
            const fiber = createTubeGeometry(fiberCurve, (t) => radius * (1 - t * 0.94), 8, 5, 0.012);
            const offset = positions.length / 3;
            const fiberPositions = fiber.getAttribute("position");
            for (let index = 0; index < fiberPositions.count; index += 1) {
                positions.push(fiberPositions.getX(index), fiberPositions.getY(index), fiberPositions.getZ(index));
                const luminance = color.r * 0.2126 + color.g * 0.7152 + color.b * 0.0722;
                const shade = Math.min(1, 0.72 + luminance * 0.6) * (0.9 + random() * 0.1);
                colors.push(shade, shade, shade);
            }
            for (const index of fiber.index.array) indices.push(index + offset);
            fiber.dispose();
        };

        const goldenAngle = Math.PI * (3 - Math.sqrt(5));
        const phase = random() * Math.PI * 2;
        const averageLeafLength = tree.leaves?.length
            ? tree.leaves.reduce((sum, leaf) => sum + (Number(leaf.length) || 18), 0) / tree.leaves.length
            : 18;
        const defaultConfig = {
            count: 7,
            length: THREE.MathUtils.clamp(averageLeafLength * 0.34, 3.5, 8.5),
            thickness: 0.12,
            droop: 1,
            color: "mixed",
        };
        const configs = tree.driedFronds?.length ? tree.driedFronds : [defaultConfig];
        const palettes = {
            golden: ["#c4a05b", "#d0b16d", "#ad8547"],
            brown: ["#80532e", "#986639", "#765237"],
            mixed: ["#c4a05b", "#a98449", "#765237", "#d0b16d"],
        };
        const materialColor = new THREE.Color(0, 0, 0);
        let paletteColorCount = 0;
        for (const config of configs) {
            for (const color of palettes[config.color] ?? palettes.mixed) {
                materialColor.add(new THREE.Color(color));
                paletteColorCount += 1;
            }
        }
        if (paletteColorCount > 0) materialColor.multiplyScalar(1 / paletteColorCount);
        let totalFronds = 0;
        configs.forEach((config, configIndex) => {
            const count = Math.min(20, Math.max(1, Math.floor(Number(config.count) || 1)));
            const palette = palettes[config.color] ?? palettes.mixed;
            for (let index = 0; index < count && totalFronds < 32; index += 1, totalFronds += 1) {
                const progress = 0.88 + random() * 0.055;
                const around = phase + totalFronds * goldenAngle + (random() - 0.5) * 0.22 + configIndex * 0.31;
                const { center, tangent, radial } = getTrunkFrame(curve, progress, around);
                const side = radial.clone().cross(tangent).normalize();
                const trunkRadius = tree.trunkradius * (1 - progress * (tree.trunkate ?? 30) / 100);
                const start = center.clone().addScaledVector(radial, trunkRadius * 0.82);
                const length = (Number(config.length) || defaultConfig.length) * (0.88 + random() * 0.24);
                const thickness = Number(config.thickness) || 0.12;
                const droop = Number(config.droop) || 1;
                const sway = (random() - 0.5) * length * 0.12;
                const rachis = new THREE.CatmullRomCurve3([
                    start,
                    start.clone().addScaledVector(radial, length * 0.25).addScaledVector(tangent, length * 0.08),
                    start.clone().addScaledVector(radial, length * 0.52).addScaledVector(tangent, -length * 0.2 * droop).addScaledVector(side, sway),
                    start.clone().addScaledVector(radial, length * 0.72).addScaledVector(tangent, -length * 0.55 * droop).addScaledVector(side, sway * 1.8),
                    start.clone().addScaledVector(radial, length * 0.7).addScaledVector(tangent, -length * 0.82 * droop).addScaledVector(side, sway),
                ]);
                const rachisColor = new THREE.Color(palette[configIndex % palette.length]).multiplyScalar(0.78);
                appendFiber(rachis, thickness * (0.88 + random() * 0.24), rachisColor);

                for (let strand = 0; strand < 6; strand += 1) {
                    const along = 0.2 + strand * 0.125 + (random() - 0.5) * 0.035;
                    const attachment = rachis.getPointAt(along);
                    const strandTangent = rachis.getTangentAt(along).normalize();
                    const strandSide = random() < 0.5 ? -1 : 1;
                    const filamentLength = length * (0.22 + random() * 0.18) * (1 - along * 0.38);
                    const lateral = side.clone().multiplyScalar(strandSide);
                    const filamentEnd = attachment.clone()
                        .addScaledVector(radial, filamentLength * 0.13)
                        .addScaledVector(lateral, filamentLength * (0.48 + random() * 0.16))
                        .addScaledVector(tangent, -filamentLength * (0.58 + random() * 0.28) * droop);
                    const filament = new THREE.CatmullRomCurve3([
                        attachment,
                        attachment.clone().lerp(filamentEnd, 0.34).addScaledVector(strandTangent, -filamentLength * 0.08 * droop),
                        attachment.clone().lerp(filamentEnd, 0.72).addScaledVector(lateral, filamentLength * 0.08),
                        filamentEnd,
                    ]);
                    const color = new THREE.Color(palette[Math.floor(random() * palette.length)]);
                    appendFiber(filament, thickness * (0.34 + random() * 0.16), color);
                }
            }
        });

        const result = new THREE.BufferGeometry();
        result.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
        result.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
        result.setIndex(indices);
        result.computeVertexNormals();
        return { geometry: result, color: `#${materialColor.getHexString()}` };
    }, [curve, tree.driedFronds, tree.leaves, tree.seed, tree.trunkradius, tree.trunkate]);

    return (
        <mesh geometry={geometry.geometry} castShadow receiveShadow>
            <meshStandardMaterial color={geometry.color} vertexColors roughness={0.96} wireframe={wireframe} />
        </mesh>
    );
}

function TreeModel({ treeRef, wireframe }) {

    const { tree } = useTree();

    const texture =
        useTexture(`${import.meta.env.BASE_URL}textures/palmtrunk.jpg`);

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
            ref={treeRef}
            name="OpenTree"
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
                <meshStandardMaterial map={barkTexture} roughness={0.88} wireframe={wireframe} />
            </mesh>

            <BranchMeshes tree={tree} curve={trunkCurve} texture={barkTexture} wireframe={wireframe} />
            <CoconutMeshes tree={tree} curve={trunkCurve} wireframe={wireframe} />
            <LeafMeshes tree={tree} curve={trunkCurve} wireframe={wireframe} />
            <DriedFrondMeshes tree={tree} curve={trunkCurve} wireframe={wireframe} />

        </group>
    );
}

function GLBExportBridge({ treeRef, onReady }) {
    useEffect(() => {
        onReady(async (filename) => {
            if (!treeRef.current) throw new Error("L’arbre n’est pas encore prêt à être exporté.");

            const exporter = new GLTFExporter();
            const root = treeRef.current.clone(true);
            root.name = "OpenTree";
            root.traverse((object) => {
                if (!object.isMesh) return;
                const exportMaterial = (material) => {
                    const clone = material.clone();
                    clone.wireframe = false;
                    return clone;
                };
                object.material = Array.isArray(object.material)
                    ? object.material.map(exportMaterial)
                    : exportMaterial(object.material);
            });
            const glb = await exporter.parseAsync(root, {
                binary: true,
                onlyVisible: true,
                trs: false,
            });
            const blob = new Blob([glb], { type: "model/gltf-binary" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = filename || "opentree.glb";
            link.click();
            window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        });
        return () => onReady(null);
    }, [onReady, treeRef]);

    return null;
}

function PolygonStatsBridge({ treeRef, onTriangleCount }) {
    const { tree } = useTree();

    useEffect(() => {
        const root = treeRef.current;
        if (!root) return;
        let triangles = 0;
        root.traverse((object) => {
            if (!object.isMesh || !object.geometry) return;
            const geometry = object.geometry;
            triangles += (geometry.index?.count ?? geometry.getAttribute("position")?.count ?? 0) / 3;
        });
        onTriangleCount(Math.round(triangles));
    }, [onTriangleCount, tree, treeRef]);

    return null;
}


function Ground({ visible }) {

    const gridTexture =
        useTexture(`${import.meta.env.BASE_URL}textures/grid.png`);


    gridTexture.wrapS =
        THREE.RepeatWrapping;

    gridTexture.wrapT =
        THREE.RepeatWrapping;

    gridTexture.repeat.set(20, 20);


    return (
        <mesh
            position={[0, 0, 0]}
            receiveShadow
            visible={visible}
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


export default function Viewport3D({ onExportReady, onTriangleCount, wireframe, showGrid, showShadows }) {
    const treeRef = useRef(null);

    return (
        <Canvas
            className="viewport-canvas"
            shadows={showShadows}
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
                castShadow={showShadows}
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

            <TreeModel treeRef={treeRef} wireframe={wireframe} />
            <GLBExportBridge treeRef={treeRef} onReady={onExportReady} />
            <PolygonStatsBridge treeRef={treeRef} onTriangleCount={onTriangleCount} />

            <Ground visible={showGrid} />

            <OrbitControls target={[0, 25, 0]} minDistance={12} maxDistance={220} />

        </Canvas>
    );
}
