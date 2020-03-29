class Tcell {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector();
    this.acc = createVector();

    this.radius = 40;
    this.size = this.radius * 2;

    this.triggered = false;
    this.in_screen = false;
    this.activated = false;
  }

  update() {
    this.pos.add(this.vel);
    this.vel.add(this.acc);
    this.acc.mult(0);
    this.vel.mult(0.96);
    if (this.pos.x - this.radius > 0 && this.pos.y - this.radius > 0) {
      this.in_screen = true;
    }
    this.size = 80 + 5 * quickSin(frameCount * 0.03);
    this.radius = this.size / 2;
  }
  
  display() {
    push();
    translate(this.pos.x, this.pos.y);
    
    if (params.Annotation) {
      fill(255);
      stroke(0);
      text("T Lymphocyte", this.radius + 10, 0);

      let mouseNear = p5.Vector.sub(mousePos, this.pos);
      if (mouseNear.mag() < this.radius) {
        let ant = "Receives signals from phagocyte.\n";
        ant += "Based on information received, generates B lymphocyte.";
        text(ant, this.radius + 10, 20);
      }
    }

    let sinVal = quickSin(frameCount * 0.01) / 4 + 1;

    fill(0, 150);
    noStroke();
    ellipse(1, 1, this.size + 1, this.size + 1);

    fill(120, 90 * sinVal, 170, 240);
    stroke(150, 110, 200, 240);
    strokeWeight(2);
    ellipse(0, 0, this.size, this.size);

    fill(110, 60, 120, 240);
    noStroke();
    ellipse(this.size / 6, - this.size / 6, this.size / 4 * sinVal, this.size / 5 * sinVal);

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

  generateB(antigen_info) {
    bcells.push(new Bcell(antigen_info, this.pos))
  }

}