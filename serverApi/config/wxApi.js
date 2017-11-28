var superagent = require('superagent');
const APPID='wx4b3cc819d682ce0e';
const APPSECRET='07826b26a4f149ccfacba09426fa980c'
const wxApi={
    getToken:()=>{
        superagent.get(getToken).accept('json').end(function(reqe,rese){

           console.log(rese.body)
        });
    }
}
module.exports = wxApi;