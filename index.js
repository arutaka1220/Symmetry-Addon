import * as MC from "@minecraft/server";

const world = MC.world;

/** @type { Map<string, MC.Vector3> } */
const symmetry = new Map();

const STAIRS_DIRECTION_CONVETER = {
    "0": 1,
    "1": 0,
    "2": 3,
    "3": 2
}

MC.system.beforeEvents.watchdogTerminate.subscribe(ev => ev.cancel);

world.beforeEvents.chatSend.subscribe(ev => {
    const { sender, message } = ev;

    if(message === "sym on") {
        symmetry.set(sender.id, roundVector3(sender.location));

        sender.sendMessage("オン");
    } else if(message === "sym off") {
        symmetry.delete(sender.id);

        sender.sendMessage("オフ");
    }
});

world.afterEvents.playerPlaceBlock.subscribe(ev => {
    const { player, block } = ev;

    if(!symmetry.has(player.id)) return;

    const data = symmetry.get(player.id);

    if(!data) return symmetry.delete(player.id);

    const pos = block.location;

    pos.x = -pos.x;
    pos.z = -pos.z;

    let permutation = block.permutation.clone();

    /* -- 以下、階段の向きを左右対称に変えるコードですが、対応がめんどくさくなったので制作を終わりました。 -- */
    // let directionName = (Object.keys(permutation.getAllStates()).find(v => v.match(/direction/gi))) || null;

    // player.sendMessage("§3" + JSON.stringify(permutation.getAllStates(), null, 2));

    // if(directionName !== null) {
    //     const value = permutation.getState(directionName);

    //     permutation = permutation.withState(directionName, DIRECTION_CONVETER[value.toString()]);
    // }

    player.dimension
        .getBlock(pos)
        .setPermutation(permutation);

    // player.sendMessage("§b" + JSON.stringify(permutation.getAllStates(), null, 2));
});

world.afterEvents.playerBreakBlock.subscribe(ev => {
    const { player, block } = ev;

    if(!symmetry.has(player.id)) return;

    const data = symmetry.get(player.id);

    if(!data) return symmetry.delete(player.id);

    const pos = block.location;

    pos.x = -pos.x;
    pos.z = -pos.z;
    
    player.dimension
        .getBlock(pos)
        .setType("minecraft:air");
});

/**
 * 
 * @param { MC.Vector3 } pos 
 * @returns { MC.Vector3 }
 */
function roundVector3(pos) {
    return {
        "x": Math.round(pos.x),
        "y": Math.round(pos.y),
        "z": Math.round(pos.z),
    }
}
