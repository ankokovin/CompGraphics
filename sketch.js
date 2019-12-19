var width;
var height;
var lines;

var selected_lines = new Set();
var stashed_selected_lines;
var pressed_point = -1;
var v1 = null;
var v2 = null;
var show_global_axes = false;
var show_local_axes = false;
var changesForm = null;
var start_list_html = null;
var end_list_html = null;

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
var t_slider;

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

    start_list_html = createElement('ul').id("start-list");
    end_list_html  = createElement('ul').id('end-list');
    
    t_slider = createSlider(0,1,0,0.1);
    let morph_done_bt = createButton("Применить").id("modal-done-bt").mousePressed(
      function()
      {
        morph();
        $('#morphing-modal').hide();
      }
  );
  createDiv().class('modal').attribute('role','dialog').id('morphing-modal').child(

    createDiv().class('modal-dialog').attribute('role','document').child(
      createDiv().class('modal-content')
    .child(
      createDiv().class('modal-header').child(
        createP("Морфинг")
        )
    )
    .child(
      createDiv().class('modal-body')
      .child(createDiv().style('display','flex')
        .child(start_list_html)
        .child(end_list_html)
      )
      .child(
        t_slider
      )
      .child(
        morph_done_bt
        )
    )
    )
  );
  
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
         
          .child(morphingButton)
      )
      .child(matrix)
      .child(createDiv().class("toolbox-part")
          .child(createP("Для множенственного выделения нажмите Shift"))
          .child(createP("Для ручного изменения координат нажмите Alt"))
          .child(createButton("Построение медианы").mousePressed(start_median))
          .child(createButton("Построение биссектрисы").mousePressed(start_angle_bisector))
          .child(createButton("Построение перпендикуляра").mousePressed(start_perpendicular))
      )
      .child(createDiv().class('toolbox-part')
          .child(createButton("Показать оси координат").mousePressed(()=>{
            show_global_axes = !show_global_axes;
            redraw();
            MorphingGroupSelection = -1;
          }))
          .child(createButton("Локальные оси координат").mousePressed(()=>{
            show_local_axes = !show_local_axes;
          }))
          .child(createButton("Сохранить").mousePressed(save))
          .child(createButton("Загрузить").mousePressed(load))
      )
    );
}

function save(){

}

function load(){

}

var maker_selected_point;
var maker_first_line;
var maker_second_line;
var make_operation = null;

function start_median(){
  unselect();
  make_operation = 'median';
  alert("Построение медианы.Выберите начальную точку или отрезок");
}

function continue_median(){
  alert("Выберите отрезок, к которому провести медиану");
}

function make_median(){
  alert("Построение медианы");
  if (maker_second_line == null){
    let end = maker_first_line.p1.add(maker_first_line.p2);
    end.mult(0.5);
    let line = new Line(maker_selected_point, end);
    lines.push(line);
  }else{
    let start = maker_first_line.p1.add(maker_first_line.p2);
    start.mult(0.5);
    let end = maker_second_line.p1.add(maker_second_line.p2);
    end.mult(0.5);
    let line = new Line(start,end);
    lines.push(line);
  }
  make_operation = null;
  maker_selected_point = null;
  maker_first_line = null;
  maker_second_line = null;
}

function start_perpendicular(){
  unselect();
  make_operation = 'perpendicular';
  alert("Построение перпендикуляра.Выберите начальную точку.");
}

function continue_perpendicular(){
  alert("Выберите отрезок, к которому провести перпендикуляр");
}

function make_perpendicular(){
  alert("Построение перпендикуляра");
  let params = maker_first_line.get_params();
  params.norm_op();
  let c = params.y*maker_selected_point.x - params.x*maker_selected_point.y;
  let y = params.y!=0&&params.x!=0?(params.y*params.z+params.x*c)/(-(params.x*params.x+params.y*params.y))
  :(params.x!=0?maker_selected_point.y:0);
  let x = params.x!=0?(params.y*y+params.z)/(-params.x):makert_selected_point.x;
  let x1 = maker_first_line.p2.x - maker_first_line.p1.x;
  let y1 = maker_first_line.p2.y - maker_first_line.p1.y;
  let z1 = maker_first_line.p2.z - maker_first_line.p1.z;
  let d = x1*x1+y1*y1;
  x1/=d, y1/=d;
  let t = x1 != 0 ? x/x1 : y/y1;
  let z = maker_first_line.p1.z + t*z1;
  let p2 = new vector3(x,y,z);
  let line = new Line(maker_selected_point,p2);
  lines.push(line);

  make_operation = null;
  maker_selected_point = null;
  maker_first_line = null;
  maker_second_line = null;
}

function start_angle_bisector(){
  unselect();
  make_operation = 'bisector';
  alert("Построение биссекртисы.Выберите первый отрезок");
}

