const fs = require('fs');
const path = require('path');
const fork = require('child_process').fork
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
let args;
let newBase;

let oldName = {
  folder:folderName,
  file:fileName
}
//----------------------------генераторы------------------------
function* generatorFolder(arrFolder){
  for(let i=0; i<arrFolder.length; i++)
    yield arrFolder[i]
}

function* generatorFileInFolder(folderPath, underFolder){
  if(underFolder){
    let folder     = fs.readdirSync(folderPath)
    let iterFolder = generatorFolder(folder)
    
    for( let dir of iterFolder){
      let fileList = fs.readdirSync(path.join(__dirname, dir))
      for(let file of fileList){
        yield {dir:dir, file:file}
      }
    }
  }
  else{
    let fileList = fs.readdirSync(folderPath)
      for(let file of fileList){
        yield {dir:dir, file:file}
      }
  }
}
//----------------------------

process.on('message', function(param) {
  args = param
  console.log(args)
  convert()
})

start()

function asd(){
  let iterFile = generatorFileInFolder()
  for(file of iterFile){
    
  }
}

function start(xlsx){
  if(!xlsx)
  for(let file of files){
    for(let row of base){
      let modDirFile = splitDirFile(file.file, args.splitFile, file.dir, args.splitDir)
      let usTrue = userEqual(row, args.splitBase, modDirFile, args.equalBaseFile, args.equalBaseDir)
      //if(usTrue)
      //  console.log(usTrue, modDirFile.file, modDirFile.dir)
    }
  }
  if(xlsx)
  for(let file of files){
    for(let xl of xlsx){
      for(let row of base){
        let rowXl = modXlsx(xl, args.splitXlsx)
        let modDirFile = splitDirFile(file.file, args.splitFile, file.dir, args.splitDir)
        modDirFile.file = rowXl
        let usTrue = userEqual(row, args.splitBase, modDirFile, args.equalBaseFile, args.equalBaseDir)
        //if(usTrue)
        //  console.log(usTrue, modDirFile.file, modDirFile.dir)
      }
    }
  }
}

function modXlsx(row, splitXlsx){
  /*предварительное изменение промежуточного xlsx по разделителю*/
  let rowMod = row;
  let result = [];
  let sXlsx   = splitXlsx.split(',')
  sXlsx = sXlsx[0] ? sXlsx : []

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