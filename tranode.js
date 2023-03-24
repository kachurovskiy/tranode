var Gpio = require('pigpio').Gpio;
var GPIO0 = 17, GPIO1 = 18, GPIO2 = 27, GPIO3 = 22, GPIO4 = 23, GPIO5 = 24;
var pin0 = new Gpio(GPIO0, { mode: Gpio.OUTPUT });
var pin1 = new Gpio(GPIO1, { mode: Gpio.OUTPUT });
var pin2 = new Gpio(GPIO2, { mode: Gpio.OUTPUT });
var pin3 = new Gpio(GPIO3, { mode: Gpio.OUTPUT });
var pin4 = new Gpio(GPIO4, { mode: Gpio.OUTPUT });
var pin5 = new Gpio(GPIO5, { mode: Gpio.OUTPUT });

var powerOff = require('power-off');
var express = require('express');

app = express();
server = require('http').createServer(app);
io = require('socket.io')(server);
server.listen(80);
app.use(express.static('public'));

// Starting webcam streaming on port 8080.
var { exec } = require("child_process");
exec(`mjpg_streamer -i input_uvc.so -o output_http.so`, (error, stdout, stderr) => {
  if (error) {
    console.log(`error: ${error.message}`);
  } else if (stderr) {
    console.log(`stderr: ${stderr}`);
  } else {
    console.log(`stdout: ${stdout}`);
  }
});

var left = 0;
var right = 0;
var leftPwm = 0;
var rightPwm = 0;
var maxPwm = 255;
var maxIncoming = 255;
var socketConnection = null;
var irCounter = 0;

io.on('connection', function (socket) {
  socket.on('speed', function (data) {
    right = validateSpeed(data.left);
    left = validateSpeed(data.right);
    speedToPins();
    stopAfter(500);
  });
  socket.on('command', function (data) {
    var time = 250;
    if (data == 'left') {
      left = maxPwm;
      right = -maxPwm;
    } else if (data == 'right') {
      left = -maxPwm;
      right = maxPwm;
    } else if (data == 'forward') {
      left = maxPwm;
      right = maxPwm;
      time = 500;
    } else if (data == 'back') {
      left = -maxPwm;
      right = -maxPwm;
      time = 500;
    } else if (data == 'ff') {
      left = 250;
      right = 250;
      time = 1000;
    } else if (data == 'off') {
      socket.emit('off');
      powerOff(function (err, stderr, stdout) {
        if (!err && !stderr) {
          console.log(stdout);
        }
      });
    }
    speedToPins();
    stopAfter(time);
  });
  socketConnection = socket;
});

function validateSpeed(speed) {
  if (isNaN(speed)) return 0;
  if (speed > 255) return 255;
  if (speed < -255) return -255;
  return speed;
}

function speedToPins() {
  if (rightPwm > 0) {
    pwmWrite(pin2, rightPwm);
    pin0.digitalWrite(1);
  } else if (rightPwm < 0) {
    pwmWrite(pin1, -rightPwm);
    pin0.digitalWrite(1);
  } else {
    pin0.digitalWrite(0);
  }

  if (leftPwm > 0) {
    pwmWrite(pin4, leftPwm);
    pin3.digitalWrite(1);
  } else if (leftPwm < 0) {
    pwmWrite(pin5, -leftPwm);
    pin3.digitalWrite(1);
  } else {
    pin3.digitalWrite(0);
  }
}

function pwmWrite(pin, value) {
  if (value < 80) {
    pin.digitalWrite(0);
  } else {
    pin.pwmWrite(value);
  }
}

function stop() {
  left = 0;
  right = 0;
}

var stopAfterTimeout;
function stopAfter(ms) {
  if (stopAfterTimeout) {
    clearTimeout(stopAfterTimeout);
    stopAfterTimeout = null;
  }
  stopAfterTimeout = setTimeout(stop, ms);
}

setInterval(function () {
  var maxStep = 5;
  leftPwm = leftPwm + Math.min(maxStep,
    Math.max(-maxStep, Math.round(left) - leftPwm));
  rightPwm = rightPwm + Math.min(maxStep,
    Math.max(-maxStep, Math.round(right * 0.98) - rightPwm));
  speedToPins();
}, 10);

console.log("running");
