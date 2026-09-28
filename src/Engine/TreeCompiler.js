export default class TreeCompiler {

    compile(nodes, edges) {

        console.log("Nodes :", nodes);
        console.log("Edges :", edges);

        const tree = {
            trunklength: 50,
            trunkradius: 2,
            subdivisions: 5
        };

        for (const node of nodes) {

            if (node.type === "trunk") {
                tree.trunklength =
                    node.data?.length ?? tree.trunklength;

                tree.trunkradius =
                    node.data?.radius ?? tree.trunkradius;
            }

            if (node.type === "subdivide") {
                tree.subdivisions =
                    node.data?.divisions ?? 5;
            }
        }

        console.log("Compiled tree :", tree);

        return tree;
    }

}