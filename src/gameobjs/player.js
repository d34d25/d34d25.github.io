import { Entity } from "./Entity.js";


export class Player extends Entity
{
    constructor(scene, x, y, texture, textureB, bulletTexture)
    {
        super(scene, x, y, texture, textureB, bulletTexture);
        
        this.body.setSize(16, 30);

        this.graphics = this.scene.add.graphics();

        this.graphics.setDepth(3);

        this.movingRight = false;

        this.wKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.aKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.sKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.dKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    }

    aim()
    {

        const mouseX = this.scene.input.activePointer.x;
        const mouseY = this.scene.input.activePointer.y;

        const body = this.body;

        this.graphics.clear();
        
        this.graphics.lineStyle(2, 0xff0000, 1); 

        this.graphics.strokeCircle(mouseX, mouseY, 12);

        this.graphics.fillStyle(0xff0000, 1);
        
        this.graphics.fillCircle(mouseX, mouseY, 2);

        if(mouseX <= body.x)
        {
            this.movingRight = false;
        }
        else
        {
            this.movingRight = true;
        }

        
        if(this.movingRight)
        {
            this.flipX = true;
        }
        else
        {
            this.flipX = false;
        }
        
    }

    shoot(scene) 
    {

        scene.input.on('pointerdown', pointer => {

            if (this.health <= 0) return;

            const mouseX = pointer.x; 
            const mouseY = pointer.y;
        
            const body = this.body;
    
            const dir = [mouseX - (body.x + body.width /2), mouseY - (body.y + body.height / 2)];

            const length = Math.sqrt(dir[0] ** 2 + dir[1] ** 2);
            if (length > 0) 
            {
                dir[0] /= length;
                dir[1] /= length;
            }
    
            const bulletSpeed = 500;//2400;
    
            this.bulletGroup.fireBullet(body.x , body.y, body.width, body.height ,dir[0] * bulletSpeed, dir[1] * bulletSpeed);
        });
    }
    

    move()
    {
        
        const body = this.body;

        var moveSpeed = 300;

        let directionX = 0;
        let directionY = 0;

        if (this.aKey.isDown) 
        {
            directionX = -1;
        } 
        if (this.dKey.isDown) 
        {
            directionX = 1;
        } 
        if (this.wKey.isDown) 
        {
            directionY = -1;
        } 
        if (this.sKey.isDown) 
        {
            directionY = 1;
        }

        // Normalize the direction vector
        const magnitude = Math.sqrt(directionX * directionX + directionY * directionY);
        if (magnitude > 0) 
        {
            directionX /= magnitude;
            directionY /= magnitude;
        }



        this.playAinamtion();

        body.setVelocityX(directionX * moveSpeed);
        body.setVelocityY(directionY * moveSpeed);
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

    receiveDamage()
    {
        if(this.hit) return false;

        this.health -= 100;

        if(this.health <= 0)
        {
            return true;
        }

        this.hit = true;     
    }
}

/*

*/