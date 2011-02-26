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
        if(this.rep !== undefined){
            this.erase();
        }
        if(offset === undefined){
            offset = new Vector(0, 0);
            attr = {};
        }if(attrs === undefined){
            attr = offset;
            offset = new Vector(0, 0);
        }
        //console.log(offset);
        str = "M " + offset.x + " " + offset.y + " l " + this.x + " " + this.y;
        this.rep = paper.path(str).attr(attrs);
        return this;
    }
    
    
    this.erase = function(){
        this.rep.remove();
        return this;
    }
    
    this.r = function(){
        return Math.sqrt(this.dot(this));
    }
    
    this.abs = this.r;
    
    this.copy = function(){
        return new Vector(this.x, this.y);
    }
    this.zero = function(){
        this.x = this.y = 0;
    }
    
    this.add = function(v, k){
        if(k === undefined){
            k = 1;
        }if(k != 1){
            v = v.copy().scale(k);
        }
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
        return this.copy().add(v, -1).r();
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
    
    this.proj = function(v){
        if(v === undefined){
            v = Vector(1, 0);
        }
        return this.scale(this.dot(v) / this.dot(this));
    }
    
    this.ortho = function(v){
        var t = this.x;
        this.x = this.y;
        this.y = -t;
    }
    
}

function vector(x, y, kwargs){
    return new Vector(x, y, kwargs);
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
    
    this.act = function(obj1, obj2, t){
        t = t || 1;
        var v = this.value(obj1, obj2);
        obj1.acl.add(v, t / obj1.mass);
        obj2.acl.add(v, -t / obj2.mass);
        return v;
    }
    
    this.draw = function(paper, obj1, obj2, attrs){
        if(this.rep1 !== undefined){
            this.erase();
        }
        attrs = attrs || {};
        var k = attrs.scale || 1;
        delete attrs.scale
        var v1 = this.value(obj1, obj2).scale(k);
        this.rep1 = v1.draw(paper, obj1.pos, attrs).rep;
        var v2 = v1.copy().scale(-1);
        this.rep2 = v2.draw(paper, obj2.pos, attrs).rep;
        attrs.scale = k;
        return this;
    }

    
    this.erase = function(){
        this.rep1.remove();
        this.rep2.remove();
        return this;
    }
    
    // Example transfer functions
    // Return vector from obj1 to obj2
    this.invSqDist = function(obj1, obj2){
        // Inverse-square (distance) relationship 
        var v = obj2.pos.copy();
        v.scale(-1).add(obj1.pos).scale(-1);
        return v.scale(this.coeff * obj1[this.prop] * obj2[this.prop] / Math.pow(v.r(), 3)); 
    }
    
    this.invDist = function(obj1, obj2){
        // Inverse (distance) relationship
        var v = obj2.pos.copy();
        v.scale(-1).add(obj1.pos).scale(-1);
        return v.scale(this.coeff * obj1[this.prop] * obj2[this.prop] / Math.pow(v.r(), 2)); 
    }
}

function collision(obj1, obj2){
    var del_r = obj1.overlap(obj2);
    if(del_r != 0){
        
        // Back up! no more overlap...
        var fin_r = obj1.r + obj2.r;
        var r = obj2.pos.copy().add(obj1.pos, -1); //p = p1 - p2
        var v = obj2.vel.copy().add(obj1.vel, -1); //v = v1 - v2
        var cos_t = v.r() * r.r() / v.dot(r);
        var t = (1 / v.dot(v)) * (-v.dot(r) - v.r() * Math.sqrt(fin_r * fin_r + r.dot(r) * (cos_t * cos_t - 1)));
        //console.log("col", del_r, fin_r, r, v, t);
        // Move everything, not just 2 objs
        obj1.pos.add(obj1.vel, t);
        obj2.pos.add(obj2.vel, t);
        
        // Collision 
        var Cr = obj1.coeff(obj2);
        var vf1 = v.copy().scale(-Cr * obj2.mass).add(obj1.pos, obj1.mass).add(obj2.pos, obj2.mass).scale(1 / (obj1.mass + obj2.mass));
        var vf2 = v.copy().scale(Cr * obj1.mass).add(obj1.pos, obj1.mass).add(obj2.pos, obj2.mass).scale(1 / (obj1.mass + obj2.mass));
        obj1.vel = vf1;
        obj2.vel = vf2;
    }else{
        return new Vector(0, 0);
    }
}

function Obj(kwargs){
    var defaults = {
        pos: new Vector(0, 0),
        vel: new Vector(0, 0),
        acl: new Vector(0, 0),
        //jrk: new Vector(0, 0),
        r : 1,
        coeff_elastic: 0.8,
        coeff_friction: 0.3,
        mass : 1
    };
    
    
    for(var i in defaults){
        if(kwargs[i] !== undefined){
            this[i] = kwargs[i];
        }else{
            this[i] = defaults[i];
        }
    }
    
    this.draw = function(paper, attrs){
        if(this.rep !== undefined){
            this.erase();
        }
        attrs = attrs || {};
        this.rep = paper.circle(this.pos.x, this.pos.y, this.r).attr(attrs);
        return this;
    }
    /*
    this.redraw = function(paper, attrs){
        this.rep.attr({ cx: this.pos.x, cy: this.pos.y, r: this.r }).attr(attrs);
    }
    */
    
    this.erase = function(){
        this.rep.remove();
        return this;
    }
    
    this.move = function(t, i){
        t = t || 1;
        i = Math.floor(i) || 10;
        var delta = t / i;
        for(; i >= 0; i--){
            //this.acl.add(this.jrk, delta);
            this.vel.add(this.acl, delta);
            this.pos.add(this.vel, delta); 
        }
        this.acl.zero(); // Acceleration is not conserved!
        
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
    
    this.overlap = function(obj){
        var r = (this.r + obj.r);
        var d = this.dist(obj);
        if(r < d){
            // No overlap
            return 0;
        }else{
            //console.log("overlap", r, d);
            return r - d;
        }
    }
    
    this.coeff = function(prop, obj){
        if(this["coeff_" + prop] !== undefined && obj["coeff_" + prop] !== undefined){
            return this["coeff_" + prop]  * obj["coeff_" + prop];
        }else{
            return 0.5; //dummy, todo...
        }
    }
}
