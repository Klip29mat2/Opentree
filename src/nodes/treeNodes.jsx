import SeedNode from "./SeedNode.jsx";
import TrunkNode from "./TrunkNode.jsx";
import BranchNode from "./BranchNode.jsx";
import LeafNode from "./LeafNode.jsx";
import OutputNode from "./OutputNode.jsx"

export const nodeTypes = {

    seed: SeedNode,

    trunk: TrunkNode,

    branch: BranchNode,

    leaf: LeafNode,

    output: OutputNode

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

    }

];



export const edges = [];
