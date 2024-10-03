import { Game } from "./game.js";

const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: Game // Pass the Game class directly
};

var game = new Phaser.Game(config);

// Function to toggle fullscreen
function toggleFullscreen()
{
    if (!document.fullscreenElement)
        {
        document.documentElement.requestFullscreen();
    } 
    else
    {
        if (document.exitFullscreen)
        {
            document.exitFullscreen();
        }
    }
}

// Add an event listener to a button or a key press to trigger fullscreen
document.addEventListener('keydown', (event) => {
    if (event.key === 'f')
    { // Use 'f' key for fullscreen toggle
        toggleFullscreen();
    }
});