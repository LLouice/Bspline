// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

// require("./canvas.js")


$(document).ready(function () {
  console.log("doc is ready");

  //bootstrap-switch
  //这里不能使用Arrow Function
  $(".switch").each(function (index, value) {
    let me = $(this);
    var labelText = me.attr('labelText');
    var $switch_input = $(":only-child", me);
    // var labelTextButton = '<bold>' + labelText + '</bold>';
    var labelTextButton = '<button type="button" class="btn btn-dark">' + labelText + '</button>';
    $switch_input.bootstrapSwitch({
      labelText: labelTextButton,
      size: "normal",
      offColor: "danger",
    });
    $switch_input.on("switchChange.bootstrapSwitch", function (event, state) {
      if (labelText == "light theme") {
        LIGHTTHEME = (!LIGHTTHEME);
        if (LIGHTTHEME) {
          canvas.style = "background-color: #fff";
          SPLINECOLOR = ["#000", "magenta", "#8B00FA"];
          LINECOLOR = "blue";

        } else {
          canvas.style = "background-color: #333A42";
          SPLINECOLOR = ["#fff", "green", "#05F2F5"];
          LINECOLOR = "#FABD2E";
        }

      } else if (labelText == "control points") {
        CONTROLPOINTS = (!CONTROLPOINTS);
      } else if (labelText == "points line")
        LINEPOINTS = (!LINEPOINTS);
      else if (labelText == "grid") {
        console.log(("grid 1", GRID));
        GRID = (!GRID);
      } else if (labelText == "uniform") {
        UNIFORM = (!UNIFORM);

      } else if (labelText == "quasi uniform") {
        QUASI = (!QUASI);
      } else if (labelText == "piecewise") {
        PIECEWIS = (!PIECEWISE)
      }
      draw();
    })
  });


  //tooltips
  //$("[data-toggle='tooltip']").tooltip();



  const electron = require("electron");
  const ipc = electron.ipcRenderer;
  const remote = electron.remote;

  const zerorpc = require("zerorpc")
  let client = new zerorpc.Client()

  client.connect("tcp://127.0.0.1:4243");
  console.log("in out");
  console.log(client);


  client.invoke("echo", "server ready", (error, res) => {
    // console.log("in invoke");
    if (error || res !== 'server ready') {
      console.error(error);
    } else {
      console.log("server is ready");
    }
  })



  $("#refresh").click(function () {
    window.location = "#";
    // console.log(process);
    // console.log("click refresh");
    // cw = remote.getCurrentWindow();
    // app = remote.app;
    ipc.send('refresh');

  })

  //switch
  LINEPOINTS = true;
  LIGHTTHEME = false;
  SPLINECOLOR = ["#fff", "green", "#8B00FA"];
  LINECOLOR = "#FABD2E";
  GRID = false;
  K = 3;
  UNIFORM = true;
  QUASI = true;
  PIECEWISE = true;

  function init() {
    console.log(".....init.......");
    cacheCanvas = undefined;
    radius = 4;
    color = "#D7443F";
    x = undefined;
    y = undefined;
    circles = [];
    preSelected = undefined;
    curClick = undefined;
    curSelected = undefined;
    curIndex = undefined;
    isDragging = false;
    drawSplineFinished = true;
    spline = undefined;
    //switch
    CONTROLPOINTS = true;
  }

  init();

  console.log("document ready");
  // console.log(isDragging);
  // var canvas = document.querySelector("canvas");
  var canvas = document.getElementById("myCanvas");
  var pointsCanvas = document.getElementById("pointsCanvas");
  var lineCanvas = document.getElementById("lineCanvas");
  var gridCanvas = document.getElementById("gridCanvas");
  var tipCanvas = document.getElementById("tipCanvas");
  canvas.width = pointsCanvas.width = lineCanvas.width = gridCanvas.width = $(".col-9")[0].offsetWidth;
  canvas.height = pointsCanvas.height = lineCanvas.height = gridCanvas.height = $(".col-9")[0].offsetHeight;
  canvas.style = gridCanvas.style = "background-color: #333A42 ";
  pointsCanvas.style = lineCanvas.style = "background-color: gray ";
  tipCanvas.style = "background-color: #fee"
  var c = canvas.getContext("2d");
  var pointsContext = pointsCanvas.getContext("2d");
  var lineContext = lineCanvas.getContext("2d");
  var gridContext = gridCanvas.getContext("2d");
  var tipContext = tipCanvas.getContext("2d");
  // var pointsContext = pointsCanvas.getContext("2d");

  canvas.onmousedown = canvasClick;
  canvas.onmousemove = dragCircle;
  // canvas.onmouseout = stopDragging;
  canvas.onmouseup = stopDragging;
  canvas.onmouseover = showToolTip;




  class Circle {
    constructor(x, y, radius, color) {
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.color = color;
      this.isSelected = false;
      this.draw = (c) => {
        c.beginPath();
        // c.strokeStyle = this.color;
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        //选中效果
        if (this.isSelected) {
          // c.lineWidth = 2;
          // c.strokeStyle = "#CAB409";
          if (LIGHTTHEME)
            // c.strokeStyle = "#17A2B8";
            c.strokeStyle = "#000";
          else {
            c.strokeStyle = "#fff";
          }
          // c.strokeStyle = "#FABD2E";
        } else {
          // c.lineWidth = 1;
          if (LIGHTTHEME) {
            c.strokeStyle = "#fff";
          } else {
            c.strokeStyle = "#000";
          }
        }
        c.fill();
        c.stroke();
      };

      this.update = () => {
        if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
          this.dx = -this.dx;
        }
        if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
          this.dy = -this.dy;
        }
        this.x += this.dx;
        this.y += this.dy;

        //interactivity
        if (mouse.x - this.x < 50 && mouse.x - this.x > -50 &&
          mouse.y - this.y < 50 && mouse.y - this.y > -50) {
          if (this.radius < maxRadius) {
            this.radius += 1;
          } else if (this.radius > minRadius) {
            this.radius -= 1;
          }
        }
        this.draw();
      };
    }
  }


  function drawCircles(context) {
    context.clearRect(0, 0, canvas.width, canvas.width);
    console.log("invoke drawCircles");
    // c.clearRect(0, 0, canvas.width, canvas.height);
    //遍历所有点
    context.setLineDash([0, 0])
    for (var i = 0; i < circles.length; i++) {
      var circle = circles[i];
      circle.draw(context);

    }
  }

  function isCircleSelected(x, y) {
    for (var i = circles.length - 1; i >= 0; i--) {
      var circle = circles[i];
      //使用勾股定理计算这个点与圆心之间的距离
      var distanceFromCenter = Math.sqrt(Math.pow(circle.x - x, 2) + Math.pow(circle.y - y, 2));
      // 判断这个点是否在圆圈中
      if (distanceFromCenter <= circle.radius) {
        curClick = circle;
        curIndex = i;
        // circle.isSelected = true;
        return true;
      }
    }
    return false;
  }



  //点击绘制点
  function canvasClick(event) {
    // console.log(circles);
    // var x = event.pageX - canvas.getBoundingClientRect().left;
    // var y = event.pageY - canvas.getBoundingClientRect().top;

    // 取得画布上被单击的点
    // var clickX = e.pageX - canvas.offsetLeft;
    // var clickY = e.pageY - canvas.offsetTop;
    x = event.offsetX;
    y = event.offsetY;

    if (isCircleSelected(x, y)) {
      // circles[preSelected].isSelected = true;
      console.log("sele index:", preSelected);
      // console.log("cur drag status", isDragging);
      //左键
      if (event.button == 0) {
        curClick.isSelected = true;
        if (!preSelected) {
          preSelected = curClick;
        } else {
          preSelected.isSelected = false;
          preSelected = curClick;
        }
        curSelected = curClick;
        curSelected.isSelected = true;
        isDragging = true;
        drawCircles(pointsContext);
        c.drawImage(pointsCanvas, 0, 0);
        // linePoints();
        // draw_buffer();
      }
      if (event.button == 2)
        deletCircle();
    } else {
      var circle = new Circle(x, y, radius, color);
      circles.push(circle);
      if (preSelected != null) {
        preSelected.isSelected = false;
      }
      circle.isSelected = false;
      // console.log(circles);
      // circle.draw();


      // drawCircles();
      // linePoints();
      // console.log("==> in click");
      // drawSpline();
      // console.log("==> click invoke ds over");
      // c.clearRect(0, 0, canvas.width, canvas.height);
      // draw();



    }




    // c.beginPath();
    // //TODO add radius select
    // c.arc(x, y, 2.5, 0, Math.PI * 2, false);
    // c.fillStyle = "#D7443F";
    // // c.strokeStyle = "black";
    // c.fill();
    // c.stroke();
  }

  function dragCircle(event) {
    if (isDragging) {
      // if (preSelected) {
      var x = event.offsetX;
      var y = event.offsetY;

      curSelected.x = x;
      curSelected.y = y;

      // canvas.onmousemove = drawCircles;
      // canvas.onmouseup = stopDragging;
      c.clearRect(0, 0, canvas.width, canvas.height);
      // draw();

      drawCircles(pointsContext);
      c.drawImage(pointsCanvas, 0, 0);
      linePoints(lineContext);
      c.drawImage(lineCanvas, 0, 0);

      // if (drawSplineOnDrag) {
      //   setTimeout(() => {
      //     drawSpline();

      //   }, 50);
      // }
      // drawSplineOnDrag = false;
      // 连续拖动 => 防抖动 debounce
      // var debouncedDrawSpline = debounce(drawSplineBuffer, 1000);
      // debouncedDrawSpline();


    }
    showToolTip(event);
  }

  function stopDragging(event) {
    // console.log(event);
    // console.log("excute stop");
    // canvas.onmousemove = null;
    // canvas.onmouseup = null;
    isDragging = false;
    // console.log("stoppppping");
    // drawSpline(c);
    draw();

  }

  function debounce(fn, delay) {
    var timer = null;
    return () => {
      // var contex = this;
      // var args = arguments;
      clearTimeout(timer);
      timer = setTimeout(() => {
        fn();
      }, delay);
    }

  }


  function clearCanvas() {
    c.clearRect(0, 0, canvas.width, canvas.height);
    init();
    // drawCircles();
  }

  $("#clear").click((event) => {
    clearCanvas();
  })

  function deletCircle() {
    circles.splice(curIndex, 1);
    drawCircles(pointsContext);
    c.drawImage(pointsCanvas, 0, 0);
  }

  function getPoints() {
    var points = [];
    var point = {
      x: undefined,
      y: undefined,
    }

    for (var i = 0; i < circles.length; i++) {
      point.x = circles[i].x;
      point.y = circles[i].y;
      //!!! 全是point ref 都是同一指向，一变全变
      //jQuery 对象复制
      points.push($.extend({}, point));
    }
    return points;

  }

  function linePoints(c) {
    c.clearRect(0, 0, canvas.width, canvas.width);
    var points = getPoints();
    // points = JSON.stringify(points)
    // console.log(points);
    c.setLineDash([5, 10]);
    c.strokeStyle = LINECOLOR;
    for (var i = 0; i < points.length; i++) {
      if (i == 0) {
        c.beginPath();
        c.moveTo(points[i].x, points[i].y);
      } else {
        c.lineTo(points[i].x, points[i].y);
      }
    }
    c.stroke();


  }

  function getSpline(points, fns, cb) {
    console.log("获取spline");
    client.invoke("draw_spline", points, fns, (err, res) => {
      if (err) {
        console.log("object调用错误");
        console.error("调用错误", err);
        return;
      } else {
        // console.log("获取成功");
        // console.log("res is", res);
        cb(res);
      }
    });
  }


  function drawSpline(c, fns) {
    c.clearRect(0, 0, canvas.width, canvas.width);
    var points = getPoints();
    console.log("invoke drawSpline: " + fns);
    console.log(QUASI);
    // console.log("spline context", c);
    //Async callback pattern
    if (points.length > 3) {
      getSpline(points, fns, (s) => {
        // var knots = s[1];
        if (s) {
          spline = s;

          // console.log("drawSpline context?", c);
          c.beginPath();
          c.setLineDash([0, 0]);
          // c.strokeStyle = SPLINECOLOR;
          if (fns == "uniform") {
            c.strokeStyle = SPLINECOLOR[0];
            c.lineWidth = 1;
          }
          if (fns == "quasi") {
            c.strokeStyle = SPLINECOLOR[1];

            c.lineWidth = 3;
          }
          if (fns == "piecewise") {
            c.strokeStyle = SPLINECOLOR[2];
          }
          c.moveTo(spline[0][0], spline[1][0]);

          for (var i = 1, j = spline[0].length; i < j; i++) {

            c.lineTo(spline[0][i], spline[1][i]);
          }
          c.stroke();
        }
      });
    }
  }


  function drawGrid(c, stepX, stepY, lineWidth, color) {
    c.save();
    c.lineWidth = lineWidth;
    c.strokeStyle = color;
    for (var i = stepY; i < c.canvas.height; i += stepY) {
      c.beginPath();
      c.moveTo(0, i);
      c.lineTo(c.canvas.width, i);
      c.stroke();
    }

    for (var i = stepX; i < c.canvas.width; i += stepX) {
      c.beginPath();
      c.moveTo(i, 0);
      c.lineTo(i, c.canvas.height);
      c.stroke();
    }
    c.restore();
  }


  function drawBuffer(c, fn) {
    //更改绘画上下文到cacheCanvas
    // c = cacheCanvas.getContext("2d");
    // c.save();

    // if (c.length > 1) {
    //   console.log(c);
    //   console.log(c[0]);

    //   context = c[0];
    //   c.splice(0, 1);
    //   console.log("===", c);
    // } else {
    //   context = c;

    // }
    // context.clearRect(0, 0, canvas.width, canvas.height);
    // drawCircles();
    // linePoints();
    // console.log(c);
    // drawSpline();
    // c.beginPath()
    // c.arc(100, 100, 10, 0, Math.PI * 2, false);
    // c.stroke();
    // c.restore();
    // c.save();
    // c.clearRect(0, 0, canvas.width, canvas.height);
    // drawCircles();
    // linePoints();
    fn(c);
    // drawCircles();
    // linePoints();
    // setTimeout(() => {
    // c.drawImage(cacheCanvas, 0, 0, canvas.width, canvas.height);
    // c.drawImage(cacheCanvas, 0, 0);
    // }, 500);
    // c = canvas.getContext("2d");
    // c.drawImage(cacheCanvas, 0, 0);
    // return c.getImageData(0, 0, canvas.width, canvas.height);
  }


  function draw() {
    c.clearRect(0, 0, canvas.width, canvas.height);
    console.log("invoke draw");
    drawBuffer(pointsContext, drawCircles);
    drawBuffer(lineContext, linePoints);
    // drawBuffer([gridContext, 20, 20, 1, 'gray'], drawGrid);
    // drawBuffer(splineContext, drawSpline);

    // var lineImageData = drawBuffer(lineContext, linePoints);
    // var splineImageData = drawBuffer(splineContext, drawSpline);
    // drawSpline(c);

    // c.drawImage(splineCanvas, 0, 0, canvas.width, canvas.height);
    if (UNIFORM) {
      console.log("UNIFORM");
      drawSpline(c, "uniform");
    }
    if (QUASI)
      drawSpline(c, "quasi");
    if (PIECEWISE)
      drawSpline(c, "piecewise")
    if (CONTROLPOINTS)
      // c.putImageData(pointsImageData, 0, 0);
      c.drawImage(pointsCanvas, 0, 0, canvas.width, canvas.height);
    // if (1) {
    // console.log("splineCanvas", splineCanvas);
    // c.drawImage(splineCanvas, 0, 0);
    // }
    // c.putImageData(lineImageData, 0, 0);
    // drawCircles();
    if (LINEPOINTS)
      c.drawImage(lineCanvas, 0, 0);
    //   c.putImageData(lineImageData, 0, 0);
    if (GRID)
      c.drawImage(gridCanvas, 0, 0);
  }


  // drawGrid(20, 20, 1, 'gray');
  drawGrid(gridContext, 20, 20, 1, 'gray'); //绘制一次即可


  //Tooltip
  function getToolTips() {
    var tips = [];
    for (var i = 0; i < circles.length; i++) {
      tips.push({
        title: undefined,
      })
    }

  }

  function showToolTip(event) {
    var x = event.offsetX;
    var y = event.offsetY;

    tipContext.clearRect(0, 0, tipCanvas.width, tipCanvas.height);
    tipContext.fillText("(" + x + "," + y + ")", 5, 15);
  }
});