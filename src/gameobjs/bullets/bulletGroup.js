export class BulletGroup extends Phaser.Physics.Arcade.Group 
{
    constructor(scene, texture, bulletCount) 
    {
        super(scene.physics.world, scene);

        this.createMultiple({
            classType: Bullet,
            frameQuantity: bulletCount,
            active: false,
            visible: false,
            key: texture,
        });

        console.log("created bullets : " + this.getLength());
    }

    fireBullet(x, y, w, h, xV, yV, bounce) 
    {
        const bullet = this.getFirstDead();

        if (bullet) 
        {
            bullet.fire(x, y, w, h, xV, yV, bounce);
        }
        else 
        {
            // Optionally, handle the case where all bullets are active
            console.warn("No available bullets to fire!");
        }
    }

    getBullet()
    {
        return this.getFirstAlive();
    }
}

class Bullet extends Phaser.Physics.Arcade.Sprite 
{
    constructor(scene, x, y, texture) 
    {

        super(scene, x, y, texture);
        this.setDepth(1);
        this.scene = scene;

        this.scene.add.existing(this);
        this.scene.physics.world.enable(this);

        this.body.setCircle(10);

        this.doBounce = false;
        this.hasBounced = false;

        this.bounceDuration = 6000; // Max time to bounce in milliseconds
        this.bounceTimer = 0; // Timer to track bouncing time
    }

    fire(x, y, w, h, xV, yV, bounce) 
    {

        this.hasBounced = false;

        var centerX = x + w / 2;
        var centerY = y + h / 2;

        this.body.reset(centerX, centerY);
        
        this.activateBullet();

        this.setVelocity(xV, yV);

        this.doBounce = bounce;
    }

    preUpdate(time, delta) 
    {
        super.preUpdate(time, delta);
        
        const radius = 10;
        const isOffScreen = this.y < -radius || 
                            this.y > this.scene.sys.game.config.height + radius || 
                            this.x < -radius || 
                            this.x > this.scene.sys.game.config.width + radius;
    

        const isOffTop = this.y < -radius || 
        this.y > this.scene.sys.game.config.height + radius;

        const isOffSides = this.x < -radius || 
        this.x > this.scene.sys.game.config.width + radius;

        if (isOffScreen && !this.doBounce) 
        {
           this.deactivateBullet();
        }
        else if (this.doBounce)
        {
            
            if(isOffTop)
            {
                this.setVelocityY(-this.body.velocity.y);
                this.hasBounced = true;
            } 
                
            
            if(isOffSides)
            {
                this.setVelocityX(-this.body.velocity.x);
                this.hasBounced = true;
            }
                

            if(this.hasBounced)
            {
                this.bounceTimer += delta;
            }
            else
            {
                this.bounceTimer = 0;
            }
           
            if (this.bounceTimer > this.bounceDuration) 
            {
                this.deactivateBullet();
            }
            
        }
    }
    

    activateBullet()
    {
        this.setActive(true);
        this.setVisible(true);
        this.body.setEnable(true);
    }

    deactivateBullet()
    {
        this.setActive(false);
        this.setVisible(false);
        this.body.setEnable(false);
        this.hasBounced = false;
    }

    
    
}


