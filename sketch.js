var width;
var height;
var lines;

var selected_lines = new Set();
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
    pressed_point = 0;
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
      if (keyIsDown(SHIFT) && selected_lines.has(lineid)){
        lines[lineid].isSelected = false;
        selected_lines.delete(lineid);
      }else{

        if (!keyIsDown(SHIFT) && !selected_lines.has(lineid)){
          selected_lines.forEach(function(element){
            lines[element].isSelected = false;
          });
          selected_lines.clear();
        }
        selected_lines.add(lineid);
        lines[lineid].isSelected = true;
        if (curmax[0] != 0 && selected_lines.size == 1){
          pressed_point = curmax[0];
          lines[lineid].selectedPointIdx = pressed_point;
        }
        if (pressed_point == 0)
        {
          selected_lines.forEach(element => {
            let points = lines[element].get_points();
            lines[element].v1 = points[0].sub(mouse);
            lines[element].v2 = points[1].sub(mouse);  
          });
        }
      }
    }else{
      if (!keyIsDown(SHIFT)){
        selected_lines.forEach(function(element){
          lines[element].isSelected = false;
        });
        selected_lines.clear();
      }
    }
    redraw();
}



function onDelete(){
  if (selected_lines.size>0){
    let nlines = [];
    for (let index = 0; index < lines.length; index++) {
      const element = lines[index];
      if (!selected_lines.has(index)){
        nlines.push(element);
      }
    }
    lines = nlines;
    selected_lines.clear();
    redraw();
  }
}

function mouseDragged(){
  mouse = new vector3(mouseX, mouseY);
  if (selected_lines.size == 1){
    let selected_line = selected_lines.values().next().value;
    lines[selected_line].move();
    if (pressed_point > 0){
      
      lines.forEach(function(element, idx) {
        let npoint = null;
        if (idx != selected_line && element.p1.dist(mouse) < 10)
        {
          npoint = element.p1.copy();
        }else if(idx != selected_line && element.p2.dist(mouse) < 10){
          npoint = element.p2.copy();
        }
        if (npoint != null){
          if (pressed_point == 1){
            lines[selected_line].p1 = npoint;
          }else{
            lines[selected_line].p2 = npoint;
          }
        }
      });
    }
  }else{
    selected_lines.forEach(function (idx){
      lines[idx].move();
    })  
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
  if (selected_lines.size == 1)
    lines[selected_lines.values().next().value].selectedPointIdx = 0;
}

function draw() {
  background(200);
  for (let i=0; i<lines.length;++i)
  {
      if (!selected_lines.has(i))
        lines[i].showline();
  }
  for (let i=0; i<lines.length;++i)
  {
    if (!selected_lines.has(i))
        lines[i].showends();
  }
  for (let i = 0; i < lines.length; i++) {
    if (selected_lines.has(i))
      lines[i].showline();
  }
  for (let i = 0; i < lines.length; i++) {
    if (selected_lines.has(i))
      lines[i].showends();
  }
  for (let i = 0; i < lines.length; i++) {
    if (selected_lines.has(i))
      lines[i].showparams();
  }  
}
