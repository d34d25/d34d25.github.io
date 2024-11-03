import { Enemy } from "./enemy.js";


export class Boss extends Enemy
{

    constructor(scene,x,y ,enemyTexture, bloodTexture, bulletTexture, spawnTexture)
    {
        super(scene,x,y, enemyTexture, bloodTexture, bulletTexture, spawnTexture, 250);

        this.body.setSize(18, 32);
        this.body.setOffset(14,14);

        this.shootDelay = 225;

        this.health = -10;

        this.firingAngle = 0; 

        this.dirX = 0;
        this.dirY = 0;

        this.currentAttack = 0;

        
    }

    spawn(x, y)
    {
         
        this.bloodSprite.setActive(false);
        this.bloodSprite.setVisible(false);

        this.body.reset(x,y);

        this.spawSprite.setVisible(true);
        this.spawSprite.setPosition(x,y);
        this.body.setEnable(false);

        const rotationInterval = setInterval(() => {
            this.spawSprite.rotation += 0.1;
        }, 1000 / 60);
        

        setTimeout(() => {

            this.spawSprite.setVisible(false);

            clearInterval(rotationInterval);

            this.health = 100;
        
            this.setActive(true);
            this.setVisible(true);
            this.body.setEnable(true);

        }, 1000);

        
    }

    look(target)
    {
        if(target.x > this.body.x)
        {
            this.flipX = true;
        }
        else
        {
            this.flipX = false;
        }
    }

    receiveDamage()
    {
        if(this.hit) return false;

        this.health -= 5;

        if(this.health <= 0)
        {
            setTimeout(() => {

                this.bloodSprite.setActive(false);
                this.bloodSprite.setVisible(false);
    
            }, 2000);

            
            return true;
        }

        this.hit = true;     

        console.log(this.health);
    }


    attack(player)
    {
        if (this.health <= 0) return;

        var currentTime = Date.now();

        if ((currentTime - this.lastShotTime) >= this.shootDelay) 
        {
            switch(this.currentAttack)
            {
                case 0:
                    this.pattern_a();
                    break;
                case 1:
                    this.pattern_b(player);
                    break;
                case 2:
                    this.pattern_c();
                    break;
                default:
                    this.pattern_a();
                    break;
            }

            this.lastShotTime = currentTime;
            
        }
    
      
    }


    pattern_a() //spiral
    {    
        const body = this.body;
        const bulletSpeed = 200;
           
        this.dirX =  Math.sin(this.firingAngle* Math.PI / 180);
        this.dirY = Math.cos(this.firingAngle * Math.PI / 180);

        this.firingAngle += this.scene.getRandomInt(5, 20);

        let dirXB = -this.dirY; // perpenicular to dirX
        let dirYB = this.dirX;

        let oppositeDirX = this.dirX * -1;
        let oppositeDirY = this.dirY * -1;
           
    
        this.bulletGroup.fireBullet(body.x, body.y, body.width, body.height, this.dirX * bulletSpeed, this.dirY * bulletSpeed, false);
        this.bulletGroup.fireBullet(body.x, body.y, body.width, body.height, oppositeDirX * bulletSpeed, oppositeDirY * bulletSpeed, false);
        this.bulletGroup.fireBullet(body.x, body.y, body.width, body.height, dirXB * bulletSpeed, dirYB * bulletSpeed, false);
        this.bulletGroup.fireBullet(body.x, body.y, body.width, body.height, dirXB * -1 * bulletSpeed, dirYB * -1 * bulletSpeed, false);
             
    }


    pattern_b(target)
    {
    
        const body = this.body;
    
        var dir = [target.x - body.x, target.y - body.y];

        const length = Math.sqrt(dir[0] ** 2 + dir[1] ** 2);

        if (length > 0)
        {
            dir[0] /= length;
            dir[1] /= length;
        }

        const bulletSpeed = 200;

        this.bulletGroup.fireBullet(body.x , body.y, body.width, body.height ,dir[0] * bulletSpeed, dir[1] * bulletSpeed, false);
        
        const spreadAngle = 0.4; // Adjust this value to change the spread

        // Calculate the direction for the second bullet (slightly to the left)
        const leftDir = [
            dir[0] * Math.cos(-spreadAngle) - dir[1] * Math.sin(-spreadAngle),
            dir[0] * Math.sin(-spreadAngle) + dir[1] * Math.cos(-spreadAngle)
        ];
        this.bulletGroup.fireBullet(body.x, body.y, body.width, body.height, leftDir[0] * bulletSpeed, leftDir[1] * bulletSpeed, false);

        // Calculate the direction for the third bullet (slightly to the right)
        const rightDir = [
            dir[0] * Math.cos(spreadAngle) - dir[1] * Math.sin(spreadAngle),
            dir[0] * Math.sin(spreadAngle) + dir[1] * Math.cos(spreadAngle)
        ];
        this.bulletGroup.fireBullet(body.x, body.y, body.width, body.height, rightDir[0] * bulletSpeed, rightDir[1] * bulletSpeed, false);
        
    }

    pattern_c() 
    {
        const body = this.body;
        const bulletSpeed = 100;
        
        // Function to generate a random angle offset
        const getRandomOffset = () => {
            return (Math.random() - 0.5) * 1; // Random offset between -0.25 and 0.25
        };
    
        const angles = [
            { x: bulletSpeed, y: bulletSpeed },             // Original direction
            { x: -bulletSpeed, y: bulletSpeed },            // Left diagonal
            { x: bulletSpeed, y: -bulletSpeed },            // Right diagonal
            { x: -bulletSpeed, y: -bulletSpeed },           // Reverse diagonal
        ];
    
        angles.forEach(angle => {
            this.bulletGroup.fireBullet(
                body.x,
                body.y,
                body.width,
                body.height,
                angle.x + getRandomOffset() * bulletSpeed, // Add random x offset
                angle.y + getRandomOffset() * bulletSpeed, // Add random y offset
                true
            );
        });
    }
    

}




/*
    how to modify the velocity of bullets already fired in a single pattern


    pattern_a(target)
    {

        const body = this.body;
    
        var dir = [target.x - body.x, target.y - body.y];

        const length = Math.sqrt(dir[0] ** 2 + dir[1] ** 2);

        if (length > 0)
        {
            dir[0] /= length;
            dir[1] /= length;
        }

        const bulletSpeed = 200;

        this.bulletGroup.fireBullet(body.x , body.y, body.width, body.height ,dir[0] * bulletSpeed, dir[1] * bulletSpeed);

        //this.bulletGroup.getFirstAlive().setVelocityX(this.bulletGroup.getFirstAlive().body.velocity.x * 0.5);
    
        const bullets = this.bulletGroup.getChildren(); // Adjust this line as necessary
        bullets.forEach(bullet => {
            if (bullet.active) {  // Ensure the bullet is alive
                bullet.setVelocityX(dir[0] * 50);
                bullet.setVelocityY(dir[1] * 50);
            }
        });
    }




 */