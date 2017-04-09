(function(){

const fork = require('child_process').fork
const path = require('path');
const {dialog} = require('electron').remote
const {preloaderCreate} = require('./../js/preload')

let userPath = {}

let buttonSourceDirectory
let buttonXlsxDirectory
let buttontargetDirectory

let dash         
let xlsx          
let dirInDir      
let splitDir      
let splitFile     
let splitXlsx     
let splitBase     
let equalBaseDir  
let equalBaseFile 
let endDir        
let endFile       
let preloader     

function getName(name) {
  return document.getElementsByName(name)[0]
}

window.addEventListener('load', ()=> {
  initVariable()
  preloader = preloaderCreate()

  buttonSourceDirectory.addEventListener('click', sourceDirectorySelect)
  buttonXlsxDirectory.addEventListener('click', xlsxDirectorySelect)
  buttonTargetDirectory.addEventListener('click', targetDirectorySelect)

  getName('xlsx').addEventListener('click', (e)=>{
    let toggle = e.target.checked ? '' : 'none'
    getName('splitXlsx').parentElement.style.display = toggle
  })

  getName('dirInDir').addEventListener('click', (e)=>{
    let toggle = e.target.checked ? '' : 'none'
    getName('splitDir').parentElement.style.display = toggle
    getName('equalBaseDir').parentElement.style.display = toggle
  })

  document.getElementById('runCopyAndRaname').addEventListener('click', (e)=>{
    initVariable()
    start()
  })
})

function initVariable(){
  buttonSourceDirectory   = document.getElementById("sourceDirectory")
  buttonXlsxDirectory     = document.getElementById("xlsxDirectory")
  buttonTargetDirectory   = document.getElementById("targetDirectory")

  xlsx          = getName('xlsx').checked
  dirInDir      = getName('dirInDir').checked
  dash          = getName('dash').checked
  splitDir      = getName('splitDir').value
  splitFile     = getName('splitFile').value
  splitXlsx     = getName('splitXlsx').value
  splitBase     = getName('splitBase').value
  equalBaseDir  = getName('equalBaseDir').value
  equalBaseFile = getName('equalBaseFile').value
  endDir        = getName('endDir').value
  endFile       = getName('endFile').value
}

function sourceDirectorySelect(){
  let sourceDirPath = dialog.showOpenDialog({properties: ['openDirectory']})
  if( !sourceDirPath ) return false
  sourceDirPath = path.normalize(sourceDirPath[0])
  userPath.source = sourceDirPath
}

function xlsxDirectorySelect(){
  let xlsxDirPath = dialog.showOpenDialog({properties: ['openDirectory']})
  if( !xlsxDirPath ) return false
  xlsxDirPath = path.normalize(xlsxDirPath[0])
  userPath.sourceXlsx = xlsxDirPath
}

function targetDirectorySelect(){
  let targetDirPath = dialog.showOpenDialog({properties: ['openDirectory']})
  if( !targetDirPath ) return false
  targetDirPath = path.normalize(targetDirPath[0])
  userPath.target = targetDirPath
  //oldBaseAndPathList()
}

function start(){
  let baseName = document.getElementsByClassName('baseListUi')[0].value

  let data = {
    xlsx,
    dash,
    dirInDir,
    splitDir,
    splitFile,
    splitXlsx,
    splitBase,
    equalBaseDir,
    equalBaseFile,
    endDir,
    endFile,
    userPath,
    baseName
  }

  let copyAndRaname = fork(path.join(__dirname, './../js/runEqual.js'), [], {silent:true})

  copyAndRaname.send(data)
  let loading = preloader.load()
  loading.image(true)

  copyAndRaname.on('message', data => {
    console.log('eee',data)
    switch(data.type){
      case 'count':
        loading.text(`скопированно ${data.data.current} из ${data.data.all}`)
        loading.progress(data.data.current*100/data.data.all)
        loading.image(false)
      break
      case 'finish':
        loading.progress(100)
        loading.text('КОПИРОВАНИЕ ЗАВЕРШЕНО')
      break
      case 'save start':
        loading.text('СОХРАНЕНИЕ РЕЗУЛЬТАТОВ В ФАЙЛ')
        loading.image(true)
      break
      case 'save finish':
        preloader.complite()
        copyAndRaname.kill();
      break
      default:
        console.log('message copyAndRaname', data)
    }
  })
  copyAndRaname.stderr.on('data', err => {
    loading.error('Ошибка. Проверте правильность введенных данных')
    console.log(err.toString())
    copyAndRaname.kill();
  })
  copyAndRaname.stdout.on('data', err => {
    console.info(err.toString())
  })

}

})()