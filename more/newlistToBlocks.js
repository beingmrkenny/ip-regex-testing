var cidrJs = require("cidr-js");
var cidr = new cidrJs();
const fs = require('fs');

var newlist = [];

var results = cidr.getBlocks(newlist);

fs.writeFileSync('../output/newlist.js', 'var newlistblocks = ' + JSON.stringify(results) + ";\n\n");
