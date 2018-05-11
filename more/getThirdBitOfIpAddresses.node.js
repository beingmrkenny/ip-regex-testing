const fs = require('fs');

var cidrJs = require("cidr-js");
var cidr = new cidrJs();

var blocks = [

];

fs.writeFileSync('../output/numbers.txt', '');

var generated = [];
for (let i = blocks.length-1; i>-1; i--) {
    for (let ip of cidr.list(blocks[i])) {
        let thirdBit = ip.replace(/\d+\.\d+\.(\d+)\.\d+/, '$1');
        if (generated.indexOf(thirdBit) < 0) {
            console.log(thirdBit);
            generated.push(thirdBit);
        }
    }
}

generated.sort((a, b) => {return a - b;});

for (let number of generated) {
    fs.appendFileSync('../output/numbers.txt', number + "\n");
}

fs.writeFileSync('../output/numbers.json', JSON.stringify(generated));
