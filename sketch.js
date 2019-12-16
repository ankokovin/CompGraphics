var width;
var height;
var lines;

var selected_lines = new Set();
var stashed_selected_lines;
var pressed_point = -1;
var v1 = null;
var v2 = null;
var do_show_axes = false;
var changesForm = null;

var curMatrix = new matrix4([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1])

var MorphingGroupSelection = -1;

function get_matrix_modifier(x, y){
  return function(){
    let nval = 0;
    if (this.value().length>0)
      nval = float(this.value());
      
    curMatrix.set_val(x,y,nval);
  }
}


function setup() {
  width = max(windowWidth - 500, 400);
  height = 400;
  lines = [];

  cv = createCanvas(width, height);
  cv.mousePressed(onMousePressed);
  cv.mouseReleased(onMouseReleased);
  
  addbt = createButton("Добавить линию");
  addbt.mousePressed(generateLine);
  
  rembt = createButton("Удалить линию");
  rembt.mousePressed(onDelete);

  showaxesbt = createButton("Показать оси координат");
  showaxesbt.mousePressed(()=>{
    do_show_axes = !do_show_axes;
    redraw();
  });


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

  let matrix = createDiv().class("toolbox-part");
  for (let i=0; i< 4; ++i){
    let row = createDiv().class("matrix-row");
    for (let j=0; j< 4; ++j){
      row.child(
        createInput(curMatrix.get_val(i,j))
        .class("matrix-input")
        .input(get_matrix_modifier(i,j))
        );
    }
    matrix.child(row);
  }
  matrix.child(
    createButton("Применить")
    .mousePressed(apply_cur_matrix)
  ); 

  changesForm = createDiv().class('modal').attribute('role','dialog').id('coord-change-modal')
    .child(
      createDiv().class('modal-dialog').attribute('role','document').child(
        createDiv().class('modal-content')
        .child(
          createDiv().class('modal-header').child(
            createP("Изменение координат")
          )
        )
        .child(
          createDiv().class('modal-body')
          .child(
            createP('x')
          )
          .child(
            createInput().id("modal-x")
          )
          .child(
            createP('y')
          )
          .child(
            createInput().id("modal-y")
          )
          .child(
            createP('z')
          )
          .child(
            createInput().id("modal-z")
          )
          .child(createP())
          .child(
            createButton("Изменить").id("modal-done-bt")
          )
        )
      )
    );

  let morphingModal = createDiv().class('modal').attribute('role','dialog').id('morphing-modal')
  
  let morphingButton = createButton('Начать морфинг').mousePressed(start_morphing);

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
          .child(showaxesbt)
          .child(morphingButton)
      )
      .child(matrix)
      .child(createDiv().class("toolbox-part")
          .child(createP("Для множенственного выделения нажмите Shift"))
          .child(createP("Для ручного изменения координат нажмите Alt"))
          
      )
    );
}

function start_morphing(){
  MorphingGroupSelection = 1;
  alert("Выберите начальную группу. Alt для продолжения.");
}

function first_group_selected(){
  stashed_selected_lines = selected_lines.Copy();
  unselect();
  MorphingGroupSelection = 2;
  alert("Выберите конечную группу. Alt для продолжения.");
}

function open_morphing_modal(){
  MorphingGroupSelection = 3;
  $('#morphing-modal').show();
}

function apply_cur_matrix(){
  selected_lines.forEach(lineIdx => {
    lines[lineIdx].p1 = lines[lineIdx].p1.apply_matrix(curMatrix);
    lines[lineIdx].p2 = lines[lineIdx].p2.apply_matrix(curMatrix);
  });
}

function updateSize(){
  width = int(widthsl.value());
  height = int(heightsl.value());
  resizeCanvas(width, height);
}

function generateLine(){
  p1 = new vector3(int(random(width)) - width/2, - int(random(height)) + height/2);
  p2 = new vector3(int(random(width)) - width/2, - int(random(height)) + height/2);
  lines.push(new Line(p1,p2));
}

