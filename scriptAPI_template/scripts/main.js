import * as server from '@minecraft/server';
import * as ui from '@minecraft/server-ui';



//UI制作
function show_form(player){
    const form = new ui.ModalFormData();
    form.slider("時間", 180, 600);
    form.dropdown("ゲームモード", ["ノックアウト", "ホットゾーン", "サバイバル"]);
    form.toggle("落下ダメージ", {
        defaultValue: true
    });
    form.show(player).then((response) => {
        if (response.canceled){
            player.sendMessage("キャンセルされました");
            return;
        }
        player.sendMessage("時間: " + String(response.formValues[0]) + "s");
        player.sendMessage("ゲームモード: " + String(response.formValues[1]));
        player.sendMessage("落下ダメージ: " + String(response.formValues[2]? "有効" : "無効"));
    })
}

server.world.afterEvents.playerInteractWithBlock.subscribe(ev => {
    if (ev.block.typeId == "minecraft:lectern"){
        show_form(ev.player);
    }
})
//羽を使った時の処理
server.world.afterEvents.itemUse.subscribe(ev => {
    if (ev.itemStack.typeId === "minecraft:feather") {
        ev.source.runCommand("function feather");
    }
})
//氷を使った時の処理
server.world.afterEvents.itemUse.subscribe(ev => {
    if (ev.itemStack.typeId === "minecraft:blue_ice") {
        ev.source.runCommand("function blue_ice");
    }
})
//小さな竜巻 
server.world.afterEvents.itemUse.subscribe(ev => {
    if (ev.itemStack.typeId === "minecraft:wind_charge") {
        ev.source.runCommand("function wind_charge");
    }
})
//透明化
server.world.afterEvents.itemUse.subscribe(ev => {
    if (ev.itemStack.typeId === "minecraft:glass") {
        ev.source.runCommand("function glass");
    }
})
//生命の苗木
server.world.afterEvents.itemUse.subscribe(ev => {
    if (ev.itemStack.typeId === "minecraft:oak_sapling") {
        ev.source.runCommand("function oak");
    }
})
server.system.runInterval(() => {

    const dimension = server.world.getDimension("overworld");

    // 「回復所」という名前のArmor Standを探す
    const healStations = dimension.getEntities({
        type: "minecraft:armor_stand"
    }).filter(entity => entity.nameTag === "oak_a");

    for (const player of server.world.getAllPlayers()) {

        for (const station of healStations) {

            // 距離の二乗を計算
            const dx = player.location.x - station.location.x;
            const dy = player.location.y - station.location.y;
            const dz = player.location.z - station.location.z;

            const distanceSquared = dx * dx + dy * dy + dz * dz;

            // 5ブロック以内
            if (distanceSquared <= 25) {

                const health = player.getComponent("minecraft:health");

                health.setCurrentValue(
                    Math.min(
                        health.currentValue + 2,
                        health.effectiveMax
                    )
                );

                break;
            }
        }
    }

}, 30);
//オウムガイ
server.world.afterEvents.itemUse.subscribe(ev => {
    if (ev.itemStack.typeId === "minecraft:nautilus_shell") {
        ev.source.runCommand("function nautilus_shell");
    }
})
//本
server.world.afterEvents.itemUse.subscribe(ev => {
    if (ev.itemStack.typeId === "minecraft:book") {
        ev.source.runCommand("function book");
    }
})
//蜘蛛の巣  
server.world.afterEvents.itemUse.subscribe(ev => {
    if (ev.itemStack.typeId === "minecraft:web") {
        ev.source.runCommand("function web");
    }
})
//どこでもドア
server.world.afterEvents.itemUse.subscribe(ev => {
    if (ev.itemStack.typeId === "minecraft:iron_door") {
        ev.source.runCommand("function iron_door");
    }
})
//盲目
server.world.afterEvents.itemUse.subscribe(ev => {
    if (ev.itemStack.typeId === "minecraft:ink_sac") {
        ev.source.runCommand("function ink");
    }
})
//コンジット 
server.world.afterEvents.itemUse.subscribe((ev) => {

    const player = ev.source;
    const item = ev.itemStack;

    // コンジット以外なら終了
    if (item.typeId !== "minecraft:conduit") {
        return;
    }

    player.runCommand("function conduit")

    // 周囲のエンティティを取得
    const entities = player.dimension.getEntities({
        location: player.location,
        maxDistance: 5
    });

    for (const entity of entities) {

        // プレイヤー以外は無視
        if (entity.typeId !== "minecraft:player") {
            continue;
        }

        // 使用者本人は無視
        if (entity.id === player.id) {
            continue;
        }

        // 使用者 → 対象の方向
        const dx = entity.location.x - player.location.x;
        const dz = entity.location.z - player.location.z;

        const distance = Math.sqrt(dx * dx + dz * dz);

        // 同じ位置なら無視
        if (distance === 0) {
            continue;
        }

        // 距離に関係なく一定方向へ飛ばす
        const x = dx / distance;
        const z = dz / distance;
        
        entity.applyKnockback({
            x: x * 6,
            z: z * 6
        }, 0.8);
    }
});
//パン  
server.world.afterEvents.itemCompleteUse.subscribe( ev => {
    if (ev.itemStack.typeId !== "minecraft:bread") {
        return;
    }

    const player = ev.source;

    const health = player.getComponent("minecraft:health");

    health.setCurrentValue(
        Math.min(
            health.currentValue + 9,
            health.effectiveMax
        )
    );
    player.runCommand("function bread")
})

