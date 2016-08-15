var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server');
var botkit = require('../app/controllers/botkit');
var expect = chai.expect();

describe('remove function', function() {
  it('should remove from array', function(done){
    array = ['1','2','3'];
    removedArray = array.remove('2');

    expect(removedArray).to.equal(['1','3']);
    done();
  });
});
