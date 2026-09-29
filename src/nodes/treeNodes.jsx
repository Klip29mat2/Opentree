import SeedNode from "./SeedNode.jsx";
import TrunkNode from "./TrunkNode.jsx";
import BranchNode from "./BranchNode.jsx";
import LeafNode from "./LeafNode.jsx";
import RotatorNode from "./RotatorNode.jsx";
import ScaleNode from "./ScaleNode.jsx";
import SubdivideNode from "./SubdivideNode.jsx";
import RandomizeNode from "./RandomizeNode.jsx";

export const nodeTypes = {
    seed: SeedNode,
    trunk: TrunkNode,
    branch: BranchNode,
    leaf: LeafNode,
    rotate: RotatorNode,
    scale: ScaleNode,
    subdivide: SubdivideNode,
    randomize: RandomizeNode,
};

export const nodes = [
    {
        id: "1",
        type: "seed",
        position: {
            x: 100,
            y: 200
        },
        data: {}
    },
    {
        id: "2",
        type: "trunk",
        position: {
            x: 350,
            y: 200
        },
        data: {}
    },
    {
        id: "3",
        type: "rotate",
        position: {
            x: 600,
            y: 200
        },
        data: {}
    },
    {
        id: "4",
        type: "scale",
        position: {
            x: 850,
            y: 200
        },
        data: {}
    },
    {
        id: "5",
        type: "subdivide",
        position: {
            x: 1100,
            y: 200
        },
        data: {}
    },

    {
        id: "6",
        type: "randomize",
        position: {
            x: 1120,
            y: 200
        },
        data: {}
    }
];

export const edges = [];