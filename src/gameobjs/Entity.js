import { BulletGroup } from "./bullets/bulletGroup.js";

export class Entity extends Phaser.Physics.Arcade.Sprite 
{
    
    constructor(scene, x, y, texture, textureB, bulletTexture, bulletCount) 
    {
        super(scene, x, y, texture);

        this.bulletsAmmount = bulletCount;

        this.setDepth(2);
        this.scene = scene;

        this.scene.add.existing(this);
        
        this.scene.physics.world.enable(this);

        this.setCollideWorldBounds(true);

        this.health = 100;

        this.bulletGroup = new BulletGroup(this.scene, bulletTexture, this.bulletsAmmount);

        this.hit = false;

        this.movingRight = false;

        this.bloodSprite = this.scene.add.sprite(this.x + this.width / 2, this.y + this.height / 2, textureB);
        this.bloodSprite.setVisible(false); 
        
    }
    
    

    preUpdate(time, delta) 
    {
        super.preUpdate(time, delta);
                    

        if (this.health <= 0) 
        {
            // Hide the enemy sprite
            this.setActive(false); 
            this.setVisible(false);

            // Stop physics interactions
            this.body.setEnable(false); 


            this.bloodSprite.setVisible(true);
            this.bloodSprite.setPosition(this.x, this.y);

        }
        else
        {
            this.bloodSprite.setVisible(false);
        }
        
    }



    receiveDamage()
    {
        if(this.hit) return false;

        this.health -= 35;

        if(this.health <= 0)
        {
            return true;
        }

        this.hit = true;     

        console.log(this.health);
    }

    getBulletGroup()
    {
        return this.bulletGroup;
    }


    playAinamtion()
    {
        const body = this.body;

        if (body.velocity.x !== 0 || body.velocity.y !== 0) 
        {
            // Use a sine wave for wobbling effect
            this.rotation += Math.sin(Date.now() / 100) * 0.025; // Adjust the divisor for speed of wobble
        } 
        else 
        {
            this.rotation = 0; 
        }

        this.rotation = Math.max(-5, Math.min(5, this.rotation)); 
    }
}


