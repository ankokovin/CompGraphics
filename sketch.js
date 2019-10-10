var width;
var height;
var lines;

var selected_line = -1;
var pressed_point = -1;
var v1 = null;
var v2 = null;


function setup() {
  width = 600;
  height = 400;
  lines = [];

  cv = createCanvas(width, height);
  cv.mousePressed(onMousePressed);
  cv.mouseReleased(onMouseReleased);
  noLoop();
  
  addbt = createButton("Добавить линию");
  addbt.mousePressed(generateLine);
  
  rembt = createButton("Удалить линию");
  rembt.mousePressed(onDelete);

  widthsl = createInput(width, 'number');
  widthsl.attribute('min', 100);
  widthsl.attribute('max', 1600);

  heightsl = createInput(height, 'number');
  heightsl.attribute('min', 100);
  heightsl.attribute('max', 1600);

  resizebt = createButton("Обновить размер");
  resizebt.mousePressed(updateSize);
  widthp = createP("Ширина"); 

  heightp = createP("Высота");

  createDiv().class("main-container")
    .child(cv)
    .child(
      createDiv().class("toolbox")
      .child(createDiv().class("toolbox-part")
        .child(
          createDiv().child(widthp).child(widthsl)
        )
        .child(
          createDiv().child(heightp).child(heightsl)
        )
        .child(resizebt)
      )
      .child(createDiv().class("toolbox-part")
          .child(addbt)
          .child(rembt)
      )
    )

  redraw();
}

function updateSize(){
  width = int(widthsl.value());
  height = int(heightsl.value());
  resizeCanvas(width, height);
  redraw();
}

function place(){
  //cv.position(25, 90);
  //widthp.position(25,0);
  //widthsl.position(90, 13);
  //heightp.position(25, 25);
  //heightsl.position(90, 38);
  //resizebt.position(25, 63);
  //addbt.position(width+35, 90);
  //rembt.position(width+35, 120);
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
  }else{
    
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
