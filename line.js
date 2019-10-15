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
    this.selectedPointIdx = -1;
  }
  
  get_points(){
    return [this.p1, this.p2];
  }
  
  move(){
    if (this.selectedPointIdx == -1)
      return;
    if (this.selectedPointIdx == 0)
      lines[selected_line].updateParallel();
    else
      lines[selected_line].update(pressed_point);
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
     if(selectedPointIdx == 1)
     {
       this.p1.x = int(mouseX);
       this.p1.y = int(mouseY);
     }
    if (selectedPointIdx == 2)
    {
      this.p2.x = int(mouseX);
      this.p2.y = int(mouseY);
    }
  }


  updateParallel(){
    this.p1.x = mouseX+this.v1.x;
    this.p1.y = mouseY+this.v1.y;
    this.p2.x = mouseX+this.v2.x;
    this.p2.y = mouseY+this.v2.y;
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
  
  get_params(){
    let result = this.p1.cross(this.p2);
    return result;
  }

  showparams(){
    stroke('red');
    let mid = this.p1.add(this.p2);
    mid.mult(0.5);
    mid.norm_op();
    let params = this.get_params();
    let div = gcd(abs(params.x), gcd(abs(params.y), abs(params.op)));
    params.div_full(div);
    text(
      '('+params.x+';'+params.y+';'+params.op+')',
      mid.x, mid.y);

  }

}
