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
    },
    addSignature:(url,fun)=>{
        var ret = {
            jsapi_ticket: tokenData.ticket,
            nonceStr: wxApi.createNonceStr(),
            timestamp: wxApi.createTimestamp(),
            url: url
        }
        var string = wxApi.raw(ret);
        jsSHA = require('jssha');
        shaObj = new jsSHA(string, 'TEXT');
        ret.signature = shaObj.getHash('SHA-1', 'HEX');
        fun && fun(ret)
    },
    createNonceStr:()=>{
        //获取字符串
        return Math.random().toString(36).substr(2, 15);
    },
    createTimestamp:()=>{
        //获取时间戳
        return parseInt(new Date().getTime() / 1000) + '';
    },
    raw:(args)=>{
        var keys = Object.keys(args);
        keys = keys.sort()
        var newArgs = {};
        keys.forEach(function (key) {
            newArgs[key.toLowerCase()] = args[key];
        });

        var string = '';
        for (var k in newArgs) {
            string += '&' + k + '=' + newArgs[k];
        }
        string = string.substr(1);
        return string;
    }

}
module.exports = wxApi;