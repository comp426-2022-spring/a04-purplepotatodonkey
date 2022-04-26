const express = require('express');
const minimist = require('minimist');
const db = require("./database.js");
const morgan = require('morgan');
const fs = require('fs');


const app = express()
const args = (minimist)(process.argv.slice(2));


const HTTP_PORT = args.port || 5000;
// Start an app server
const server = app.listen(HTTP_PORT, () => {
  console.log('App listening on port %PORT%'.replace('%PORT%',HTTP_PORT))
});



console.log(args)
// Store help text 
const help = (`
server.js [options]

--port	Set the port number for the server to listen on. Must be an integer
            between 1 and 65535.

--debug	If set to true, creates endlpoints /app/log/access/ which returns
            a JSON access log from the database and /app/error which throws 
            an error with the message "Error test successful." Defaults to 
            false.

--log		If set to false, no log files are written. Defaults to true.
            Logs are always written to database.

--help	Return this message and exit.
`)
// If --help or -h, echo help text to STDOUT and exit
if (args.help || args.h) {
    console.log(help)
    process.exit(0)
}



if (args.log == true) {
  const WRITESTREAM = fs.createWriteStream('FILE', { flags: 'a' });
  app.use(morgan('combined', { stream: WRITESTREAM }));
} 

// Creates sqllite database       ...ffjriposephffsffffdfbig greenfffds    leadelike to climbrboard high score
app.use((req, res, next) => {
  let logdata = {
    remoteaddr: req.ip,
    remoteuser: req.user,
    time: Date.now(),
    method: req.method,
    url: req.url,
    protocol: req.protocol,
    httpversion: req.httpVersion,
    status: res.statusCode,
    referer: req.headers['referer'],
    useragent: req.headers['user-agent']
  }

  const stmt = db.prepare(`INSERT INTO accesslog (remoteaddr, remoteuser, time, method, url, protocol, httpversion, status, referer, useragent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  const info = stmt.run(logdata.remoteaddr, logdata.remoteuser, logdata.time, logdata.method, logdata.url, logdata.protocol, logdata.httpversion, logdata.status, logdata.referer, logdata.useragent)
  next();
});

app.get('/app/log/access', (req, res) => {
  try {
    const select_statement = db.prepare('SELECT * FROM accesslog').all();
    res.status(200).json(select_statement);
  } catch {
    console.error(e);
  }
});

app.get('/app/error', (req, res) => {
  res.status(500);
  throw new Error('Error test was successful.')
});

// Default response for any other request
app.use(function(req, res){
    res.status(404).send('404 NOT FOUND');
    res.type("text/plain");
});

app.get('/app', (req, res) => {
// Respond with status 200   
    res.statusCode = 200;
// Respond with status message "OK"
    res.statusMessage = 'OK';
    res.writeHead( res.statusCode, { 'Content-Type' : 'text/plain' });
    res.end(res.statusCode+ ' ' +res.statusMessage)
})

app.get('/app/flip', (req, res) => {
    res.status(200).json({ "flip" : coinFlip()})
})

app.get('/app/flips/:number', (req, res) => {
    var flips = coinFlips(req.params.number);
    res.status(200).json({ "raw" : flips, "summary" : countFlips(flips)})
})

app.get('/app/flip/call/:something', (req, res) => {
    var flip = flipACoin(req.params.something)
    res.status(200).json(flip)
})

app.use(function(req, res) {
    res.status(404).send("404 NOT FOUND")
    res.type("text/plain")
})

/** Coin flip functions 
 * This module will emulate a coin flip given various conditions as parameters as defined below
 */

/** Simple coin flip
 * 
 * Write a function that accepts no parameters but returns either heads or tails at random.
 * 
 * @param {*}
 * @returns {string} 
 * 
 * example: coinFlip()
 * returns: heads
 * 
 */

function coinFlip() {
    var x = Math.floor(Math.random() * 2);
    if (x == 1) {
      return "heads";
    }
    return "tails";
  }

  /** Multiple coin flips
   * 
   * Write a function that accepts one parameter (number of flips) and returns an array of 
   * resulting "heads" or "tails".
   * 
   * @param {number} flips 
   * @returns {string[]} results
   * 
   * example: coinFlips(10)
   * returns:
   *  [
        'heads', 'heads',
        'heads', 'tails',
        'heads', 'tails',
        'tails', 'heads',
        'tails', 'heads'
      ]
   */

  function coinFlips(flips) {
    var arr = [];
    for (var i = 0; i < flips; i++) {
      arr.push(coinFlip());
    }
    return arr;
  }

  /** Count multiple flips
   * 
   * Write a function that accepts an array consisting of "heads" or "tails" 
   * (e.g. the results of your `coinFlips()` function) and counts each, returning 
   * an object containing the number of each.
   * 
   * example: conutFlips(['heads', 'heads','heads', 'tails','heads', 'tails','tails', 'heads','tails', 'heads'])
   * { tails: 5, heads: 5 }
   * 
   * @param {string[]} array 
   * @returns {{ heads: number, tails: number }}
   */

  function countFlips(array) {
    var headNum = 0;
    var tailNum = 0;
    for (var i = 0; i < array.length; i++) {
      if (array[i] == "heads") {
        headNum++;
      } else {
        tailNum++;
      }
    }

    return {heads: headNum, tails: tailNum};
  }

  /** Flip a coin!
   * 
   * Write a function that accepts one input parameter: a string either "heads" or "tails", flips a coin, and then records "win" or "lose". 
   * 
   * @param {string} call 
   * @returns {object} with keys that are the input param (heads or tails), a flip (heads or tails), and the result (win or lose). See below example.
   * 
   * example: flipACoin('tails')
   * returns: { call: 'tails', flip: 'heads', result: 'lose' }
   */

  function flipACoin(call) {
    var headsOrTails = coinFlip();
    var result;
    if (headsOrTails == call) {
      result = "win";
    } else {
      result = "lose";
    }
    return {call: call, flip: headsOrTails, result: result};
  }