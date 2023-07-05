window.addEventListener("load", function () {
  /**@type{HTMLCanvasElement} */
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  ctx.fillStyle = "white";
  ctx.strokeStyle = "white";
  ctx.lineWidth = 1;

  class Particle {
    constructor(effect) {
      this.effect = effect;
      this.x = Math.random() * this.effect.width;
      this.y = Math.random() * this.effect.height;
      this.size = 10;
      this.speedX;
      this.speedY;
      this.speedModifier = Math.floor(Math.random() * 5 + 1);

      this.history = [{ x: this.x, y: this.y }];
      this.maxLength = Math.floor(Math.random() * 210 + 10);
      this.angle = 0;
      this.timer = this.maxLength * 2;
      this.colorArray = [
        "rgb(252, 3, 244)",
        "rgb(198, 3, 252)",
        "rgb(107, 3, 252)",
        "rgb(3, 3, 252)",
      ];

      this.color =
        this.colorArray[Math.floor(Math.random() * this.colorArray.length)];
    }
    draw() {
      //ctx.fillRect(this.x, this.y, this.size, this.size);
      ctx.strokeStyle = this.color;
      ctx.beginPath();
      ctx.moveTo(this.history[0].x, this.history[0].y);
      for (let i = 0; i < this.history.length; i++) {
        ctx.lineTo(this.history[i].x, this.history[i].y);
      }
      ctx.stroke();
    }
    update() {
      this.timer--;
      if (this.timer >= 1) {
        let x = Math.floor(this.x / this.effect.cellSize);
        let y = Math.floor(this.y / this.effect.cellSize);
        let index = y * this.effect.cols + x;
        this.angle = this.effect.flowField[index];
        this.speedX = Math.cos(this.angle);
        this.speedY = Math.sin(this.angle);
        this.x += this.speedX * this.speedModifier;
        this.y += this.speedY * this.speedModifier;

        this.history.push({ x: this.x, y: this.y });

        if (this.history.length > this.maxLength) {
          this.history.shift(1);
        }
      } else if (this.history.length > 1) {
        this.history.shift();
      } else {
        this.reset();
      }
    }
    reset() {
      this.x = Math.random() * this.effect.width;
      this.y = Math.random() * this.effect.height;
      this.history = [{ x: this.x, y: this.y }];
      this.timer = this.maxLength * 2;
    }
  }

  class Effect {
    constructor(canvas) {
      this.canvas = canvas;
      this.width = this.canvas.width;
      this.height = this.canvas.height;
      this.particles = [];
      this.numOfParticles = 2000;
      this.cellSize = 20;
      this.rows;
      this.cols;
      this.flowField = [];
      this.curve = 20;
      this.zoom = 0.01 ;
      this.debug = false;
      this.init();
      const zoomSlider = document.getElementById("zoom");
      const zoomLabel = document.getElementById("zoomLabel");
      const curveSlider = document.getElementById("curve");
      const curveLabel = document.getElementById("curveLabel");

      zoomSlider.addEventListener("change", (e) => {
        this.zoom = Number(e.target.value);
        zoomLabel.innerText = `Zoom   ${this.zoom}`
        this.init();
      });
      curveSlider.addEventListener("change", (e) => {
        this.curve = Number(e.target.value);
        curveLabel.innerText = `Curve    ${this.curve}`;
        this.init();
      });

      window.addEventListener("keydown", (e) => {
        if (e.key === "d") {
          this.debug = !this.debug;
        }

        window.addEventListener("resize", (e) => {
          this.resize(e.target.innerWidth, e.target.innerHeight);
        });
      });
    }
    init() {
      //create flow field
      this.rows = Math.floor(this.height / this.cellSize);
      this.cols = Math.floor(this.width / this.cellSize);
      this.flowField = [];
      for (let y = 0; y < this.rows; y++) {
        for (let x = 0; x < this.cols; x++) {
          let angle =
            (Math.cos(x * this.zoom) + Math.sin(y * this.zoom)) * this.curve;
          this.flowField.push(angle);
        }
      }

      // create particles
      this.particles = [];
      for (let i = 0; i < this.numOfParticles; i++) {
        this.particles.push(new Particle(this));
      }
    }
    drawGrid() {
      ctx.save();
      ctx.strokeStyle = "white";
      ctx.lineWidth = 0.75;
      for (let c = 0; c < this.cols; c++) {
        ctx.beginPath();
        ctx.moveTo(this.cellSize * c, 0);
        ctx.lineTo(this.cellSize * c, this.height);
        ctx.stroke();
      }
      for (let r = 0; r < this.rows; r++) {
        ctx.beginPath();
        ctx.moveTo(0, this.cellSize * r);
        ctx.lineTo(this.width, this.cellSize * r);
        ctx.stroke();
      }
      ctx.restore();
    }
    resize(width, height) {
      this.canvas = canvas;
      this.width = width;
      this.height = height;
      this.init();
    }
    render() {
      if (this.debug) {
        this.drawGrid();
      }

      this.particles.forEach((particle) => {
        particle.draw();
        particle.update();
      });
    }
  }
  const effect = new Effect(canvas);

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    effect.render();
    requestAnimationFrame(animate);
  }
  animate();

  //load function end
});
