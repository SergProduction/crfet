const copy = require('recursive-copy');

let count = 0

process.on('message', data=> {
  count+=1
  //if(count == 4){
  //  process.send({type:'stop'})
  //}
  if(data.type == 'count?'){
    process.send({type:'count', data:count})
  }
  //console.log('start',count)
  if(data.type == 'copy'){
    myCopy(data.source, data.target)
  }
})

function queue(err){
  if(err){
    process.send({type:'error'})
  }
  else{
    //process.send({type:'success': data:count})
  }
  count-=1;
  console.log({type:'success', data:count}, count == 1)
  if(count == 1){
    process.send({type:'continue'})
  }
}

function myCopy(source, target){
  //if(!source || !target){
  //  process.send({type:'error'})
  //  return
  //}
  console.log('myCopy',source, target)
  copy(source, target)
    .then( results => {
      //console.log('Copied ' + results.length + ' files');
      queue()
    })
    .catch( error => {
      //console.error('Copy failed: ' + error);
      queue(error)
    });

}