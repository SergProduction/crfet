const fs = require('fs');
const path = require('path');
const fork = require('child_process').fork
const convertXslxTo = require('./../js/xlsxToJson')
const copy = require('recursive-copy');

/*
var args = {
    //xlsx          :true         ,
    //dirInDir      :true         ,
    splitDir      :''          ,
    splitFile     :'_'          ,
    splitXlsx     :'1;/;1',
    splitBase     :'1; ;1,2; ;1',
    equalBaseDir  :''        ,
    equalBaseFile :'2;1'        ,
    endDir        :'1;_;1:name' ,
    endFile       :'1;_;1:name' ,
    //userPath      : {source:'', sourceXlsx:'', target: ''},
    //baseName      :'test.json'  
}

var files =  [
{dir:'5', file:'55_e.jpg'},
{dir:'5', file:'84_e.jpg'},
{dir:'1', file:'76_e.jpg'},
{dir:'1', file:'12_e.jpg'}]

var xlsx = [
[null,"55/asd",'er'],
[null,"84/asd",'er'],
[null,"76/asd",'er'],
[null,"12/asd",'er'],
]

var base = [
[null,"15 август","55 Филатов",1854,"25.03.17",null,5],
[null,"18 декабря","84 Иванов",1256,"17.09.17",null,5],
[null,"24 января","76 Алиев",7892,"07.08.17",null,5],
[null,"27 февраля","99 Кузнецова",3456,"19.05.17",null,3],
[null,"31 августа","12 Сидорова",2587,"25.11.17",null,3],
[null,"17 июня","56 Карташова",1654,"05.12.17",null,3]
]
*/

function myCopy(source, target, xlsx){
  //if(!source || !target){
  //  return
  //}
  //console.log('myCopy',source, target)
  copy(source, target)
    .then( results => {
      //console.log('Copied ' + results.length + ' files');
      if( !args.dash ){
  		scan()
  		return
  	  }
      if( !xlsx ){
        controlStarting()
      }
      else if( xlsx ){
        startXlsx()
      }
    })
    .catch( error => {
      //console.error('Copy failed: ' + error);
      if( !args.dash ){
  		scan()
  		return
  	  }
      if( !xlsx ){
        controlStarting()
      }
      else if( xlsx ){
        startXlsx()
      }
    });
}
//----------------------------генераторы------------------------
function* generatorFileInFolder(folderPath, underFolder){
  let allFilesCount = countAllFiles(folderPath)
  let currentFilesCount = 0;
  if(underFolder){
    let folder     = fs.readdirSync(folderPath)
    for( let dir of folder){
      let fileList = fs.readdirSync(path.join(folderPath, dir))
      for(let file of fileList){
        let ext = '.' + file.match(/[^.]+$/)[0]
        file = file.slice(0, file.match(/[^.]+$/).index -1 )
        currentFilesCount +=1
        yield {dir:dir, file:file, ext:ext, count:{current: currentFilesCount, all: allFilesCount} }
      }
    }
  }
  else{
    let fileList = fs.readdirSync(folderPath)
      for(let file of fileList){
        let ext = '.' + file.match(/[^.]+$/)[0]
        file = file.slice(0, file.match(/[^.]+$/).index -1 )
        currentFilesCount +=1
        yield {dir:'', file:file, ext:ext, count:{current: currentFilesCount, all: allFilesCount} }
      }
  }
}
//----------------------------
function* generatorXlsx(data, file){
  for(let xl of data){
    yield* generatorXlsxInBase(xl, file)
  }
}


function* generatorXlsxInBase(xl, file){

    let startName;
    let endName;
    let newName = {file:'', dir:''}
    let count = 0;
    let rowXl = modXlsx(xl, args.splitXlsx)
    
    for(let row of base){
      let modDirFile = splitDirFile(file.file, args.splitFile, file.dir, args.splitDir)
      modDirFile.file = rowXl
      let usTrue = userEqual(row, args.splitBase, modDirFile, args.equalBaseFile, args.equalBaseDir)
      if(usTrue){
        newName.file = newNameSplit(row, file.file, args.endFile),
        newName.dir  = newNameSplit(row, file.dir , args.endDir )
        
        if(!count){
          startName = newName.file
        }else{
          endName   = newName.file
        }
        count+=1;

        logIs.push(row)
        
        if(!args.dash){
          yield {newName, file}
        }
      }
    }
    if(args.dash){
      if(count == 1){
        yield {newName, file}
      }
      else if(count > 1){
        newName.file = startName+'-'+endName
        yield {newName, file}
      }
    }

}
//----------------------------


