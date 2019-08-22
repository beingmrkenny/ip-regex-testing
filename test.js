const fs = require('fs-extra');
const colors = require('colors');
const cidrJs = require("./cidr.js");
const cidr = new cidrJs();
const progressBar = require('progress');
const message = function (message) {
    console.log('\n');
    console.log(message.white.bgMagenta);
    console.log('\n');
}

const ipFilePath = process.argv.slice(2)[0] || 'ip';
const regexFilePath = process.argv.slice(2)[1] || 'regex';

fs.emptyDirSync(__dirname+'/output');

var ips, regexes = [];

try {
    const ipFileContents = fs.readFileSync(ipFilePath, null, (err, data) => console.log(data)).toString();
    ips = ipFileContents.split(/\s+/)
        .filter( (value, index, self) => self.indexOf(value) === index )
        .filter(value => value.length);
} catch (err) {
    message('There was a problem processing the IP list file. Please make sure it exists at the path you gave and that node is permitted to read it');
    throw err;
}

try {
    const regexFileContents = fs.readFileSync(regexFilePath, null, (err, data) => console.log(data)).toString();
    const patterns = regexFileContents.split(/\s+/)
        .filter( (value, index, self) => self.indexOf(value) === index )
        .filter(value => value.length);
    for (let pattern of patterns) {
        regexes.push(new RegExp(pattern));
    }
} catch (err) {
    message('There was a problem processing the regex list file. Please make sure you have specified the correct file and that node is permitted to read it.');
    throw err;
}

// Generate every possible IP and save the matching IPs

console.log('Now checking all 4,294,967,296 possible IP addresses');

var start = new Date(),
    i = 0,
    ip,
    found = [],
    lastB1;
    bar = new progressBar('[:bar] :percent :elapseds/:etas', {
        total: 256, width: 80, complete: '.', incomplete: ' ' }
    );

while (true) {

    let b1 = (i >> 24) & 0xff;
    let b2 = (i >> 16) & 0xff;
    let b3 = (i >>  8) & 0xff;
    let b4 = (i)       & 0xff;

    i++;

    ip = `${b1}.${b2}.${b3}.${b4}`;

    for (let regex of regexes) {
        if (regex.test(ip)) {
            found.push(ip);
        }
    }

    if (lastB1 != b1) {
        bar.tick();
        lastB1 = b1;
    }

    if (b1 == 1 && b2 == 255 && b3 == 255 && b4 == 255) {
        break;
    }

}

message(`Regex matched ${found.length} IPs. Process took ${Math.round((new Date() - start) / (1000 * 60))} mins.`);

fs.writeFileSync('output/matchingCheck.js', 'var found = ' + JSON.stringify(found) + ";\n\n");

// Generate a list from the cidr block / ips list
var generated = [];
for (let i = ips.length-1; i>-1; i--) {
    if (ips[i].includes('/')) {
        for (let generatedIp of cidr.list(ips[i])) {
            generated.push(generatedIp);
        }
    } else {
        generated.push(ips[i]);
    }
}
fs.appendFileSync('output/matchingCheck.js', 'var generated = ' + JSON.stringify(generated) + ";\n\n");

var falseMatches = false;
var missedIPs = false;

for (let ip of found) {
    fs.appendFileSync('output/matchedIPs.txt', ip+'\n');
    if (generated.indexOf(ip) == -1) {
        falseMatches = true;
        fs.appendFileSync('output/falseMatches.txt', ip+'\n');

    }
}

for (let ip of generated) {
    if (found.indexOf(ip) == -1) {
        missedIPs = true;
        fs.appendFileSync('output/missedIPs.txt', ip+'\n');
    }
}

if (falseMatches) {
    message('😱 regex falsely identified at least one invalid IP as a match, see the output folder for more information');
}

if (missedIPs) {
    message('😔 regex failed to identify at least one valid IP, see the output folder for more information');
}

if (!falseMatches && !missedIPs) {
    message('🎉 Checked every possible IP (4.3 billion!) against the regex(es). Every matching IP was correctly identified and no non-matching IPs were identified. Congratulations!');
}
