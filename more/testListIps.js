const IP = require('../ip');

var ipsToTest = IP.generateList();

var rejectCount = 0;
var passCount = 0;

console.time('testIps');
for (let ip of ipsToTest) {
    if (IP.check(ip)) {
        passCount++;
    } else {
        rejectCount++;
        console.log(`${ip} has been rejected`);
    }
}
console.timeEnd('testIps');

console.log("\n");
console.log('tested: ' + ipsToTest.length);
console.log(`Passed: ${passCount}`);
console.log(`Rejected: ${rejectCount}`);
