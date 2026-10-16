import * as THREE from "three";
import { SimplifyModifier } from "three/examples/jsm/modifiers/SimplifyModifier.js";
import { mergeGeometries, mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

function hasValidTriangles(geometry) {
    const positions = geometry.getAttribute("position");
    const index = geometry.index;
    if (!positions || !index || index.count < 3 || index.count % 3 !== 0) return false;
    const a = new THREE.Vector3();
    const b = new THREE.Vector3();
    const c = new THREE.Vector3();
    const ab = new THREE.Vector3();
    const ac = new THREE.Vector3();
    for (let offset = 0; offset + 2 < index.count; offset += 3) {
        a.fromBufferAttribute(positions, index.getX(offset));
        b.fromBufferAttribute(positions, index.getX(offset + 1));
        c.fromBufferAttribute(positions, index.getX(offset + 2));
        if (![a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z].every(Number.isFinite)) return false;
        ab.subVectors(b, a);
        ac.subVectors(c, a);
        if (ab.cross(ac).lengthSq() <= 1e-16) return false;
    }
    return true;
}

/** Builds the same merged, material-sectioned mesh used by the Unreal FBX export. */
export function createUnrealLodScene(root, ratio) {
    root.updateMatrixWorld(true);
    const materialKeys = new Map();
    const sections = new Map();
    const getMaterialKey = (material) => {
        const color = material.color?.getHexString?.() ?? "ffffff";
        const map = material.map?.uuid ?? "none";
        const key = `${map}|${color}|${Boolean(material.vertexColors)}|${material.roughness ?? 1}|${material.side ?? 0}`;
        if (!materialKeys.has(key)) materialKeys.set(key, material);
        return key;
    };

    root.traverse((object) => {
        if (!object.isMesh || object.userData.isCollision || !object.geometry?.getAttribute("position")) return;
        const sourceMaterials = Array.isArray(object.material) ? object.material : [object.material];
        const sourceGeometry = object.geometry;
        const groups = sourceGeometry.groups.length ? sourceGeometry.groups : [{ start: 0, count: sourceGeometry.index?.count ?? sourceGeometry.getAttribute("position").count, materialIndex: 0 }];
        for (const group of groups) {
            const sourceMaterial = sourceMaterials[group.materialIndex] ?? sourceMaterials[0];
            if (!sourceMaterial) continue;
            const key = getMaterialKey(sourceMaterial);
            const geometry = new THREE.BufferGeometry();
            const start = group.start;
            const count = group.count;
            const sourceIndex = sourceGeometry.index;
            const positions = sourceGeometry.getAttribute("position");
            const sourceIndices = sourceIndex ? Array.from(sourceIndex.array.slice(start, start + count)) : Array.from({ length: count }, (_, i) => start + i);
            const doubleSided = sourceMaterial.side === THREE.DoubleSide;
            const indices = [];
            const flippedCorners = [];
            for (let corner = 0; corner < sourceIndices.length; corner += 3) {
                const triangle = sourceIndices.slice(corner, corner + 3);
                if (triangle.length !== 3) continue;
                indices.push(...triangle);
                flippedCorners.push(false, false, false);
                if (doubleSided) {
                    indices.push(triangle[2], triangle[1], triangle[0]);
                    flippedCorners.push(true, true, true);
                }
            }

            const transformed = [];
            const normals = [];
            const uvs = [];
            const colors = [];
            const normalMatrix = new THREE.Matrix3().getNormalMatrix(object.matrixWorld);
            const position = new THREE.Vector3();
            const normal = new THREE.Vector3();
            const sourceNormals = sourceGeometry.getAttribute("normal");
            const uv = sourceGeometry.getAttribute("uv");
            const color = sourceGeometry.getAttribute("color");
            for (let corner = 0; corner < indices.length; corner += 1) {
                const vertexIndex = indices[corner];
                position.fromBufferAttribute(positions, vertexIndex).applyMatrix4(object.matrixWorld);
                transformed.push(position.x, position.y, position.z);
                if (sourceNormals) {
                    normal.fromBufferAttribute(sourceNormals, vertexIndex).applyMatrix3(normalMatrix).normalize();
                    if (flippedCorners[corner]) normal.negate();
                    normals.push(normal.x, normal.y, normal.z);
                } else normals.push(0, 1, 0);
                if (uv) uvs.push(uv.getX(vertexIndex), uv.getY(vertexIndex));
                else uvs.push(0, 0);
                if (color) colors.push(color.getX(vertexIndex), color.getY(vertexIndex), color.getZ(vertexIndex));
                else colors.push(1, 1, 1);
            }
            geometry.setAttribute("position", new THREE.Float32BufferAttribute(transformed, 3));
            geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
            geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
            geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
            geometry.setIndex(indices.map((_, i) => i));
            if (!sections.has(key)) sections.set(key, []);
            sections.get(key).push(geometry);
        }
    });

    const simplify = new SimplifyModifier();
    const sectionGeometry = [];
    const sectionMaterials = [];
    try {
        for (const [key, geometries] of sections) {
            let merged = mergeGeometries(geometries);
            if (!merged) throw new Error("Impossible de regrouper les matériaux pour Unreal.");
            if (ratio < 1) {
                const welded = mergeVertices(merged);
                const weldedVertexCount = welded.getAttribute("position").count;
                welded.dispose();
                const removeCount = Math.min(Math.max(0, weldedVertexCount - 4), Math.floor(weldedVertexCount * (1 - ratio)));
                if (removeCount > 0) {
                    const reduced = simplify.modify(merged, removeCount);
                    if (hasValidTriangles(reduced)) {
                        merged.dispose();
                        merged = reduced;
                    } else reduced.dispose();
                }
            }
            if ((merged.index?.count ?? 0) < 3) {
                merged.dispose();
                throw new Error(`La géométrie ${key} est vide après réduction.`);
            }
            sectionGeometry.push(merged);
            sectionMaterials.push(materialKeys.get(key));
        }
        const combined = mergeGeometries(sectionGeometry, true);
        if (!combined) throw new Error("Impossible de créer le mesh Unreal.");
        const scene = new THREE.Group();
        scene.name = "OpenTree";
        const mesh = new THREE.Mesh(combined, sectionMaterials);
        mesh.name = "OpenTree_StaticMesh";
        scene.add(mesh);
        return scene;
    } finally {
        sections.forEach((geometries) => geometries.forEach((geometry) => geometry.dispose()));
        sectionGeometry.forEach((geometry) => geometry.dispose());
    }
}
