var width;
var height;
var lines;

var selected_line = -1;
var pressed_point = -1;
var v1 = null;
var v2 = null;
var cv = null;
var addbt = null;
var rembt = null;
var widthsl = null;
var heightsl = null;
var widthp = null;
var heightp = null;
function setup() {
  width = 600;
  height = 400;
  lines = [];
  cv = createCanvas(width, height);
  cv.mousePressed(onMousePressed);
  cv.mouseReleased(onMouseReleased);
  noLoop();
  
  addbt = createButton("Добавить");
  addbt.mousePressed(generateLine);
  
  rembt = createButton("Удалить");
  rembt.mousePressed(onDelete);

  widthsl = createSlider(100, 1600, width);
  widthsl.input(updateSize);

  heightsl = createSlider(100, 1600, height);
  heightsl.input(updateSize);

  widthp = createP("Ширина"); 

  heightp = createP("Высота");

  place();
  redraw();
}

function updateSize(){
  width = widthsl.value();
  height = heightsl.value();
  place();
  cv.resize(width, height);
  redraw();
}

function place(){
  cv.position(25, 40);
  widthp.position(25,0);
  widthsl.position(90, 13);
  heightp.position(275, 0);
  heightsl.position(335, 13);
  addbt.position(width+35, 70);
  rembt.position(width+35, 100);
}


function generateLine(){
  p1 = createVector(random(width), random(height));
  p2 = createVector(random(width), random(height));
  lines.push(new Line(p1,p2));
  redraw();
}

function onMousePressed(){
  let mx = mouseX, my = mouseY;
  if (selected_line != -1)
    lines[selected_line].isSelected = false;
  
  selected_line = -1;
  pressed_point = -1;
  
  var curmax = null;
  var curd = 0;
  var lineid = -1;
  for (let i=0; i<lines.length;++i){
     let res = lines[i].close_point(mx, my);
     if (res != null){
      var d = dist(mx, my, res[1].x, res[1].y);
      if (curmax == null || d<curd){
        curmax = res;
        curd = d;
        lineid = i;
      }
    }
  }
  if (curmax != null){
    selected_line = lineid;
    pressed_point = curmax[0];
    lines[selected_line].isSelected = true;
    if (pressed_point == 0)
    {
      let points = lines[selected_line].get_points();
      v1 = createVector(points[0].x - mx, points[0].y - my);
      v2 = createVector(points[1].x - mx, points[1].y - my);
    }
  }
  redraw();
}

function onDelete(){
  if (selected_line!=-1){
    lines.splice(selected_line,1);
    redraw();
    selected_line = -1;
  }
}

function mouseDragged(){
  if (selected_line != -1 && pressed_point != -1){
    if (pressed_point == 0)
      lines[selected_line].updateParallel(v1,v2);
    else
      lines[selected_line].update(pressed_point);

    redraw();
  }
}

function onMouseReleased(){
  redraw();
  pressed_point = -1;
}

function draw() {
  background(200);
  for (let i=0; i<lines.length;++i)
  {
      if (i != selected_line)
        lines[i].showline();
  }
  for (let i=0; i<lines.length;++i)
  {
      if (i != selected_line)
        lines[i].showends();
  }
  if (selected_line != -1){
      lines[selected_line].showline();
      lines[selected_line].showends();
  }
}
