const fs   = require('fs');
const path = require('path');
const babyparse = require('babyparse');
const _differenceWith = require('lodash/differenceWith');
const _isEqual = require('lodash/isEqual');

let us;
let baseName;

process.on('message', data => {
  us = data

  let a = path.parse(data.userPath.logPathSource).name
  let b = a.split('_')
  let c = b[ b.length-1 ] + '.json'
  baseName = path.join(__dirname, './../base/', c)

  if(data.type == 'success'){
    createCsvSuccess()
  }
  if(data.type == 'not'){
    createCsvNot()
  }
})

function createCsvSuccess(){
  process.send('read log')
  let baseLog = JSON.parse( fs.readFileSync( us.userPath.logPathSource ).toString() )
  
  process.send('convert csv')
  let csv = createCsv(baseLog)
  
  process.send('save')
  writeToFile(csv)
}

function createCsvNot(){
  process.send('read base')
  let base = JSON.parse( fs.readFileSync( baseName ).toString() )
  
  process.send('read log')
  let baseLog = JSON.parse( fs.readFileSync( us.userPath.logPathSource ).toString() )

  process.send('comput')
  var baseNot = _differenceWith(base, baseLog, _isEqual)
  
  process.send('convert csv')
  let csv = createCsv(baseNot)

  process.send('save')
  writeToFile(csv)
}

function createCsv(data){
  let csv = babyparse.unparse(data, {delimiter:';'});
  return csv
}

function writeToFile(data){
  fs.writeFile(us.userPath.logPathTarget+'.csv', data, {encoding:'utf8'}, (err) => {
    if (err) throw err;
    console.log('The file has been saved!');
    process.send('finish')
  });
}