let args;
let base;
let iterFile
let xlsxData;
let iterXlsxInBase
let iterBase;
let logIs = [];
let logErorrXlsx = [];



process.on('message', function(param) {
  args = param
  
  iterFile = generatorFileInFolder(args.userPath.source , args.dirInDir)

  let pathBase = path.join(__dirname,'./../', 'base', args.baseName)
  base = JSON.parse( fs.readFileSync(pathBase).toString() )
  
  controlStarting()
})


function controlStarting(){
  start()
}


function readXlsx(file){
    let pathXlsx = path.join(args.userPath.sourceXlsx, file.dir, file.file + '.xlsx')
    convertXslxTo(pathXlsx, (type, data) => {
      if(type == 'error'){
        console.log('xlsx read error', data)
        logErorrXlsx.push( file.dir +'/'+ file.file + '.xlsx' )
        controlStarting()
        return
      }
      if(type == 'data'){
        xlsxData = data
        process.send({type:'count', data:file.count })
        iterXlsxInBase = generatorXlsx(data, file)
        startXlsx()
      }
    })
}


function startXlsx(){
  let data = iterXlsxInBase.next()
  //console.log(data)
  if(data.done){
    controlStarting()
    return
  }
  data = data.value
  //console.log('aa--------------', data)
  let copyPath = copyPathJoin(args.userPath.source,  data.file.dir,  data.file.file,  args.userPath.target,  data.newName.dir,  data.newName.file,  data.file.ext)
  myCopy(copyPath.source, copyPath.target, true)
}


function start(){
  let iter = iterFile.next()
  let file = iter.value
  console.log(file, iter.done)
  if(iter.done){
    process.send({type:'finish', data:null })
    
      saveLog({dir:'logIs', data:logIs}, () => {
        logIs = null
        if(logErorrXlsx.length){
          saveLog({dir:'logError', data:logErorrXlsx}, () => {
          	process.send({type:'save finish'})
          })
        }else{
          process.send({type:'save finish'})
        }
      })

    return
  }
  process.send({type:'count', data:file.count })
  if(!args.xlsx){
    readBase(file)
  }else{
    readXlsx(file)
  }

}


function readBase(file){
  iterBase = generatorBase(file)
  scan()
}

function scan(){
  let data = iterBase.next()
  if(data.done){
    controlStarting()
    return
  }
  //console.log('args.dash',args.dash)
  data = data.value
  let copyPath = copyPathJoin(args.userPath.source,  data.file.dir,  data.file.file,  args.userPath.target,  data.newName.dir,  data.newName.file,  data.file.ext)
  myCopy(copyPath.source, copyPath.target)
}

function* generatorBase(file){
    
    let startName;
    let endName;
    let newName = {file:'', dir:''}
    let count = 0;

    //yield{newName:newName, count:count, file:file}
    
    for(let row of base){
      let modDirFile = splitDirFile(file.file, args.splitFile, file.dir, args.splitDir)
      let usTrue = userEqual(row, args.splitBase, modDirFile, args.equalBaseFile, args.equalBaseDir)
      if(usTrue){
        
        newName.file = newNameSplit(row, file.file, args.endFile),
        newName.dir  = newNameSplit(row, file.dir , args.endDir )
        
        if(!count){
          startName = newName.file
        }else{
          endName   = newName.file
        }
        count+=1;

        logIs.push(row)
        
        if(!args.dash){
          yield {newName, file}
        }
      }
    }
    console.log(startName, endName, count)
    if(args.dash){
      if(count == 1){
        yield {newName, file}
      }
      else if(count > 1){
        newName.file = startName+'-'+endName
        yield {newName, file}
      }
      else{
        return false
      }
    }
}


