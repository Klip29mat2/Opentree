import * as THREE from "three";

const getSegmentRadius = (tree, progress) => {
    const taper = tree.trunkate ?? 30;
    const baseRadius = tree.trunkradius * (1 - progress * taper / 100) * (1 + 0.12 * Math.exp(-progress * 18));
    return Math.max(0.03, baseRadius * (tree.collisionRadiusScale ?? 1.08));
};

/** Builds closed convex capsule meshes along the procedural trunk centerline. */
export function createTrunkCollisionGroup(curve, tree) {
    const segmentCount = Math.min(24, Math.max(1, Math.floor(Number(tree.collisionSegments) || 8)));
    const group = new THREE.Group();
    group.name = "OpenTree_Collision";
    group.userData.isCollisionGroup = true;

    for (let index = 0; index < segmentCount; index += 1) {
        const startProgress = index / segmentCount;
        const endProgress = (index + 1) / segmentCount;
        const start = curve.getPointAt(startProgress);
        const end = curve.getPointAt(endProgress);
        const direction = end.clone().sub(start);
        const length = direction.length();
        if (!Number.isFinite(length) || length <= 1e-5) continue;

        const middleProgress = (startProgress + endProgress) * 0.5;
        const radius = getSegmentRadius(tree, middleProgress);
        // The capsule's pole-to-pole length matches the curve interval, with a small
        // overlap so adjacent convex hulls do not leave gaps on curved trunks.
        const overlap = Math.min(radius * 0.2, length * 0.15);
        const cylinderHeight = Math.max(0.001, length + overlap - radius * 2);
        const geometry = new THREE.CapsuleGeometry(radius, cylinderHeight, 2, 8);
        const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
            color: 0xf08a68,
            roughness: 1,
            transparent: true,
            opacity: 0.34,
            depthWrite: false,
            wireframe: true,
        }));
        mesh.name = `OpenTree_CollisionPreview_${String(index).padStart(2, "0")}`;
        mesh.position.copy(start).add(end).multiplyScalar(0.5);
        mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
        mesh.userData.isCollision = true;
        mesh.userData.collisionPrimitive = "convexCapsule";
        group.add(mesh);
    }

    return group;
}

/** Creates FBX UCX meshes aligned to the world-space render mesh exported by UnrealLodBuilder. */
export function createUnrealCollisionGroup(root) {
    root.updateMatrixWorld(true);
    const collisionGroup = new THREE.Group();
    collisionGroup.name = "OpenTree_UnrealCollision";
    let index = 0;

    root.traverse((object) => {
        if (!object.isMesh || !object.userData.isCollision || !object.geometry) return;
        const geometry = object.geometry.clone();
        geometry.applyMatrix4(object.matrixWorld);
        const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0xffffff }));
        mesh.name = `UCX_OpenTree_StaticMesh_${String(index).padStart(2, "0")}`;
        mesh.userData.isCollision = true;
        mesh.userData.collisionPrimitive = "convexCapsule";
        collisionGroup.add(mesh);
        index += 1;
    });

    return collisionGroup;
}

export function getCollisionComplexity(root) {
    const result = { primitives: 0, triangles: 0, vertices: 0 };
    root.traverse((object) => {
        if (!object.isMesh || !object.userData.isCollision || !object.geometry) return;
        result.primitives += 1;
        result.triangles += (object.geometry.index?.count ?? object.geometry.getAttribute("position")?.count ?? 0) / 3;
        result.vertices += object.geometry.getAttribute("position")?.count ?? 0;
    });
    result.triangles = Math.round(result.triangles);
    return result;
}

