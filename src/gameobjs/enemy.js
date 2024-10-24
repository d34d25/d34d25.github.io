import { Entity } from "./Entity.js";



export class EnemyGroup extends Phaser.Physics.Arcade.Group 
{
    constructor(scene, enemyTexture, bloodTexture, bulletTexture) 
    {
        super(scene.physics.world, scene);
        
        this.enemyTexture = enemyTexture;
        this.bloodTexture = bloodTexture;
        this.bulletTexture = bulletTexture;

        for (let i = 0; i < 20; i++)
        { 
            const enemy = new Enemy(scene, 0, 0, this.enemyTexture, this.bloodTexture, this.bulletTexture);
            enemy.setActive(false);
            enemy.setVisible(false);
            enemy.body.setEnable(false);
            enemy.health = -10;
            this.add(enemy); 
        }
        

        console.log("Created enemies: " + this.getLength());
    }

    spawnEnemy(x, y, wave) 
    {
        const enemy = this.getFirstDead();

        if (enemy) 
        {
            enemy.spawn(x, y, this.bloodTexture, wave);
        }
    }


    handleEnemyAttacks(target) 
    {
        const enemies = this.getChildren();

        if (enemies && enemies.length > 0)
        {
            enemies.forEach(enemy => {
                enemy.attack(target);
            });
        }
    }

    resetFlags()
    {
        const enemies = this.getChildren();

        if (enemies && enemies.length > 0)
        {
            enemies.forEach(enemy => {
               enemy.hit = false;
            });
        }
    } 


    getEnemiesBulletGroup() 
    {        
        const enemies = this.getChildren();
    
        return enemies.map(enemy => enemy.getBulletGroup()).filter(group => group); // Filter out any undefined values
    }
}




export class Enemy extends Entity
{
    constructor(scene, x, y, texture, textureB, bulletTexture)
    {
        super(scene, x, y, texture, textureB, bulletTexture);

        this.body.setSize(16, 30);

        this.lastShotTime = 0;
        this.shootDelay = 1200;
        
        this.setBehaviorType();
    }

    spawn(x, y, bloodTexture, currentWave)
    {

        var wave = currentWave;

        if(wave < 6)
        {
            this.behaviorType = this.scene.getRandomInt(0, 1);
        }
        else
        {
            this.behaviorType = this.scene.getRandomInt(0, 4);
        }

        
        this.setBehaviorType();

        console.log(`Wave: ${currentWave}, Behavior Type: ${this.behaviorType}`);


        this.body.reset(x,y);
        this.health = 100;
        
        this.setActive(true);
        this.setVisible(true);
        this.body.setEnable(true);

        this.bloodTexture = bloodTexture;
    }

   

    setBehaviorType() 
    {
        // Set behavior type based on random generation
        switch (this.behaviorType)
        {
            case 0: this.behaviorType = 'follow'; break;
            case 1: this.behaviorType = 'track'; break;
            case 2: this.behaviorType = 'shoot'; break;
            case 3: this.behaviorType = 'all_shoot'; break;
            case 4: this.behaviorType = 'maniac'; break;
        }
    }

    playAinamtion()
    {
        const body = this.body;

        if (body.velocity.x !== 0 || body.velocity.y !== 0) 
        {
            // Use a sine wave for wobbling effect
            this.rotation += Math.sin(Date.now() / 100) * 0.005; // Adjust the divisor for speed of wobble
        } 
        else 
        {
            this.rotation = 0; 
        }

        this.rotation = Math.max(-5, Math.min(2, this.rotation)); 
    }
    
    attack(target)
    {
        if (this.health <= 0) return;

        this.playAinamtion();

        if(target.x >= this.body.x)
        {
            this.movingRight = true;
        }
        else
        {
            this.movingRight = false;
        }

        if(this.movingRight)
        {
            this.flipX = true;
        }
        else
        {
            this.flipX = false;
        }

        switch(this.behaviorType)
        {
            case 'follow':
                this.follow(target);
                break;
            case 'shoot':
                const shootType = this.scene.getRandomInt(1, 2);
                this.staynShoot(target, shootType);
                break;
            case 'track':
                this.staynShoot(target, 0);
                break;
            case 'all_shoot':
                const shootType_b = this.scene.getRandomInt(0, 2); 
                this.staynShoot(target, shootType_b);
                break;
            case 'maniac':
                this.follow(target);
                const shootType_c = this.scene.getRandomInt(0, 2);
                this.staynShoot(target, shootType_c);
                break;
        }
    }

    follow(target)
    {

        const body = this.body;
    
        var direction = [target.x - body.x, target.y - body.y];

        const moveSpeed = 125;

        const magnitude = Math.sqrt(direction[0] * direction[0] + direction[1] * direction[1]);
        if (magnitude > 0) 
        {
            direction[0] /= magnitude;
            direction[1] /= magnitude;
        }

        body.setVelocityX(direction[0] * moveSpeed);
        body.setVelocityY(direction[1] * moveSpeed);
    }

    staynShoot(target, type)
    {   
        var currentTime = Date.now();

        if (this.health > 0 && (currentTime - this.lastShotTime) >= this.shootDelay) 
        {
            switch (type)
            {
                case 0:
                    this.pattern_a(target);
                    break;
                case 1:
                    this.pattern_b();
                    break;
                case 2:
                    this.pattern_c();
                    break;
            }

            this.lastShotTime = currentTime;
        }
        
        
    }

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
    
    }

    pattern_b()
    {
        const body = this.body;

        const bulletSpeed = 200;

        this.bulletGroup.fireBullet(body.x , body.y, body.width, body.height ,bulletSpeed, 0);
        this.bulletGroup.fireBullet(body.x , body.y, body.width, body.height ,-bulletSpeed, 0);
        this.bulletGroup.fireBullet(body.x , body.y, body.width, body.height ,0, bulletSpeed);
        this.bulletGroup.fireBullet(body.x , body.y, body.width, body.height ,0, -bulletSpeed);
    }

    pattern_c()
    {
        const body = this.body;

        const bulletSpeed = 200;

        this.bulletGroup.fireBullet(body.x , body.y, body.width, body.height ,bulletSpeed, bulletSpeed);
        this.bulletGroup.fireBullet(body.x , body.y, body.width, body.height ,-bulletSpeed, bulletSpeed);
        this.bulletGroup.fireBullet(body.x , body.y, body.width, body.height ,bulletSpeed, -bulletSpeed);
        this.bulletGroup.fireBullet(body.x , body.y, body.width, body.height ,-bulletSpeed, -bulletSpeed);
    }
}


 /* reset(x, y)
    {
        this.rekt.setPosition(x, y);
        this.health = 100; 
        this.setBehaviorType();
        this.lastShotTime = 0;

    }*/