import { EnemyGroup } from "./src/gameobjs/enemy.js";
import { Player } from "./src/gameobjs/player.js";


export class Game extends Phaser.Scene {
    constructor() {
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
    }

    create()
    {
        this.add.image(1280/2,720/2,'bg');

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

        this.enemygrp = new EnemyGroup(this, 'enemy', 'blood', 'bulletTexture_b');

        this.spawnEnemies(); 

        this.addOverlaps();
              
        this.startTime = this.time.now; // Current time when the game starts
        this.elapsedTime = 0; // Total elapsed time
       
        this.addText();
        
    }

    update()
    {
    
        if (this.player.health <= 0)
        {
            this.restartText.setText('You died! \n Press R to Restart');
            return;
        } 

        this.getTime();

        const fps = this.game.loop.actualFps;

        this.fpsText.setText('FPS: ' + Math.round(fps));

        

        this.player.aim();
        this.player.move();    
        
        for(var i = 0; i < this.totalEnemies; i++)
        {
           this.enemygrp.handleEnemyAttacks(this.player.body);
        }
    
        
        this.killcountText.setText('killed count: ' + this.killedCount);

        this.resetHitFlags();
       
        

        if (this.killedCount >= this.totalEnemies) 
        {
            // Increment the wave number
            this.wave++;
            this.killedCount = 0;
            this.waveText.setText('WAVE: ' + this.wave);
    
            // Delay before spawning new enemies
            this.time.delayedCall(3000, () => {
                this.spawnEnemies();
            }, [], this);
        }
        
    }

    spawnEnemies() 
    {
        this.spawnIndex = 0; 
        this.totalEnemies = Math.min(20, 5 + Math.floor(this.wave / 5) * 5);

        const spawnEnemy = () => {
            if (this.spawnIndex < this.totalEnemies) 
            {
                let rX, rY;
                // Ensure random position doesn't conflict with player position or existing enemies
                do {
                    rX = this.getRandomInt(20, 1280);
                    rY = this.getRandomInt(20, 720);
                } while (this.isPositionOccupied(rX, rY));

                this.enemygrp.spawnEnemy(rX, rY, this.wave);
                this.spawnIndex++;

                // Call the next enemy spawn after a short delay
                this.time.delayedCall(1250, spawnEnemy, [], this); // Adjust the delay as needed (e.g., 500 ms)
            } 

        };

        spawnEnemy(); 
    }

    
    isPositionOccupied(x, y) 
    {
        // Check if the player is near the position
        const distanceToPlayer = Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y);
        if (distanceToPlayer < 100) return true; // Adjust distance threshold as needed

        // Check if there are any active enemies at the position
        return this.enemygrp.getChildren().some(enemy => {
            return enemy.active && Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y) < 100; // Adjust threshold as needed
        });
    }
        
    resetHitFlags()
    {
        this.enemygrp.resetFlags();
        this.player.body.setEnable(true);
        this.player.hit = false; //has to be false
    }


    getRandomInt(min, max) 
    {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    

    getTime() 
    {
        // If the player is killed, we don't update the timer
        if (this.player.health <= 0)  
        {
            this.timeText.setText(`TIME SURVIVED: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
            return;
        }
    
        this.elapsedTime = Math.floor((this.time.now - this.startTime) / 1000);
    
        const minutes = Math.floor(this.elapsedTime / 60);
        const seconds = this.elapsedTime % 60;
    
        // Update the time display
        this.timeText.setText(`TIME: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
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

        this.killcountText = this.add.text(10, 80, 'kill count: ' , {
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
    }

    addOverlaps()
    {
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
        

        this.physics.add.overlap(this.player, this.enemygrp.getEnemiesBulletGroup(), (player,bullet) => {
            if(player.active)
            {
                bullet.deactivateBullet();
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


