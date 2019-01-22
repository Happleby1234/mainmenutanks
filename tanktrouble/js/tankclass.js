//classes
class BaseTank {
    constructor(scene, x, y, texture, frameNum) {
        this.scene = scene;
        //tank shadow
        this.shadow = this.scene.add.sprite(x, y, texture, 'shadow');
        this.shadow.setDepth(1);
        //tank body
        this.hull = this.scene.physics.add.sprite(x, y, texture, frameNum);
        //tank turret
        this.turret = this.scene.physics.add.sprite(x, y, texture, 'turret');
        this.turret.setDepth(4);
        this.hull.body.collideWorldBounds = true;
        this.hull.body.setSize(this.hull.width - 8, this.hull.height - 8)
        this.hull.body.bounce.setTo(1, 1);
        this.hull.setDepth(2);
        this.damageCount = 0;
        this.damageMax = 2;
    }
    update() {
        this.turret.x = this.shadow.x = this.hull.x;
        this.turret.y = this.shadow.y = this.hull.y;
    }
    damage() {

    }
    setBullets(bullets) {
        this.bullets = bullets;
    }
    burn() {
        this.turret.setVisible(false);
        this.hull.setVelocity(0);
        this.hull.body.immovable = true;
    }
    isDestroyed() {
        if (this.damageCount >= this.damageMax) {
            return true
        }
    }
    enableCollision(destructLayer) {
        this.scene.physics.add.collider(this.hull, destructLayer);
    }
}



class EnemyTank extends BaseTank {
    constructor(scene, x, y, texture, frameNum, player) {
        super(scene, x, y, texture, frameNum);
        this.hull.angle = Phaser.Math.RND.angle();
        this.player = player1;
        this.scene.physics.velocityFromRotation(this.hull.rotation, 100, this.hull.body.velocity);
        this.fireTime = 0;
    }

    update(time, delta) {
        super.update();
        this.turret.rotation = Phaser.Math.Angle.Between(this.hull.x, this.hull.y, this.player.hull.x, this.player.hull.y)
        //rotates enemy tank to direction facing
        this.shadow.rotation = this.hull.rotation = Math.atan2(this.hull.body.velocity.y, this.hull.body.velocity.x);
        if (Phaser.Math.Distance.Between(this.hull.x, this.hull.y, this.player.hull.x, this.player.hull.y) < 300 && this.fireTime == 0) {
            //down range
            this.fireTime = time;
            var bullet = this.bullets.get(this.turret.x, this.turret.y);
            if (bullet) {
                fireBullet.call(this.scene, bullet, this.turret.rotation, this.player);
            }
        }
        if (this.fireTime > 0) {
            if (time > this.fireTime + 4000) {
                this.fireTime = 0;
            }
        }

    }

    damage() {
        this.damageCount++;
        if (this.damageCount >= this.damageMax) {
            //destroy
            this.turret.destroy();
            this.hull.destroy();
        } else if (this.damageCount == this.damageMax - 1) {
            //disable visual damage
            this.burn();
        }

    }
}



class PlayerTank extends BaseTank {
    constructor(scene, x, y, texture, frameNum, playerKeys) {
        super(scene, x, y, texture, frameNum)
        this.currentSpeed = 0;
        this.keys = this.scene.input.keyboard.addKeys(
            {
                left: playerKeys.left,
                right: playerKeys.right,
                down: playerKeys.down,
                up: playerKeys.up,
                space: playerKeys.space,
                w: playerKeys.w,
                a: playerKeys.a,
                s: playerKeys.s,
                d: playerKeys.d,
                l: playerKeys.l
            }
        );
        this.damageMax = 10;
    }

    update() {
        super.update();
        if (this.keys.up.isDown || this.keys.w.isDown) {
            if (this.currentSpeed < 100) {
                this.currentSpeed += 10;
            }
        }
        else if (this.keys.down.isDown || this.keys.s.isDown) {
            if (this.currentSpeed > -100) {
                this.currentSpeed -= 10;
            }
        }
        else {
            this.currentSpeed *= 0.9;
        }
        if (this.keys.left.isDown || this.keys.a.isDown) {
            if (this.currentSpeed > 0) {
                this.hull.angle--
                this.turret.angle--
            } else {
                this.hull.angle++
                this.turret.angle++
            }
        }
        else if (this.keys.right.isDown || this.keys.d.isDown) {
            if (this.currentSpeed > 0) {
                this.hull.angle++
                this.turret.angle++
            } else {
                this.hull.angle--
                this.turret.angle--
            }
        }

        if (this.keys.l.isDown) {
            //console.log(this.scene.tryShoot)
            // this.scene.tryShoot(this)
            //tryShoot(this)
        }
        if (Phaser.Input.Keyboard.JustDown(this.keys.l)){
            tryShoot(this)
        }
		if (this.keys.space.isDown) {
                //console.log(this.scene.tryShoot)
                // this.scene.tryShoot(this)
                //tryShoot(this)
            }
        if (Phaser.Input.Keyboard.JustDown(this.keys.space)) {
            tryShoot(this)
        }

        this.scene.physics.velocityFromRotation(this.hull.rotation, this.currentSpeed, this.hull.body.velocity);
        //const worldPoint = this.scene.input.activePointer.positionToCamera(this.scene.cameras.main);
        //this.turret.rotation.velocityFromRotation(this.turret.x, this.turret.y, worldPoint.x, worldPoint.y);
    }
    getTank() {
        return this.tank
    }
    damage() {
        this.scene.cameras.main.shake(200, 0.005);
        this.damageCount++
        if (this.damageCount >= this.damageMax) {
            this.burn();
        }
    }
}