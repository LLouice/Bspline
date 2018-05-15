$(document).ready(function () {
    console.log("canvas.js is here");
    // var canvas = $("#myCanvas")[0];
    var canvas = document.querySelector("canvas");
    console.log(canvas);
    canvas.width = window.outerWidth;
    console.log("window innerWidth:", window.innerWidth);
    canvas.height = 400;

    var c = canvas.getContext("2d");
    var mouse = {
        x: undefined,
        y: undefined,
    };

    var maxRadius = 40;
    var minRadius = 40;

    var colors = ["green", "black", "gray", "#17a2b8"]

    // canvas.onclick = function () {
    //     var x = event.pageX - canvas.getBoundingClientRect().left;
    //     var y = event.pageY - canvas.getBoundingClientRect().top;
    //     console.log(x, y);
    // };

    $("#myCanvas").click((event) => {
        var x = event.pageX - canvas.getBoundingClientRect().left;
        var y = event.pageY - canvas.getBoundingClientRect().top;
        // console.log(event.pageX, event.pageY)
        console.log(x, y);
    });


    //rect
    c.fillStyle = "red"
    c.fillRect(10, 10, 2, 2);

    //Arc / Circle
    // c.beginPath();
    // c.arc(100, 100, 30, 0, Math.PI * 2, true);
    // c.strokeStyle = "red";
    // // c.arc(200, 400, 30, 0, Math.PI * 2, false);
    // c.stroke();



    class Circle {
        constructor(x, y, dx, dy, radius) {
            this.x = x;
            this.y = y;
            this.dx = dx;
            this.dy = dy;
            this.radius = radius;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.draw = () => {
                c.beginPath();

                // c.strokeStyle = this.color;
                c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
                // console.log("drawing");
                c.fillStyle = this.color;
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

    // function Circle(x, y, dx, dy, radius) {
    //     this.x = x;
    //     this.y = y;
    //     this.dx = dx;
    //     this.dy = dy;
    //     this.radius = radius;

    //     this.draw = () => {
    //         c.beginPath();
    //         c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    //         c.strokeStyle = "blue";
    //         console.log("drawing");
    //         c.stroke();
    //     }

    //     this.update = () => {
    //         if (this.x + this.radius > innerWidth || this.x - this.radius < 0) {
    //             this.dx = -this.dx;
    //         }
    //         if (this.y + this.radius > innerHeight || this.y - this.radius < 0) {
    //             this.dy = -this.dy;
    //         }
    //         this.x += this.dx;
    //         this.y += this.dy;
    //         this.draw();
    //     }
    // }

    var circleArray = [];
    for (var i = 0; i < 100; i++) {
        var radius = Math.random() * 3 + 1;
        var x = Math.random() * (canvas.width - radius * 2) + radius;
        var y = Math.random() * (canvas.height - radius * 2) + radius;
        var dx = Math.random() - 0.5;
        var dy = Math.random() - 0.5;
        circleArray.push(new Circle(x, y, dx, dy, radius));
        // console.log(circleArray);
    }
    // circleArray[0].draw();

    function animate() {
        c.clearRect(0, 0, canvas.width, canvas.height);
        window.requestAnimationFrame(animate);
        // console.log("yes");
        for (var i = 0; i < circleArray.length; i++) {
            circleArray[i].update();

        }
    }

    animate();

    // canvas.addEventListener("mousemove", () => {
    //     console.log("touch it");
    // })

    $("#myCanvas").mousemove((e) => {
        // mouse.x = e.offsetX;
        // mouse.y = e.offsetY;
        // console.log(e);
        mouse.x = e.x;
        mouse.y = e.y;
        console.log(mouse);
    })
});