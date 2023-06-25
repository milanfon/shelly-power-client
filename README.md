# Shelly Power Client

This script is used to receive power data from Shelly power meters / smart switches (_like Pro 4PM used here_).

README is WIP

## How to set up

TBD

## How to run

1. Install [Node.js](https://nodejs.org/en).
2. Navigate into the script folder and run `npm install` which install required modules into the folder (_like MQTT connector_).
3. In the `app.js` script add your own config for MQTT broker.
4. Run `node app.js` in the root folder to start the app.
5. You are going to be prompted to enter the name of the measurement. You should use anything that is allowed in you OS.
6. Wait until the value `0` appears and then you can start you testing. 
7. To save the measurement and quit, press <kbd>Ctrl</kbd> + <kbd>x</kbd>.
8. You are going to find your measurement in the folder `out/`.