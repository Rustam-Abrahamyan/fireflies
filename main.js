window.requestAnimationFrame =
    window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.msRequestAnimationFrame;

let starDensity = 0.216;
let speedCoefficient = 0.05;
let width;
let height;
let starCount;
let circleRadius;
let circleCenter;
let first = true;
let giantColor = "180,184,240";
let starColor = "226,225,142";
let cometColor = "226,225,224";
let universeCanvas = document.getElementById("universe");
let stars = [];
let universe = null;

windowResizeHandler();
window.addEventListener("resize", windowResizeHandler, false);

createUniverse();

function createUniverse() {
    universe = universeCanvas.getContext("2d");

    for (let i = 0; i < starCount; i++) {
        stars[i] = new Star();
        stars[i].reset();
    }

    draw();
}

function draw() {
    universe.clearRect(0, 0, width, height);

    let starsLength = stars.length;

    for (let i = 0; i < starsLength; i++) {
        let star = stars[i];
        star.move();
        star.fadeIn();
        star.fadeOut();
        star.draw();
    }

    window.requestAnimationFrame(draw);
}

function Star() {
    this.reset = function() {
        this.giant = getProbability(3);
        this.comet = this.giant || first ? false : getProbability(10);
        this.x = getRandInterval(0, width - 10);
        this.y = getRandInterval(0, height);
        this.r = getRandInterval(1.1, 2.6);
        this.dx =
            getRandInterval(speedCoefficient, 6 * speedCoefficient) +
            (this.comet + 1 - 1) * speedCoefficient * getRandInterval(50, 120) +
            speedCoefficient * 2;
        this.dy =
            -getRandInterval(speedCoefficient, 6 * speedCoefficient) -
            (this.comet + 1 - 1) * speedCoefficient * getRandInterval(50, 120);
        this.fadingOut = null;
        this.fadingIn = true;
        this.opacity = 0;
        this.opacityTresh = getRandInterval(
            0.2,
            1 - (this.comet + 1 - 1) * 0.4
        );
        this.do = getRandInterval(0.0005, 0.002) + (this.comet + 1 - 1) * 0.001;
    };

    this.fadeIn = function() {
        if (this.fadingIn) {
            this.fadingIn = this.opacity <= this.opacityTresh;
            this.opacity += this.do;
        }
    };

    this.fadeOut = function() {
        if (this.fadingOut) {
            this.fadingOut = this.opacity >= 0;
            this.opacity -= this.do / 2;
            if (this.x > width || this.y < 0) {
                this.fadingOut = false;
                this.reset();
            }
        }
    };

    this.draw = function() {
        universe.beginPath();

        if (this.giant) {
            universe.fillStyle =
                "rgba(" + giantColor + "," + this.opacity + ")";
            universe.arc(this.x, this.y, 2, 0, 2 * Math.PI, false);
        } else if (this.comet) {
            universe.fillStyle =
                "rgba(" + cometColor + "," + this.opacity + ")";
            universe.arc(this.x, this.y, 1.5, 0, 2 * Math.PI, false);

            for (let i = 0; i < 30; i++) {
                universe.fillStyle =
                    "rgba(" +
                    cometColor +
                    "," +
                    (this.opacity - (this.opacity / 20) * i) +
                    ")";
                universe.rect(
                    this.x - (this.dx / 4) * i,
                    this.y - (this.dy / 4) * i - 2,
                    2,
                    2
                );
                universe.fill();
            }
        } else {
            universe.fillStyle = "rgba(" + starColor + "," + this.opacity + ")";
            universe.rect(this.x, this.y, this.r, this.r);
        }

        universe.closePath();
        universe.fill();
    };

    this.move = function() {
        this.x += this.dx;
        this.y += this.dy;
        if (this.fadingOut === false) {
            this.reset();
        }
        if (this.x > width - width / 4 || this.y < 0) {
            this.fadingOut = true;
        }
    };

    (function() {
        setTimeout(function() {
            first = false;
        }, 50);
    })();
}

function getProbability(percents) {
    return Math.floor(Math.random() * 1000) + 1 < percents * 10;
}

function getRandInterval(min, max) {
    return Math.random() * (max - min) + min;
}

function windowResizeHandler() {
    width = window.innerWidth;
    height = window.innerHeight;
    starCount = width * starDensity;

    circleRadius = width > height ? height / 2 : width / 2;
    circleCenter = {
        x: width / 2,
        y: height / 2
    };

    universeCanvas.setAttribute("width", width);
    universeCanvas.setAttribute("height", height);
}

