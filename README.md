# Online Game SET

## Prerequisites

### Install Dependencies
```
npm install
```

### Install Browserify
To build the client
```
npm install --global browserfiy
```

## Build Client
```
browserify src/client.js -o app/js/client.js
```

## Run Server
```
node server.js
```

## Resources
* Set the original boardgame : [SET | America's Favorite Card Games®](http://www.setgame.com/set) 
* Base code from [socket.io-p2p chat example](https://github.com/socketio/socket.io-p2p/tree/master/examples/chat)
* Card image from [vincentwoo/setgame](https://github.com/vincentwoo/setgame)
