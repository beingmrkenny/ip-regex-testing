'use strict';

const long2ip = function(ip) {
	//  discuss at: http://locutus.io/php/long2ip/
	// original by: Waldo Malqui Silva (https://fayr.us/waldo/)
	//   example 1: long2ip( 3221234342 )
	//   returns 1: '192.0.34.166'

	if (!isFinite(ip)) {
		return false
	}

	return [ip >>> 24 & 0xFF, ip >>> 16 & 0xFF, ip >>> 8 & 0xFF, ip & 0xFF].join('.')
}

const ip2long = function(argIP) {
	//  discuss at: http://locutus.io/php/ip2long/
	// original by: Waldo Malqui Silva (http://waldo.malqui.info)
	// improved by: Victor
	//  revised by: fearphage (http://http/my.opera.com/fearphage/)
	//  revised by: Theriault (https://github.com/Theriault)
	//    estarget: es2015
	//   example 1: ip2long('192.0.34.166')
	//   returns 1: 3221234342
	//   example 2: ip2long('0.0xABCDEF')
	//   returns 2: 11259375
	//   example 3: ip2long('255.255.255.256')
	//   returns 3: false

	let i = 0
	// PHP allows decimal, octal, and hexadecimal IP components.
	// PHP allows between 1 (e.g. 127) to 4 (e.g 127.0.0.1) components.

	const pattern = new RegExp([
		'^([1-9]\\d*|0[0-7]*|0x[\\da-f]+)',
		'(?:\\.([1-9]\\d*|0[0-7]*|0x[\\da-f]+))?',
		'(?:\\.([1-9]\\d*|0[0-7]*|0x[\\da-f]+))?',
		'(?:\\.([1-9]\\d*|0[0-7]*|0x[\\da-f]+))?$'
	].join(''), 'i')

	argIP = argIP.match(pattern) // Verify argIP format.
	if (!argIP) {
		// Invalid format.
		return false
	}
	// Reuse argIP variable for component counter.
	argIP[0] = 0
	for (i = 1; i < 5; i += 1) {
		argIP[0] += !!((argIP[i] || '').length)
		argIP[i] = parseInt(argIP[i]) || 0
	}
	// Continue to use argIP for overflow values.
	// PHP does not allow any component to overflow.
	argIP.push(256, 256, 256, 256)
	// Recalculate overflow of last component supplied to make up for missing components.
	argIP[4 + argIP[0]] *= Math.pow(256, 4 - argIP[0])
	if (argIP[1] >= argIP[5] ||
		argIP[2] >= argIP[6] ||
		argIP[3] >= argIP[7] ||
		argIP[4] >= argIP[8]) {
		return false
	}

	return argIP[1] * (argIP[0] === 1 || 16777216) +
		argIP[2] * (argIP[0] <= 2 || 65536) +
		argIP[3] * (argIP[0] <= 3 || 256) +
		argIP[4] * 1
}

const Calculator = require('ip-subnet-calculator');

const CIDR = function CIDR() {
	if (!(this instanceof CIDR)) {
		return new CIDR();
	}
};

/**
 * Finds the appropriate block or
 * bucket for the given IP to be
 * inserted in. Another way
 * @param key
 * @param ip
 */
const block = function(collection, key, ip) {
	if (!collection) {
		collection = {};
	}

	if (!collection[key]) {
		collection[key] = [];
	}

	collection[key].push(ip);
};

/**
 * Returns the IP range (start & end)
 * for a given IP/CIDR
 * @param ip
 * @returns {Object}
 */
CIDR.prototype.range = function(ip) {
	if (!(ip.indexOf('/') > -1)) {
		return null;
	}

	var range = {};
	var parts = ip.split('/');

	if ((parts[1] > 32)) {
		return null;
	}

	range.start = long2ip((ip2long(parts[0])) & ((-1 << (32 - +parts[1]))));
	range.end = long2ip((ip2long(range.start)) + Math.pow(2, (32 - +parts[1])) - 1);

	return range;
};

/**
 * Returns a list of
 * ip values within the range of a
 * given cidr block.
 *
 * @param ip
 * @return {Array}
 */
CIDR.prototype.list = function(ip) {
	if (typeof(ip) === 'undefined') {
		return null;
	}

	var range = this.range(ip);

	if (!range) {
		return null;
	}

	var _ip2long = ip2long;
	var _long2ip = long2ip;
	var list = [];
	var index = 0;
	var startLong = _ip2long(range.start);
	var endLong = _ip2long(range.end);

	list[index++] = range.start;

	while ((startLong++ < endLong)) {
		list[index++] = _long2ip(startLong);
	}

	return list;
};

var convertAndSort = function(ips) {
	var len = ips.length;
	var _ip2long = ip2long;
	var current = null;

	for (var i = 0; i < len; i++) {
		current = ips[i];
		if (current) {
			ips[i] = _ip2long(current);
		}
	}

	ips = ips.sort();
	return ips;
}

/**
 * Filter the array by grouping
 * IPs where all 32 bits are contiguous
 * 127.0.0.0, 127.0.0.1, 127.0.0.2, etc
 * @returns {Object}
 */
CIDR.prototype.filter = function(ips) {
	if (!(ips instanceof Array) || ips.length <= 0) {
		return null;
	}

	ips = convertAndSort(ips);

	var key = 0;
	var cont = true;
	var len = ips.length;
	var previous = null;
	var current = null;
	var next = null;
	var results = {};

	if (ips.length === 1) {
		return block(results, 0, long2ip(ips[0]));
	}

	for (var i = 0; i < len; i++) {
		current = ips[i];
		next = ips[i + 1];
		previous = current;

		if (!cont) {
			key += 1;
		}

		if (next) {
			if ((next - current) === 1) {
				block(results, key, long2ip(current));
				cont = true;
			} else {
				block(results, key, long2ip(current));
				cont = false;
			}
		} else {
			if (previous) {
				if ((current - previous) === 1) {
					block(results, key, long2ip(current));
					cont = true;
				} else {
					block(results, ++key, long2ip(current));
				}
			}
		}
	}

	return results;
};

/**
 * Returns arrays grouped
 * contiguously.
 *
 * @returns {Array}
 */
CIDR.prototype.getBlocks = function(ips) {
	var blocks = this.filter(ips);
	var results = [];

	for (var i in blocks) {
		var block = blocks[i];

		if (block.length === 1) {
			results.push(block[0]);
			continue;
		}

		var start = block.shift();
		var end = block.pop();
		var ranges = Calculator.calculate(start, end);

		for (var j in ranges) {
			results.push(ranges[j].ipLowStr + '/' + ranges[j].prefixSize);
		}
	}

	return results;
};

module.exports = CIDR;
