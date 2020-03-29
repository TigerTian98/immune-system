class Bcell {
  constructor(antigen_info, pos) {
  	this.pos = createVector(pos.x, pos.y);
  	this.vel = createVector(random(-10, 10), random(-10, 10));
  	this.acc = createVector();

  	this.size = 7;
  	this.lifespan = 1;
  	this.type = antigen_info;

    this.paused = false;
  	this.grown = false;
  	this.antibodySent = false;
  }
  
  update() {
    this.pos.add(this.vel);
    this.vel.add(this.acc);
    this.acc.mult(0);
    this.vel.mult(0.96);

    if (!this.paused) {
      this.lifespan -= 0.002;
    }

    if (this.grown) {
      this.size = (80 + 10 * quickSin(frameCount * 0.03)) * this.lifespan;
    }

  	this.radius = this.size / 2;
  }
  
  display() {
  	push();
  	translate(this.pos.x, this.pos.y);

    if (params.Annotation) {
      fill(255, this.lifespan * 255);
      stroke(0, this.lifespan * 255);
      text("B Lymphocyte", this.radius + 10, 0);

      let mouseNear = p5.Vector.sub(mousePos, this.pos);
      if (mouseNear.mag() < this.radius && !this.paused) {
        this.paused = true;
      }

      if (mouseNear.mag() > this.radius) {
        this.paused = false;
      }

      if (this.paused) {
        let ant = "Takes information from T lympocyte and produces antibodies.";
        text(ant, this.radius + 10, 20);
      }
    }

    let sinVal = quickSin(frameCount * 0.02) / 5 + 1;

    fill(0, this.lifespan * 255);
    noStroke();
    ellipse(1, 1, this.size + 1, this.size + 1);

    fill(80, 150 * sinVal, 100, this.lifespan * 255);
    stroke(30, 150, 90, this.lifespan * 255);
    strokeWeight(2);
    ellipse(0, 0, this.size, this.size);

    fill(70, 200, 110, this.lifespan * 255);
    noStroke();
    ellipse(this.size / 6, this.size / 6, this.size / 4 * sinVal, this.size / 5 * sinVal);

    pop();
  }

  //-------------------------------
  //----------MyFunctions----------
  //-------------------------------

  applyForce(f) {
    let force = f.copy();
    this.acc.add(force);
  }

  checkCollision(other) {
    let vector = p5.Vector.sub(other.pos, this.pos);
    let distance = vector.mag();
    if (distance < this.size / 2 + other.size / 2) {
      let magnitude;
      let c = 0.1;

      vector.normalize();
      magnitude = this.vel.mag();
      vector.mult(magnitude * c);
      other.applyForce(vector);

      vector.normalize();
      magnitude = other.vel.mag();
      vector.mult(-magnitude * c);
      this.applyForce(vector);
    }
  }

  checkEdges() {
    if (this.pos.x - this.radius < 0 || this.pos.x + this.radius > width) {
      this.vel.x *= -1;
    }

    if (this.pos.y - this.radius < 0 || this.pos.y + this.radius > height) {
      this.vel.y *= -1;
    }
  }

  grow() {
  	if (this.size < 80) {
  		this.size += 1;
  	} else {
  		this.grown = true;
  	}
  }

  sendAntibodies() {
  	this.antibodySent = true;
  	for (let i = 0; i < 20; i ++) {
  		antibodies.push(new Antibody(this.type, this.pos));
  	}
  }

}