/*
 * Force.js 
 * CC by-nc-sa 3.0
 * Zach Banks <zach@zbanks.net>
 */

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
        if(typeof this[this.fn] === "function"){
            return this[this.fn](obj1, obj2);
        }else{
            return 0;
        }
    }
    
    // Example transfer functions
    this.invSqDist = function(obj1, obj2){
        // Inverse-square (distance) relationship 
        return this.coeff * obj1[this.prop] * obj2[this.prop] / Math.pow(obj1.dist(obj2)); 
    }
    
    this.invDist = function(obj1, obj2){
        // Inverse (distance) relationship
        return this.coeff * obj1[this.prop] * obj2[this.prop] / obj1.dist(obj2);
    }
}

function Obj(kwargs){
    var defaults = {
        x : 0,
        y : 0,
        r : 1,
    };
    
    
    for(var i in defaults){
        if(kwargs[i] !== undefined){
            this[i] = kwargs[i];
        }else{
            this[i] = defaults[i];
        }
    }
    
    this.draw = function(paper){
        this.rep = paper.circle(this.x, this.y, this.r);
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
        return Math.sqrt(Math.pow(this.diff(obj, 'x'), 2) + Math.pow(this.diff(obj, 'y'), 2))
    }
}
