# Hello 👋

This is a node script that checks regular expressions written to match multiple IP addresses match all the IPs you want them to, and none of the ones you don't. It's incredibly easy to get the regex wrong. The only way to be sure you've got it right is to test all 4,294,967,296 possible IPv4 addresses against your regex. This script does that.

1. Install using `npm install`. If you run into problems, delete the `node_modules` directory and try again. This script was developed against Node 12.2.0.

2. Specify the regex in a file called `regex` in the root of this repo. You can specify more than one regex per line.

3. Specify the IPs that the regex SHOULD match in a file called `ip` in the root of this repo. You can supply IPs as individual addresses or as CIDR blocks. One IP or CIDR block per line.

4. Run the test using `node test.js`

Alternatively you can specify the regex and ip lists as arguments — where the first argument is the list of IPs and the second is the list of regexes, e.g. `node test.js ~/Desktop/ipList.txt ~/Desktop/regexes.txt`, just make sure node can read those files.

# Results

The script will run through every numerically possible IP address, including the ones that aren't used publicly. Any IP address which matches the regex will be saved in the `output` directory in a file called `matchedIPs.txt`. It will then check these matched IPs against the list of IPs you supplied. Any false matches will be placed in `falseMatches.txt`. Any IPs that SHOULD be matched but were missed are placed in `missedIPs.txt`.

# Tips and Common Pitfalls

## Escape the dot

You should always escape the dot character (`.`), e.g. `213\.12\.1\.1`, since `.1` will match any character followed by 1.

`213.12.1.1` looks like it would match a single IP address, but in fact matches **5,231** IP addresses.

## Wrap lists in `^(` and `)$`

If your regex contains alternatives, wrap the whole thing in `^()$`, e.g. `^(12\.234\.45\.21|13\.121\.113\.23)$`.

For example, the regex `12\.234\.45\.21|13\.121\.113\.23` looks like it will only match 2 IPs but will in fact match any IP containing `12\.234\.45\.21` or `13\.121\.113\.23`, which is **66** IP addresses.

The same is true for `(12\.234\.45\.21|13\.121\.113\.23)` and `^12\.234\.45\.21|13\.121\.113\.23$`, which are also inaccurate.

## Visual editing

Find a way to view your regex visually. For example, atom has a [railroad diagram package](https://atom.io/packages/regex-railroad-diagram) which makes it much easier to spot errors at a glance and follow the logic of a regex.

## Useful stuff

- <http://gamon.webfactional.com/regexnumericrangegenerator/> — numerical range generator, e.g. the range 0 – 10 in regex looks like `([0-9]|10)`. 124 – 255 is `(12[4-9]|1[3-9][0-9]|2[0-4][0-9]|25[0-5])`
- <https://www.regexpal.com/> - test regexes against sample text
