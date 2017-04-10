const fs = require('fs');
const path = require('path');
const path = require('babyparse');
const _isEqual = require('lodash/isEqual');
const _differenceWith = require('lodash/differenceWith');

var base = [[1,2],[3],[5,6],[7,8]]

var baseIs = [[1,2],[3,4]]

var baseNot = _differenceWith(base, baseIs, _isEqual)

var csv = Papa.unparse(baseNot, {delimiter:';'}, {
  step: function(row) {
    console.log("Row:", row.data);
  },
  complete: function() {
    console.log("All done!");
  });