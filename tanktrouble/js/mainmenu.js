var mainMenu = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

        function mainMenu() {
            Phaser.Scene.call(this, { key: 'mainMenu' });
        },

    preload: function () {        
        this.load.image('landscape-tileset', 'assets/maps/landscape-tileset.png');
    },

    create: function () {
        this.add.sprite(400, 300, 'landscape-tileset').setAlpha(0.2);
        this.input.once('pointerdown', function () {

            console.log('From Main Menu to Single Player');

            this.scene.start('doublePlayer');

        }, this);
    }

});

var config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 1280,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: {
                y: 0
            } // Top down game, so no gravity
        }
    },
    scene: [mainMenu, singlePlayer, doublePlayer]
};

var game = new Phaser.Game(config);