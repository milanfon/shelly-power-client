const mqtt = require('mqtt');
const readLine = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});
const fs = require('fs');

const conf = {
    host: '', // Insert IP of your MQTT broker
    port: '', // MQTT port on the broker
    clientId: '', // ID of your client - choose whatever string - like MY_PC
    topic: '' // The topic you are subscribing to - like shellypro4pm-..../events/rpc
}

let sum = 0;
let lastTimestamp = 0;
let lastPower = 0;
let startTime = 0;

const urlString = `mqtt://${conf.host}:${conf.port}`;

function createFiles(dir){
    fs.writeFileSync(dir+'/log.csv', ["id", "ts", "apower"].map(i => i+';').join('')+'\r\n');
    fs.writeFileSync(dir+'/summary.json', "");
}

function addToLog(dir, o){
    fs.appendFileSync(dir+'/log.csv', [o.src, o.params.ts, o.params["switch:0"].apower].map(i => i+';').join('')+'\r\n');
}

function writeSummary(dir){
    const elapsedSecs = parseInt(((new Date())-startTime)/1000);
    fs.writeFileSync(dir+'/summary.json', JSON.stringify({
        totalPower: sum,
        elapsedTime: elapsedSecs,
        avgHourlyPower: (sum/elapsedSecs)*3600
    }));
}

readLine.question('Enter filename: ', (filename) => {
    readLine.write(`Creating test '${filename}'\n`);
    const dir = 'out/'+filename;
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
        createFiles(dir);
    } else {
        readLine.write('File already exists! Exiting...');
        process.exit();
    }

    const client = mqtt.connect(urlString, {clientId: conf.clientId});
    startTime = new Date();

    client.on('connect', () => {
        client.subscribe([conf.topic]);
    });

    client.on('message', (topic, payload) => {
        const o = JSON.parse(payload.toString());
        try {
            if (o?.params['switch:0'].hasOwnProperty('apower')){
                sum += (o.params.ts-lastTimestamp)*lastPower/3600;
                lastTimestamp = o.params.ts;
                lastPower = o.params['switch:0'].apower;
                addToLog(dir, o);
                console.log(sum);
            }
        } catch (e){
            console.log('Corupted packet received');
        }
    });

    process.stdin.on('keypress', (str, key) => {
        if (key.ctrl && key.name === 'x'){
            console.log('Saving results and ending...');
            client.removeAllListeners();
            writeSummary(dir);
            process.exit();
        }
    });
});



