//(function() {

window.game = window.game || { };

game.Soldier = function(pos) {
    game.Thing.call(this, pos, [12,12]);
    this.killtarget = -1;
    this.enemy = false;
    this.dead = false;
    this.fired = 0;
    this.moveto = new Array();
}
game.Soldier.prototype = new game.Thing();
game.Soldier.prototype.constructor = game.Soldier;
 
game.Soldier.prototype.draw = function() {
    //game.Thing.prototype.draw.call(this, this.pos, 'Soldier');

    if (this.dead) {
        var oldColor = gContext.fillStyle;
        gContext.fillStyle = 'grey';
    }
    drawRect(gContext, this.pos[0] - this.size[0]/2, this.pos[1] - this.size[1]/2, this.size[0], this.size[1]);
    if (this.fired > Date.now() - 500) {
        drawCircle(this.pos, this.size[1]+2, 3);
    }
    if (this.dead) {
        gContext.fillStyle = oldColor;
    } else {
        if (this.enemy == false) {
            drawCircle(this.pos, gWorld.soldier_viewrange, 0.25);
            drawCircle(this.pos, gWorld.soldier_firerange, 0.5);
            
            var dest;
            var prev = this.pos;
            for (var i in this.moveto) {
                dest = this.moveto[i];
                drawLine(prev, dest, 1);
                prev = dest;
            }
        } else {
        }
    }
};
game.Soldier.prototype.update = function(dt) {
    if (this.dead) {
        return;
    }
    var movevect = [0, 0];
    
    // else if (this.killtarget != -1) {
        /*var coll = this.getOpposingSoldiers();
        if (calcDistance(calcVector(this.pos, coll[this.killtarget].pos)) > gWorld.soldier_maxrange) {
            //move towards target
            movevect = calcNormalVector(coll[this.killtarget].pos, this.pos);
        } else {
            this.fire(this.killtarget);
        }*/
    //} else
    if (this.moveto.length > 0) {
        if (Math.abs(this.moveto[0][0] - this.pos[0]) > 2 || Math.abs(this.moveto[0][1] - this.pos[1]) > 2) {
            movevect = calcNormalVector(this.moveto[0], this.pos);
        } else {
            this.moveto.shift();
        }
    }
    game.Thing.prototype.update.call(this, dt, movevect, 2000);
    
    var autokill = this.findSoldiersNearby();
    if (autokill.length > 0) {
        if (this.fired < Date.now() - 1000) {
            this.fire(autokill[0], movevect);
        }
    }
};
game.Soldier.prototype.fire = function(i, movevect) {
    var tohit = 0.7;
    var enemy = this.getOpposingSoldiers()[i];
    if (movevect[0] != 0 || movevect[1] != 0) {
        tohit += 0.05; //moving so less accurate
        
        var dp = dotProduct(movevect, calcNormalVector(enemy.pos, this.pos));
        // 1 == directly in front
        if (dp < 0.7) {
             tohit += 0.05;
        }
        if (dp < 0.0) {
             tohit += 0.1;
        }
    }
    var shot = Math.random();
    if (shot > tohit) {
        enemy.killed();
        //this.killtarget = -1;
    }
    this.fired = Date.now();
};
game.Thing.prototype.getOpposingSoldiers = function() {
    if (this.enemy == true) {
        return gWorld.friendlies;
    } else {
        return gWorld.enemies;
    }
}
game.Soldier.prototype.findSoldiersNearby = function() {
    var coll = this.getOpposingSoldiers();
    return findPointsNearby(this.pos, gWorld.soldier_firerange, coll);
}
//}());
