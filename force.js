/*
 * Force.js 
 * CC by-nc-sa 3.0
 * Zach Banks <zach@zbanks.net>
 */

function Vector(x, y, kwargs){
    var defaults = {
        
    }
    
    this.x = x;
    this.y = y;
    
    for(var i in defaults){
        if(kwargs[i] !== undefined){
            this[i] = kwargs[i];
        }else{
            this[i] = defaults[i];
        }
    }
    
    this.draw = function(paper, offset, attrs){
        if(offset === undefined){
            offset = Vector(0, 0);
            attr = {};
        }if(typeof offset == "object"){
            attr = offset;
            offset = Vector(0, 0);
        }
        this.rep = paper.path("M" + offset.x + " " + offset.y + "L" + this.x + " " + this.y).attr(attrs);
    }
    
    this.redraw = function(offset, attrs){
        this.rep.attr({"path" : "M" + offset.x + " " + offset.y + "L" + this.x + " " + this.y}).attr(attrs);
    }
    
    this.erase = function(){
        this.rep.remove();
    }
    
    this.r = function(){
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    
    this.copy = function(){
        return new Vector(this.x, this.y);
    }
    
    this.add = function(v){
        this.x += v.x;
        this.y += v.y;
        return this;
    }
    
    this.scale = function(k){
        this.x *= k;
        this.y *= k;
        return this;
    }
    
    this.dist = function(v){
        return Math.sqrt(Math.pow(this.x - v.x, 2), Math.pow(this.y - v.y, 2));
    }
    
    this.dot = function(v){
        return this.x * v.x + this.y * v.y;
    }
    
    this.angle = function(v){
        if(v === undefined){
            v = Vector(1, 0);
        }
        return Math.acos(this.dot(v) / (this.r() * v.r()));
    }
    
}

function Force(kwargs){
    var defaults = {
        fn : "invSqDist",
        prop : "r",
        coeff : 1,
    };
    
    for(var i in defaults){
        if(kwargs[i] !== undefined){
            this[i] = kwargs[i];
        }else{
            this[i] = defaults[i];
        }
    }
    
    this.value = function(obj1, obj2){
        if(typeof this.fn == "function"){
            return this.fn(obj1, obj2);
        }else if(typeof this[this.fn] === "function"){
            return this[this.fn](obj1, obj2);
        }else{
            return Vector(0, 0);
        }
    }
    
    this.draw = function(paper, obj1, obj2, attrs){
        var v1 = this.value(obj1, obj2);
        this.rep1 = v1.draw(paper, obj1.pos, attrs);
        var v2 = v1.copy().scale(-1);
        this.rep2 = v2.draw(paper, obj2.pos, attrs);
    }
    
    this.redraw = function(obj1, obj2, attrs){
        var paper = this.rep1.paper();
        this.rep1.remove();
        this.rep2.remove();
        return this.draw(paper, obj1, obj2, attrs);
    }
    
    this.erase = function(){
        this.rep1.remove();
        this.rep2.remove();
    }
    
    // Example transfer functions
    // Return vector from obj1 to obj2
    this.invSqDist = function(obj1, obj2){
        // Inverse-square (distance) relationship 
        var v = obj2.pos.copy();
        v.scale(-1).add(obj1.pos);
        return v.scale(this.coeff * obj1[this.prop] * obj2[this.prop] / Math.pow(v.r(), 3)); 
    }
    
    this.invDist = function(obj1, obj2){
        // Inverse (distance) relationship
        var v = obj2.pos.copy();
        v.scale(-1).add(obj1.pos);
        return v.scale(this.coeff * obj1[this.prop] * obj2[this.prop] / Math.pow(v.r(), 2)); 
    }
}

function Obj(kwargs){
    var defaults = {
        pos: new Vector(0, 0);
        r : 1,
    };
    
    
    for(var i in defaults){
        if(kwargs[i] !== undefined){
            this[i] = kwargs[i];
        }else{
            this[i] = defaults[i];
        }
    }
    
    this.draw = function(paper, attrs){
        this.rep = paper.circle(this.pos.x, this.pos.y, this.r).attr(attrs);
    }
    
    this.redraw = function(paper, attrs)){
        this.rep.attr({ cx: this.pos.x, cy: this.pos.y, r: this.r }).attr(attrs);
    }
    
    this.erase = function(){
        this.rep.remove();
    }
    
    this.set = function(key, val){
        this[key] = val;
        return val;
    }
    
    this.get = function(key){
        return this[key] || 0;
    }
    
    this.isset = function(key){
        return this[key] !== undefined;
    }   
    
    this.sum = function(obj, key){
        return obj[key] + this[key];
    }
    
    this.diff = function(obj, key){
        return obj[key] - this[key];
    }
    
    this.dist = function(obj){
        return this.pos.dist(obj.pos);
    }
}
