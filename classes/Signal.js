class Signal {
	constructor(color, pos) {
    this.initPos = createVector(pos.x, pos.y);

    this.pos = createVector(pos.x, pos.y);
    this.vel = createVector();
    this.acc = createVector();

    this.info = color;
    this.maxSpeed = 0.2;

    this.red = color[0];
    this.green = color[1];
    this.blue = color[2];

    this.targetFound = false;
    this.paused = false;
	}

	update() {
    this.pos.add(this.vel);
    this.vel.add(this.acc);
    this.acc.mult(0);
    this.vel.mult(0.96);
	}

  display() {
    push();
    translate(this.pos.x, this.pos.y);

    if (params.Annotation) {
      fill(255, this.lifespan * 255);
      stroke(0, this.lifespan * 255);
      text("Antigen", 10, 0);

      let mouseNear = p5.Vector.sub(mousePos, this.pos);
      console.log(mouseNear.mag());
      let temp_vel = createVector();
      if (mouseNear.mag() < 50 && !this.paused) {
        this.paused = true;
      }

      if (mouseNear.mag() > 50) {
        this.paused = false;
      }

      if (this.paused) {
        let ant = "Contains unique information about a certain type of pathogen.\n";
        ant += "By studying antigens, your immune system provides specialized treatment\n";
        ant += "towards different kinds of pathogens.";
        text(ant, 10, 20);
      }
    }

    fill(0, 150);
    noStroke();
    ellipse(1, 1, 7, 7);
    
    fill(this.red, this.green, this.blue);
    noStroke();
    ellipse(0, 0, 7, 7);
    
    pop();
  }

  //-------------------------------
  //----------MyFunctions----------
  //-------------------------------

  applyForce(f) {
    let force = f.copy();
    this.acc.add(force);
  }

  seek(Tcell) {
    if (!this.paused) {
    	let desired = p5.Vector.sub(Tcell.pos, this.pos);
    	let distance = desired.mag();
    	desired.normalize();
    	desired.mult(this.maxSpeed)
    	this.applyForce(desired);
    	if (distance < 5) {
    		Tcell.generateB(this.info);
     		this.targetFound = true;
    	}
    }
  }
}