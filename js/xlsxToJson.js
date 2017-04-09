const fs = require('fs');
const path = require('path');
const Excel = require('exceljs');
const baby = require("babyparse");

function convertXslxTo(fileName, cb){
  let base = [];
  let options = {
    dateFormats: ['DD/MM/YYYY']
  };
  var workbook = new Excel.Workbook();
  workbook.xlsx.readFile(fileName, options)
    .then(function(){
      var worksheet = workbook.getWorksheet(1);
      cb('rowLength', worksheet.rowCount)
      worksheet.eachRow(function(row, rowNumber){
        let rowText = [""];
        let rowString = row.eachCell({ includeEmpty: true },(cell, colNum) => {
          try{
            rowText.push(cell.text == '[object Object]' ? '' : cell.text)
          }catch(e){}
        })
        if(worksheet.columnCount+1 == rowText.length){
          base.push(rowText)
        }
        cb('rowCurrent', rowNumber)
      })
      cb('data', base )
    })
    .catch(error => {
      cb('error', error )
    });
}

module.exports = convertXslxTo