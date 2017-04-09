window.addEventListener('load', () => {

let leftPan = document.getElementById('leftPan')
let rightPan = document.getElementById('rightPan')

rightPan.children[0].classList.add('arrow-right')
leftPan.children[0].classList.add('arrow-left')

leftPan.parentElement.addEventListener('click', e => {
  leftPan.parentElement.style.width = '100%'
  leftPan.parentElement.getElementsByClassName('content')[0].style.display = ''
  rightPan.parentElement.style.width = '1%'
  rightPan.parentElement.getElementsByClassName('content')[0].style.display = 'none'
})

rightPan.parentElement.addEventListener('click', e => {
  rightPan.parentElement.style.width = '100%'
  rightPan.parentElement.getElementsByClassName('content')[0].style.display = ''
  leftPan.parentElement.style.width = '1%'
  leftPan.parentElement.getElementsByClassName('content')[0].style.display = 'none'
})

let mainDesc = document.getElementsByTagName('a')[0]
mainDesc.toggle = true

mainDesc.addEventListener('click', (e)=>{
  e.preventDefault()
  let toggle = e.target.toggle ? 'inherit' : '40px'
  e.target.parentElement.parentElement.style.height = toggle
  e.target.toggle = !e.target.toggle
})

})