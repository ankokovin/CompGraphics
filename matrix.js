class matrix4{
    constructor(ar){
        if (ar.length < 16) console.log("length of array is less than 16");
        if (ar.length > 16) console.log("length of array is greater than 16");
        this.m = [[],[],[],[]];
        for(let i=0; i < 4; ++i){
            for(let j=0; j<4;++j){
                let idx = 4*i+j;
                if (idx <ar.length){
                    this.m[i].push(ar[idx]);
                }else this.m[i].push(0);
            }
        }
    }
    set_val(x, y, nval){
        this.m[x][y] = nval;
    }
    get_val(x, y){
        return this.m[x][y];
    }
}