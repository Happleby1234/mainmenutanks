var player1, enemyTanks = [], maxEnemies = 6, bullets, enemyBullets, explosions, destructLayer, level1, startButton, isPlaying = true, SFX = {};
var player1Keys = { left: Phaser.Input.Keyboard.KeyCodes.LEFT, right: Phaser.Input.Keyboard.KeyCodes.RIGHT, down: Phaser.Input.Keyboard.KeyCodes.DOWN, up: Phaser.Input.Keyboard.KeyCodes.UP, l: Phaser.Input.Keyboard.KeyCodes.L };
var player = []

var doublePlayer = false;

var singlePlayer = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:  function singlePlayer() {
            Phaser.Scene.call(this, { key: 'singlePlayer' });
        },

    preload: function () {
        this.load.atlas('tank', 'assets/tanks/tanks.png', 'assets/tanks/tanks.json');
        this.load.image('earth', 'assets/tanks/scorched_earth.png');
        this.load.atlas('enemy', 'assets/tanks/enemy-tanks.png', 'assets/tanks/tanks.json');
        this.load.image('bullet', 'assets/tanks/bullet.png');
        this.load.audio('hurtSFX', '../assets/audio/sfx/Hurt.mp3');
        this.load.spritesheet('explosion', 'assets/tanks/explosion.png', { frameWidth: 64, frameHeight: 64 });
        this.load.image('landscape-tileset', 'assets/maps/landscape-tileset.png');
        this.load.tilemapTiledJSON('level1', 'assets/maps/level1.json');

        this.load.spritesheet('button', 'assets/tanks/button.png', { frameWidth: 120, frameHeight: 40 });
    },

    create: function () {
        level1 = this;
        this.physics.world.on('worldbounds', function (body) {
            killBullet(body.gameObject)
        }, this);




        this.map = this.make.tilemap({ key: 'level1' });
        var landscape = this.map.addTilesetImage('landscape', 'landscape-tileset');
        this.map.createStaticLayer('floor', landscape, 0, 0);
        this.cameras.main.setBounds(0, 0, this.map.widthInPixles, this.map.heightInPixles);
        this.physics.world.setBounds(0, 0, 1280, 1280);
        destructLayer = this.map.createDynamicLayer('walls', landscape, 0, 0);
        destructLayer.setCollisionByProperty({ collides: true });

        console.log(player1Keys);
        player1 = new PlayerTank(this, game.config.width * 0.5, game.config.height * 0.5, 'tank', 'tank1', player1Keys);
        player1.enableCollision(destructLayer);

        //this.input.on('pointerdown', tryShoot, this);

        bullets = this.physics.add.group({
            defaultKey: 'bullet',
            maxSize: 2
        });

        enemyBullets = this.physics.add.group({
            defaultKey: 'bullet',
            maxSize: 10
        });

        explosions = this.physics.add.group({
            defaultKey: 'explosion',
            maxSize: maxEnemies
        })

        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 23, first: 23 }),
            frameRate: 24
        })
        function addSound() {
            SFX.hurt = this.sound.add('hurtSFX', { loop: false, volume: 0.5 });
        }

        console.log('bullets.getchildren.length() = ' + bullets.getChildren.length);
        var outerFrame = new Phaser.Geom.Rectangle(0, 0, game.config.width, game.config.height);
        var innerFrame = new Phaser.Geom.Rectangle(game.config.width * 0.25, game.config.height * 0.25, game.config.width * 0.5, game.config.height * 0.5);

        var enemyTank, loc;
        for (var i = 0; i < maxEnemies; i++) {
            loc = Phaser.Geom.Rectangle.RandomOutside(outerFrame, innerFrame)
            enemyTank = new EnemyTank(this, loc.x, loc.y, 'enemy', 'tank1', player);
            enemyTank.enableCollision(destructLayer);
            enemyTank.setBullets(enemyBullets);
            enemyTanks.push(enemyTank);
            this.physics.add.collider(enemyTank.hull, player1.hull);
            if (i > 0) {
                for (var j = 0; j < enemyTanks.length - 1; j++) {
                    this.physics.add.collider(enemyTank.hull, enemyTanks[j].hull);
                }
            }
        }
    },

    update: function (time, delta) {
        if (isPlaying) {
            player1.update();
            for (var i = 0; i < enemyTanks.length; i++) {
                enemyTanks[i].update(time, delta);
            }
        }
    }

});

