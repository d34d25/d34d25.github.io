import { EnemyGroup } from "./src/gameobjs/enemy.js";
import { Entity } from "./src/gameobjs/Entity.js";
import { Player } from "./src/gameobjs/player.js";
import { Boss } from "./src/gameobjs/boss.js";


export class Game extends Phaser.Scene 
{
    constructor() 
    {
        super({ key: 'game' });
    }

    preload()
    {
        this.load.image('bulletTexture', 'assets/bulletTexture.png');
        this.load.image('blood', 'assets/blood.png');
        this.load.image('player','assets/playertexture.png');
        this.load.image('enemy','assets/enemytexture.png');
        this.load.image('bulletTexture_b', 'assets/bulletTextureb.png');
        this.load.image('sample_p', 'assets/samplePlayer.png');
        this.load.image('bg', 'assets/sampleBackground.jpg')
        this.load.image('wall', 'assets/wallsample.png');
        this.load.image('sampleEnemy', 'assets/sampleEnemy.png');
        this.load.image('spawncircle', 'assets/spawncircle.png');
        this.load.image('sampleboss', 'assets/sampleBoss.png');
    }

    create()
    {
       
        this.inIntermission = false;

        this.minutes;

        this.seconds;

        this.add.image(1280/2,720/2,'bg');

        //wall
        this.wall = new Entity(this, 1280/2, 94, 'wall', null,null);
        this.wall.setDepth(1);
        this.wall.setCollideWorldBounds(false);
        this.wall.setImmovable(true);
        this.wall.setOffset(0,-94);
        

        this.input.keyboard.on('keydown-R', () => {
            this.restartScene();
        });

       
        this.totalEnemies = 5;
        this.spawnIndex = 0; 
        this.killedCount = 0;

        
        this.wave = 1;

        this.input.setDefaultCursor('none');

        this.colors = [0x3d03fc, 0x808080, 0x6a608f, 0xb0544d, 0x4aba61];
        

        this.player = new Player(this, 500,500, 'sample_p', 'blood', 'bulletTexture');
        this.player.shoot(this);

        this.enemygrp = new EnemyGroup(this, 'sampleEnemy', 'blood', 'bulletTexture_b', 'spawncircle');

        this.boss = new Boss(this, -10,-10 ,'sampleboss', 'blood', 'bulletTexture_b', 'spawncircle');

        this.bossPatternChangeTimer = 0;

        this.spawnEnemies(); 

        this.addCollisions();
              
        this.startTime = this.time.now; // Current time when the game starts
        this.elapsedTime = 0; // Total elapsed time
       
        this.addText();
        
    }

    update()
    {
    
        if (this.player.health <= 0)
        {
            this.timeText.setText(`TIME SURVIVED: ${this.minutes}:${this.seconds < 10 ? '0' : ''}${this.seconds}`);

            this.restartText.setText('You died! \n Press R to Restart');

            this.timeText.setPosition((1280 - this.timeText.width) /2 , 600 /2);
            this.restartText.setPosition((1280 - this.restartText.width)/2, 720/2);
            
            return;
        } 

        this.getTime();

        const fps = this.game.loop.actualFps;

        this.fpsText.setText('FPS: ' + Math.round(fps));

        

        this.player.aim();
        this.player.move();

        const playerX = this.player.x;
        const playerY = this.player.y;

        this.posText.setText(`Position: ${playerX.toFixed(2)}, ${playerY.toFixed(2)}`);
        

        for(let i = 0; i < this.totalEnemies; i++)
        {
            this.enemygrp.handleEnemyAttacks(this.player.body);
        }

        if (this.time.now - this.bossPatternChangeTimer >= 4000) 
        {
            this.boss.currentAttack = this.getRandomInt(0, 2);
            this.bossPatternChangeTimer = this.time.now; // Reset the timer
        }

        this.boss.attack(this.player.body);
        
        this.boss.look(this.player.body);
    
        this.killcountText.setText('Enemies killed: ' + this.killedCount);

        this.resetHitFlags();
       
        

        let isSpecialRound = this.wave % 19 == 0;

        if(this.inIntermission)
        {
            this.waveText.setPosition((1280 - this.waveText.width)/2 , 720/2);
        }
        else
        {
            this.waveText.setPosition(10,10);
        }

        if (this.killedCount >= this.totalEnemies) 
        {
            // Increment the wave number
            this.inIntermission = true;
            this.wave++;
       

            this.killedCount = 0;
            this.waveText.setText('WAVE: ' + this.wave);
    
            this.time.delayedCall(4000, () => { //only affects the first spawn
                this.inIntermission = false;
                if(!isSpecialRound)
                {
                    this.spawnEnemies();
                }
                else
                {
                    this.totalEnemies = 1;
        
                    this.boss.spawn(1280/2,720/2);    
                }

            }, [], this);  
           
        }
        
    }

