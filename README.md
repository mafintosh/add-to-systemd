# add-to-systemd

Small command line tool to simply add a service to systemd

```shell
npm install -g add-to-systemd
```

## Usage

```shell
# add a node server to systemd (will start it on boot)
add-to-systemd my-new-service "$(which node) server.js --port 8080"
# lets start it right away
systemctl start my-new-service
```

Full list of options include

```
Usage: add-to-systemd name [options] command...

  --user, -u  [user]      User the service will run as
  --cwd,  -c  [dir]       Set the cwd of the service (Defaults to the current directory)
  --env,  -e  [name=val]  Add env vars to the service

```

## License

MIT