function continue_bisector(){
  alert('Выберите второй отрезок');
}

function make_bisector(){
  alert("Построение биссектрисы");
  let first_start = maker_first_line.p1.copy();
  let first_end = maker_first_line.p2.copy();
  let second_start = maker_second_line.p1.copy();
  let second_end = maker_second_line.p2.copy();
  first_start.z = 0;
  first_end.z = 0;
  second_start.z = 0;
  second_end.z = 0;
  let d1 = first_start.dist(second_start);
  let d2 = first_start.dist(second_end);
  let d3 = first_end.dist(second_start);
  let d4 = first_end.dist(second_end);
  if (d1 <= d2 && d1 <= d3 && d1 <= d4){
  }else if (d2 <= d1 && d2 <= d3 && d2 <= d4){
    [second_start, second_end] = [second_end, second_start];
  }else if (d3 <= d1 && d3 <= d2 && d3 <= d4){
    [first_end, first_start] = [first_start, first_end];
  }else{
    [second_start, second_end] = [second_end, second_start];
    [first_end, first_start] = [first_start, first_end];  
  }
  let v1 = first_end.sub(first_start);
  v1.norm();
  let v2 =second_end.sub(second_start);
  v2.norm();
  
  let m = v1.cross(v2);
  if (m.z<0) [v1, v2] = [v2, v1];
  let angle = Math.asin(m.mag());
  
  if (angle==0){
    alert('Прямые совпадают или параллельны');
  }else{
    angle/=2.0;
    let res = v2.apply_matrix(new matrix4([
        Math.cos(angle),  -Math.sin(angle), 0, 0,
        Math.sin(angle),  Math.cos(angle),  0, 0,
        0,                0,                1, 0,
        0,                0,                0, 1
      ]));
    
    
    let params_f = maker_first_line.get_params();
    let params_s = maker_second_line.get_params();
    let delta = params_f.x*params_s.y-params_f.y*params_s.x;
    let x = ((-params_f.z)*params_s.y-params_f.y*(-params_s.z))/delta;
    let y = (params_f.z*params_s.x-params_f.x*params_s.z)/delta;
    let p1 = new vector3(x,y);
    let magn = 40;
    res.mult(magn);
    
    let line = new Line(p1.add(res),p1.sub(res));
    lines.push(line);
  }

  make_operation = null;
  maker_selected_point = null;
  maker_first_line = null;
  maker_second_line = null;
}

function start_morphing(){
  onMouseReleased();
  MorphingGroupSelection = 1;
  alert("Выберите начальную группу. CTRL для продолжения.");
}

function first_group_selected(){
  onMouseReleased();
  stashed_selected_lines = new Set(selected_lines);
  unselect();
  MorphingGroupSelection = 2;
  alert("Выберите конечную группу. CTRL для продолжения.");
}
var start_group_order;
function open_morphing_modal(){
  onMouseReleased();
  MorphingGroupSelection = 3;
  start_list_html.html('');
  stashed_selected_lines.forEach(idx => {
    let line = lines[idx];
    start_list_html
      .child(
        createElement('li','['+idx+','+1+"]:"+line.p1.x+";"+line.p1.y+";"+line.p1.z+";"+line.p1.op)
      )
      .child(
        createElement('li','['+idx+','+2+"]:"+line.p2.x+";"+line.p2.y+";"+line.p2.z+";"+line.p2.op)
      );
    
  });
  end_list_html.html('');
  selected_lines.forEach(idx => {
    let line = lines[idx];
    end_list_html
      .child(
        createElement('li','['+idx+','+1+"]:"+line.p1.x+";"+line.p1.y+";"+line.p1.z+";"+line.p1.op)
      )
      .child(
        createElement('li','['+idx+','+2+"]:"+line.p2.x+";"+line.p2.y+";"+line.p2.z+";"+line.p2.op)
      );
    
  });
  function to_tuple(str){
    let substr = str.substring(0,str.indexOf(':'));
    return JSON.parse(substr);
  }
  $(function  () {
    var start_list_group = $("#start-list").sortable({
      serialize: function (parent, children, isContainer) {
        return isContainer ? children : [parent.text()];
      },
      onDrop: function ($item, container, _super) {
        
        start_group_order = 
        start_list_group.sortable("serialize").get().map(to_tuple);
        _super($item, container);
      }
    });
    start_group_order = start_list_group.sortable("serialize").get().map(to_tuple);
    var end_list_group = $("#end-list").sortable({
      serialize: function (parent, children, isContainer) {
        return isContainer ? children : [parent.text()];
      },
      onDrop: function ($item, container, _super) {
        
        end_group_order = 
        end_list_group.sortable("serialize").get().map(to_tuple);
        _super($item, container);
      }
    });
    end_group_order = end_list_group.sortable("serialize").get().map(to_tuple);
  });
  unselect();
  $('#morphing-modal').show();
 
}

