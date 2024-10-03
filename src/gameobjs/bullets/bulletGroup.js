export class BulletGroup extends Phaser.Physics.Arcade.Group 
{
    constructor(scene) 
    {
        super(scene.physics.world, scene);

        // Create multiple instances of Bullet
        this.createMultiple({
            classType: Bullet,
            frameQuantity: 30,
            active: false,
            visible: false,
            key: 'bulletTexture',
        });

        //console.log("created: " + this.getLength());
    }

    fireBullet(x, y, w, h, xV, yV) 
    {
        const bullet = this.getFirstDead();

        if (bullet) 
        {
            bullet.fire(x, y, w, h, xV, yV);
        }
    }

    getBullet()
    {
        return this.get();
    }
}

class Bullet extends Phaser.Physics.Arcade.Sprite 
{
    constructor(scene, x, y) 
    {
        super(scene, x, y, 'bulletTexture');
        this.setDepth(2);
        this.scene = scene;

        this.scene.add.existing(this);
        this.scene.physics.world.enable(this);

        this.body.setCircle(10);
    }

    fire(x, y, w, h, xV, yV) 
    {
        var centerX = x + w / 2;
        var centerY = y + h / 2;

        this.body.reset(centerX, centerY);
        
        this.setActive(true);
        this.setVisible(true);
        this.body.setEnable(true);
        this.setVelocity(xV, yV);

    }

    preUpdate(time, delta) 
    {
        super.preUpdate(time, delta);
        
        const radius = 10;
        const isOffScreen = this.y < -radius || 
                            this.y > this.scene.sys.game.config.height + radius || 
                            this.x < -radius || 
                            this.x > this.scene.sys.game.config.width + radius;
    
        if (isOffScreen) 
        {
            this.setActive(false);
            this.setVisible(false);
            this.body.setEnable(false);
            //console.log('Bullet active:', this.active);
        }
    }
    
    
    
}


