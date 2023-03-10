let serial; // variable to hold an instance of the serialport library
let portName = "/dev/tty.usbmodem101"; // fill in your serial port name here
let msg;

let width = window.innerWidth;
let height = window.innerHeight;

let inData;

let h1;

let song1, song2, amp;
let checkboxSong;

let songs = [];

let songPlaying = false;

let vol = 0;
let distance = 0;
let selection = 0;
let luminosity = 1000;

const maxSongs = 3;
let currentSong = 0;

let space = 10;
let barHeight = 30;

let diameter;
let previousDiameter;

var xValues = [];
var yValues = [];

function crookedCircle(radius, steps, centerX, centerY) {
  for (var i = 0; i < steps; i++) {
      xValues[i] = centerX + radius * Math.cos(2 * Math.PI * i / steps);
      yValues[i] = centerY + radius * Math.sin(2 * Math.PI * i / steps);
  }
  beginShape();
  for(let i = 0; i < steps; i ++) {
      vertex(xValues[i] + random(-5, 2), yValues[i] + random(-2, 2));
  }
  endShape(CLOSE);
}

function checkBoxEvent() {
  if (checkboxSong.checked()) {
    songPlaying = true;
    songs[currentSong].play();
  } else {
    songPlaying = false;
    songs[currentSong].pause();
  }
}

function changeSong(up) {

  if (up) {
    songs[currentSong].stop();
    if (currentSong == maxSongs && up) {
      currentSong = 0;
    } else {
      currentSong++
    }
    songs[currentSong].play();
  } else {
    songs[currentSong].stop();
    if (currentSong == 0) {
      currentSong = maxSongs;
    } else {
      currentSong--;
    }
    songs[currentSong].play();
  }
}

function setup() {

  for (let i = 0; i <= maxSongs; i++) {
    songs.push(loadSound(`assets/song${i}.mp3`));
  }

  amp = new p5.Amplitude();


  checkboxSong = select('#songCheckBox');
  checkboxSong.changed(checkBoxEvent);

  createCanvas(width, height);

  fill('#000000');

  h1 = select('#speed');
  // serial
  serial = new p5.SerialPort(); // make a new instance of the serialport library
  serial.on("list", printList); // set a callback function for the serialport list event
  serial.on("connected", serverConnected); // callback for connecting to the server
  serial.on("open", portOpen); // callback for the port opening
  serial.on("data", serialEvent); // callback for when new data arrives
  serial.on("error", serialError); // callback for errors
  serial.on("close", portClose); // callback for the port closing

  serial.list(); // list the serial ports
  serial.open(portName); // open a serial port
}

// get the list of ports:
function printList(portList) {
  // portList is an array of serial port names
  for (var i = 0; i < portList.length; i++) {
    // Display the list the console:
    console.log(i + ": " + portList[i]);
  }
}

function serverConnected() {
  console.log("connected to server.");
}

function portOpen() {
  console.log("the serial port opened.");
}

function serialEvent() {
  inData = serial.readLine();
  inData = split(inData, ',');

  distance = inData[0];
  vol = inData[1];
  selection = inData[2];
  luminosity = inData[3];

  if (selection > 580) {
    changeSong(true);
  } else if (selection < 480) {
    changeSong(false);
  }

  if (distance != 0) {
    previousDiameter = diameter;
    diameter = 10 * distance;
  } else {
    diameter = 10;
  }

  vol = parseFloat(vol);
}

function serialError(err) {
  console.log("Something went wrong with the serial port. " + err);
}

function portClose() {
  console.log("The serial port closed.");
}

function draw() {

  background("#3c3c3c");
  
  fill("#333333");
  for (let i = 0; i < 15; i++) {
    rect(width/2 - 7*space + i * space, height/2, 5, barHeight, 20);
  }

  fill("#ffffff");


  if(songPlaying) {

    crookedCircle(diameter/2, 50, width/2, height/4);

    if (distance) {
    
      h1.html(distance + " cm");
  
      if (distance == 0) {
        h1.html("Mettre la main devant la boîte pour faire varier la vitesse");
        songs[currentSong].rate(1);
      } else {
        console.log("changeSpeed");
        songs[currentSong].rate(map(parseFloat(distance), 2.0, 28.0, 0.5, 1.5));
      }
    }
    
    if (vol) {
      for (let i = 0; i < map(vol, 0, 100, 0, 15); i++) {
        rect(width/2 - 7*space + i * space, height/2, 5, barHeight, 20);
      }
      songs[currentSong].setVolume(map(vol, 0, 100, 0.0, 0.1));
    }
    
    
  } else {
    circle(width/2, height/4, diameter);
  }

  if (luminosity && songs[maxSongs].isLoaded()) {
    let checkbox = document.querySelector('#songCheckBox');
    if (luminosity < 200 && songPlaying == false) {
      // Play
      checkbox.checked = true;
      checkBoxEvent();
    } else if (luminosity > 200) {
      // Stop
      checkbox.checked = false;
      checkBoxEvent();
    }
  }
}