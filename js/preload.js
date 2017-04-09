function preloaderCreate(){
  let centerDiv = document.createElement('div');
  centerDiv.style.cssText = `
    position: absolute;
    text-align: center;
    color: #fff;
    width: 300px;
    left: 50%;
    top: 50%;
    transform: translate(-50%,-50%);
  `
  let loadDiv = document.createElement('div');
  loadDiv.style.cssText = `
    background: #57c1c5;
    width: 100%;
    height: 100%;
  `;
  let progressDiv = document.createElement('div');
  progressDiv.style.cssText = `
    display: none;
    width: 300px;
    height: 25px;
    margin: 15px 0;
    border: 1px solid #fff;
    border-radius: 5px;
  `;
  let textDiv = document.createElement('div');
  textDiv.style.cssText = `
    height: 50px;
    word-wrap: break-word;
  `;
  let img = document.createElement('img')
  img.src = '../img/load.gif';
  img.style.cssText = `
    display: none;
    width: 50px;
  `;
  let back = document.createElement('div');
  back.style.cssText = `
    background: #000;
    position: fixed;
    z-index:5;
    width:100%;
    height:100%;
    left:0;
    top:0;
    opacity:0.8;
    display:none;
  `;
  document.body.appendChild(back)
  back.appendChild(centerDiv)
  centerDiv.appendChild(textDiv)
  centerDiv.appendChild(progressDiv)
  centerDiv.appendChild(img)
  progressDiv.appendChild(loadDiv)

  function load(){
    back.style.display = '';
    return {image, progress, text, error}
  }
  function image(bool){
    if( bool === false ){
      img.style.display = 'none'
    }
    else if( bool === true){
      img.style.display = ''
    }
  }
  function progress(procent){
    progressDiv.style.display = ''
    loadDiv.style.width = `${procent}%`
    if(procent == 100){
      progressDiv.style.display = 'none';
      loadDiv.style.width = '0%'
    }
  }
  function text(usText){
    textDiv.innerHTML = usText
  }
  function error(usText){
    textDiv.innerHTML = `<span style="color:#f13939"><b>${usText}</b></span>`
    setTimeout(()=>{
      complite()
    },5000)
  }
  function complite(){
    back.style.display = 'none';
    progressDiv.style.display = 'none';
    loadDiv.style.width = '0%'
    textDiv.innerHTML = ''
    img.style.display = 'none'
  }
  return {load, complite, error}
}

module.exports = {preloaderCreate}