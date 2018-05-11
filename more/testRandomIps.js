const IP = require('../ip');

function randomByte() {
    return Math.round(Math.random()*256);
}

function randomIp() {
    return randomByte() + '.' +
           randomByte() + '.' +
           randomByte() + '.' +
           randomByte();
}

var ipsToTest = [];

for (let i = 0; i < 9999999; i++) {
    ipsToTest.push(randomIp());
}

for (let ip of ipsToTest) {
    if (IP.check(ip)) {
        console.log(`${ip} matches`);
    }
}