function tryShoot(player) {
    //  console.log('tryShoot this = '+this);
    var bullet = bullets.get(player.turret.x, player.turret.y);
    if (bullet) {
        if (doublePlayer) {
            var otherPlayer = player2;
            if (otherPlayer == player) {
                otherPlayer = player1
            }

            fireBullet.call(this, bullet, player.turret.rotation, otherPlayer);
        } else {

            fireBullet.call(this, bullet, player.turret.rotation, enemyTanks);
        }
    }
}
function fireBullet(bullet, rotation, target) {
    bullet.setDepth(3);
    bullet.body.collideWorldBounds = true;
    bullet.body.onWorldBounds = true;
    //console.log('fire bullet');
    bullet.enableBody(false);
    bullet.setActive(true);
    bullet.setVisible(true);
    bullet.rotation = rotation;
    //breaking walls

    //destructLayer = level1.map.getLayer("walls").tilemapLayer;
    level1.physics.add.collider(bullet, destructLayer, damageWall, null, this);

    level1.physics.velocityFromRotation(bullet.rotation, 500, bullet.body.velocity);
    if (target === enemyTanks) {
        for (var i = 0; i < enemyTanks.length; i++) {
            level1.physics.add.overlap(enemyTanks[i].hull, bullet, bulletHitEnemy, null, this);
        }
    } else {
        bullet.targetCollider = level1.physics.add.overlap(target.hull, bullet, bulletHitPlayer, null, this);
    }
    /*
    if (target === player) {
        this.physics.add.overlap(player1.hull, bullet, bulletHitPlayer, null, this)
 
    } else {
        for (var i = 0; i < enemyTanks.length; i++) {
            this.physics.add.overlap(enemyTanks[i].hull, bullet, bulletHitEnemy, null, this);
        }
    }
    */
    //bullet.targetCollider = level1.physics.add.overlap(target.hull, bullet, bulletHitPlayer, null, this);
    //console.log(bullet)


}


function bulletHitPlayer(hull, bullet) {


    killBullet(bullet);
    // player1.damage();
    if (hull === player1.hull) {
        //console.log('1')
        player1.damage();
        if (player1.isDestroyed()) {
            //level1.playerKeys.enabled = false;
            enemyTanks = [];
            var explosion = explosions.get(hull.x, hull.y);
            if (explosion) {
                activateExplosion(explosion);
                explosion.play('explode');
            }
            level1.physics.pause();
        }
    }
    if (doublePlayer) {
        if (hull === player2.hull) {
            //console.log('2')
            player2.damage();
            if (player2.isDestroyed()) {
                //level1.playerKeys.enabled = false;
                enemyTanks = [];
                var explosion = explosions.get(hull.x, hull.y);
                if (explosion) {
                    activateExplosion(explosion);
                    explosion.play('explode');
                }
                level1.physics.pause();
            }
        }
    }




}

function killBullet(bullet) {
    level1.physics.world.removeCollider(bullet.targetCollider);
    bullet.disableBody(true, true);
    bullet.setActive(false);
    bullet.setVisible(false);
}

function activateExplosion(explosion) {
    explosion.setDepth(5);
    explosion.setActive(true);
    explosion.setVisible(true);

}

function bulletHitEnemy(hull, bullet) {
    var enemy;
    var index;
    for (var i = 0; i < enemyTanks.length; i++) {
        if (enemyTanks[i].hull === hull) {
            enemy = enemyTanks[i];
            index = i;
            break;
        }
    }
    killBullet(bullet);
    enemy.damage();
    var explosion = explosions.get(hull.x, hull.y);
    if (explosion) {
        activateExplosion(explosion);
        explosion.on('animationcomplete', animComplete, this)
        explosion.play('explode');
    }
    if (enemy.isDestroyed()) {
        //remove from list
        enemyTanks.splice(index, 1);
    }
}
function animComplete(animation, frame, gameObject) {
    gameObject.disableBody(true, true);
}

function damageWall(bullet, tile) {
    //var destructLayer = this.map.getLayer("walls").tilemapLayer;
    killBullet(bullet);


    var index = tile.index + 1;
    var tileProperties = destructLayer.tileset[0].tileProperties[index - 1];


    var checkCollision = false;

    if (tileProperties) {
        if (tileProperties.collides) {
            checkCollision = true;

        }
    }
    const newTile = destructLayer.putTileAt(index, tile.x, tile.y);
    if (checkCollision) {
        newTile.setCollision(true);
    }

}