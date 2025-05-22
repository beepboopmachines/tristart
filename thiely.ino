#include <WiFiS3.h>

  

// WiFi credentials

const char* ssid = "xxxxx";

const char* password = "xxxxxx";


// Node.js server IP and port

const char* serverIP = "xxxxx";

const uint16_t serverPort = xxxxxxx;

  

WiFiClient client;

  

// LED 1

const int red1 = 3;

const int green1 = 5;

const int blue1 = 6;

  

// LED 2

const int red2 = 9;

const int green2 = 10;

const int blue2 = 11;

  

// LED 3

const int red3 = 7;

const int green3 = 8;

const int blue3 = 12;

  

// LED 4 (no PWM)

const int red4 = A0;

const int green4 = A1;

const int blue4 = A2;

  

// LED 5 (no PWM)

const int red5 = A3;

const int green5 = A4;

const int blue5 = A5;

  

// Store all pins in arrays for easier control

const int greenPins[5] = {red1, red2, red3, red4, red5};

const int bluePins[5] = {green1, green2, green3, green4, green5};

const int redPins[5] = {blue1, blue2, blue3, blue4, blue5};

  

void setupLEDs() {

for (int i = 0; i < 5; i++) {

pinMode(redPins[i], OUTPUT);

pinMode(greenPins[i], OUTPUT);

pinMode(bluePins[i], OUTPUT);

}

}

  

// For LEDs 4 and 5 (no PWM) do simple thresholding with inverted logic (common anode)

void setDigitalLED(int redPin, int greenPin, int bluePin, int r, int g, int b) {

digitalWrite(redPin, r > 127 ? LOW : HIGH);

digitalWrite(greenPin, g > 127 ? LOW : HIGH);

digitalWrite(bluePin, b > 127 ? LOW : HIGH);

}

  

// Set color of one LED (0-based index)

void setLEDColor(int ledIndex, int r, int g, int b) {

if (ledIndex < 0 || ledIndex >= 5) return;

  

int ri = 255 - r; // invert for common anode

int gi = 255 - g;

int bi = 255 - b;

  

// LEDs 1–3 use PWM analogWrite

if (ledIndex < 3) {

analogWrite(redPins[ledIndex], ri);

analogWrite(greenPins[ledIndex], gi);

analogWrite(bluePins[ledIndex], bi);

} else {

// LEDs 4–5 use digital on/off approximation

setDigitalLED(redPins[ledIndex], greenPins[ledIndex], bluePins[ledIndex], r, g, b);

}

}

  

void setup() {

Serial.begin(9600);

delay(500);

setupLEDs();

  

Serial.println("Connecting to WiFi...");

WiFi.begin(ssid, password);

while (WiFi.status() != WL_CONNECTED) {

delay(500);

Serial.print(".");

}

Serial.println("\nWiFi connected");

  

Serial.println("Connecting to Node.js server...");

while (!client.connect(serverIP, serverPort)) {

Serial.println("Retrying connection to server...");

delay(1000);

}

Serial.println("Connected to Node.js server");

}

  

String inputBuffer = "";

  

void loop() {

while (client.available()) {

char c = client.read();

if (c == '\n') {

// Parse inputBuffer, format: ledNumber,r,g,b

int ledNum, r, g, b;

int parsed = sscanf(inputBuffer.c_str(), "%d,%d,%d,%d", &ledNum, &r, &g, &b);

if (parsed == 4) {

Serial.print("Set LED ");

Serial.print(ledNum);

Serial.print(" to RGB(");

Serial.print(r);

Serial.print(", ");

Serial.print(g);

Serial.print(", ");

Serial.print(b);

Serial.println(")");

setLEDColor(ledNum - 1, r, g, b); // leds numbered 1 to 5, convert to 0-based index

} else {

Serial.print("Invalid message: ");

Serial.println(inputBuffer);

}

inputBuffer = "";

} else {

inputBuffer += c;

}

}

  

// Reconnect if disconnected

if (!client.connected()) {

Serial.println("Disconnected, reconnecting...");

while (!client.connect(serverIP, serverPort)) {

delay(1000);

}

Serial.println("Reconnected");

}

}