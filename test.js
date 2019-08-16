const IP = require('./ip');
const fs = require('fs');

// Generate every possible IP and save the matching IPs

console.log('Now checking all possible IPs against IP regex');

fs.writeFileSync('output/matching.txt', '');

var start = new Date();

var found = [];
var two;
var i = 0;
var count = 0;
var step = Date.now();

var ip;

while (true) {

    let b1 = (i >> 24) & 0xff;
    let b2 = (i >> 16) & 0xff;
    let b3 = (i >>  8) & 0xff;
    let b4 = (i)       & 0xff;

    i++;
    ++count;

    ip = `${b1}.${b2}.${b3}.${b4}`;

    if (IP.check(ip)) {
        found.push(ip);
        fs.appendFileSync('output/matching.txt', `${ip}\n`);
    }

    if (two != b1) {
        let now = Date.now();
        console.log(Math.floor((b1 / 255) * 100) + '% - Took: ' + (now-step)/1000 + 's');
        step = now;
        two = b1;
    }

    if (b1 == 255 && b2 == 255 && b3 == 255 && b4 == 255) {
        break;
    }

}

var end = new Date();
var minutes = Math.round((end - start) / (1000 * 60));
console.log(minutes + ' mins');

var percentChecked = Math.floor(i / 4294967296) * 100;
fs.writeFileSync('output/results.txt', `# of generated IPs: ${count.toLocaleString()} (${percentChecked.toFixed(2)}% - max: 4,294,967,296)\n`);
fs.appendFileSync('output/results.txt', '# of IPs found from all generated IPs: ' + found.length + "\n\n");
fs.appendFileSync('output/results.txt', 'Took ' + minutes + " minutes\n\n");
fs.writeFileSync('output/matchingCheck.js', 'var found = ' + JSON.stringify(found) + ";\n\n");

// Generate a list from the cidr block

var generated = IP.generateList();
fs.appendFileSync('output/results.txt', '# of IPs generated: ' + generated.length + "\n\n");
fs.appendFileSync('output/matchingCheck.js', 'var generated = ' + JSON.stringify(generated) + ";\n\n");

var problemExists = false;

for (let ip of found) {
    if (generated.indexOf(ip) == -1) {
        problemExists = true;
        console.log(`${ip} - 😱 regex falsely identified an invalid IP as a match`);
    }
}

for (let ip of generated) {
    if (found.indexOf(ip) == -1) {
        problemExists = true;
        console.log(`${ip} - 😔 regex failed to identify a valid IP`);
    }
}

if (!problemExists) {
    console.log('🎉 Checked every possible IP (4.3 billion!) against the regex(es). Every matching IP was correctly identified while no non-matching IPs were identified. Congratulations!');
}
