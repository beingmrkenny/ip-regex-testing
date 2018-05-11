const fs = require('fs');

var cidrJs = require("cidr-js");
var cidr = new cidrJs();

var blocks = [

];

fs.writeFileSync('../output/generatedIps.txt', '');

var generated = [];
for (let i = blocks.length-1; i>-1; i--) {
    for (let ip of cidr.list(blocks[i])) {
        let firstBit = ip.replace(/(\.\d+$)/, '');
        if (generated.indexOf(firstBit) < 0) {
            console.log(firstBit);
            generated.push(firstBit);
            fs.appendFileSync('../output/generatedIps.txt', firstBit + "\n");
        }
    }
}

fs.writeFileSync('../output/generatedIps.json', JSON.stringify(generated));
