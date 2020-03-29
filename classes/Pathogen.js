class Pathogen {
  constructor(x, y, size, color) {
    this.pos = createVector(x, y);
    this.vel = createVector(random(-0.5, 0.5), random(-0.5, 0.5));
    this.acc = createVector();

    this.size = size;
    this.radius = this.size / 2;
    this.mass = this.size / 50;
    this.type = color;
    this.lifespan = 1;

    this.red = this.type[0];
    this.green = this.type[1];
    this.blue = this.type[2];

    this.antigens = [];
    this.numOfAntigens = int(this.size / 5);

    this.exposed = false;
    this.signalSent = false;

    for (let i = 0; i < this.numOfAntigens; i ++) {
      let angle = i / this.numOfAntigens * TWO_PI;
      this.antigens.push(new Antigen(angle, this.size/2, this.type));
    }
  }

  update() {
    this.pos.add(this.vel);
    this.vel.add(this.acc);
    this.acc.mult(0);
    this.vel.mult(0.97);

    for (let i = 0; i < this.antigens.length; i ++) {
      let atg = this.antigens[i];
      atg.follow(this.pos);
      atg.lifespan = this.lifespan;
      if (atg.radius < 2) {
        this.antigens.splice(i, 1);
      }
    }

    if (this.signalSent) {
      for (let i = 0; i < this.antigens.length; i ++) {
        let atg = this.antigens[i];
        atg.moveTowardsCenter();
      }
    }
  }
  
  display() {

    push();
    translate(this.pos.x, this.pos.y);

    if (params.Annotation) {
      fill(255, this.lifespan * 255);
      stroke(0, this.lifespan * 255);
      text("Pathogen", this.radius + 10, 0);

      let mouseNear = p5.Vector.sub(mousePos, this.pos);
      if (mouseNear.mag() < this.radius) {
        let ant = "Pathogen is anything that can cause a disease.\n"
        ant += "Could be a germ, a virus, etc.\n"
        ant += "The very reason why you need your immune system!";
        text(ant, this.radius + 10, 20);
      }
    }

    fill(0, this.lifespan * 255);
    noStroke();
    ellipse(1, 1, this.size, this.size);

    fill(this.red, this.green, this.blue, this.lifespan * 255);
    noStroke();
    ellipse(0, 0, this.size, this.size);

    fill(255, this.lifespan * 10);
    noStroke();
    for (let i = 0; i < 10; i ++) {
      rotate(frameCount * 0.001 * i);
      ellipse(0, 0, this.size * (i+1) / 10, this.size * (i+0.5) / 10);
    }
    pop();

    for (let i = 0; i < this.antigens.length; i ++) {
      let atg = this.antigens[i];
      atg.display();
    }
  }

  //-------------------------------
  //----------MyFunctions----------
  //-------------------------------

  applyForce(f) {
    let force = f.copy();
    force.div(this.mass);
    this.acc.add(force);
  }

  applyRepulsion(other) {
    let force = p5.Vector.sub(other.pos, this.pos);
    let distance = force.mag();
    let magnitude = 5 * this.mass * other.mass / distance / distance;
    force.normalize();
    force.mult(- magnitude);
    this.applyForce(force);
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

  detectAntibody(antibody) {
    if (antibody.type == this.type) {
      let vector = p5.Vector.sub(antibody.pos, this.pos);
      let distance = vector.mag();
      let abdVel = antibody.vel.mag();
      if (distance < this.radius) {
        this.lifespan -= 0.01;
      }
    }
  }

  exposeAntigen(phagocyte) {
    if (this.size < phagocyte.size) {
      this.lifespan -= 0.02;
    } else {
      for (let i = 0; i < this.antigens.length; i ++) {
        let atg = this.antigens[i];
        atg.switchCenter(phagocyte.pos, phagocyte.radius);
        let difference = abs(atg.radius - phagocyte.radius);
        if (difference < 1 && !this.signalSent) {
          phagocyte.sendOutSignal(this);
          this.signalSent = true;
        }
      }
    }
  }
}