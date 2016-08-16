var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server');
var botkit = require('../app/controllers/botkit');
var expect = require('chai').expect;

describe('example', function(){
  it('should work', function(done) {
    foo = "bar";

    expect(foo).to.equal("bar");
    done();
  });
});
