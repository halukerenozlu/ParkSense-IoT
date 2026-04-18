#include <ESP8266WiFi.h>
#include <FirebaseArduino.h>
#include "config.h"

// Flash tuşu (ESP8266'daki D3 pinine bağlı)
#define FLASH_BUTTON_PIN 0

bool oncekiDurum = HIGH; 
int basmaSayisi = 0;     

void setup() {
  Serial.begin(9600); 
  delay(1000);

  Serial.println("WiFi ağına bağlanılıyor...");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi bağlantısı tamamlandı!");
  Serial.print("Alınan IP adresi: ");
  Serial.println(WiFi.localIP()); 

  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);

  pinMode(FLASH_BUTTON_PIN, INPUT_PULLUP); 
}

void loop() {
  
  bool flashButtonState = digitalRead(FLASH_BUTTON_PIN);

  
  if (flashButtonState == LOW && oncekiDurum == HIGH) {
    basmaSayisi++; 

   
    if (basmaSayisi % 2 == 1) {
      Firebase.setString("Otopark/Durum", "Otopark bos");
      Serial.println("Firebase'e 'Otopark bos' verisi gönderildi.");
    } else {
      Firebase.setString("Otopark/Durum", "Otopark dolu");
      Serial.println("Firebase'e 'Otopark dolu' verisi gönderildi.");
    }

    
    if (Firebase.failed()) {
      Serial.print("Veri gönderim hatası ");
      Serial.println(Firebase.error());
    }
  }

 
  oncekiDurum = flashButtonState;

  delay(100); 
}
