function gcd(a,b){
  if (b>a) return gcd(b,a);
  if (b == 0) return a;
  return gcd(b, a%b);
}

prad = 10;
class Line{
  constructor(p1, p2){
    this.p1 = p1;
    this.p2 = p2;
    this.isSelected = false;
    this.v1 = null;
    this.v2 = null;
    this.selectedPointIdx = 0;
  }
  
  get_points(){
    return [this.p1, this.p2];
  }
  
  move(){
    if (this.selectedPointIdx == -1)
      return;
    if (this.selectedPointIdx == 0)
      this.updateParallel();
    else
      this.update(pressed_point);
  }
  
  close_point(mouse){
    var res = null;
    var d = mouse.dist(this.p1);
    if (d < prad)
        res = [1, this.p1];
    var d2 = mouse.dist(this.p2);
    if (d2 < prad && d2<d)
      res = [2, this.p2];

    if (res == null){
      this.p1.norm_op();
      this.p2.norm_op();
      var a = mouse.sub(this.p1);
      var b = this.p2.sub(this.p1);
      var t = a.dot(b) / b.mag();
      var p = b;
      p.norm();
      p.mult(t);
      p = p.add(this.p1);
      d = mouse.dist(p);
      if (d < prad && p.x >= min(this.p1.x, this.p2.x) && p.x <= max(this.p1.x, this.p2.x) && p.y >= min(this.p1.y, this.p2.y) && p.y <= max(this.p1.y, this.p2.y)) 
        res = [0, p];
    }
    
    return res;
  }
  
  update(selectedPointIdx){
    mouse = mouseVector();
    if(selectedPointIdx == 1)
     {
       this.p1.norm_op();
       this.p1.x = mouse.x;
       this.p1.y = mouse.y;
     }
    if (selectedPointIdx == 2)
    {
      this.p2.norm_op();
      this.p2.x = mouse.x;
      this.p2.y = mouse.y;
    }
  }


  updateParallel(){
    mouse = mouseVector();
    this.p1 = mouse.add(this.v1);
    this.p2 = mouse.add(this.v2);
  }
  
  
  showline(){
    if (this.isSelected)
      stroke('red');
    else
      stroke('black');
    line(this.p1.x + width/2, 
      height/2 - this.p1.y, 
      this.p2.x + width/2, 
      height/2 - this.p2.y);
  }
  
  showends(){
    fill('white');
     if (this.isSelected)
      stroke('red');
    else
      stroke('black');
    circle(this.p1.x + width/2,  height/2 - this.p1.y , prad);
    circle(this.p2.x + width/2,  height/2 - this.p2.y , prad);
  }
  
  get_params(){
    let lhs = this.p1.copy();
    let rhs = this.p2.copy();
    lhs.z = 1;
    rhs.z = 1;
    let result = lhs.cross(rhs);
    return result;
  }

  showparams(){
    stroke('red');
    fill('red');
    let mid = this.p1.add(this.p2);
    mid.mult(0.5);
    mid.norm_op();
    let params = this.get_params();
    let div = gcd(abs(params.x), gcd(abs(params.y), abs(params.z)));
    params.div_full(div);
    let str = '('+params.x+';'+params.y+';'+params.z+')';  
    let sz = str.length;
    let mvx = sz*3;
    let mvy = 5;
    text(str, (mid.x - mvx) + width/2, -(mid.y - mvy)+ height/2,(mid.x + mvx) + width/2, -(mid.y + mvy)+ height/2 );
  }

}
