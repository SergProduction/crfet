process.on('message', function(param) {
  process.send('ok')
})