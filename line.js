prad = 10;
class Line{
  constructor(p1, p2){
    this.p1 = p1;
    this.p2 = p2;
    this.isSelected = false;
  }
  
  get_points(){
    return [this.p1, this.p2];
  }
  
  
  close_point(mx, my){
    var res = null;
    var d = dist(mx, my, this.p1.x, this.p1.y);
    if (d < prad)
        res = [1, this.p1];
    var d2 = dist(mx, my, this.p2.x, this.p2.y);
    if (d2 < prad && d2<d)
      res = [2, this.p2];

    if (res == null){
      var a = p5.Vector.sub(createVector(mx,my),this.p1);
      var b = p5.Vector.sub(this.p2, this.p1);
      var t = p5.Vector.dot(a,b) / b.mag();
      var p = b;
      p.normalize();
      p.mult(t);
      p.add(this.p1);
      d = dist(p.x, p.y, mx, my)
      if (d < prad && p.x >= min(this.p1.x, this.p2.x) && p.x <= max(this.p1.x, this.p2.x) && p.y >= min(this.p1.y, this.p2.y) && p.y <= max(this.p1.y, this.p2.y)) 
        res = [0, p];
    }
    
    return res;
  }
  
  update(p){
     if(p == 1)
     {
       this.p1.x = mouseX;
       this.p1.y = mouseY;
     }
    if (p == 2)
    {
      this.p2.x = mouseX;
      this.p2.y = mouseY;
    }
  }


  updateParallel(v1,v2){
    this.p1.x = mouseX+v1.x;
    this.p1.y = mouseY+v1.y;
    this.p2.x = mouseX+v2.x;
    this.p2.y = mouseY+v2.y;
  }
  
  
  showline(){
    if (this.isSelected)
      stroke('red');
    else
      stroke('black');
    line(this.p1.x, this.p1.y, this.p2.x, this.p2.y);
  }
  
  showends(){
    fill('white');
     if (this.isSelected)
      stroke('red');
    else
      stroke('black');
    circle(this.p1.x, this.p1.y, prad);
    circle(this.p2.x, this.p2.y, prad);
  }
  
}
