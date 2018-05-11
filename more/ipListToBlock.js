var cidrJs = require("cidr-js");
var cidr = new cidrJs();
const fs = require('fs');

var newlist = [

];

var results = cidr.getBlocks(newlist);

fs.writeFileSync('../output/blocks.txt', '');
for (let i = 0, x = results.length; i<x; i++) {
    fs.appendFileSync('../output/blocks.txt', results[i] + "\n");
}
