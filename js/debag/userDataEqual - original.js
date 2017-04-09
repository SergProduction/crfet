//var fileName = '7_8_9'//имя файла
var fileName = '8_sdf'
var folderName = '55'

//var usfile = fileName.split('_')//разделить имени файла
var a = ''//разделитель имени файла
var b = ''//разделитель имени папки

var usfile = a ? fileName.split(a) : [fileName]//разделить имени файла
var usfolder = a ? folderName.split(b) : [folderName]//разделить имени файла

var usXlsx = false//true

var usXlsxColSplit = ""//"1" or "1;_;1" or ""

//var data = "2;1,3;2,4;3"//укажите в каком стобце таблици какую часть имени файла использовать
var usTabRowNameFileVal = "3;1"//укажите в каком стобце таблици, какую часть имени файла сравнивать (можно оставить пустым)

var usTabRowNameFolderVal = "6;1"//укажите в каком стобце таблици, какую часть имени папки сравнивать (можно оставить пустым)

var usTabRowNameXlsxVal = "6;1"//укажите в каком стобце таблици, какую часть имени папки сравнивать (можно оставить пустым)


//var usRowSplitVal = "2;_;1,3;_;1,4;_;1"/для изменения имени в базе. укажите столбец; разделить имени; индекс
var usRowSplitVal = "2;_;1,3,4;_;1"//для изменения имени в базе. укажите столбец; разделить имени; индекс

//var usRenameFolred = '1' //столбец из таблици
var usRenameFolred = ':myFolder' // в одну папку с :одним названием

var usRenameFile   = '5; ;1'//либо столбец разделитель индекс("5; ;1"), либо столбец("5"), + имя ("5; ;1:myname") или ("5:myname") // тоже самое и с usRenameFolred


var table = [
[null,1,2,3,4,5],
[null,'folYES','7_kljf','8_sdf','9_asd','filYES lab',55],
[null,11,12,13,14,15]]


function validNum(val){
  val = parseInt(val[0])
  if( val <= 0 || val >= 0)
    return true
  else
    return false
}

function validNameFileOrFolder(name){
    //'1'
    //'5; ;1'
    if( name[0] == ':')
      return true
    let val = name.split(';')
    if( val.length == 1){
      return validNum(val[0])
    }
    else if(val.length == 3){
      return validNum(val[0]) && validNum(val[2])
    }
    else{
      return false
    }
}

function validRowSplitVal(name){
  //"2;_;1, 3;_;1, 4"
  let usVarValid = name.split(',')
  for( let i of usVarValid){
    let val = i.split(';')
    if( val.length == 1){
      return validNum(val[0])
    }
    else if(val.length == 3){
      return validNum(val[0]) && validNum(val[2])
    }
    else{
      return false
    }
  }
}

function validRowFileNameOrFolder(name){
  //"2;1,3;2,4;3" or ""
  if(!name)
    return true
  let rowFileName = name.split(',')
  for( let i of rowFileName){
    let val = i.split(';')
    if( val.length == 2){
      return validNum(val[0]) && validNum(val[1])
    }
    else{
      return false
    }
  }
}

function validUserVal(usRowSplitVal, usTabRowNameFileVal, usTabRowNameFolderVal, usRenameFolred, usRenameFile){//разделитель строк в таблице, сравнение таблици с именем файла, новое имя дир, новое имя файла
  try{
    
    if(  !validNameFileOrFolder(usRenameFolred) ||
         !validNameFileOrFolder(usRenameFile  )    ){
      throw new SyntaxError('notNumber')
    }
    else if( !validRowSplitVal(usRowSplitVal) ){
      throw new SyntaxError('notNumber')
    }
    else if( !validRowFileNameOrFolder(usTabRowNameFileVal) ){
      throw new SyntaxError('notNumber')
    }
    else if( !validRowFileNameOrFolder(usTabRowNameFolderVal) ){
      throw new SyntaxError('notNumber')
    }
    else{
      console.log('valide!')
    }
  }
  catch(e){
    if(e.message == 'notNumber')
      console.log('not validate')
  }
}

validUserVal(usRowSplitVal, usTabRowNameFileVal, usTabRowNameFolderVal, usRenameFolred, usRenameFile)

function start(base, xlsxCol){
  if(
  !Array.isArray(base) ||
  !Array.isArray(xlsxCol)
  ){
    console.warn('base or xlsxCol, not array')
    return
  }

  if(!xlsxCol && base)
  for( let row of base ){
    let uif = userEqual(row, usRowSplitVal, usTabRowNameFileVal, usTabRowNameFolderVal)
    if( uif){
      let newName = newNameFilderAndFile(row, oldName, usRenameFolred, usRenameFile)
      renameFileOrFolred(newName)
    }
  }

  if(xlsxCol && base)
  for( let row of base ){
    for( let cell of xlsxCol ){
      let uif = userEqual(row, usRowSplitVal, usTabRowNameFileVal, usTabRowNameFolderVal)
      if( uif){
        let newName = newNameFilderAndFile(row, oldName, usRenameFolred, usRenameFile)
        renameFileOrFolred(newName)
      }
    }
  }
}

