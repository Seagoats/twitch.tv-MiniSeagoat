/*********************User Friendly Configuration!******************************
 *
 * The Variables below can be changed to whatever you need them to be.
 * Nothing else in the file should need to be changed :D except the section below.
 *
 *******************************************************************************/

//the username of your bot's twitch account
const botName = '';
// The oauth token - EZPZ way to get a token is to log into your bot's twitch
// account and go here: https://twitchapps.com/tmi/
const botOAuthToken = '';

// The channels you want your bot to be snoopin on;
const connectedChannels = [];

// This is the path to the local file you have your quips
const quipsFilePath = "/Users/minh.pham/Code/scratch/twitch/quips.txt";

// How many seconds you want between quips, for testing you can lower this,
// just dont go below 5 otherwise twitch might time your bot out for spam.
const quipsTimingInterval = 10

// Some extra commands for debugging, controls, etc...
const commands = {
  '!test': rollDice,
  '!startTimer': startTimer,
  '!stopTimer': stopTimer,
  '!resetQuips': resetQuips,
  '!quip': sendQuip
}

// ******************* END OF SHIT YOU SHOULD FUCK WITH ********************* //

// *************************** BIG BOY SHIT BELOW *************************** //
const tmi = require('tmi.js');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

// some variables for managing the quips
const quipConfig = {
  inputFile: `File://${quipsFilePath}`,
  intervalInSeconds: quipsTimingInterval * 1000, //convert to millis
  quips: [], //lets us store and manage all the quips, allowing for resets and random polls
}

var quipInterval;

// Define configuration options
const opts = {
  identity: {
    username: botName,
    password: botOAuthToken
  },
  channels: connectedChannels
};
// Create a client with our options
const client = new tmi.client(opts);

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect();

// Called every time a message comes in
function onMessageHandler (target, context, msg, self) {
  if (self) { return; } // Ignore messages from the bot

  // Remove whitespace from chat message
  const commandName = msg.trim();

  const command = commands[commandName];

  if(command) {
    console.log(`* Command recognized - executing {${commandName}}`)
    command(target);
  } else {
    console.log("* Yo dawg, that command was whack, I don't know it.")
  }
}

// Command Functions below
function rollDice(target) {
  const sides = 6;
  const num = Math.floor(Math.random() * sides) + 1;
  client.say(target, `You rolled a ${num}`);
}

function sendQuip(target) {
  const line = pullRandomQuip();
  sendMessage(target, line);
}

function startTimer(target) {
  quipInterval = setInterval(function () {
      sendQuip(target);
    }, quipConfig.intervalInSeconds);
  console.log(`* Started Quip timer for ${quipConfig.intervalInSeconds} millis.`);
}

function stopTimer() {
  clearInterval(quipInterval);
  console.log(`* Stopped Quip timer.`);
}

function resetQuips() {
  initializeQuips();
}

function sendMessage(target, message) {
  console.log(`* Sending Message: ${message}.`)
  client.say(target, `${message}`);
}

function initializeQuips() {
  const fullQuips = readTextFile(quipConfig.inputFile);
  quipConfig.quips = fullQuips.split("\n").filter(Boolean);
  console.log(`* Initializing quips with: ${quipConfig.quips}`);
}

function pullRandomQuip() {
  if(!quipConfig.quips || quipConfig.quips.length == 0) {
    console.log("* Quips were empty, reinitializing quips");
    initializeQuips();
  }
  const lineNumber = Math.floor(Math.random() * quipConfig.quips.length);
  console.log(`* Pulling random quip # ${lineNumber}`);
  return quipConfig.quips.splice(lineNumber, 1); //this grabs And trims the remaining quip randomly
}

function readTextFile(file) {
  var rawFile = new XMLHttpRequest();
  var output = "MiniSeagoat fucked up";
  rawFile.open("GET", file, false);
  rawFile.onreadystatechange = function () {
    if (rawFile.readyState === 4) {
      if (rawFile.status === 200 || rawFile.status == 0) {
        output = rawFile.responseText;
        console.log(`* File Read: ${output}`);
      }
    }
  }
  rawFile.send(null);
  return output;
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}
