const IP = require('../ip');

var ipsToTest = IP.generateList();

console.time('testIps');
for (let i = 0; i<9999; i++) {
    for (let ip of ipsToTest) {
        IP.check(ip);
    }
}
console.timeEnd('testIps');
