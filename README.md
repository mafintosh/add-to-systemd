# add-to-systemd

Small command line tool to simply add a service to systemd

```
npm install -g add-to-systemd
```

## Usage

```
# add a node server to systemd (will start it on boot)
add-to-systemd my-new-service "node server.js --port 8080"
# lets start it right away
service my-new-service start
```

## License

MIT