function morph(){
  let t = t_slider.value();
  let start_lines = {};
  for (let index = 0; index < start_group_order.length; index++) {
    const tup = start_group_order[index];
    if (!(tup[0] in start_lines)){
      start_lines[tup[0]] = lines[tup[0]];
    }
  }
  let end_lines = {};
  for (let index = 0; index < end_group_order.length; index++) {
    const tup = end_group_order[index];
    if (!(tup[0] in end_lines)){
      end_lines[tup[0]] = lines[tup[0]];
    }
  }
  let n_lines = [];
  for (let i = 0; i < lines.length; i++) {
    if (!(i in start_lines || i in end_lines)){
      n_lines.push(lines[i]);
    }
  }
  lines = n_lines;
  let order = [];
  for (let index = 0; index < start_group_order.length; index++) {
    order.push(index);
  }
  order.sort(function(a,b){
    if (start_group_order[a][0] < start_group_order[b][0]) return -1;
    if (start_group_order[a][0] > start_group_order[b][0]) return 1;
    if (start_group_order[a][1] < start_group_order[b][1]) return -1;
    if (start_group_order[a][1] > start_group_order[b][1]) return 1;
    return 0;
  });
  for (let index = 0; index < order.length; index+=2) {
    const first_start = start_lines[start_group_order[order[index]][0]].p1;
    const second_start = start_lines[start_group_order[order[index+1]][0]].p2;
    let tup_f = end_group_order[order[index]];
    const first_end = tup_f[1] == 1 
    ?
    end_lines[tup_f[0]].p1
    :
    end_lines[tup_f[0]].p2;
    let tup_s = end_group_order[order[index+1]];
    const second_end = tup_s[1] == 1 
    ?
    end_lines[tup_s[0]].p1
    :
    end_lines[tup_s[0]].p2;
    let first_vec = first_end.sub(first_start);
    first_vec.mult(t);
    let second_vec = second_end.sub(second_start);
    second_vec.mult(t);
    let p1 = first_start.add(first_vec);
    let p2 = second_start.add(second_vec);
    let res_line = new Line(p1,p2);
    lines.push(res_line);
 }
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
  if (make_operation == 'median' && !maker_selected_point && !maker_first_line){
    maker_selected_point = mouse;
    continue_median();
    return;
  }
  if (make_operation == 'perpendicular' && !maker_selected_point){
    maker_selected_point = mouse;
    continue_perpendicular();
    return;
  }
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
      if (make_operation != null){
        if (make_operation == 'bisector'){
          if (maker_first_line == null){
            maker_first_line = lines[lineid];
            continue_bisector();
            return;
          }else{
            maker_second_line = lines[lineid];
            make_bisector();
            return;
          }
        }else if (make_operation == 'median'){
          if (maker_first_line == null){
            maker_first_line = lines[lineid];
            if (maker_selected_point == null){
              continue_median();
              return;
            }else{
              make_median();
              return;
            }
          }else{
            maker_second_line = lines[lineid];
            make_median();
            return;
          }
        }else if (make_operation == 'perpendicular'){
            maker_first_line = lines[lineid];
            make_perpendicular();
            return;
          }
        
      }
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
    redraw();
}

function unselect(){
  selected_lines.forEach(function(element){
    lines[element].isSelected = false;
  });
  selected_lines.clear();
  redraw();
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

function local_axes(){
  if (mouseX<0||mouseX>width||mouseY<0||mouseY>height) return;
  stroke("black");
  fill("white");
  line(width-10, mouseY-5,width,mouseY);
  line(width-10, mouseY+5,width,mouseY);
  line(0,mouseY,width,mouseY);
  line(mouseX-5, 10, mouseX,0);
  line(mouseX+5,10,mouseX,0);
  line(mouseX,0,mouseX,height);
  for(let i = Math.floor(width/axes_step)*axes_step ; i > -(width)+1; i-= axes_step){
    line(i+mouseX, mouseY-5,i+mouseX, mouseY+5);
    text(i, i+mouseX, mouseY);
  }
  for(let i = Math.floor((height)/axes_step - 1)*axes_step ; i > -(height)+1; i-= axes_step){
    line(mouseX-5, mouseY + i, mouseX + 5, mouseY + i);
    text(i, mouseX, mouseY + i);
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
  if (show_global_axes)
    show_axes();
  if (show_local_axes)
    local_axes(); 
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
  if (maker_selected_point){
    stroke('green');
    circle(maker_selected_point.x + width/2,  height/2 - maker_selected_point.y , 5)
  }  
  show_point_coords();
  if (keyIsDown(CONTROL)){
    if (MorphingGroupSelection == 1){
      first_group_selected();
    }else if (MorphingGroupSelection == 2){
      open_morphing_modal();
    }
  }
}
