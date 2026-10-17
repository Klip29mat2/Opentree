import ParameterNode from "./ParameterNode.jsx";
import defaultGraphTemplate from "../../defaultGraph.json";

export const nodeTypes = Object.fromEntries(["seed", "trunk", "branch", "coconut", "leaf", "dryfrond", "collision", "wind", "rotate", "scale", "subdivide", "randomize", "move", "trunkate", "output"].map((type) => [type, ParameterNode]));

const defaultGraph = structuredClone(defaultGraphTemplate);
export const nodes = defaultGraph.nodes;
export const edges = defaultGraph.edges;