function onMousePressed(){
  let mouse = mouseVector();
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
        if (pressed_point != 0) {
          selected_lines.forEach(function(element){
            lines[element].isSelected = false;
          });
          selected_lines.clear();
          selected_lines.add(lineid);
          lines[lineid].isSelected = true;
          if (keyIsDown(ALT) && MorphingGroupSelection == -1){
            setupManualChange(selected_lines.values().next().value);
          }
        } else
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
        unselect();
      }
    }
}

function unselect(){
  selected_lines.forEach(function(element){
    lines[element].isSelected = false;
  });
  selected_lines.clear();

}



var lineOnManualChange = null;

function setupManualChange(line){
  lineOnManualChange = line;
  selected_lines.forEach(function(element){
    lines[element].isSelected = false;
  });
  selected_lines.clear();
  console.log("setup manual change:")
  console.log(line);
  console.log(lines[line])
  let p = lines[line].selectedPointIdx == 1 ? lines[line].p1 : lines[line].p2;
  $("#modal-x").val(p.x);
  $("#modal-y").val(p.y);
  $("#modal-z").val(p.z);
  $('#coord-change-modal').modal('show');
  $('#modal-done-bt').click(
    function(){
      $('#coord-change-modal').modal('hide');
    }
  );
  $('#coord-change-modal').on('hide.bs.modal',function(){
    console.log(lineOnManualChange);
    console.log(lines);
    let x = int($("#modal-x").val());
    let y = int($("#modal-y").val());
    let z = int($('#modal-z').val());
    if (lines[lineOnManualChange].selectedPointIdx == 1){
      lines[lineOnManualChange].p1.x = x;
      lines[lineOnManualChange].p1.y = y;
      lines[lineOnManualChange].p1.z = z;
    }else{
      lines[lineOnManualChange].p2.x = x;
      lines[lineOnManualChange].p2.y = y;
      lines[lineOnManualChange].p2.z = z;
    }
    selected_lines.add(lineOnManualChange)
    lines[lineOnManualChange].isSelected = true;
  })
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
  }
}


function mouseDragged(){
  mouse = mouseVector();
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
  show_point_coords();
}

function show_point_coords(){
  let mouse = mouseVector();
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
    fill('black');
    text('('+p.x+';'+p.y+';'+p.z+';'+p.op+')',mouse.x+ width/2, - mouse.y + height/2);
  }
}
const axes_step = 50;
function show_axes(){
  stroke("black");
  fill("white");
  line(width/2, 0, width/2, height);
  line(width/2, 0, width/2 + 5, 10);
  line(width/2, 0, width/2 - 5, 10);
  line(0, height/2, width, height/2);
  line(width, height/2, width -10, height/2 - 5);
  line(width, height/2, width -10, height/2 + 5);
  for(let i = Math.floor((width/2)/axes_step)*axes_step ; i > -(width/2)+1; i-= axes_step){
    line(i+width/2, height/2-5,i+width/2, height/2+5);
    text(i, i+width/2, height/2);
  }
  for(let i = Math.floor((height/2)/axes_step - 1)*axes_step ; i > -(height/2)+1; i-= axes_step){
    line(width/2-5, height/2 - i, width/2 + 5, height/2 - i);
    text(i, width/2, height/2 - i);
  }
}

function mouseMoved(){
  show_point_coords();
}

  


function onMouseReleased(){
  if (selected_lines.size == 1){
    lines[selected_lines.values().next().value].selectedPointIdx = 0;
    pressed_point = 0;
  }
}

function draw() {
  background(200);
  if (do_show_axes)
    show_axes();
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
  if (keyIsDown(ALT)){
    if (MorphingGroupSelection == 1){
      first_group_selected();
    }else if (MorphingGroupSelection == 2){
      open_morphing_modal();
    }
  }
}
