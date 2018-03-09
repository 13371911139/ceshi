var express= require('express');
var superagent = require('superagent');

var router = express.Router();
//express body-parser swig iconv-lite bluebird request
var projjj=true;

router.post('/*',(req,res,next)=>{
    if(projjj){
        var apiURL = 'http://www.beidouchaxun.cn'+req.originalUrl;
    }else{
        // var apiURL = 'http://121.43.165.81:8888'+req.originalUrl;
        var apiURL = 'http://192.168.0.129:8080'+req.originalUrl;
    }

   if(req.headers.cookie){
        var ServerCookie = req.headers.cookie;
    }
    const data=req.body;
   console.log(apiURL,data)
    superagent
        .post(apiURL)
        .type('form')
        .accept('json')
        .send(data)
        .set('X-API-Key', 'foobar')
        .set('Accept', 'application/json')
        .set('Cookie', ServerCookie)
        .end(function(reqe,rese){
            try{
                console.log(rese,reqe)
                if(rese.ok) {
                    if (rese.headers && rese.headers['set-cookie']) {
                        var Cookies = {};
                        rese.headers['set-cookie'][0].split(';').forEach(l => {
                            var parts = l.split('=');
                            Cookies[parts[0].trim()] = (parts[1] || '').trim();
                        });
                        res.cookie('app_sid', Cookies.app_sid)
                    }
                    if(rese.body){
                        res.json(rese.body)
                    }
                }else{
                    res.json({msg:'请求异常',code:'911',text:rese.text})
                }
            }catch (e){
                console.log(e)
                res.json({msg:'您请求的地址可能不存在',code:'119',text:rese ? rese.text :'地址错误'})

            }

        });
});
router.get('/',(req,res,next)=>{
    if(projjj){
        var apiURL = 'http://www.beidouchaxun.cn'+req.originalUrl;
    }else{
        var apiURL = '192.168.0.113:8080'+req.originalUrl;
    }

    if(req.headers.cookie){
        var ServerCookie = req.headers.cookie;
    }
    const data=req.body;
    superagent
        .get(apiURL)
        .accept('json')
        .send(data)
        .set('X-API-Key', 'foobar')
        .set('Accept', 'application/json')
        .end(function(reqe,rese){
            try {
                if (rese.ok) {
                    if (rese.headers && rese.headers['set-cookie']) {
                        var Cookies = {};
                        rese.headers['set-cookie'][0].split(';').forEach(l => {
                            var parts = l.split('=');
                            Cookies[parts[0].trim()] = (parts[1] || '').trim();
                        });
                        res.cookie('app_sid', Cookies.app_sid)
                    }
                    if (rese.body) {
                        res.json(rese.body)
                    }
                } else {
                    res.json({msg: '请求异常', code: '911', text: rese.text})
                }
            }catch (e){
                console.log(e)
                res.json({msg:'您请求的地址可能不存在',code:'119',text:rese.text})

            }
        });
});
module.exports = router;