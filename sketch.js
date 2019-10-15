var width;
var height;
var lines;

var selected_line = -1;
var pressed_point = -1;
var v1 = null;
var v2 = null;

function setup() {
  width = max(windowWidth - 500, 400);
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
    .child(
      createDiv().class("cv")
      .child(cv)
    )
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
    );

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
  p1 = new vector3(int(random(width)), int(random(height)));
  p2 = new vector3(int(random(width)), int(random(height)));
  lines.push(new Line(p1,p2));
  redraw();
}

function onMousePressed(){
  let mouse = new vector3(mouseX, mouseY);
  if (selected_line != -1)
    lines[selected_line].isSelected = false;
  
  selected_line = -1;
  pressed_point = -1;
  
  var curmax = null;
  var curd = 0;
  var lineid = -1;
  for (let i=0; i<lines.length;++i){
     let res = lines[i].close_point(mouse);
     if (res != null){
      var d = mouse.dist(res[1]);
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
    lines[selected_line].selectedPointIdx = pressed_point;
    if (pressed_point == 0)
    {
      let points = lines[selected_line].get_points();
      lines[selected_line].v1 = points[0].sub(mouse);
      lines[selected_line].v2 = points[1].sub(mouse);
    }
  }
  redraw();
}


function onDelete(){
  if (selected_line!=-1){
    lines.splice(selected_line,1);
    selected_line = -1;
    redraw();
  }
}

function mouseDragged(){
  if (selected_line != -1){
    lines[selected_line].move();
  }
  redraw();
  show_point_coords();
}

function show_point_coords(){
  let mouse = new vector3(mouseX, mouseY);
  let mindist = 1000000;
  let p = null;
  for (let index = 0; index < lines.length; index++) {
    const element = lines[index];
    let d = element.p1.dist(mouse);
    if (d < mindist)
    {
      mindist = d;
      p = element.p1.copy();
    }
    d = element.p2.dist(mouse);
    if (d < mindist)
    {
      mindist = d;
      p = element.p2.copy();
    }
  }
  if (mindist < 5){
    p.norm_op();
    stroke('black');
    text('('+p.x+';'+p.y+')',mouse.x, mouse.y);
  }
}

function mouseMoved(){
  redraw();
  show_point_coords();
}

  


function onMouseReleased(){
  redraw();
  if (selected_line != -1)
    lines[selected_line].selectedPointIdx = -1;
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
      lines[selected_line].showparams();
  }
  
  
}
