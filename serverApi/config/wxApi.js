var superagent = require('superagent');
const APPID='wx4b3cc819d682ce0e';
const APPSECRET='07826b26a4f149ccfacba09426fa980c'
const wxApi={
    getToken:()=>{
        superagent.get('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='+APPID+'&secret='+APPSECRET).accept('json').end(function(reqe,rese){
            console.log(rese,getHeader);
            res.json(rese.body)
        });
    }
}
module.exports = wxApi;