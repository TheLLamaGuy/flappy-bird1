let myGamePiece;
let myObstacles = [];
let myPoints = 0;
let myScore;
let gameRunning = true;
let soundJump = new Audio("assets/audio/sfx_wing.mp3");
let soundDie = new Audio("assets/audio/sfx_die.mp3");
let soundPoints = new Audio("assets/audio/sfx_point.mp3");

function startGame() {
    myGamePiece = new component(30, 30, "assets/pictures/smiley.gif", 10, 120, "image");
    myScore = new component("20px", "Consolas", "black", 360, 40, "text");
    myObstacles = [];
    myPoints = 0;
    myGameArea.start();
}

let myGameArea = {
    canvas: document.createElement("canvas"),
    start: function () {
        this.canvas.width = 480;
        this.canvas.height = 270;
        this.canvas.style = "border:1px solid #d3d3d3;";
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.frameNo = 0;
        gameRunning = true;
        time = 16;
        this.interval = setInterval(updateGameArea, time);

        // Handle keyboard jump (Spacebar)
        window.addEventListener('keydown', function (e) {
            myGameArea.keys = (myGameArea.keys || []);
            myGameArea.keys[e.keyCode] = true;

            if (e.keyCode === 82) { // 'R' key is pressed
                resetGame();
            }
        });

        window.addEventListener('keyup', function (e) {
            myGameArea.keys[e.keyCode] = false;
        });

        // Handle touch for mobile jump
        this.canvas.addEventListener('touchstart', function (e) {
            e.preventDefault();
            if (e.touches.length > 0) {
                myGameArea.keys = (myGameArea.keys || [])
                myGameArea.keys[32] = true;
            }
        });
        
        this.canvas.addEventListener('touchend', function (e) {
            myGameArea.keys[32] = false;
        });
        
    },
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    stop: function () {
        clearInterval(this.interval);
        gameRunning = false;
    }
};

function everyinterval(n) {
    return (myGameArea.frameNo / n) % 1 === 0;
}

function component(width, height, colour, x, y, type) {
    this.type = type;
    if (type === "image") {
        this.image = new Image();
        this.image.src = colour;
    }
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.speedX = 0;
    this.speedY = 0;
    this.gravity = 0.08;
    this.gravitySpeed = 0;
    this.bounce = 0.4;

    this.update = function () {
        const ctx = myGameArea.context;
        if (this.type === "text") {
            ctx.font = this.width + " " + this.height;
            ctx.fillStyle = colour;
            ctx.fillText(this.text, this.x, this.y);
        } else if (this.type === "image") {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = colour;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    };

    this.newPos = function () {
        this.gravitySpeed += this.gravity;
        this.x += this.speedX;
        this.y += this.speedY + this.gravitySpeed;
        this.hitBottom();
        this.hitTop();
    };

    this.hitBottom = function () {
        const rockbottom = myGameArea.canvas.height - this.height;
        if (this.y > rockbottom) {
            this.y = rockbottom;
            this.gravitySpeed = -(this.gravitySpeed * this.bounce);
        }
    };

    this.hitTop = function () {
        if (this.y < 0) {
            this.y = 0.1;
            this.gravitySpeed = 0;
        }
    };

    this.crashWith = function (otherobj) {
        const myleft = this.x;
        const myright = this.x + this.width;
        const mytop = this.y;
        const mybottom = this.y + this.height;
        const otherleft = otherobj.x;
        const otherright = otherobj.x + otherobj.width;
        const othertop = otherobj.y;
        const otherbottom = otherobj.y + otherobj.height;
        return !(mybottom < othertop || mytop > otherbottom || myright < otherleft || myleft > otherright);
    };
}

function checkJump() {
    if (myGameArea.keys && myGameArea.keys[32]) {
        myGamePiece.gravitySpeed = -2;
        soundJump.play();
    }
}

function pointIncrement() {
    for (let i = 0; i < myObstacles.length; i += 2) {
        if (myObstacles[i].x + myObstacles[i].width < myGamePiece.x && !myObstacles[i].scored) {
            soundPoints.play();
            myPoints += 1;
            myObstacles[i].scored = true; // Marks the obstacle as passed
        }
    }
}

function updateGameArea() {
    if (!gameRunning) return;

    let x, height, gap, minHeight, maxHeight, minGap, maxGap;

    myGameArea.clear();

    myGameArea.frameNo += 1;

    // Add new obstacles at regular intervals
    if (myGameArea.frameNo === 1 || everyinterval(150)) {
        x = myGameArea.canvas.width;
        minHeight = 20;
        maxHeight = 200;
        height = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
        minGap = 60;
        maxGap = 120;
        gap = Math.floor(Math.random() * (maxGap - minGap + 1) + minGap);
        myObstacles.push(new component(20, height, "green", x, 0));
        myObstacles.push(new component(20, x - height - gap, "green", x, height + gap));
    }

    for (let i = 0; i < myObstacles.length; i++) {
        myObstacles[i].x += -1;
        myObstacles[i].update();
    }

    checkJump();

    pointIncrement();
    myScore.text = "SCORE: " + myPoints;
    myScore.update();

    myGamePiece.newPos();
    myGamePiece.update();

    for (let i = 0; i < myObstacles.length; i++) {
        if (myGamePiece.crashWith(myObstacles[i])) {
            myGameArea.stop();
            soundDie.play();
            return;
        }
    }
}

// Reset function
function resetGame() {
    if (!gameRunning) {
        myGameArea.stop();
        startGame();
    }
}

startGame();
