const fs = require('fs');
const path = require('path');
const fork = require('child_process').fork
const xlsxToJson = require('./../js/xlsxToJson')

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

let args;
let base;
let iterFile
let copy
let countStop = 0;

process.on('message', function(param) {
  args = param
  
  iterFile = generatorFileInFolder(args.userPath.source , args.dirInDir)

  let pathBase = path.join(__dirname,'./../', 'base', args.baseName)
  base = JSON.parse( fs.readFileSync(pathBase).toString() )
  
  copyWatch()
})

function copyWatch(){
  copy = fork('./js/runCopy.js', [], {silent:true})

  copy.on('message', data => {
    //if(data.type == 'stop'){
    //  //console.log('copy stop')
    //}
    //if(data.type == 'success'){
    //  //console.log('copy success')
    //  if( data.data <= 4){}
    //}
    if(data.type == 'count'){
      console.log('copy count', data.data)
      countStop = data.data
      if(countStop <= 4){
        controlStarting()
      }
    }
    if(data.type == 'error'){
      console.log('copy error')
    }
    if(data.type == 'continue'){
      countStop = 0
      controlStarting()
      console.log('copy continue')
    }
  })
  copy.stderr.on('data', err => {
    console.log('runCopy.js:error', err.toString())
  })
  copy.stdout.on('data', err => {
    console.log('runCopy.js:console', err.toString())
  })

  controlStarting()
}

function controlStarting(){
  if(countStop <= 4){
    start()
  }else{
    copy.send({type:'count?'})
  }
}

function start(){
  let iter = iterFile.next()
  let file = iter.value
  console.log(file, iter.done, countStop)
  if(iter.done){
    copy.kill();
    process.send({type:'finish', data:null })
    return
    //logWrite
  }
  if(!args.xlsx){
    for(let row of base){
      let modDirFile = splitDirFile(file.file, args.splitFile, file.dir, args.splitDir)
      let usTrue = userEqual(row, args.splitBase, modDirFile, args.equalBaseFile, args.equalBaseDir)
      if(usTrue){
        let newName = {
          file:newNameSplit(row, file.file, args.endFile),
          dir :newNameSplit(row, file.dir , args.endDir )
        }
        console.log(newName.file,newName.dir)
        let copyPath = copyPathJoin(args.userPath.source,file.dir, file.file, args.userPath.target, newName.dir, newName.file, file.ext)
        //process.send({type:'copy', data:{source: copyPath.source, target:copyPath.target} })
        copy.send({type:'copy', source: copyPath.source, target:copyPath.target})
        countStop+=1
      }
    }
    process.send({type:'count', data:file.count })
    controlStarting()
  }
  if(args.xlsx){
    let pathXlsx = path.join(args.userPath.sourceXlsx, file.dir, file.file + '.xlsx')
    xlsxToJson(pathXlsx, (type, data) => {
      if(type == 'error'){
        console.log('xlsx read error', data)
        controlStarting()
        return
      }
      process.send({type:'rad', data:data})
      if(type == 'data'){
      for(let xl of data){
        for(let row of base){
          let rowXl = modXlsx(xl, args.splitXlsx)
          let modDirFile = splitDirFile(file.file, args.splitFile, file.dir, args.splitDir)
          modDirFile.file = rowXl
          let usTrue = userEqual(row, args.splitBase, modDirFile, args.equalBaseFile, args.equalBaseDir)
          if(usTrue){
            let newName = {
              file:newNameSplit(row, file.file, args.endFile),
              dir :newNameSplit(row, file.dir , args.endDir )
            }
            let copyPath = copyPathJoin(args.userPath.source,file.dir, file.file, args.userPath.target, newName.dir, newName.file)
            console.log('cop:',copyPath.source, copyPath.target)
            copy.send({type:'copy', source: copyPath.source, target:copyPath.target})
            countStop+=1
          }
        }
      }
      process.send({type:'count', data:file.count })
      controlStarting()
      }
    })
  }
}

function modXlsx(row, splitXlsx){
  /*предварительное изменение промежуточного xlsx по разделителю*/
  let rowMod = row;
  let result = [];
  let sXlsx   = splitXlsx.split(',')
  sXlsx = splitXlsx ? sXlsx : []
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

function userEqual(row, splitBase, modDirFile, equalBaseFile, equalBaseDir, xlsxData){
/* сравнивает  базой имя файла/xlsx, директории
row           | cтрока базы: массив, ([null,"15 август","55 Филатов",1854,"25.03.17",null,5])
splitBase     | предварительный разделитель базы: строка ("1; ;1,2; ;1")
modDirFile    | имя файла/каталога: объект с масивами ({file["1;1"], dir["1;1"]} or {file["1"], dir["1"]})
equalBaseFile | столбец строки; часть имени файла/xlsx : строка ("1;1" or "1")
xlsxData      | двумерный масив [[],[]...]
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
      newName = row[index].split(usSplit)[indexUsSplit-1] + (uName ? uName : '')
  }
  else if(splitRow.length == 1){                        //"1:myName"
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