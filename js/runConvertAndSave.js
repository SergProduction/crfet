const xlsxToJson = require('./../js/xlsxToJson')
const fs = require('fs');
const path = require('path');
//console.log(xlsxToJson)
let args;
let newBase;

process.on('message', function(param) {
  args = param
  //console.log(args)
  convert()
})

function convert(){ //xlsx -> json //newBase
  //process.send({type:'ok'})
  xlsxToJson(args.baseXlsxPath, (type, toJson)=>{
    switch(type){
      case 'rowLength':
        process.send({type:'ROW LENGTH',data: toJson})
      break
      case 'rowCurrent':
        process.send({type:'ROW CURRENT',data: toJson})
      break
      case 'error':
        process.send({type:'CONVERT ERROR'})
        process.exit()
        return
      break
      case 'data':
        newBase = toJson.slice()
        toJson = null
        process.send({type:'CONVERT FINISH'})
        saveBaseJson()
      break
    }
    

  })
}

function saveBaseJson(){//json save in file  system //newBase

  let nameJsonBase = path.join(__dirname, '../base', args.nameJsonBase+'.json')
  
  const writeBaseStream = fs.createWriteStream( nameJsonBase, {defaultEncoding: 'utf8'})

  writeBaseStream.write('[')
  for(let i=0; i<newBase.length; i++){
    if(i == newBase.length-1){
      writeBaseStream.write( JSON.stringify(newBase[i]) + '\n')
    }
    else{
      writeBaseStream.write( JSON.stringify(newBase[i]) + ',\n')
    }
  }
  writeBaseStream.write(']')
  writeBaseStream.end()

  writeBaseStream.on('finish', () => {
    process.send({type:'SAVE FINISH'})
    process.exit()
  })
}