// 二段ジャンプ（試験運用:rabbit_foot）
server.world.afterEvents.playerButtonInput.subscribe( ev => {
    if (
        ev.button !== server.InputButton.Jump ||
        ev.newButtonState !== server.ButtonState.Pressed
    ) {
        return;
    }

    const player = ev.player;

    if (player.isOnGround) {
        return;
    }

    const inventory = player.getComponent("minecraft:inventory");
    const container = inventory.container;
    const item = container.getItem(player.selectedSlotIndex);

    if (item?.typeId !== "minecraft:rabbit_foot") {
        return;
    }

    // ウサギの足を1個消費
    if (item.amount > 1) {
        item.amount -= 1;
        container.setItem(player.selectedSlotIndex, item);
    } else {
        container.setItem(player.selectedSlotIndex, undefined);
    }
    //二段ジャンプ
    const velocity = player.getVelocity();
    const direction = player.getViewDirection();

    player.applyImpulse({
        x: velocity.x * 1.0 + direction.x * 1.2,
        y: 1.3,
        z: velocity.z * 1.0 + direction.z * 1.2
    });
    player.runCommand("function rabbit_foot")
});

server.world.afterEvents.playerInteractWithEntity.subscribe(ev => {

    const player = ev.player;
    const entity = ev.target;

    if (entity.typeId !== "minecraft:armor_stand") {
        return;
    }

    if (entity.nameTag !== "剣士") {
        return;
    }

    if (
        player.hasTag("sword")
    ) {
        player.sendMessage("§cすでに同じ職業に設定されています");
        return;
    }

    // 職業を設定
    player.addTag("sword");
    player.removeTag("spear");
    player.removeTag("axe");
    player.removeTag("crossbow");
    player.removeTag("bow");
    player.sendMessage("§a職業を「剣士」に設定しました");
});
server.world.afterEvents.playerInteractWithEntity.subscribe(ev => {

    const player = ev.player;
    const entity = ev.target;

    if (entity.typeId !== "minecraft:armor_stand") {
        return;
    }

    if (entity.nameTag !== "槍使い") {
        return;
    }

    if (
        player.hasTag("spear")
    ) {
        player.sendMessage("§cすでに同じ職業に設定されています");
        return;
    }

    // 職業を設定
    player.addTag("spear");
    player.removeTag("sword");
    player.removeTag("crossbow");
    player.removeTag("bow");
    player.removeTag("axe");
    player.sendMessage("§a職業を「槍使い」に設定しました");
});
server.world.afterEvents.playerInteractWithEntity.subscribe(ev => {

    const player = ev.player;
    const entity = ev.target;

    if (entity.typeId !== "minecraft:armor_stand") {
        return;
    }

    if (entity.nameTag !== "戦士") {
        return;
    }

    if (
        player.hasTag("axe")
    ) {
        player.sendMessage("§cすでに同じ職業に設定されています");
        return;
    }

    // 職業を設定
    player.addTag("axe");
    player.removeTag("sword");
    player.removeTag("crossbow");
    player.removeTag("bow");
    player.removeTag("spear");
    player.sendMessage("§a職業を「戦士」に設定しました");
});
server.world.afterEvents.playerInteractWithEntity.subscribe(ev => {

    const player = ev.player;
    const entity = ev.target;

    if (entity.typeId !== "minecraft:armor_stand") {
        return;
    }

    if (entity.nameTag !== "狩人") {
        return;
    }

    if (
        player.hasTag("bow")
    ) {
        player.sendMessage("§cすでに同じ職業に設定されています");
        return;
    }

    // 職業を設定
    player.addTag("bow");
    player.removeTag("sword");
    player.removeTag("crossbow");
    player.removeTag("spear");
    player.removeTag("axe");
    player.sendMessage("§a職業を「狩人」に設定しました");
});
server.world.afterEvents.playerInteractWithEntity.subscribe(ev => {

    const player = ev.player;
    const entity = ev.target;

    if (entity.typeId !== "minecraft:armor_stand") {
        return;
    }

    if (entity.nameTag !== "襲撃者") {
        return;
    }

    if (
        player.hasTag("crossbow")
    ) {
        player.sendMessage("§cすでに同じ職業に設定されています");
        return;
    }

    // 職業を設定
    player.addTag("crossbow");
    player.removeTag("sword");
    player.removeTag("spear");
    player.removeTag("bow");
    player.removeTag("axe");
    player.sendMessage("§a職業を「襲撃者」に設定しました");
    player.runCommand("replaceitem entity @s slot.hotbar 4 crossbow")
});