function modXlsx(row, splitXlsx){
  /*предварительное изменение промежуточного xlsx по разделителю*/
  let rowMod = row;
  let result = [];
  let sXlsx  = splitXlsx ? splitXlsx.split(',') : []
  for(let sb of sXlsx){                 //изменение значений ячеек
    let split = sb.split(';')
    let index        = split[0]
    let usSplit      = split[1]
    let indexUsSplit = split[2]
    rowMod[index] = row[index].split(usSplit)[indexUsSplit-1]
  }

  return rowMod.slice(1)
}

function splitDirFile(file, splitFile, dir, splitDir){
  /*разбивает имена файла, каталога по разделителю*/
  let result = {file:[''], dir: ['']}
  if(file){
    let modFile = splitFile ? file.split(splitFile) : [file]
    result.file = modFile
  }
  if(dir){
    let modDir  = splitDir  ? dir.split(splitDir)   : [dir]
    result.dir  = modDir
  }
  return result
}

function userEqual(row, splitBase, modDirFile, equalBaseFile, equalBaseDir){
/* сравнивает  базой имя файла/xlsx, директории
row           | cтрока базы: массив, ([null,"15 август","55 Филатов",1854,"25.03.17",null,5])
splitBase     | предварительный разделитель базы: строка ("1; ;1,2; ;1")
modDirFile    | имя файла/каталога: объект с масивами ({file["1;1"], dir["1;1"]} or {file["1"], dir["1"]})
equalBaseFile | столбец строки; часть имени файла/xlsx : строка ("1;1" or "1")
*/

  let rowMod = row;
  let result = [];
  let sBase  = splitBase ? splitBase.split(',') : []
  //sBase = sBase[0] ? sBase : []

  let equalBaseFileArr = equalBaseFile ? equalBaseFile.split(',') : [] //1 or 1;1 or 1;1,2;2
  let equalBaseDirArr  = equalBaseDir  ? equalBaseDir.split(',')  : [] //1 or 1;1 or 1;1,2;2

  for(let sb of sBase){                 //изменение значений ячеек
    let split = sb.split(';')
    let index        = split[0]
    let usSplit      = split[1]
    let indexUsSplit = split[2]
    rowMod[index] = row[index].split(usSplit)[indexUsSplit-1]
  }

  for( let eqBF of equalBaseFileArr){ //сравнение имени файла с ячейками базы 
    let split = eqBF.split(';')
    if(split.length == 1){
      let indexBase = split[0]
      //console.log(modDirFile.file[ 0 ])
      if( rowMod[indexBase] == modDirFile.file[ 0 ] )
        result.push(rowMod[indexBase])
    }
    if(split.length == 2){
      let indexBase     = split[0]
      let indexNameFile = split[1]
      if( rowMod[indexBase] == modDirFile.file[ indexNameFile-1 ] )
        result.push(rowMod[indexBase])
    }
  }

  for( let eqBD of equalBaseDirArr){ //сравнение имени директории с ячейками базы 
    let split = eqBD.split(';')
    if(split.length == 1){
      let indexBase = split[0]
      if( rowMod[indexBase] == modDirFile.dir[ 0 ] )
        result.push(rowMod[indexBase])
    }
    if(split.length == 2){
      let indexBase     = split[0]
      let indexNameFile = split[1]
      if( rowMod[indexBase] == modDirFile.dir[ indexNameFile-1 ] )
        result.push(rowMod[indexBase])
    }
  }

  if( result.length == equalBaseFileArr.length + equalBaseDirArr.length ){
    return true
  }
  else{
    return false
  }
}

