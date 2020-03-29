class Antibody {
  constructor(type, pos) {
  	this.pos = createVector(pos.x, pos.y);
  	this.vel = createVector(random(-1, 1), random(-1, 1));
  	this.acc = createVector();

    this.maxSpeed = random(2, 3);
    this.maxSteerForce = random(0.01, 0.05);
    this.brakeRad = 20;
    this.lifespan = 1;
    this.paused = false;

    this.type = type;
    this.red = this.type[0];
    this.green = this.type[1];
    this.blue = this.type[2];
  }
  
  update() {
    this.pos.add(this.vel);
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.acc.mult(0);

    if (!this.paused) {
      this.lifespan -= 0.001;
    }

    this.angle = this.vel.heading();
  }
  
  display() {
    push();
    translate(this.pos.x, this.pos.y);

    if (params.Annotation) {
      fill(255, this.lifespan * 255);
      stroke(0, this.lifespan * 255);
      text("Antibody", 15, 0);

      let mouseNear = p5.Vector.sub(mousePos, this.pos);
      console.log(mouseNear.mag());
      let temp_vel = createVector();
      if (mouseNear.mag() < 15 && !this.paused) {
        this.paused = true;
      }

      if (mouseNear.mag() > 15) {
        this.paused = false;
      }

      if (this.paused) {
        this.vel.mult(0.98);
        let ant = "A type of protein produced specially to kill pathogens.\n"
        ant += "One antibody can only match and neutralize pathogens of the kind it is assigned.";
        text(ant, 10, 20);
      }
    }

    rotate(this.angle);

    strokeWeight(3);
    stroke(0, this.lifespan * 100);
    line(-15, 2, 0, 2);
    line(-15, -2, 0, -2);
    line(0, 2, 4, 6);
    line(0, -2, 4, -6);

    strokeWeight(2);
    stroke(this.red, this.green, this.blue, this.lifespan * 255);
    line(-15, 2, 0, 2);
    line(-15, -2, 0, -2);
    line(0, 2, 4, 6);
    line(0, -2, 4, -6);
  
    pop();
  }

  //-------------------------------
  //----------MyFunctions----------
  //-------------------------------

  applyForce(f) {
    let force = f.copy();
    this.acc.add(force);
  }
  
  seek(pathogen) {
    if (pathogen.type == this.type && !this.paused) {
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
  }
}