//視点固定
server.system.runInterval(() => {

    for (const player of server.world.getAllPlayers()) {

        // FOVを70に固定
        player.camera.setFov({
            fov: 110
        });
    }

}, 10);
//死亡後の処理
server.world.afterEvents.entityDie.subscribe(ev => {

    const player = ev.deadEntity;

    if (player.typeId !== "minecraft:player") {
        return;
    }

    server.system.run(() => {
        player.runCommand("function player_dead");
    });

});
//カウント
server.system.runInterval(() => {

    const objective = server.world.scoreboard.getObjective("kills");
    const deathObjective = server.world.scoreboard.getObjective("deaths");

    if (!objective || !deathObjective) {
        return;
    }

    for (const player of server.world.getAllPlayers()) {

        const kills = objective.getScore(player) ?? 0;
        const deaths = deathObjective.getScore(player) ?? 0;

        player.onScreenDisplay.setActionBar(
            `§cKills: ${kills} §f| §9Deaths: ${deaths}`
        );
    }

}, 1);
//勝敗設定
server.system.runInterval(() => {

    // mode が 1 でなければ何もしない
    const objective = server.world.scoreboard.getObjective("mode");

    if (!objective) {
        return;
    }

    const mode = objective.getScore("game");

    if (mode !== 1) {
        return;
    }

    const players = server.world.getAllPlayers();

    const red = players.filter(p => p.hasTag("team_red"));
    const blue = players.filter(p => p.hasTag("team_blue"));

    const redAlive = red.some(
        p => p.getGameMode() !== server.GameMode.Spectator
    );

    const blueAlive = blue.some(
        p => p.getGameMode() !== server.GameMode.Spectator
    );

    if (!redAlive) {
        server.world.getDimension("overworld")
            .runCommand("function red_lose");
    }

    if (!blueAlive) {
        server.world.getDimension("overworld")
            .runCommand("function blue_lose");
    }

}, 1);
//リセット
server.world.afterEvents.itemUse.subscribe(ev => {

    if (ev.itemStack.typeId === "minecraft:paper") {

        const objective =
            server.world.scoreboard.getObjective("mode");

        if (objective) {
            objective.setScore("game", 1);
        }

        ev.source.runCommand("function reset");
    }

});
server.world.afterEvents.itemUse.subscribe(ev => {

    if (ev.itemStack.typeId === "minecraft:empty_map") {

        const objective = server.world.scoreboard.getObjective("mode");

        if (objective) {
            objective.setScore("game", 0);
        }

    }

});
server.world.beforeEvents.entityHurt.subscribe(ev => {
    const attacker = ev.damageSource.damagingEntity;
    const target = ev.hurtEntity;

    if (
        attacker?.hasTag("team_red") &&
        target.hasTag("team_red")
    ) {
        ev.cancel = true;
    }

    if (
        attacker?.hasTag("team_blue") &&
        target.hasTag("team_blue")
    ) {
        ev.cancel = true;
    }
});
server.world.afterEvents.entityDie.subscribe(ev => {

    const killer = ev.damageSource?.damagingEntity;

    if (!killer) {
        return;
    }

    if (killer.typeId !== "minecraft:player") {
        return;
    }

    killer.runCommand(
        "scoreboard players add @s kills 1"
    );

});
//雪玉
server.world.afterEvents.projectileHitEntity.subscribe((ev) => {
    const projectile = ev.projectile;

    if (projectile.typeId !== "minecraft:snowball") {
        return;
    }

    const target = ev.getEntityHit().entity;

    target.applyDamage(1);
});
//color
server.system.runInterval(() => {

    for (const player of server.world.getAllPlayers()) {

        if (player.hasTag("team_red")) {

            player.nameTag = "§c[RED]§r " + player.name;

        }
        else if (player.hasTag("team_blue")) {

            player.nameTag = "§9[BLUE]§r " + player.name;

        }
        else {

            player.nameTag = player.name;

        }

    }

}, 20);