    spawnEnemies() 
    {
        this.spawnIndex = 0; 
        this.totalEnemies = Math.min(4 + this.wave, 20);

        const spawnEnemy = () => {
            if (this.spawnIndex < this.totalEnemies) 
            {
                let rX, rY;
                // Ensure random position doesn't conflict with player position or existing enemies
                do {
                    rX = this.getRandomInt(20, 1260);
                    rY = this.getRandomInt(200, 700);
                } while (this.isPositionOccupied(rX, rY));


                this.enemygrp.spawnEnemy(rX, rY, this.wave);
                this.spawnIndex++;

                // Call the next enemy spawn after a short delay
                this.time.delayedCall(1250, spawnEnemy, [], this); //1250
            } 

        };

        spawnEnemy(); 
    }

    
    isPositionOccupied(x, y) 
    {
        // Check if the player is near the position
        const distanceToPlayer = Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y);
        if (distanceToPlayer < 400) return true; // 400 is a good distance   distance between the player and the enemy

        // Check if there are any active enemies at the position
        return this.enemygrp.getChildren().some(enemy => {
            return enemy.active && Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y) < 100; //distance between active enemies
        });
    }
        
    resetHitFlags()
    {
        this.enemygrp.resetFlags();
        this.player.body.setEnable(true);
        this.boss.hit = false;
        this.player.hit = false; //has to be false
    }


    getRandomInt(min, max) 
    {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    

    getTime() 
    {
      
        this.elapsedTime = Math.floor((this.time.now - this.startTime) / 1000);
    
        this.minutes = Math.floor(this.elapsedTime / 60);
        this.seconds = this.elapsedTime % 60;
    
        // Update the time display
        this.timeText.setText(`TIME: ${this.minutes}:${this.seconds < 10 ? '0' : ''}${this.seconds}`);
    }
    

    restartScene() 
    {
        this.scene.restart();
    }


    addText()
    {
        this.fpsText = this.add.text(10, 50, 'FPS: ' , {
            font: '22px Arial',
            fill: '#ffffff'
        });
        this.fpsText.setDepth(5);

        this.killcountText = this.add.text(10, 80, 'Enemies Killed: ' , {
            font: '22px Arial',
            fill: '#ffffff'
        });
        this.killcountText.setDepth(5);

        this.waveText = this.add.text(10, 10, 'WAVE: ' + this.wave, {
            font: '32px Arial',
            fill: '#ffffff'
        });
        this.waveText.setDepth(5);
        
        this.restartText = this.add.text((1280/2) - 100, (720/2) - 100, '' , {
            font: '32px Arial',
            fill: '#ffffff'
        });
        this.restartText.setDepth(5);

        this.timeText = this.add.text(10, 120, 'TIME: 0:00', {
            font: '22px Arial',
            fill: '#ffffff'
        });
        this.timeText.setDepth(5);

        this.posText = this.add.text(10, 140, 'Pos: ', {
            font: '22px Arial',
            fill: '#ffffff'
        });
        this.timeText.setDepth(5);
    }

    addCollisions()
    {

        this.physics.add.collider(this.player, this.wall);



        this.physics.add.overlap(this.enemygrp, this.player.getBulletGroup(), (enemy, bullet) => {
            if (enemy.active) 
            {
                bullet.deactivateBullet();
                if(enemy.receiveDamage())
                {
                    this.killedCount++;
                }
            }
        });
        
        
        this.physics.add.overlap(this.boss, this.player.getBulletGroup(), (boss, bullet) => {
            if (boss.active) 
            {
                bullet.deactivateBullet();
        
                if (boss.receiveDamage()) 
                {

                    this.killedCount++; 

                }
            }
        });

        this.physics.add.overlap(this.player, this.enemygrp.getEnemiesBulletGroup(), (player,bullet) => {
            if(player.active)
            {
                bullet.deactivateBullet();
                player.receiveDamage();
                console.log(this.player.health);
            }
            
        });

        
        this.physics.add.overlap(this.player, this.boss.getBulletGroup(), (player,bullet) => {
            if(player.active)
            {
                bullet.deactivateBullet();
                player.receiveDamage();
                console.log(this.player.health);
            }
            
        });
        
        this.physics.add.overlap(this.player, this.boss, (player) => {
            if(player.active)
            {
                player.body.setEnable(false);
                player.receiveDamage();
                console.log(this.player.health);
            }
        });

        this.physics.add.overlap(this.player, this.enemygrp, (player) => {
            if(player.active)
            {
                player.body.setEnable(false);
                player.receiveDamage();
                console.log(this.player.health);
            }
        });

    }

}