function userEqualXlsx(row, splitBase, modDirFile, equalBaseFile, equalBaseDir){
/* сравнивает  базой имя файла/xlsx, директории
row           | cтрока базы: массив, ([null,"15 август","55 Филатов",1854,"25.03.17",null,5])
splitBase     | предварительный разделитель базы: строка ("1; ;1,2; ;1")
modDirFile    | имя файла/каталога: объект с масивами ({file["1;1"], dir["1;1"]} or {file["1"], dir["1"]})
equalBaseFile | столбец строки; часть имени файла/xlsx : строка ("1;1" or "1")
*/
  let rowMod = row;
  let result = [];
  let sBase   = splitBase.split(',')
  sBase = sBase[0] ? sBase : []

  let equalBaseFileArr = equalBaseFile ? equalBaseFile.split(',') : [] //1 or 1;1 or 1;1,2;2
  let equalBaseDirArr  = equalBaseDir  ? equalBaseDir.split(',')  : [] //1 or 1;1 or 1;1,2;2

  for(let sb of sBase){                 //изменение значений ячеек
    let split = sb.split(';')
    let index        = split[0]
    let usSplit      = split[1]
    let indexUsSplit = split[2]
    rowMod[index] = row[index].split(usSplit)[indexUsSplit-1]
  }

  for( let eqBF of equalBaseFileArr){ //сравнение имени файла с ячейками базы 
    let split = eqBF.split(';')
    if(split.length == 1){
      let indexBase = split[0]
      if( rowMod[indexBase] == modDirFile.file[ 0 ] )
        result.push(rowMod[indexBase])
    }
    if(split.length == 2){
      let indexBase     = split[0]
      let indexNameFile = split[1]
      if( rowMod[indexBase] == modDirFile.file[ indexNameFile-1 ] )
        result.push(rowMod[indexBase])
    }
  }

  for( let eqBD of equalBaseDirArr){ //сравнение имени директории с ячейками базы 
    let split = eqBD.split(';')
    if(split.length == 1){
      let indexBase = split[0]
      if( rowMod[indexBase] == modDirFile.dir[ 0 ] )
        result.push(rowMod[indexBase])
    }
    if(split.length == 2){
      let indexBase     = split[0]
      let indexNameFile = split[1]
      if( rowMod[indexBase] == modDirFile.dir[ indexNameFile-1 ] )
        result.push(rowMod[indexBase])
    }
  }

  if( result.length == equalBaseFileArr.length + equalBaseDirArr.length ){
    return true
  }
  else{
    return false
  }
}

function copyPathJoin(source, dir, file, target, dirTar, fileTar, ext){
  let newPath = {
    source: path.join(source, dir, file) + (ext ? ext : ''),
    target: path.join(target, dirTar, fileTar) + (ext ? ext : '')
  }
  return newPath
}

function newNameSplit(row, oldName, splitName){
  let newName = oldName
  //console.log(oldName, splitName, row)
  if(splitName[0] == ':'){    //":myName"
    newName = splitName.slice(1)
    return newName
  }

  let splitRowStr = splitName.split(':')[0]
  let uName       = splitName.split(':')[1]
  let splitRow    = splitRowStr.split(';')

  if(splitRow.length == 3){         //"1:myName" or "1;_;1:myName"
         //"1;_;1:myName"
      let index        = splitRow[0]
      let usSplit      = splitRow[1]
      let indexUsSplit = splitRow[2]
      if( row[index] )
        newName = row[index].split(usSplit)[indexUsSplit-1] + (uName ? uName : '')
  }
  else if(splitRow.length == 1){                        //"1:myName"
    if( row[ splitRow[0] ] )
      newName = row[ splitRow[0] ] + (uName ? uName : '')
  }
  
  return newName
}


function countAllFiles(usPathDir){//вернет кол-во всех файлов, в указанной директории
  let fif   = fs.readdirSync(usPathDir)
  let stat  = fs.statSync(path.join(usPathDir, fif[0]))
  let count = 0;
  if ( stat.isDirectory() ){
    for(let dir of fif ){
      count+= fs.readdirSync(path.join(usPathDir, dir)).length
    }
  }
  else{
    count+= fif.length
  }
  return count
}

function saveLog(data, cb){//json save in file  system //newBase

  process.send({type:'save start'})
  let a = new Date()
  let currentTime = a.getDate()+'.'+(a.getMonth()+1)+'.'+(a.getYear()-100)+'_'+a.getHours()+'.'+a.getMinutes()+'.'+a.getSeconds()+'_'
  
  let nameJsonBase = path.join(__dirname,'./../', data.dir, currentTime+args.baseName)
  data = data.data
  const writeBaseStream = fs.createWriteStream( nameJsonBase, {defaultEncoding: 'utf8'})

  writeBaseStream.write('[')
  for(let i=0; i<data.length; i++){
    if(i == data.length-1){
      writeBaseStream.write( JSON.stringify(data[i]) + '\n')
    }
    else{
      writeBaseStream.write( JSON.stringify(data[i]) + ',\n')
    }
  }
  writeBaseStream.write(']')
  writeBaseStream.end()

  writeBaseStream.on('finish', () => {
    if(cb){
      cb()
      return
    }
  })

}