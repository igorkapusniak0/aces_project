// Pin Assignment
const int rightIndicatorPIN = 2;
const int leftIndicatorPIN = 4;  
const int brakePIN = 7;
const int steeringWheelPIN = A0;  
const int speedPIN = A1;


// Address Assignement for serial to button translation
const uint8_t LI_Address = 0x0;
const uint8_t RI_Address = 0x1;
const uint8_t SA_Address = 0x2;
const uint8_t VS_Address = 0x3;
const uint8_t BRAKE_Address = 0x4;

// Constants
const uint16_t indicatorTimeDuration = 20000;

// Global variables
boolean rightIndicator = 0;
boolean leftIndicator = 0;
boolean brake = 0;
uint16_t steeringWheel = 0;
uint16_t speed = 0;
long LI_Time = 0;
long RI_Time = 0;
long time = millis();
boolean new_turn = false;
long turnTimer = 0;


void setup() {
  Serial.begin(9600);
  pinMode(rightIndicatorPIN, INPUT);
  pinMode(leftIndicatorPIN, INPUT);
  pinMode(brakePIN, INPUT);
}

uint16_t speed_map(uint16_t value){
  uint16_t minVal = 445;
  uint16_t maxVal = 575;
  uint16_t map_range = 1023;

  float scale = (float)(value - minVal) / (maxVal - minVal);
  uint16_t retVal = scale * map_range;

  if (retVal > 1023){
    retVal = 0;
  }

  return retVal;
}


uint16_t steering_map(uint16_t value){
  float expansion;
  if(value < 512){
    value = map(0,512,212,511,value);
  }
  else if (value > 512){
    value = map(513, 1023, 513, 813, value);
  }
  
  return value;
}

uint16_t speed_check(uint16_t value){
  if(value <= 50){
    value = 0;
  }
  else if (value >= 973){
    value = 1023;
  }
  else if(value >= 412 && value <= 812){
    value = 512;
  }
  
  return value;
}

uint16_t map(uint16_t minVal, uint16_t maxVal, uint16_t minMap, uint16_t maxMap, uint16_t input){
  float scale = (float) (input - minVal) / (maxVal - minVal);
  uint16_t retVal = (scale * (maxMap - minMap)) + minMap;
  return retVal;
}

uint16_t speed_check2(uint16_t value){
  if(value <= 250){
    value = map(0,250,300,511,value);
  }
  else if(value > 250 && value < 650){
    value = 512;

  }
  else if (value >= 650){
    value = map(650,1023,513,850,value);

  }
  
  return value;
}

// check if turn has occured
boolean turn_check(uint16_t value){
  boolean turned = false;
  if((value >= 0 && value <= 200) || (value >= 823 && value <= 1023)){
    turned = true;
  }
  return turned;
}

void loop() {

  // get data from pins
  rightIndicator = digitalRead(rightIndicatorPIN);
  leftIndicator = digitalRead(leftIndicatorPIN);
  brake = digitalRead(brakePIN);
  steeringWheel = analogRead(steeringWheelPIN);
  speed = analogRead(speedPIN);
  


  
  steeringWheel = steering_map(steeringWheel);

   speed = speed_map(speed);
   speed = speed_check2(speed);

  //set start time of loop
  time = millis();

  // start right indicator timer
  if(rightIndicator && RI_Time == 0){
    RI_Time = millis();
  }
  // start left indicator timer
  if(leftIndicator && LI_Time == 0){
    LI_Time = millis();
  }

  if(!new_turn){
    new_turn = turn_check(steeringWheel);
    turnTimer = millis();
  }
  
  if (LI_Time != 0 && ((time - LI_Time)<= indicatorTimeDuration)){
    leftIndicator = true;
  }
  else{
    leftIndicator = false;
    LI_Time = 0;
  }

  if (RI_Time != 0 && ((time - RI_Time)<= indicatorTimeDuration)){
    rightIndicator = true;
  }
  else{
    rightIndicator = false;
    RI_Time = 0;
  }

  if(time - turnTimer >= 5000){
    
    leftIndicator = false;
    LI_Time = 0;
    rightIndicator = false;
    RI_Time = 0;
    turnTimer = millis();
    new_turn = false;
  }

if (leftIndicator && rightIndicator) {
  if (LI_Time < RI_Time) { 
    leftIndicator = false;
    LI_Time = 0;
  } else { 
    rightIndicator = false;
    RI_Time = 0;
  }
}


  //Send data via serial
  Serial.print(LI_Address);
  Serial.print(",");
  Serial.println(leftIndicator);

  Serial.print(RI_Address);
  Serial.print(",");
  Serial.println(rightIndicator);

  Serial.print(SA_Address);
  Serial.print(",");
  Serial.println(steeringWheel);

  Serial.print(VS_Address);
  Serial.print(",");
  Serial.println(speed);

  Serial.print(BRAKE_Address);
  Serial.print(",");
  Serial.println(brake);

  delay(20);
}
