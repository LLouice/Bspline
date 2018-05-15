window.onload = () => {
    console.log("window loading");

}


$(document).ready(function () {
    function init() {
        console.log(".....init.......");
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

    }
    init();

    console.log("document ready");
    console.log(isDragging);
    var canvas = document.querySelector("canvas");
    var c = canvas.getContext("2d");

    canvas.onmousedown = canvasClick;
    canvas.onmousemove = dragCircle;
    canvas.onmouseout = stopDragging;
    canvas.onmouseup = stopDragging;




    class Circle {
        constructor(x, y, radius, color) {
            this.x = x;
            this.y = y;
            this.radius = radius;
            this.color = color;
            this.isSelected = false;
            this.draw = () => {
                c.beginPath();
                // c.strokeStyle = this.color;
                c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
                c.fillStyle = this.color;
                //选中效果
                if (this.isSelected) {
                    // c.lineWidth = 2;
                    c.strokeStyle = "#CAB409";
                } else {
                    // c.lineWidth = 1;
                    c.strokeStyle = "black";
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


    function drawCircles() {
        c.clearRect(0, 0, canvas.width, canvas.height);
        //遍历所有点
        for (var i = 0; i < circles.length; i++) {
            var circle = circles[i];
            circle.draw();

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
                drawCircles();
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
            console.log(circles);
            // circle.draw();
            drawCircles();
        }


        linePoints();


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
            drawCircles();
            // }
        }
    }

    function stopDragging(event) {
        // console.log(event);
        // console.log("excute stop");
        // canvas.onmousemove = null;
        // canvas.onmouseup = null;
        isDragging = false;

    }

    // function stopDragging2() {
    //     console.log("mouse up");
    // }

    function clearCanvas() {
        init();
        drawCircles();
    }

    $("#clear").click((event) => {
        clearCanvas();
    })

    function deletCircle() {
        circles.splice(curIndex, 1);
        drawCircles();
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

    function linePoints() {
        console.log(getPoints());

    }

    // linePoints();



});