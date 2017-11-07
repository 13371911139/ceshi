var express= require('express');
var superagent = require('superagent');
var router = express.Router();
//express body-parser swig iconv-lite bluebird request
router.post('/*',(req,res,next)=>{
    const data=req.body;
    var projjj=true;
    if(projjj){
        var apiURL = 'http://www.toumingxiuche.cn'+req.originalUrl;
    }else{
        var apiURL = '192.168.0.117:8080'+req.originalUrl;
    }
    superagent
        .post(apiURL)
        .type('form')
        .accept('json')
        .send(data)
        .set('X-API-Key', 'foobar')
        .set('Accept', 'application/json')
        .end(function(reqe,rese){
            console.log(rese.body);
            res.json(rese.body)
        });
});
router.get('/*',(req,res,next)=>{
    console.log(typeof(data));
    r.post({url:'http://www.toumingxiuche.cn'+req.originalUrl,form:req.body}).pipe(res);

});
module.exports = router;