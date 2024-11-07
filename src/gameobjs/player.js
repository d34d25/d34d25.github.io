import { Entity } from "./Entity.js";


export class Player extends Entity
{
    constructor(scene, x, y, texture, textureB, bulletTexture)
    {
        super(scene, x, y, texture, textureB, bulletTexture, 30);
        
        this.body.setSize(16, 30);

        this.graphics = this.scene.add.graphics();

        this.graphics.setDepth(3);

        this.wKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.aKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.sKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.dKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

        this.lastShotTime = 0;
        this.shootDelay = 225;
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
            this.flipX = false;
        }
        else
        {
            this.flipX = true;
        }



        //debug area around player
        
        //this.graphics.strokeCircle(this.body.x + this.body.width / 2,  this.body.y + this.body.height / 2, 400);
        
    }

    shoot(scene) 
    {
        if(this.health <= 0) return;

        let firing = false; // Track if the fire button is being held down
    
        // Initialize lastShotTime if it doesn't exist
        if (this.lastShotTime === undefined) 
        {
            this.lastShotTime = 0;
        }
    
        scene.input.on('pointerdown', pointer => {
            if (this.health <= 0) return;
            firing = true; // Start firing
        });
    
        scene.input.on('pointerup', pointer => {
            firing = false; // Stop firing
        });
    
        scene.events.on('update', (time, delta) => {
            if (this.health <= 0) return;
            const currentTime = Date.now(); // Get current time each frame
    
            if (firing && (currentTime - this.lastShotTime) >= this.shootDelay) {
                const mouseX = scene.input.x;
                const mouseY = scene.input.y;
    
                const body = this.body;
    
                const dir = [mouseX - (body.x + body.width / 2), mouseY - (body.y + body.height / 2)];
    
                const length = Math.sqrt(dir[0] ** 2 + dir[1] ** 2);
                if (length > 0) {
                    dir[0] /= length;
                    dir[1] /= length;
                }
    
                const bulletSpeed = 800; 
    
                this.bulletGroup.fireBullet(body.x, body.y, body.width, body.height, dir[0] * bulletSpeed, dir[1] * bulletSpeed, false);
                this.lastShotTime = currentTime; // Update last shot time after firing
            }
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