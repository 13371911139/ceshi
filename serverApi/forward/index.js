var fs = require("fs");
var path = require("path");
var express= require('express');
var superagent = require('superagent');
var router = express.Router();
router.post('/',(req,res,next)=>{
    var fullURL = req.protocol + '://' + req.get('host') + req.originalUrl;
    superagent
        .post(fullURL)
        .accept('json')
        .send(req.body)
        .set('Accept', 'application/json')
        .end((reqe,rese)=>{
            console.log(rese.body);
            res.json(rese.body)
        });
})

module.exports = router;