let oldName = {
  folder:folderName,
  file:fileName
}

start(table)

function newNameFilderAndFile(row, oldName, usRenameFolred, usRenameFile){//текущая строка, новое имя дир, новое имя файла
  let folName = oldName.folder; // new name folred
  let filName = oldName.file  ; // new name file
  if( usRenameFolred ) //если задали конечное имени файла
  { // создает новое имя папки из общей табллици необ.(по разделителям)
    let split = usRenameFolred.split(';')
    let uName = usRenameFolred.split(':')[1] //"1:myName" or "1;_;1:myName"
    if( usRenameFolred[0] == ':'){           //":myname"
      folName = usRenameFolred.slice(1) + (uName ? uName : '')
    }
    else if(split.length == 1 && split[0]){  //"1"
      let index        = split[0]
      folName = row[ index ] + (uName ? uName : '')
    }
    else if(split.length == 3){              //"1;_;1"
      let index        = split[0]
      let usSplit      = split[1]
      let indexUsSplit = split[2]
      folName = row[ index ].split(usSplit)[indexUsSplit-1] + (uName ? uName : '')
      if(!folName)
        folName = 'other'
    }
    else{
      folName = 'other'
    }
  }
  if( usRenameFile ) //если задали конечное имени директории
  { // создает новое имя файла из общей табллици необ.(по разделителям)
    let split = usRenameFile.split(';')
    let uName = usRenameFile.split(':')[1]   //"1:myName" or "1;_;1:myName"
    if( usRenameFile[0] == ':'){             //":myname"
      filName = usRenameFile.slice(1) + (uName ? uName : '')
    }
    else if(split.length == 1 && split[0]){  //"1"
      let index        = split[0]
      filName = row[ index ] + (uName ? uName : '')
    }
    else if(split.length == 3){              //"1;_;1"
      let index        = split[0]
      let usSplit      = split[1]
      let indexUsSplit = split[2]
      filName = row[ index ].split(usSplit)[indexUsSplit-1] + (uName ? uName : '')
      if(!filName)
        filName = 'other'
    }
    else{
      filName = 'other'
    }
  }
  console.log(folName, filName)
  return {folder:folName, file: filName}
}

var usXlsxColSplit = ""//"1" or "1;_;1" or ""
var usTabRowNameXlsxVal = "6;1"

function test(cell, usXlsxColSplit, usTabRowNameXlsxVal){
  let groupSplitCell = usXlsxColSplit.split(',')
  let groupSplitBase = usTabRowNameXlsxVal.split(',')
  try{

  }catch(e){

  }
}

function userEqual(row, usRowSplitVal, usTabRowNameFileVal, usTabRowNameFolderVal) {//текущая строка, разделитель строк в таблице, сравнение таблици с именем файла
  let usRowSplit         = usRowSplitVal.split(',')
  let usTabRowNameFile   = usTabRowNameFileVal.split(',')
  let usTabRowNameFolder = usTabRowNameFolderVal.split(',')
  try{
    let rowMod = row;
    let result = [];
    for( let urs of usRowSplit ){//раделяет строки в ячейках из общей таблици по пользовательским разделителями
        if(!urs)
          break
        let split = urs.split(';')
        if(split.length == 1){
          let index        = split[0]
          rowMod[index] = row[index]
        }
        if(split.length == 3) {
          let index        = split[0]
          let usSplit      = split[1]
          let indexUsSplit = split[2]
          rowMod[index] = row[index].split(usSplit)[indexUsSplit-1]
        }
    }
    for( let rnf of usTabRowNameFile ){//сравнивает знаение из ячеек(общая таблица) c значениями из имени текущего файла(так же, может быть разделен)
      if(!rnf)
        break
      let usRow    = rowMod[ rnf.split(';')[0] ]
      let ufileCol = usfile[ rnf.split(';')[1]-1 ]
      if( usRow == ufileCol ){
        result.push(true)
      }
    }
    for( let rnf of usTabRowNameFolder){
      if(!rnf)
        break
      let usRow    = rowMod[ rnf.split(';')[0] ]
      let ufileCol = usfile[ rnf.split(';')[1]-1 ]
      if( usRow == ufileCol ){
        result.push(true)
      }
    }
    if( result.length == usTabRowNameFile.length + usTabRowNameFolder.length)
      return true
  }catch(e){
    console.error(e)
    return false
  }
}

function renameFileOrFolred(newName){
  //newName.file
  //newName.folder
  //fs.mkdir or copy file
}