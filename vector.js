class vector3{

    constructor(x, y, z, op){
        this.x = float(x);
        this.y = float(y);
        this.z = (z === undefined)?0:float(z);
        this.op = (op === undefined)?1:float(op); 
        this.mouse = false;
    }

    norm_op(){
        this.x /= this.op;
        this.y /= this.op;
        this.z /= this.op;
        this.op = 1;
    }

    sub(input){
        let lhs = this.copy();
        let rhs = input.copy();
        lhs.norm_op();
        rhs.norm_op();
        lhs.x -= rhs.x;
        lhs.y -= rhs.y;
        lhs.z -= rhs.z;
        return lhs;
    }

    mag(){
        return sqrt(this.x*this.x+this.y*this.y+this.z*this.z)/this.op;
    }

    dot(input){
        let lhs = this.copy();
        let rhs = input.copy();
        lhs.norm_op();
        rhs.norm_op();
        return lhs.x * rhs.x + lhs.y * rhs.y + lhs.z * rhs.z;
    }

    cross(input){
        let lhs = this.copy();
        lhs.norm_op();
        let rhs = input.copy();
        rhs.norm_op();
        return new vector3(
            lhs.y*rhs.z - lhs.z*rhs.y,
            lhs.z*rhs.x - lhs.x*rhs.z,
            lhs.x*rhs.y - lhs.y*rhs.x
            );
    }

    dist(input){
        let lhs = this.copy();
        let rhs = input.copy();
        if (this.mouse || input.mouse){
            lhs.z = 0;
            rhs.z = 0;
        }
        return lhs.sub(rhs).mag();
    }

    norm(){
        this.norm_op();
        let mag = this.mag();
        this.x /= mag;
        this.y /= mag;
        this.z /= mag;
    }

    mult(scalar){
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
    }

    div_full(scalar){
        this.x /= scalar;
        this.y /= scalar;
        this.z /= scalar;
        this.op /= scalar;
    }

    add(input){
        if (input == null)
            return this;
        let lhs = this.copy();
        let rhs = input.copy();
        lhs.norm_op();
        rhs.norm_op();
        return new vector3(lhs.x + rhs.x, lhs.y + rhs.y, lhs.z + rhs.z);
    }

    copy(){
        return new vector3(this.x, this.y,this.z, this.op);
    }

    apply_matrix(matrix){
        let ar = []
        for(let i=0;i<4;++i){
            let t = 0;
            t +=   this.x*matrix.get_val(0,i);
            t +=   this.y*matrix.get_val(1,i);
            t +=   this.z*matrix.get_val(2,i);
            t +=   this.op*matrix.get_val(3,i);
            ar.push(t);
        }
        return new vector3(ar[0],ar[1],ar[2],ar[3]);
    }

    scalar(vect){
        let lhs = this.copy();
        let rhs = vect.copy();
        lhs.norm_op();
        rhs.norm_op();
        return lhs.x*rhs.x + lhs.y*rhs.y + lhs.z*rhs.z;
    }
}

function mouseVector(){
    let result =  new vector3(mouseX - width/2,  height/2 - mouseY);
    result.mouse = true;
    return result;
}