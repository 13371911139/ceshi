var superagent = require('superagent');
const APPID='wx4b3cc819d682ce0e';
const APPSECRET='07826b26a4f149ccfacba09426fa980c'
const wxApi={
    getToken:(fun)=>{
        superagent.get(getToken).accept('json').end(function(reqe,rese){
           fun && fun(rese.body)
        });
    },
    getTicket:(fun)=>{
        superagent.get('https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token='+tokenData.token+'&type=jsapi').accept('json').end(function(reqe,rese){
            console.log(rese.body);
            fun && fun(rese.body)
        });
    }
}
module.exports = wxApi;