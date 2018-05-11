 function generateList () {
    var cidrJs = require("cidr-js");
    var cidr = new cidrJs();

    var blocks = [
    ];

    var generated = [];
    for (let i = blocks.length-1; i>-1; i--) {

        if (blocks[i].includes('/')) {
            for (let ip of cidr.list(blocks[i])) {
                generated.push(ip);
            }
        } else {
            generated.push(blocks[i]);
        }

    }

    return generated;
}

var generated = generateList();

var newlist = [
];

var problemExists = false;

for (let ip of newlist) {
    if (generated.indexOf(ip) == -1) {
        problemExists = true;
        console.log(`${ip} is in newlist, but not in generated`);
    }
}

for (let ip of generated) {
    if (newlist.indexOf(ip) == -1) {
        problemExists = true;
        console.log(`${ip} is in generated, but not in newlist`);
    }
}

if (!problemExists) {
    console.log('🎉 Blocks are valid');
}
