"use strict";

//----------------------------------
//----------GUI parameters----------
//----------------------------------

let params = {
  Automatic: true,
  Annotation: false,
  Size: 75,
  AntigenColor: [255, 180, 0]
};

let gui = new dat.GUI();
gui.add(params, "Automatic");
gui.add(params, "Annotation");
gui.add(params, "Size", 50, 200).step(1);
gui.addColor(params, "AntigenColor");

//-----------------------------
//----------variables----------
//-----------------------------

let SIN_ARRAY = [];
let COS_ARRAY = [];

let pathogens = [];
let phagocyte;
let signals = [];
let tcell;
let bcells = [];
let antibodies = [];
let total_num_of_objects = 0;

let red_noise = 50;
let green_noise = 20;
let blue_noise = 20;

let mousePos;

//-----------------------------
//----------functions----------
//-----------------------------

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);

  for (let a = 0; a < 360; a ++) {
    let rad = radians(a);
    SIN_ARRAY.push(sin(rad));
    COS_ARRAY.push(cos(rad));
  }

  phagocyte = new Phagocyte(width + 50, height + 50);
  tcell = new Tcell(-50, -50);

}

function draw() {

  total_num_of_objects = pathogens.length + bcells.length + signals.length + antibodies.length + 2;
  red_noise = 50 * noise(frameCount * 0.01) - total_num_of_objects;
  green_noise = 30 * noise(frameCount * 0.005) - total_num_of_objects;
  blue_noise = 40 * noise(frameCount * 0.005) - total_num_of_objects;
  background(180 + red_noise, 90 + green_noise, 100 + blue_noise);

  mousePos = createVector(mouseX, mouseY);

  //-----------------------------------------------
  //----------PathogenAutomaticGeneration----------
  //-----------------------------------------------

  if (frameCount % 200 == 0) {
    let bool = random(10);
    if (pathogens.length < 10 && bool > 3 && params.Automatic) {
      let this_size = random(50, 200);
      let this_color = [random(255), random(255), random(255)];
      pathogens.push(new Pathogen(random(width), random(height), this_size, this_color));
    }
  }

  //-------------------------------------
  //----------PathogenBehaviors----------
  //-------------------------------------

  for (let i = 0; i < pathogens.length; i ++) {
    let ptg = pathogens[i];

    for (let j = 0; j < pathogens.length; j ++) {
      if (i != j) {
        ptg.applyRepulsion(pathogens[j]);
        ptg.checkCollision(pathogens[j]);
      }
    }

    for (let j = 0; j < antibodies.length; j ++) {
      let abd = antibodies[j];
      ptg.detectAntibody(abd);
    }

    if (ptg.lifespan < 0.01) {
      ptg.antigens.splice(0, ptg.numOfAntigens);
      pathogens.splice(i, 1);
    }

    ptg.checkEdges();
    ptg.update();
    ptg.display();
  }

  //--------------------------------------
  //----------PhagocyteBehaviors----------
  //--------------------------------------
  
  if (pathogens.length > 0) {
    let frst_ptg = pathogens[0];
    phagocyte.seek(frst_ptg);
    phagocyte.ingest(frst_ptg);
  } else {
    phagocyte.stop();
  }

  for (let i = 0; i < bcells.length; i ++) {
    phagocyte.checkCollision(bcells[i]);
  }

  phagocyte.checkCollision(tcell);
  phagocyte.update();
  phagocyte.display();

  //----------------------------------
  //----------TCellBehaviors----------
  //----------------------------------

  if (tcell.triggered) {
    tcell.update();
    tcell.display();
    if (tcell.in_screen) {
      tcell.checkEdges();
    }
    for (let i = 0; i < bcells.length; i ++) {
      tcell.checkCollision(bcells[i]);
    }
    tcell.checkCollision(phagocyte);
  }

  //----------------------------------
  //----------BCellBehaviors----------
  //----------------------------------

  for (let i = 0; i < bcells.length; i ++) {
    let bcl = bcells[i];
    bcl.update();
    bcl.checkEdges();
    
    if (!bcl.grown) {
      bcl.grow();
    } else if (!bcl.antibodySent) {
      bcl.sendAntibodies();
    }

    bcl.checkCollision(phagocyte);
    bcl.checkCollision(tcell);
    bcl.display();
    if (bcl.lifespan < 0.05) {
      bcells.splice(i, 1);
    }
  }

  //-----------------------------------
  //----------SignalBehaviors----------
  //-----------------------------------

  for (let i = 0; i < signals.length; i ++) {
    let sgn = signals[i];
    sgn.update();
    sgn.display();
    sgn.seek(tcell);
    if (sgn.targetFound) {
      signals.splice(i, 1);
    }
  }

  //-------------------------------------
  //----------AntibodyBehaviors----------
  //-------------------------------------

  for (let i = 0; i < antibodies.length; i ++) {
    let abd = antibodies[i];
    abd.update();
    abd.display();
    if (pathogens.length > 0) {
      abd.seek(pathogens[i % pathogens.length]);
    }
    if (abd.lifespan < 0.01) {
      antibodies.splice(i, 1);
    }
  }
}

function mouseClicked() {
  if (mouseX < 1108 || mouseY > 187) {
    if (pathogens.length < 20) {
      pathogens.push(new Pathogen(mouseX, mouseY, params.Size, params.AntigenColor));
    }
  }
}

function quickCos(angle) {
  angle = angle % (2 * PI);
  let deg = int(degrees(angle));
  return COS_ARRAY[deg];
}

function quickSin(angle) {
  angle = angle % (2 * PI);
  let deg = int(degrees(angle));
  return SIN_ARRAY[deg];
}