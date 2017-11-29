var superagent = require('superagent');
const APPID='wx4b3cc819d682ce0e';
const APPSECRET='07826b26a4f149ccfacba09426fa980c'
const wxApi={
    //获取可用于签名的tooken
    getToken:(fun)=>{
        superagent.get(getToken).accept('json').end(function(reqe,rese){
           fun && fun(rese.body)
        });
    },
    //获取签名所需的ticket
    getTicket:(fun)=>{
        superagent.get('https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token='+tokenData.token+'&type=jsapi').accept('json').end(function(reqe,rese){
            console.log(rese.body);
            fun && fun(rese.body)
        });
    },
    //条件充足生成签名，需要必要的参数url
    addSignature:(url,fun)=>{
        var ret = {
            jsapi_ticket: tokenData.ticket,
            noncestr: wxApi.createNonceStr(),
            timestamp: wxApi.createTimestamp(),
            url: url.split('#')[0]
        }
        var string = wxApi.raw(ret);
        var jsSHA = require('jssha');
        var shaObj = new jsSHA('SHA-1', 'TEXT');
        shaObj.update(string)
        ret.signature = shaObj.getHash('HEX');
        fun && fun(ret)
    },
    //生成签名所需随机字符串
    createNonceStr:()=>{
        //获取字符串
        return Math.random().toString(36).substr(2, 15);
    },
    //生成签名所需生成签名的时间戳
    createTimestamp:()=>{
        //获取时间戳
        return parseInt(new Date().getTime() / 1000) + '';
    },
    //组装签名信息为指定字符串
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
    },
    //获取openid
    getOpenId:(code,fun)=>{
        var getOps='https://api.weixin.qq.com/sns/oauth2/access_token?appid='+APPID+'&secret='+APPSECRET+'&code='+code+'&grant_type=authorization_code'
        superagent.get(getOps).accept('json').end(function(reqe,rese){
            console.log(rese.body,'获取openid？？？？？',getOpenId)
            fun && fun(rese.body)
        });
    }
}
module.exports = wxApi;