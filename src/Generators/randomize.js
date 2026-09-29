export function randomize(cylinders, percentage) {

    for (const cylinder of cylinders) {

        const random = Math.random() * 100;

        if (random < percentage) {

            cylinder.x += Math.random() - 0.5;
            cylinder.z += Math.random() - 0.5;

        }

    }

    return cylinders;
}