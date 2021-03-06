
function drawRect(context, x, y, width, height) {
    context.fillRect(x, y, width, height);
}
function drawBox(context, x, y, width, height, color) {
    context.beginPath();
    context.rect(x, y, width, height);
    context.lineWidth = 1;
    if (color != undefined) {
        context.strokeStyle = color;
    }
    context.stroke();
}
function drawCircle(center, radius, lineWidth) {
    gContext.beginPath();
    gContext.lineWidth = lineWidth;
    gContext.arc(center[0], center[1], radius, 0, 2*Math.PI);
    gContext.stroke();
}
function drawText(context, text, font, style, x, y) {
    context.font = font;
    context.fillStyle = style;
    context.fillText(text, x, y);
}
function drawLine(start, end, width) {
    gContext.lineWidth = width;
    gContext.beginPath();
    gContext.moveTo(start[0], start[1]);
    gContext.lineTo(end[0], end[1]);
    gContext.stroke();
}
function angleToVector(ang) {
    return [Math.cos(ang), Math.sin(ang)]
}
function calcDistance(vect) {
    return Math.sqrt(Math.pow(vect[0], 2) + Math.pow(vect[1], 2));
}
function calcVector(dest, src) {
    return [dest[0] - src[0], dest[1] - src[1]];
}
function calcNormalVector(dest, src) {
    var vect = calcVector(dest, src);
    var h = calcDistance(vect);
    vect[0] = vect[0] / h;
    vect[1] = vect[1] / h;
    return vect;
}
function dotProduct(v1, v2) {
    return v1[0]*v2[0] + v1[1]*v2[1];
}
function randomProperty(obj) {
    var keys = Object.keys(obj)
    return obj[keys[ keys.length * Math.random() << 0]];
};
/*function getDrawPos(p) {
    return [p[0] - gCamera[0], p[1] - gCamera[1]];
}*/
function lockToScreen(thing) {
    _lockToScreen(thing, true);
    _lockToScreen(thing, false);
}
function _lockToScreen(thing, width) {
    var i = width?0:1;
    
    if (thing.pos[i] < 0) {
        thing.pos[i] = 0;
        return;
    }
    
    var maximum = gCanvas.height;
    if (width == true) {
        maximum = gCanvas.width;
    }
    if (thing.pos[i] + thing.size[i]/2 > maximum) {
        thing.pos[i] = gCanvas.width - thing.size[i]/2;
    }
}
function findPointsNearby(pos, radius, coll) {
    var found = new Array();

    for (var i in coll) {
        if (coll[i].dead == true) {
            continue;
        }
        if (calcDistance(calcVector(pos, coll[i].pos)) < radius) {
            found.push(i);
        }
    }
    return found;
}
