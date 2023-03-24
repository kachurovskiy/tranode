# Tranode

WiFi remote-controlled car with a USB webcam built on Raspberry Pi and L293D chip for motor control.

## Usage

1. Turn on the power, wait 50 seconds for the device to boot and start the web server
2. Connect to `tranode` WiFi
3. Drive around delivering drinks 🧉🍺🍼🏺🍾
4. When done, press Off button in the UI
5. After 20 seconds, turn off the power

## Hardware

![image](https://user-images.githubusercontent.com/517919/227595927-4dc85a3e-a691-4916-92a1-ae459ad68234.png)

## Building steps

- Install latest Raspbian on SD card, boot and create a user `tranode` with password `tranode`
- Use [this guide](https://www.tomshardware.com/how-to/raspberry-pi-access-point) to make your Raspberry Pi broadcast a `tranode` WiFi network
- [Install NodeJS](https://pimylifeup.com/raspberry-pi-nodejs/) on your Raspberry
- Connect USB webcam

### Install mjpg-streamer

```
sudo apt-get install xz-utils gcc g++ cmake libjpeg9-dev
git clone https://github.com/jacksonliam/mjpg-streamer.git
cd mjpg-streamer/mjpg-streamer-experimental
make
sudo make install
sudo bash -c "echo 'LD_LIBRARY_PATH=/home/tranode/mjpg-streamer/mjpg-streamer-experimental' >> /etc/profile"
export LD_LIBRARY_PATH=/home/tranode/mjpg-streamer/mjpg-streamer-experimental
```

### Install tranode server

```
cd ~
git clone https://github.com/kachurovskiy/tranode.git
cd tranode
npm install
sudo npm install -g pm2
sudo pm2 start tranode.js
sudo pm2 save
```

### Debug

See `sudo pm2 log` and `sudo cat /var/log/syslog` for signs of potential errors.