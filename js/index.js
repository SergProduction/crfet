const fs = require('fs');
const path = require('path');

const {dialog} = require('electron').remote

const xlsxToJson = require('./../js/xlsxToJson')

function selFolder(){
  let dir = dialog.showOpenDialog({properties: ['openFile', 'openDirectory', 'multiSelections']})
  console.log(dir)
  onloadDir(dir[0])
}

function onloadDir(dir){
  //e.target.value
  try{
    dir = path.normalize(dir)
    let list = fs.readdirSync(dir)
    list.forEach(el => {
      document.write('<p>'+el+'</p>')
    })
  }catch(e){
    console.error(e)
  }
}

function preloaderCreate(){
  let progress = document.createElement('div');
  progress.style.cssText = `
  `
  let text = document.createElement('div');
  text.style.cssText = `
  `
  let img = document.createElement('img')
  img.src = '../img/preloader.gif';
  img.style.cssText = `
    position: absolute;
    width: 100px;
    left: 50%;
    top: 50%;
    transform: translate(-50%,-50%);
    background: #fff;
    border-radius: 50%;
    box-shadow: inset 0 0 50px 0px;`
  ;
  let back = document.createElement('div');
  back.style.cssText = `
    background: #000;
    position: absolute;
    z-index:5;
    width:100%;
    height:100%;
    left:0;
    top:0;
    opacity:0.8;
    display:none;
  `;
  document.body.appendChild(back)
  back.appendChild(text)
  back.appendChild(progress)
  back.appendChild(img)


  function complite(){
    back.style.display = 'none';
  }
  function load(){
    back.style.display = '';
  }
  return {load, complite}
}

let baseXlsxPath = []

let sel_dataXlsx;
let buttonConvertXlsxToJson;
let buttonSaveJson;

let buttonSourceDirectory
let buttonXlsxDirectory
let buttontargetDirectory
//let tab1
//let tab2
let preload
let oldBaseAndPath = []
let buttonRemoveJson
let newBase //переменная для конвертации xlsx -> json 

window.addEventListener('load', ()=>{
  console.log('load document');
  {//инициализация html елементов
    //tab1                    = document.getElementById('tab1')
    //tab2                    = document.getElementById('tab2')
    sel_dataXlsx            = document.getElementById('sel_dataXlsx')
    buttonConvertXlsxToJson = document.getElementById("convertXlsxToJson")
    buttonSaveJson          = document.getElementById("saveJson")
    
    buttonRemoveJson        = document.getElementById("removeJson")
    
    buttonSourceDirectory   = document.getElementById("sourceDirectory")
    buttonXlsxDirectory     = document.getElementById("xlsxDirectory")
    buttonTargetDirectory   = document.getElementById("targetDirectory")
  }
  {//назначение обработчиков
    sel_dataXlsx.addEventListener('click', selBase)
    buttonConvertXlsxToJson.addEventListener('click', convert)
    buttonSaveJson.addEventListener('click', saveJson)
    
    buttonRemoveJson.addEventListener('click', removeJson)
    
    buttonSourceDirectory.addEventListener('click', sourceDirectorySelect)
    buttonXlsxDirectory.addEventListener('click', xlsxDirectorySelect)
    buttonTargetDirectory.addEventListener('click', targetDirectorySelect)
    preload = preloaderCreate()
    preload.load()
  }
  start()
})

function sourceDirectorySelect(){
  let sourceDirPath = dialog.showOpenDialog({properties: ['openDirectory']})
  if( !sourceDirPath ) return false
  sourceDirPath = path.normalize(sourceDirPath[0])
  oldBaseAndPath.push({value:sourceDirPath, name:'исходная папка'})
}

function xlsxDirectorySelect(){
  let xlsxDirPath = dialog.showOpenDialog({properties: ['openDirectory']})
  if( !xlsxDirPath ) return false
  xlsxDirPath = path.normalize(xlsxDirPath[0])
  oldBaseAndPath.push({value:xlsxDirPath, name:'промежуточные xlsx файлы'})
}

function targetDirectorySelect(){
  let targetDirPath = dialog.showOpenDialog({properties: ['openDirectory']})
  if( !targetDirPath ) return false
  targetDirPath = path.normalize(targetDirPath[0])
  oldBaseAndPath.push({value:'file_name', name:'имя файла'})
  //oldBaseAndPathList()
}

function selBase(){
  let xlsxPath = dialog.showOpenDialog({properties: ['openFile']})
  if(!xlsxPath) return
  xlsxPath = path.normalize(xlsxPath[0])
  baseXlsxPath.push(xlsxPath)
}


function getBaseList(){
  let baseList = fs.readdirSync(path.join(__dirname, '../base'))
  return baseList
}

function convert(){ //xlsx -> json //newBase
  preload.load()
  xlsxToJson(baseXlsxPath[0], (type, toJson)=>{
    if(type == 'error'){
      console.log('Ошибка чтения документа .xlsx\n', toJson)
      return
    }
    preload.complite()
    newBase = toJson.slice()
    toJson = null
  })
}

function saveJson(){//json save in file  system //newBase

  let nameJsonBase = document.getElementById("nameJsonBase").value
  nameJsonBase = path.join(__dirname, '../base', nameJsonBase+'.json')
  console.log('json to text success')
  
  const writeBaseStream = fs.createWriteStream( nameJsonBase, {defaultEncoding: 'utf8'})
  
  writeBaseStream.write('[')
  newBase.forEach( (el,i,arr) => {
    if(i == arr.length-1){
      writeBaseStream.write( JSON.stringify(el) + '\n')
    }
    else{
      writeBaseStream.write( JSON.stringify(el) + ',\n')
    }
  })
  writeBaseStream.write(']')
  writeBaseStream.end()
  updateBaseListUi()
}

function updateBaseListUi(){
  let baseListUi = document.getElementById('baseListUi')
  let newBaseList = getBaseList()

  for(let i=0; i<newBaseList.length; i++){
    baseListUi.remove(i)
  }
  newBaseList.forEach( el =>{
    let option = document.createElement("option");
    option.value = el
    option.text = el
    baseListUi.add(option)
  })
}

function removeJson(e){
  let baseListUi = document.getElementById('baseListUi')
  let pathFileToRemove = path.join(__dirname, '../base', baseListUi.value)
  fs.unlink(pathFileToRemove, error=> {
    if(error)
      console.log(error)
    updateBaseListUi()
  })
}


function start(){
  
}