class Antigen {
  constructor(angle, radius, color) {
    this.pos = createVector();
    this.angle = angle;
    this.radius = radius;
    this.red = color[0];
    this.green = color[1];
    this.blue = color[2];
    this.lifespan = 1;
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);

    fill(0, this.lifespan * 255);
    noStroke();
    ellipse(1, 1, 5, 5);
    
    fill(this.red, this.green, this.blue, this.lifespan * 255);
    noStroke();
    ellipse(0, 0, 5, 5);

    pop();
  }

  //-------------------------------
  //----------MyFunctions----------
  //-------------------------------

  follow(center) {
    this.center = center;
    let cosVal = quickCos(this.angle) * this.radius;
    let sinVal = quickSin(this.angle) * this.radius;
    this.pos.x = this.center.x + cosVal;
    this.pos.y = this.center.y + sinVal;
  }

  moveTowardsCenter() {
    this.radius *= 0.7;
  }

  switchCenter(target, new_radius) {
    this.target = target;
    let desired = p5.Vector.sub(target, this.center);
    let distance = desired.mag();
    desired.normalize();
    this.center.add(desired);
    if (new_radius > this.radius) {
      this.radius += random(0, 1);
    } else if (new_radius < this.radius) {
      this.radius -= random(0, 1);
    }
  }
}