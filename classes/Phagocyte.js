class Phagocyte {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector();
    this.acc = createVector();

    this.maxSpeed = 3; // max speed;
    this.maxSteerForce = 0.03; // max steering force
    this.brakeRad = 150;

    this.radius = 50;
    this.size = this.radius * 2;

    this.particles = [];
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.angle = this.vel.heading();
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);
    
    if (params.Annotation) {
      fill(255);
      stroke(0);
      text("Phagocyte", this.radius + 10, 0);

      let mouseNear = p5.Vector.sub(mousePos, this.pos);
      if (mouseNear.mag() < this.radius) {
        let ant = "Ingests pathogens smaller than itself.\n";
        ant += "If unable to do so, sends a signal to T lymphocyte,\n";
        ant += "requesting its assistance.";
        text(ant, this.radius + 10, 20);
      }
    }

    let sinVal = quickSin(frameCount * 0.005) / 5 + 1;

    fill(0, 200);
    noStroke();
    ellipse(1, 1, this.size, this.size);

    rotate(this.angle);

    fill(240, 140, 40, 240 * sinVal);
    stroke(250, 180, 100, 200);
    strokeWeight(2);
    ellipse(0, 0, this.size, this.size);

    this.particles.push(new DisplayParticle(0, 0));
    for (let i = 0; i < this.particles.length; i ++) {
      let ptc = this.particles[i];
      ptc.update();
      ptc.display();
    }

    if (this.particles.length > 200) {
      this.particles.splice(0, 1);
    }

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

  ingest(pathogen) {
    let desired = p5.Vector.sub(pathogen.pos, this.pos);
    let distance = desired.mag();
    if (distance < 20 && this.vel.mag() < 3) {
      pathogen.exposeAntigen(this);
    }
  }

  seek(pathogen) {
    let desired = p5.Vector.sub(pathogen.pos, this.pos);
    let distance = desired.mag();
    desired.normalize();
    
    if(distance < this.brakeRad){
      let mappedSpeed = map(distance, 0, this.brakeRad, 0, this.maxSpeed);
      desired.mult(mappedSpeed);
    } else {
      desired.mult(this.maxSpeed);
    }

    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxSteerForce);
    this.applyForce(steer);
  }

  sendOutSignal(pathogen) {
    signals.push(new Signal(pathogen.type, this.pos));
    if (!tcell.triggered) {
      let startForce = createVector(7, 7);
      tcell.applyForce(startForce);
    }
    tcell.triggered = true;
    let currentPathogen = pathogens.shift();
    pathogens.push(currentPathogen);
  }

  stop() {
    this.vel.mult(0.95);
  }
}



class DisplayParticle {
  constructor(x, y) {
    this.initPos = createVector(x, y);
    this.radius = 0;
    this.angle = random(0, TWO_PI);
    this.size = random(2, 10);
    this.speed = random(0.2);
    this.clr = color(150, 50, 20, random(150));
  }

  update() {
    this.radius += this.speed;
  }

  display() {
    push();
    translate(this.initPos.x, this.initPos.y);
    rotate(this.angle);
    fill(this.clr);
    noStroke();
    ellipse(this.radius, 0, this.size, this.size);
    pop();
  }
}