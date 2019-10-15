class vector3{
    constructor(x, y, op){
        this.x = x;
        this.y = y;
        this.op = (op === undefined)?1:op;
    }

    norm(){
        this.x /= this.op;
        this.y /= this.op;
        this.op = 1;
    }

    sub(input){
        let lhs = this;
        let rhs = input;
        lhs.norm();
        rhs.norm();
        lhs.x -= rhs.x;
        lhs.y -= rhs.y;
        return lhs;
    }

    mag(){
        return sqrt(this.x*this.x+this.y*this.y)/this.op;
    }

    dot(input){
        let lhs = this;
        let rhs = input;
        lhs.norm();
        rhs.norm();
        return lhs.x * rhs.x + lhs.y * rhs.y;
    }

    cross(input){
        let lhs = this;
        let rhs = input;
        return vector3(
            lhs.y*rhs.z - lhs.z*rhs.y,
            lhs.z*rhs.x - lhs.x*rhs.z,
            lhs.x*rhs.y - lhs.y*rhs.x
            );
    }
}