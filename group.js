class Node{
    constructor(parent){
        this.parent = parent
    }

    get_linelist(){
        return null;   
    }

    dec(val){

    }
}

class Group extends Node{
    constructor(parent, children){
        super(parent);
        this.leaf = false;
        if (children === undefined){
            this.children = new Set();
        }else{
            this.children = children;
        }
    }
    get_linelist(){
        let result = new Set();
        for (const child of this.children) {
            for (const idx of child.get_linelist()) {
                result.add(idx);
            }
        }
        return result;
    }
    add(child){
        this.children.add(child);
    }
    dec(val){
        let nchildren = new Set();
        this.children.forEach(child => {
            if (!(child.leaf && child.lineidx == val)){   
                child.dec(val);
                if (child.leaf||child.children.size>1)
                    nchildren.add(child);
                else if(child.children.size == 1){
                    var t = child.children.values().next().value;
                    t.parent = this;
                    nchildren.add(t);
                }
            }
        });   
        this.children = nchildren;
    }
}

class Leaf extends Node{
    constructor(parent, idx){
        super(parent);
        this.leaf = true;
        this.lineidx = idx;
    }
    get_linelist(){
        return new Set([this.lineidx]);
    }
    dec(val){
        if (this.lineidx > val) this.lineidx--;   
    }
}