let Clock = (function() {
    let canvas,
        ctx,
        height = 400,
        key = {
            up: false,
            shift: false
        },
        particles = [],
        quiver = true,
        texts = ["CANVAS", "FIREFLIES"],
        text = texts[0],
        textNum = 0,
        textSize = 90,
        width = 520;

    let FRAME_RATE = 60,
        PARTICLE_NUM = 1400,
        RADIUS = Math.PI * 2;

    let draw = function(p) {
        ctx.fillStyle = "rgba(226,225,142, " + p.opacity + ")";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, RADIUS, true);
        ctx.closePath();
        ctx.fill();
    };

    let loop = function() {
        ctx.clearRect(0, 0, width, height);

        ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.textBaseline = "middle";
        ctx.font =
            textSize + "px 'Avenir', 'Helvetica Neue', 'Arial', 'sans-serif'";
        ctx.fillText(
            text,
            (width - ctx.measureText(text).width) * 0.5,
            height * 0.5
        );

        let imgData = ctx.getImageData(0, 0, width, height);

        ctx.clearRect(0, 0, width, height);

        for (let i = 0, l = particles.length; i < l; i++) {
            let p = particles[i];
            p.inText = false;
        }
        particleText(imgData);
    };

    let particleText = function(imgData) {
        let pxls = [];
        for (let w = width; w > 0; w -= 3) {
            for (let h = 0; h < width; h += 3) {
                let index = (w + h * width) * 4;
                if (imgData.data[index] > 1) {
                    pxls.push([w, h]);
                }
            }
        }

        let count = pxls.length;
        let j = parseInt((particles.length - pxls.length) / 2, 10);

        if (j < 0) {
            j = 0;
        }

        for (let i = 0; i < pxls.length && j < particles.length; i++, j++) {
            try {
                let p = particles[j],
                    X,
                    Y;

                if (quiver) {
                    X = pxls[count - 1][0] - (p.px + Math.random() * 5);
                    Y = pxls[count - 1][1] - (p.py + Math.random() * 5);
                } else {
                    X = pxls[count - 1][0] - p.px;
                    Y = pxls[count - 1][1] - p.py;
                }
                let T = Math.sqrt(X * X + Y * Y);
                let A = Math.atan2(Y, X);
                let C = Math.cos(A);
                let S = Math.sin(A);
                p.x = p.px + C * T * p.delta;
                p.y = p.py + S * T * p.delta;
                p.px = p.x;
                p.py = p.y;
                p.inText = true;
                p.fadeIn();
                draw(p);
                if (key.up === true) {
                    p.size += 0.3;
                } else {
                    let newSize = p.size - 0.5;
                    if (newSize > p.origSize && newSize > 0) {
                        p.size = newSize;
                    } else {
                        p.size = p.origSize;
                    }
                }
            } catch (e) {}
            count--;
        }
        for (let i = 0; i < particles.length; i++) {
            let p = particles[i];
            if (!p.inText) {
                p.fadeOut();

                let X = p.mx - p.px;
                let Y = p.my - p.py;

                let T = Math.sqrt(X * X + Y * Y);

                let A = Math.atan2(Y, X);

                let C = Math.cos(A);

                let S = Math.sin(A);

                p.x = p.px + (C * T * p.delta) / 2;
                p.y = p.py + (S * T * p.delta) / 2;
                p.px = p.x;
                p.py = p.y;

                draw(p);
            }
        }
    };

    let setDimensions = function() {
        canvas.width = window.innerWidth >= 520 ? 520 : width;
        canvas.height = window.innerHeight >= 150 ? 150 : height;

        width = canvas.width;
        height = canvas.height;

        canvas.style.position = "absolute";
        canvas.style.left = "0px";
        canvas.style.top = "0px";
        canvas.style.bottom = "0px";
        canvas.style.right = "0px";
        canvas.style.marginTop = window.innerHeight * 0.15 + "px";
    };

    return {
        init: function(canvasID) {
            canvas = document.getElementById(canvasID);
            if (canvas === null || !canvas.getContext) {
                return;
            }
            ctx = canvas.getContext("2d");
            setDimensions();
            this.event();

            for (let i = 0; i < PARTICLE_NUM; i++) {
                particles[i] = new Particle(canvas);
            }

            setInterval(loop, FRAME_RATE);
        },

        event: function() {
            let interval = null;

            interval = setInterval(() => {
                if (textNum >= texts.length) {
                    textNum--;
                    clearInterval(interval);
                    return;
                }

                text = texts[textNum];
                textNum++;
            }, 2000);
        }
    };
})();

let Particle = function(canvas) {
    let spread = canvas.height / 4;
    let size = Math.random() * 1.2;

    this.delta = 0.15;

    this.px = canvas.width / 2 + (Math.random() - 0.5) * canvas.width;
    this.py = canvas.height * 0.5 + (Math.random() - 0.5) * spread;

    this.mx = this.px;
    this.my = this.py;

    this.origSize = size;

    this.opacity = 0;
    this.do = 0.02;

    this.opacityTresh = 0.98;
    this.fadingOut = true;
    this.fadingIn = true;
    this.fadeIn = function() {
        this.fadingIn = this.opacity <= this.opacityTresh;
        if (this.fadingIn) {
            this.opacity += this.do;
        } else {
            this.opacity = 1;
        }
    };

    this.fadeOut = function() {
        this.fadingOut = this.opacity >= 0;
        if (this.fadingOut) {
            this.opacity -= 0.06;
            if (this.opacity < 0) {
                this.opacity = 0;
            }
        } else {
            this.opacity = 0;
        }
    };
};

setTimeout(function() {
    Clock.init("canvas");
}, 2000);
