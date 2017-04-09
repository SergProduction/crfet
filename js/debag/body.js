
const fs = require('fs');
const path = require('path');
const Excel = require('exceljs');
const baby = require("babyparse");

function* generatorFolder(arrFolder){
  for(let i=0; i<arrFolder.length; i++)
    yield arrFolder[i]
}

function* generatorFileInFilder(folder){
  let iterFolder = generatorFolder(folder)
  
  for( let dir of iterFolder){
    let fileList = fs.readdirSync(path.join(__dirname, dir))

    for(let i=0; i<fileList.length; i++){
      yield {dir:dir, file:fileList[i]}
    }
  }
}

let iterFile = generatorFileInFilder(fs.readdirSync(path.join(__dirname, dir))


function* generatorEequalBase(base1, base2){  
                                              
  for(let i=0; i<base1.length; i++){          
                                              
    for(let z=0; z<base2.length; z++){
      if( userIf(base1[i], base2[z]) ){
        yield userThen()
      }
    }
  }
}

function start(){
  let source =  iterFile.next()

  if( source.done ){
    logWriteId()
    return
  }

  let {dir} = source.value
  let {file} = source.value

  let pathEnd = path.join(__dirname, 'result/regis/', dir, file )
  let checkFile = fs.existsSync( pathEnd )
  
  if(!checkFile){
    start()
    return
  }

    readXlsx(checkFile, (data) => {
      generatorEequalBase()
    })
}

function readXlsx(pathFile, col, callback){
  pathFile = pathFile.replace(/\.[a-zа-я\d]+$/i, '.xlsx')
  
  let workbook = new Excel.Workbook();
  workbook.xlsx.readFile( pathFile )
    .then( e => {
      let worksheet = workbook.getWorksheet(1);
      let ids = [];
      let col_ids = worksheet.getColumn(col);
      
      col_ids.eachCell((cell, rowNum) => {
        ids.push( cell.text )
      })

      ids = _uniq(ids)
      ids = ids.filter( el => el != '[object object]')

      callback(ids)
    })
    .catch( error => {
      logWrite('error read xlsx file', pathFile)
    })
}

function logWrite(){
  let data = '';
  logOut.forEach( el => {
    data += JSON.stringify(el) + '\n'
  })
  const logStream = fs.appendFile( path.join(__dirname, 'logReestr.txt'), data, {defaultEncoding: 'utf8'}, err =>{
    if(err){
      console.log('ERROR Logs\n', err)
    }
  })
}

function logWriteId(){
  //logOutId.push({id, dir: fileName+' '+dirName})
  let data = ''
  logOutId.forEach(el =>{
    data+= el + '\n'
  })

  fs.appendFile( path.join(__dirname, 'logReestrIsId.csv'), data, {encoding:'utf8'},  err => {
    if(err){
      console.log('ERROR Logs\n', err)
    }
  })
}

function tempValue(){
  function set(data){
    fs.writeFile('temp.txt', data)
  }
  function get(){
    return fs.readFileSync('temp.txt').toString()
  }
  return {set,get}
}