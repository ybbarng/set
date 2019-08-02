# Online Game SET
<p align="center">
    <img src="/preview.png" title="SET Preview" style="center;" />
</p>

## Run Server with Docker

### Build Image
```sh
docker build -t set .
```

### Run a container
```sh
docker run -p 127.0.0.1:8080:80 -d set
```

## Run Server without Docker

### Install Dependencies
```sh
npm install
```

### Build Client
```sh
npm run build      # dev mode
npm run build:p    # production mode
```

### Run Server
```sh
node server.js
```

## Resources
* Set the original boardgame : [SET | America's Favorite Card Games®](http://www.setgame.com/set) 
* Base code from [socket.io-p2p chat example](https://github.com/socketio/socket.io-p2p/tree/master/examples/chat)
* Card image from [vincentwoo/setgame](https://github.com/vincentwoo/setgame)
* Animal names from [Animal Pictures Archive](http://animal.memozee.com/animal/Dic/)
