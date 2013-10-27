//(function() {

window.game = window.game || { };

game.IntelligenceManager = function(mine, other, level) {
    this.states = {
        SCATTER: 1,
        CHARGE: 2,
        CHARGE_FOCUS: 3,
        PINCER: 4,
        FLANK: 5,
        HEDGEHOG: 6
    };
    this.mine = mine;
    this.other = other;
    //this.setup = false;
    this.down = false;
    this.stoporders = false;
    
    switch(level) {
        case 1:
            this.setState(this.states.SCATTER);
            break;
        case 2:
            this.setState(this.states.CHARGE);
            break;
        case 3:
            this.setState(this.states.CHARGE_FOCUS);
            break;
        case 4:
            this.setState(this.states.PINCER);
            break;
        case 5:
            this.setState(this.states.FLANK);
            break;
        case 6:
            this.setState(this.states.HEDGEHOG);
            break;
        default:
            this.setState(randomProperty(this.states));
            break;
    }
};
game.IntelligenceManager.prototype.setState = function(s) {
    this.state = s; //should be doing some checking here
    //this.setup = false;
};
game.IntelligenceManager.prototype.getState = function(s) {
    return this.state;
};
game.IntelligenceManager.prototype.update = function() {
    //if (this.setup == true) {
    //    return;
    //}
    if (this.stoporders) {
        return;
    }
    var needplan = true;
    for (var i = 0; i < this.mine.length; i++) {
        if (this.mine[i].dead == false && this.mine[i].moveto.length > 0) {
            needplan = false;
            break;
        }
    }
    if (needplan == true) {
        this.down = !this.down;
        //this.state = randomProperty(this.states);
    } else {
        return;
    }
    var goalY = gCanvas.height - 30;
    if (this.down == false) {
        goalY = 30;
    }
    
    if (this.state == this.states.SCATTER) {
        for (var i = 0; i < this.mine.length; i++) {
            this.mine[i].moveto.push([Math.random() * gCanvas.width, Math.random() * gCanvas.height]);
        }
    } else if (this.state == this.states.CHARGE) {
        var spacing = gCanvas.width/(this.mine.length+1);
        for (var i = 0; i < this.mine.length; i++) {
            this.mine[i].moveto.push([(i+1)*spacing, goalY]);
        }
    } else if (this.state == this.states.CHARGE_FOCUS) {
        for (var i = 0; i < this.mine.length; i++) {
            this.mine[i].moveto.push([gCanvas.width/2, goalY]);
        }
    } else if (this.state == this.states.PINCER) {
        for (var i = 0; i < this.mine.length; i++) {
            var x = 30;
            if (i > 2) {
                x = gCanvas.width - 30;
            }
            if (this.down) {
                this.mine[i].moveto.push([x, gCanvas.height/3]);
                this.mine[i].moveto.push([x, gCanvas.height * (2/3)]);
            } else {
                this.mine[i].moveto.push([x, gCanvas.height * (2/3)]);
                this.mine[i].moveto.push([x, gCanvas.height/3]);
            }
            this.mine[i].moveto.push([gCanvas.width/2, goalY]);
        }
    } else if (this.state == this.states.FLANK) {
        for (var i = 0; i < this.mine.length; i++) {
            var x = 30;
            if (this.down == false) {
                x = gCanvas.width - 30;
            }
            if (this.down) {
                this.mine[i].moveto.push([x, gCanvas.height/3]);
                this.mine[i].moveto.push([x, gCanvas.height * (2/3)]);
            } else {
                this.mine[i].moveto.push([x, gCanvas.height * (2/3)]);
                this.mine[i].moveto.push([x, gCanvas.height/3]);
            }
            this.mine[i].moveto.push([gCanvas.width/2, goalY]);
        }
    } else if (this.state == this.states.HEDGEHOG) {
        for (var i = 0; i < this.mine.length; i++) {
            this.mine[i].moveto.push([gCanvas.width/2 + Math.random() * 30, 10 + (Math.random() * 30)]);
        }
        this.stoporders = true;//move and stop
    }
    //this.setup = true;
}

//}());
