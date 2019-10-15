class vector3{
    constructor(x, y, op){
        this.x = x;
        this.y = y;
        this.op = (op === undefined)?1:op;
    }

    norm_op(){
        this.x /= this.op;
        this.y /= this.op;
        this.op = 1;
    }

    sub(input){
        let lhs = this.copy();
        let rhs = input.copy();
        lhs.norm_op();
        rhs.norm_op();
        lhs.x -= rhs.x;
        lhs.y -= rhs.y;
        return lhs;
    }

    mag(){
        return sqrt(this.x*this.x+this.y*this.y)/this.op;
    }

    dot(input){
        let lhs = this.copy();
        let rhs = input.copy();
        lhs.norm_op();
        rhs.norm_op();
        return lhs.x * rhs.x + lhs.y * rhs.y;
    }

    cross(input){
        let lhs = this.copy();
        let rhs = input.copy();
        return new vector3(
            lhs.y*rhs.z - lhs.z*rhs.y,
            lhs.z*rhs.x - lhs.x*rhs.z,
            lhs.x*rhs.y - lhs.y*rhs.x
            );
    }

    dist(input){
        return this.sub(input).mag();
    }

    norm(){
        this.norm_op();
        let mag = this.mag();
        this.x /= mag;
        this.y /= mag;
    }

    mult(scalar){
        this.x *= scalar;
        this.y *= scalar;
    }

    add(input){
        let lhs = this.copy();
        let rhs = input.copy();
        lhs.norm_op();
        rhs.norm_op();
        return new vector3(lhs.x + rhs.x, lhs.y + rhs.y);
    }

    copy(){
        return new vector3(this.x, this.y, this.op);
    }
}