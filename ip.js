
// Specify regex here
exports.check = function (ip) {
    var regex = /^$/
    return regex.test(ip);
}

exports.generateList = function () {
    var cidrJs = require("cidr-js");
    var cidr = new cidrJs();

    // Specify IP list here
    var fullIPList = [

    ];

    var generated = [];
    for (let i = fullIPList.length-1; i>-1; i--) {

        if (fullIPList[i].includes('/')) {
            for (let ip of cidr.list(fullIPList[i])) {
                generated.push(ip);
            }
        } else {
            generated.push(fullIPList[i]);
        }

    }

    return generated;
}
