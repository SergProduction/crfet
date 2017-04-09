(function(){

const fs = require('fs');
const path = require('path');
const fork = require('child_process').fork

const {dialog} = require('electron').remote

const {preloaderCreate} = require('./../js/preload')

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

let baseXlsxPath;

let sel_dataXlsx;
let buttonConvertXlsxToJson;
let buttonSaveJson;
let buttonRemoveJson
let buttonRemoveConfig
let buttonloadConfig
let inputNameConfig
let buttonSaveConfig

let preload
let newBase //переменная для конвертации xlsx -> json 

window.addEventListener('load', ()=>{
  initVariable()
  initHandler()
  updateBaseListUi()
  updateConfigListUi()
  start()
})

function initVariable(){
  sel_dataXlsx            = document.getElementById('sel_dataXlsx')
  buttonConvertXlsxToJson = document.getElementById("convertXlsxToJson")
  buttonRemoveJson        = document.getElementById("removeJson")
  buttonRemoveConfig      = document.getElementById("removeConfig")
  inputNameConfig         = document.getElementById("nameConfig")
  buttonSaveConfig        = document.getElementById("saveConfig")
  buttonloadConfig        = document.getElementById("loadConfig")
  preload = preloaderCreate()
}

function initHandler(){
  sel_dataXlsx.addEventListener('click', selBase)
  buttonConvertXlsxToJson.addEventListener('click', convertAndSave)
  buttonRemoveJson.addEventListener('click', removeBaseJson)
  buttonRemoveConfig.addEventListener('click', removeConfigJson)
  buttonSaveConfig.addEventListener('click', saveConfig)
  buttonloadConfig.addEventListener('click', loadConfig)
}


function selBase(){
  let xlsxPath = dialog.showOpenDialog({properties: ['openFile']})
  if(!xlsxPath) return
  xlsxPath = path.normalize(xlsxPath[0])
  baseXlsxPath = xlsxPath
}


function getListFile(dir){
  let baseList = fs.readdirSync(path.join(__dirname, dir))
  return baseList
}


function updateBaseListUi(){
  let baseListUi = document.getElementsByClassName('baseListUi')
  let newBaseList = getListFile('../base')

  if(!newBaseList.length)
    for(let sel of baseListUi )
      sel.innerHTML = ''

  for(let i=0; i<newBaseList.length; i++){
    for(let sel of baseListUi )
      sel.remove(i)
  }
  newBaseList.forEach( el =>{
    for(let sel of baseListUi ){
      let option = document.createElement("option");
      option.value = el
      option.text = el
      sel.add(option)
    }
  })
}

function updateConfigListUi(){
  let loadConfigUi = document.getElementsByClassName('usConfUi')
  let newConfigList = getListFile('../usConfig')

  if(!newConfigList.length)
    for(let sel of loadConfigUi )
      sel.innerHTML = ''

  for(let i=0; i<newConfigList.length; i++){
    for(let sel of loadConfigUi )
      sel.remove(i)
  }
  newConfigList.forEach( el =>{
    for(let sel of loadConfigUi ){
      let option = document.createElement("option");
      option.value = el
      option.text = el
      sel.add(option)
    }
  })
}


function start(){
  
}

function getName(name) {
  return document.getElementsByName(name)[0]
};


function convertAndSave(){
  let convertAndSaveChild = fork(path.join(__dirname, './../js/runConvertAndSave.js'), [], {silent:true})

  let data = {
    baseXlsxPath,
    nameJsonBase: document.getElementById("nameJsonBase").value
  };
  let loadXLSX = preload.load()
  loadXLSX.image(true)
  loadXLSX.text('ЧТЕНИЕ ...')

  convertAndSaveChild.send(data)
  let lengthRow;
  convertAndSaveChild.on('message', data => {
    switch(data.type){
      case 'ROW LENGTH':
        lengthRow = data.data
        loadXLSX.text('КОНВЕРТАЦИЯ ...')
        loadXLSX.image(false)
        console.log('ROW LENGTH', data.data)
        break
      case 'ROW CURRENT':
        loadXLSX.text(`строк обработанно: ${data.data} из ${lengthRow}`)
        loadXLSX.progress(data.data*100/lengthRow)
        //console.log('ROW CURRENT', data)
        break
      case 'CONVERT FINISH':
        loadXLSX.progress(100)
        loadXLSX.text('СОХРАНЕНИЕ ...')
        loadXLSX.image(true)
        console.log('CONVERT FINISH')
        break
      case 'CONVERT ERROR':
        preload.complite()
        console.log('CONVERT ERROR')
        break
      case 'SAVE FINISH':
        preload.complite()
        console.log('SAVE FINISH')
        break
      default:
        //console.log('неизвесная ошибка конвертации и сохранения', data.type, data.data)
        //preload.complite()
    }
    //preload.complite()
    updateBaseListUi()
  })
  convertAndSaveChild.stderr.on('data', err => {
    console.log(err.toString())
  })
  convertAndSaveChild.stdout.on('data', data => {
    console.log(data.toString())
  })
}


function saveConfig(){
  let xlsx          = getName('xlsx').checked
  let dirInDir      = getName('dirInDir').checked
  let splitDir      = getName('splitDir').value
  let splitFile     = getName('splitFile').value
  let splitXlsx     = getName('splitXlsx').value
  let splitBase     = getName('splitBase').value
  let equalBaseDir  = getName('equalBaseDir').value
  let equalBaseFile = getName('equalBaseFile').value
  let endDir        = getName('endDir').value
  let endFile       = getName('endFile').value

  let save = {
    xlsx          ,
    dirInDir      ,
    splitDir      ,
    splitFile     ,
    splitXlsx     ,
    splitBase     ,
    equalBaseDir  ,
    equalBaseFile ,
    endDir        ,
    endFile       
  }

  console.log(save)
  
  let nameConfig = inputNameConfig.value
  nameConfig = path.join(__dirname, '../usConfig', nameConfig+'.json')

  preload.load()
  fs.writeFile(nameConfig, JSON.stringify(save), {encoding: 'utf8'}, err => {
    if (err) throw err;
    console.log('The file has been saved!');
    preload.complite()
  })

}

function loadConfig(){
  let loadConfigUi = document.getElementsByClassName('usConfUi')[0]
  let listConfig = getListFile('../usConfig')
  let pathFile = path.join(__dirname, '../usConfig', loadConfigUi.value)
  fs.readFile(pathFile, {encoding:'utf8'}, (err, data) => {
    if (err) throw err;
    let configValue = JSON.parse(data);
    Object.keys(configValue).forEach(key => {
      let htmlElem = getName( key )
      if( htmlElem.type == 'text'){
        htmlElem.value = configValue[key]
      }
      else{
        htmlElem.checked = configValue[key]
      }
    })
  })
}

function removeBaseJson(e){
  let baseListUi = document.getElementsByClassName('baseListUi')[1]
  let pathFileToRemove = path.join(__dirname, '../base', baseListUi.value)
  fs.unlink(pathFileToRemove, error=> {
    if(error) console.log(error)
    updateBaseListUi()
  })
}

function removeConfigJson(e){
  let baseListUi = document.getElementsByClassName('usConfUi')[1]
  let pathFileToRemove = path.join(__dirname, '../usConfig', baseListUi.value)
  fs.unlink(pathFileToRemove, error=> {
    if(error) console.log(error)
    updateConfigListUi()
  })
}

function parseBase(){
  nameJsonBase = path.join(__dirname, '../base/mini.json')
  nameJsonBase = fs.readFileSync(nameJsonBase)
  nameJsonBase = JSON.parse(nameJsonBase)
}

})()