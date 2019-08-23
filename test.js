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

console.log('\n1/3: Checking all 4,294,967,296 possible IP addresses to find the ones your regex matches ...');

var start = new Date(),
    i = 0,
    ip,
    found = [],
    bar = new progressBar('[:bar] :percent :elapseds :rate IPs per sec', {
        total: 4294967296, width: 80, complete: '.', incomplete: ' ' }
    );

while (true) {

    let b1 = (i >> 24) & 0xff;
    let b2 = (i >> 16) & 0xff;
    let b3 = (i >>  8) & 0xff;
    let b4 = (i)       & 0xff;

    bar.tick();

    i++;

    ip = `${b1}.${b2}.${b3}.${b4}`;

    for (let regex of regexes) {
        if (regex.test(ip)) {
            found.push(ip);
        }
    }

    if (b1 == 255 && b2 == 255 && b3 == 255 && b4 == 255) {
        break;
    }

}

// fs.writeFileSync('output/matchingCheck.js', 'var found = ' + JSON.stringify(found) + ";\n\n");

console.log(`Matched ${found.length} IPs. Process took ${Math.round((new Date() - start) / (1000 * 60))} mins.`);

// Generate a list from the cidr block / ips list
console.log('\nGenerating full list of IPs regex should match ...');
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
// fs.appendFileSync('output/matchingCheck.js', 'var generated = ' + JSON.stringify(generated) + ";\n\n");

var falseMatchCount = 0,
    missedIPCount = 0;

console.log('\n2/3: Checking for false matches ...');
bar = new progressBar('[:bar] :percent :elapseds :rate IPs per sec', {
    total: found.length, width: 80, complete: '.', incomplete: ' ' }
);
for (let ip of found) {
    bar.tick();
    fs.appendFileSync('output/matchedIPs.txt', ip+'\n');
    if (generated.indexOf(ip) == -1) {
        falseMatchCount++;
        fs.appendFileSync('output/falseMatches.txt', ip+'\n');
    }
}
console.log(`Falsely matched ${falseMatchCount} IPs.`);

console.log('\n3/3: Checking for missed IPs ...');
bar = new progressBar('[:bar] :percent :elapseds :rate IPs per sec', {
    total: generated.length, width: 80, complete: '.', incomplete: ' ' }
);
for (let ip of generated) {
    bar.tick();
    if (found.indexOf(ip) == -1) {
        missedIPCount++;
        fs.appendFileSync('output/missedIPs.txt', ip+'\n');
    }
}
console.log(`Failed to match ${missedIPCount} valid IPs.`);

if (falseMatchCount > 0) {
    console.log(`\n😱 regex falsely identified ${falseMatchCount} invalid IPs as a match`);
}

if (missedIPCount > 0) {
    console.log(`\n😔 regex failed to identify ${missedIPCount} valid IPs`);
}

if (falseMatchCount == 0 && missedIPCount == 0) {
    console.log('\n🎉 Checked every possible IP against the regex(es). Every matching IP was correctly identified and no non-matching IPs were identified. This regex is perfect.');
} else {
    console.log('\nYour regex still needs work :( see the output folder for the specific IPs');
}
