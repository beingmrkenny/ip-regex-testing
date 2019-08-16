I wrote a regex to determine if a given IP was on a list of IPs. The list of IPs was over 1000 items long and the regex was complicated and hard to follow so errors were likely. The regex had to be 100% accurate, so I concluded that the only way to be sure was to write a script that would cycle through all 4,294,967,296 possible IPs from 0.0.0.0 to 255.255.255.255.

To write your regex, I recommend using atom with [regex-railroad-diagram](https://atom.io/packages/regex-railroad-diagram) installed, which displays your regex elegantly and effectively.

- Specify the regex in ip.js. You'll also need to supply the full list of valid IPs, in order for the check to be certain. These can be supplied as a JavaScript array of IPs or CIDR blocks or a mix of both.
- install using `npm install`.
- Run the test like: `node test.js`. On my machine it takes about 15 minutes.
- This code will almost definitely won't work; you will need to fix things

There's a bunch of other files in the `more` directory that you might find useful — though watch out for bugs, I've just dumped them there.