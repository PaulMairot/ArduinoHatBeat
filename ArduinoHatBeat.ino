#define echoPin 9
#define trigPin 10

#include "pitches.h"
#include <TM1637Display.h>
#include <math.h>

// Define the connections pins
#define CLK 3
#define DIO 4

// Create a display object of type TM1637Display
TM1637Display display = TM1637Display(CLK, DIO);

// Create an array that turns all segments ON
const uint8_t allON[] = {0xff, 0xff, 0xff, 0xff};

// Create an array that turns all segments OFF
const uint8_t allOFF[] = {0x00, 0x00, 0x00, 0x00};

// Create an array that sets individual segments per digit to display the word "dOnE"
const uint8_t done[] = {
  SEG_B | SEG_C | SEG_D | SEG_E | SEG_G,           // d
  SEG_A | SEG_B | SEG_C | SEG_D | SEG_E | SEG_F,   // O
  SEG_C | SEG_E | SEG_G,                           // n
  SEG_A | SEG_D | SEG_E | SEG_F | SEG_G            // E
};

long duration;

int distance1=0;
int distance=0;

void setup() {
  Serial.begin(9600);   
  
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);

  // Volume Input
  pinMode(A0, INPUT);
  
  // Joystick Input
  pinMode(A1, INPUT);

  // Luminosity Input
  pinMode(A3, INPUT);
}

float ultrasonicRead () {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);

  digitalWrite(trigPin, HIGH);
  delayMicroseconds(5);
  digitalWrite(trigPin, LOW);

  duration = pulseIn(echoPin, HIGH);

  distance = duration * 0.034/2;

  return distance;

}

String toSend = "";

void loop() {

  int select = analogRead(A1);

  display.setBrightness(4);

  distance1 = ultrasonicRead();
  int distanceInt = (distance1 * 100);

  int vol = analogRead(A0);
  vol = map(vol, 0, 1023, 0, 100);

  int lum = analogRead(A3);

  if(distance1 > 2 && distance1 < 28) {
    // If hand is between a 2-28 [cm] range
    display.setSegments(allON);
    display.showNumberDecEx(distanceInt,0b11100000	,true,4,0);
  } else {
    display.setSegments(allOFF);
    distance1 = 0;
  }

  // Data to send
  toSend = (String) distance1 + "," + (String) vol + "," + (String) select + "," + (String) lum;
  Serial.println(toSend);
  
  delay(1000);
  
}