/*
 *
 * This code does not come with any sort of warranty.
 * You are welcome to use it for whatever you like.
 * A credit would be nice but is not required.
 */
(function() {

window.game = window.game || { };

gCanvas = document.createElement("canvas");
gContext = gCanvas.getContext("2d");
gCanvas.width = 800;
gCanvas.height = 600;
//gCanvas.style.backgroundColor = "grey";
document.body.appendChild(gCanvas);

gWorld = {
    keyState: Array(),
    state: new game.StateManager(),
    images: new game.ImageManager(),
    sounds: new game.SoundManager(),
    friendlies: Array(),
    enemies: Array(),
    selected: -1,
    soldier_viewrange: 180,
    soldier_firerange: 140,
    
    textcolor: 'White',
    textfont: '18pt Arial'
};
gWorld.state.setState(gWorld.state.states.LOADING);

function onKeyDown(event) {
    var state = gWorld.state.getState();
    if (state == gWorld.state.states.PREGAME || state == gWorld.state.states.END) {
        if (event.keyCode == 49) {
            newGame();
        }
    } else if ((state == gWorld.state.states.INGAME_RUNNING || state == gWorld.state.states.INGAME_PAUSED)
               && event.keyCode == 8
               && gWorld.selected != -1) {
        gWorld.friendlies[gWorld.selected].moveto.pop();
    } else if (state == gWorld.state.states.INGAME_RUNNING && event.keyCode == 80) {
        gWorld.state.setState(gWorld.state.states.INGAME_PAUSED);
    } else if (state == gWorld.state.states.INGAME_PAUSED && event.keyCode == 80) {
        gWorld.state.setState(gWorld.state.states.INGAME_RUNNING);
    } else if (state == gWorld.state.states.BETWEENLEVELS) {
        if (event.keyCode == 49) {
            if (friendliesAlive()) {
                loadLevel(true);
            } else {
                loadLevel();
            }
        }
    } 
    gWorld.keyState[event.keyCode] = true;
}
function onKeyUp(event) {
    gWorld.keyState[event.keyCode] = false;
}
function kill(collection, i) {
    collection[i].dead = true;
    collection[i].moveto = new Array();
    //gWorld.dead.push(collection[i]);
    //collection.splice(i, 1);
}
function onMouseClick(event) {
    var state = gWorld.state.getState();

    if (state == gWorld.state.states.INGAME_RUNNING || state == gWorld.state.states.INGAME_PAUSED) {
        var mouseX;
        var mouseY;
        if ( event.offsetX == null ) { // Firefox
            if (event.pageX || event.pageY) { 
              mouseX = event.pageX;
              mouseY = event.pageY;
            }
            else { 
              mouseX = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft; 
              mouseY = event.clientY + document.body.scrollTop + document.documentElement.scrollTop; 
            } 
            mouseX -= gCanvas.offsetLeft;
            mouseY -= gCanvas.offsetTop;
        } else {                       // Other browsers
           mouseX = event.offsetX;
           mouseY = event.offsetY;
        }
        target = [mouseX, mouseY];
        
        var selected = false;
        for (var i = gWorld.friendlies.length -1; i >= 0; i--) {
            var d = calcDistance(calcVector(target, gWorld.friendlies[i].pos));
            if (d < 10) {
                console.log("selected soldier");
                gWorld.selected = i;
                selected = true;
                break;
            }
        }
        if (gWorld.selected != -1) {
            /*for (var i = gWorld.enemies.length -1; i >= 0; i--) {
                if (gWorld.enemies[i].dead == true) {
                    continue;
                }
                var d = calcDistance(calcVector(target, gWorld.enemies[i].pos));
                if (d < 10) {
                    console.log('assigning kill target');
                    gWorld.friendlies[gWorld.selected].killtarget = i;
                    selected = true;
                    break;
                }
            }*/
        }
        if (selected == false && gWorld.selected != -1) {
            console.log("assigning moveto");
            gWorld.friendlies[gWorld.selected].moveto.push(target);
        }
        
        /*var playerX = gWorld.player.pos[0] + gWorld.player.size[0]/2;
        var playerY = gWorld.player.pos[1] + gWorld.player.size[1]/2;
        var vector = calcNormalVector(target, [playerX, playerY]);

        var pos = [gWorld.player.pos[0], gWorld.player.pos[1]];

        var projectile = new game.Projectile(pos, [vector[0]*100, vector[1]*100]);
        gWorld.projectiles.push(projectile);*/
    }
}
window.addEventListener('keydown', onKeyDown, false);
window.addEventListener('keyup', onKeyUp, false);
gCanvas.addEventListener('click', onMouseClick);

function newGame() {
    gWorld.level = 1;
    loadLevel();
    
    //gSounds.play("music", true);
}
function loadLevel(nextlevel) {
    if (nextlevel == true) {
        gWorld.level++;
    }
    console.log("level "+gWorld.level);
    
    gWorld.friendlies = Array();
    gWorld.enemies = Array();
    //gWorld.projectiles = Array();
    //sgWorld.explosions = Array();
    gWorld.AI = new game.IntelligenceManager(gWorld.enemies, gWorld.friendlies, gWorld.level);
    
    var x = 250;
    var y = gCanvas.height - 40;
    for (var i = 0; i < 5; i++) {
        x += 50;
        gWorld.friendlies.push(new game.Soldier([x, y]));
    }
    
    x = 250;
    y = 40;
    s = null;
    for (var i = 0; i < 5; i++) {
        x += 50;
        s = new game.Soldier([x, y]);
        s.enemy = true;
        gWorld.enemies.push(s);
    }
    gWorld.state.setState(gWorld.state.states.INGAME_PAUSED);
}

function updateGame(dt) {
    
    if (gWorld.keyState[49]) {
        gWorld.selected = 0;
    } else if (gWorld.keyState[50]) {
        gWorld.selected = 1;
    } else if (gWorld.keyState[51]) {
        gWorld.selected = 2;
    } else if (gWorld.keyState[52]) {
        gWorld.selected = 3;
    } else if (gWorld.keyState[53]) {
        gWorld.selected = 4;
    }
    
    var state = gWorld.state.getState();
    if (state != gWorld.state.states.INGAME_RUNNING) {
        return;
    }
    /*if (gWorld.player) {
        gWorld.player.update(dt);
    }*/
    for (var i in gWorld.friendlies) {
        gWorld.friendlies[i].update(dt);
    }
    gWorld.AI.update();
    for (var i in gWorld.enemies) {
        gWorld.enemies[i].update(dt);
    }
    
    // check for victory
    if (friendliesAlive() == false || enemiesAlive() == false) {
        gWorld.state.setState(gWorld.state.states.BETWEENLEVELS);
    }
}

/*function checkCollisions() {
    var m, p;
    
    for (var j = gWorld.friendlies.length - 1; j >= 0;j--) {
        m = gWorld.friendlies[j];
        
        if (m.collideThing(gWorld.player)) {
            gWorld.state.setState(gWorld.state.states.END);
            return;
        }
    
        for (var i = gWorld.projectiles.length - 1;i >= 0;i--) {
            p = gWorld.projectiles[i];
        
            if (p.collideThing(m)) {
                //gWorld.sounds.play("explosion");
                gWorld.explosions.push(new game.Explosion(m.pos));
                gWorld.score++;
                gWorld.friendlies.splice(j, 1);
                gWorld.projectiles.splice(i, 1);
                spawnMonster();
                continue;
            }
        }
    }
}*/

function drawInstructions(showImages) {
    drawText(gContext, "Greetings applicant.", "italic "+gWorld.textfont, gWorld.textcolor, gCanvas.width/6, 100);
    drawText(gContext, "It is time to prove yourself on the field.", "italic "+gWorld.textfont, gWorld.textcolor, gCanvas.width/6, 125);
    drawText(gContext, "You and your opponent each command a five man team", "italic "+gWorld.textfont, gWorld.textcolor, gCanvas.width/6, 150);

    drawText(gContext, "1-5 on the keyboard to select your units", gWorld.textfont, gWorld.textcolor, gCanvas.width/4, 250);
    drawText(gContext, "Use the mouse to set way points", gWorld.textfont, gWorld.textcolor, gCanvas.width/4, 280);
    drawText(gContext, "P to pause/unpause", gWorld.textfont, gWorld.textcolor, gCanvas.width/4, 310);
    drawText(gContext, "Backspace to cancel orders", gWorld.textfont, gWorld.textcolor, gCanvas.width/4, 340);
    if (showImages) {
        //gContext.drawImage(gImages.getImage('exit'), 40, gCanvas.height/2, gSettings.tilesize, gSettings.tilesize);
        //gContext.drawImage(gImages.getImage('starship'), gCanvas.width - 80, gCanvas.height/2, 30, 30);
    }
}
function friendliesAlive() {
    var alive = false;
    for (var i in gWorld.friendlies) {
        if (gWorld.friendlies[i].dead == false) {
            alive = true;
            break;
        }
    }
    return alive;
}
function enemiesAlive() {
    var alive = false;
    for (var i in gWorld.enemies) {
        if (gWorld.enemies[i].dead == false) {
            alive = true;
            break;
        }
    }
    return alive;
}
function drawGame() {
    //var img = gWorld.images.getImage('background');
    //if (img) {
    //    gContext.drawImage(img, 0, 0);
    //}
    
    gContext.clearRect(0,0,gCanvas.width,gCanvas.height);
    
    var state = gWorld.state.getState();
    if (state == gWorld.state.states.LOADING) {
        drawInstructions(false);
        var total = gWorld.sounds.sounds.length + gWorld.images.images.length;
        var loaded = gWorld.sounds.numSoundsLoaded + gWorld.images.numImagesLoaded;
        if (loaded < total) {
            gContext.clearRect(0, 0, gCanvas.width, gCanvas.height);
            var text = "Loading...    "+loaded+"/"+total;
            drawText(gContext, text, gWorld.textfont, gWorld.textcolor, gCanvas.width/5,400);
            //return;
        } else {
            gWorld.state.setState(gWorld.state.states.PREGAME);
        }
    } else if (state == gWorld.state.states.PREGAME) {
        drawInstructions(true);
        drawText(gContext, "Press 1 to begin", gWorld.textfont, "white", gCanvas.width/3, 400);
    } else if (state == gWorld.state.states.INGAME_RUNNING
               || state == gWorld.state.states.INGAME_PAUSED
               || state == gWorld.state.states.BETWEENLEVELS) {
        drawBox(gContext, 1, 1, gCanvas.width-2, gCanvas.height-2, "blue");

        gContext.fillStyle = 'blue';
        gContext.strokeStyle = 'blue';
        for (var i in gWorld.friendlies) {
            gWorld.friendlies[i].draw();
        }
        if (gWorld.selected != -1) {
            drawCircle(gWorld.friendlies[gWorld.selected].pos, gWorld.friendlies[gWorld.selected].size[1]+2, 1);
        }
        
        gContext.fillStyle = 'red';
        gContext.strokeStyle = 'red';
        for (var i in gWorld.enemies) {
            if (gWorld.enemies[i].dead) {
                gWorld.enemies[i].draw();
                continue;
            }
            for (var j in gWorld.friendlies) {
                if (gWorld.friendlies[j].dead == true) {
                    continue;
                }
                var d = calcDistance(calcVector(gWorld.enemies[i].pos, gWorld.friendlies[j].pos));
                if (d < gWorld.soldier_viewrange) {
                    gWorld.enemies[i].draw();
                    break;
                }
            }
        }

        if (state == gWorld.state.states.INGAME_PAUSED) {
            drawText(gContext, "Paused", "Arial", "White", gCanvas.width/2-50, gCanvas.height/2);
        } else if (state == gWorld.state.states.BETWEENLEVELS) {
            if (friendliesAlive()){
                drawText(gContext, "Nicely handled.", "italic "+gWorld.textfont, gWorld.textcolor, gCanvas.width/6, 100);
                if (gWorld.level < 7) {
                    drawText(gContext, "Tier "+gWorld.level+" surpassed", "italic "+gWorld.textfont, gWorld.textcolor, gCanvas.width/6, 125);
                }
                drawText(gContext, "Press 1 for your next challenge", "italic "+gWorld.textfont, gWorld.textcolor, gCanvas.width/6, 150);
                if (gWorld.level == 6) {
                    drawText(gContext, "Applicant, you have completed the assessment.", gWorld.textfont, gWorld.textcolor, gCanvas.width/6, 200);
                    drawText(gContext, "If you wish, you can continue to practice.", gWorld.textfont, gWorld.textcolor, gCanvas.width/6, 225);
                }
            } else if (enemiesAlive()) {
                drawText(gContext, "It seems you have some learning to do.", "italic "+gWorld.textfont, gWorld.textcolor, gCanvas.width/6, 100);
                drawText(gContext, "Press 1 to try again.", "italic "+gWorld.textfont, gWorld.textcolor, gCanvas.width/6, 125);
            }
        }
    } else if (state == gWorld.state.states.END) {
        drawText(gContext, "Five Man Team", gWorld.textfont, gWorld.textcolor, gCanvas.width/3, 100);
        //drawText(gContext, "You left "+gWorld.score+" flaming corpses in your wake.", gWorld.textfont, gWorld.textcolor, 50, 200);
        drawText(gContext, "Press d to play again", gWorld.textfont, gWorld.textcolor, 150, 350);
    }
}

var then = Date.now();
var now = null;
var dt = null;

//executed 60/second
var mainloop = function() {
    
    now = Date.now();
    dt = (now - then)/1000;
    then = now;
    
    gWorld.loopCount++;
    gWorld.loopCount %= 8; //stop it going to infinity

    updateGame(dt);
    if (gWorld.state.getState() == gWorld.state.states.INGAME_RUNNING) {
        //checkCollisions();
    }
    drawGame();
};

var ONE_FRAME_TIME = 1000 / 60; // 60 per second
setInterval( mainloop, ONE_FRAME_TIME );

}());
