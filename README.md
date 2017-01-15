# add-to-systemd

Small command line tool to simply add a service to systemd

```shell
npm install -g add-to-systemd
```

## Usage

```shell
# add a node server to systemd (will start it on boot)
add-to-systemd my-new-service "node server.js --port 8080"
# lets start it right away
systemctl start my-new-service
```

## License

MIT
