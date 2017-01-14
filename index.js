#!/usr/bin/env node

var fs = require('fs')
var path = require('path')
var cp = require('child_process')

var TEMPLATE = fs.readFileSync(path.join(__dirname, 'template.service'), 'utf-8')

if (!process.argv[3]) {
  console.error('Usage: add-to-systemd name command...')
  process.exit(1)
}
if (!fs.existsSync('/lib/systemd/system/')) {
  console.error('/lib/systemd/system/ does not exist. Is systemd installed?')
  process.exit(2)
}

var name = process.argv[2]
var command = process.argv.slice(3).join(' ')
var service = TEMPLATE.replace('{command}', command)

fs.writeFileSync('/lib/systemd/system/' + name + '.service', service)
cp.spawn('systemctl', ['enable', name + '.service'], {stdio: 'inherit'})
