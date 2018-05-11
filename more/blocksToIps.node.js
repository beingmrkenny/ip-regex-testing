const fs = require('fs');

var cidrJs = require("cidr-js");
var cidr = new cidrJs();

var blocks = [

];

fs.writeFileSync('../output/generatedIps.txt', '');

var generated = [];
for (let i = blocks.length-1; i>-1; i--) {
    for (let ip of cidr.list(blocks[i])) {
        generated.push(ip);
        fs.appendFileSync('../output/generatedIps.txt', ip + "\n");
    }
}

fs.writeFileSync('../output/generatedIps.json', JSON.stringify(generated));
