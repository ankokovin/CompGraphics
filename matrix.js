class matrix4{
    constructor(ar){
        if (ar.length < 16) console.log("length of array is less than 16");
        if (ar.length > 16) console.log("length of array is greater than 16");
        this.m = [[],[],[],[]];
        for(let i=0; i < 4; ++i){
            for(let j=0; j<4;++j){
                let idx = 4*i+j;
                if (idx <ar.length){
                    m[i].push(ar[idx]);
                }else m[i].push(0);
            }
        }
    }
    get_val(x, y){
        return this.m[x][y];
    }
}