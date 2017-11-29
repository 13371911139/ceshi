var express= require('express');
var superagent = require('superagent');
var jsonp = require('superagent-jsonp')
var sql=require('./config/ConnectDatabase');
var http=require('http')
var wxApi = require('./config/wxApi')
var router = express.Router();
//express body-parser swig iconv-lite bluebird request
var projjj=true;



/*ws*/
var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({ port: 8181 });
var sockets = {};
global.APPID='wx4b3cc819d682ce0e';
global.APPSECRET='07826b26a4f149ccfacba09426fa980c'
global.tokenData={time:0,appid:APPID}
wss.on('connection', function (ws) {
    console.log('client connected',sockets.length);
    ws.on('message', function (message) {
        var newMes=JSON.parse(message);
        switch(newMes.type){
            case 'userd':
                sockets[newMes.id].send('isUserd');
                delete sockets[newMes.id];
                break;
            case 'toUse':
                sockets[newMes.id]=ws;
                break;
            default:
        }
    });
    ws.on('close',function(e){

        console.log('关闭了'+e);
    })
});
//获取基础支持的access_token
global.getToken='https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='+APPID+'&secret='+APPSECRET
//获取openid，普通access_token
global.getTok='https://api.weixin.qq.com/sns/oauth2/access_token?appid='+APPID+'&secret='+APPSECRET+'&code=CODE&grant_type=authorization_code'
//更新token
global.rtoken ='https://api.weixin.qq.com/sns/oauth2/refresh_token?appid=APPID&grant_type=refresh_token&refresh_token=REFRESH_TOKEN'



router.post('/getSignature',(req,res,next)=>{
    if(!tokenData.time || (nowTime-tokenData.time)>=7000000){
        wxApi.getToken((rest)=>{
            if(rest.access_token){
                tokenData.token=rest.access_token;
                tokenData.time=nowTime;
                wxApi.getTicket((resg)=>{
                    tokenData.ticket=resg.ticket;
                    wxApi.addSignature(req.body.url,(data)=>{
                        console.log('现场获取取得')
                        data.appid=tokenData.appid;
                        next('/nextSign')
                        //res.json(data)
                    })
                })
            }
        })
    }else{
        wxApi.addSignature(req.body.url,(data)=>{
            console.log('从内存取得')
            data.appid=tokenData.appid;
            next('/nextSign')
            //res.json(data)
        })
    }
})
router.use('/nextSign',(req,res,next)=>{
    var nowTime=Date.parse( new Date());
    var reg = new RegExp("(^|&)" + 'code' + "=([^&]*)(&|$)");
    var r = req.body.url.substr(1).match(reg);
    var code=unescape(r[2]) || '';
    console.log(code)
})

//首页
router.get('/showEWM/:id',(req,res,next)=>{
    if(req.params.id == 'isAdd'){
        var data=req.query;
        var url='https://api.weixin.qq.com/cgi-bin/user/info?access_token='+data.token+'&openid='+data.openid+'&lang=zh_CN'
        var getHeader='https://api.weixin.qq.com/cgi-bin/user/info?access_token='+data.token+'&openid='+data.openid+'&lang=zh_CN'
        superagent
            .get(getHeader)
            .accept('json')
            .set('X-API-Key', 'foobar')
            .set('Accept', 'application/json')
            .end(function(reqe,rese){
                console.log(rese,getHeader);
                res.json(rese.body)
            });
    }else{
        res.cookie('jb','ii')
        var arr={loveCarRepair:'维修记录',lexiuApp:'修理厂',reportStatistics:'透明修车',newBuild:'案件维修',repairState:'运营管理',integral:'积分榜'}
        var dataList={
            path:ripath+(req.query.action || 'lexiuApp'),
            title:arr[req.query.action]
        }
        res.render('index',{dataList:dataList});
    }
});
router.get('/',(req,res,next)=>{
    res.cookie('jb','ii')
    var newArr={fomeXLC:{type:'lexiuApp'}};
    for(var i in newArr){
        if(i==req.query.action){
            req.query.action=newArr[i].type
        }
    }
    var arr={loveCarRepair:'维修记录',lexiuApp:'修理厂',reportStatistics:'透明修车',newBuild:'案件维修',integral:'积分榜'}
    var dataList={
        path:ripath+(req.query.action || 'lexiuApp'),
        title:arr[req.query.action]
    }
    res.render('index',{dataList:dataList});
});
router.post('/BQXX',(req,res,next)=>{
    console.log(req.body.data);
    var url="http://assess-api.lexiugo.com/assess-api/assess-api"+encodeURIComponent(req.body.data)+"?callback=__callback&userName=lexiugo&passwd=n27H3lNGL7wJSePFsrr0g16UTU0%2BtDfsGHMVZ2pmxsDaFV4cVSzVwQ%3D%3D&_=1510119995854"
    http.get(url,(r)=>{
        var html = '';
        // 绑定data事件 回调函数 累加html片段
        r.on('data',(data)=>{
            html += data;
        });
        r.on('end',()=>{
            console.log(eval(''+html.split('__callback')[1]+''))
            res.json(eval(''+html.split('__callback')[1]+''))
        });
    }).on('error',()=>{
        console.log('获取数据错误');
    });
})

router.get('/getMapList',(req,res,next)=>{
    var query = (connection)=> {
        sql.query({
            connection: connection,
            sql: "SELECT * from ceshi_hotpoint",
            success: (dats) => {
                console.log(dats);
                res.jsonp({data:dats})
            }
        })
    }
    sql.Connect(query)
})

router.post('/getCoupon',(req,res,next)=>{
    var code,msg;
    if(!req.body.ticketId){
        code='0002',msg='请使用正确的优惠券';
        res.jsonp({code:code,mess:msg})
        return;
    }
    var query = (connection)=> {
        sql.query({
            connection: connection,
            sql: "SELECT "+
            "a.id,a.task_id,a.user_id,a.coupon_name,a.lower_limit,a.upper_limit,a.coupon_money,DATE_FORMAT(a.end_time,'%Y-%c-%d %h:%i:%s') AS end_time,a.use_status,DATE_FORMAT(a.use_time,'%Y-%c-%d %h:%i:%s') AS use_time,DATE_FORMAT(a.create_time,'%Y-%c-%d %h:%i:%s') AS create_time,"+
            "b.PLATENO,b.CXMC,b.CUSTOMERNAME,b.TELEPHONE,b.repair_Moneny"+
            " FROM tmx_coupon_xlc_user a,xlc_pushtask b WHERE a.task_id = b.ID and ticket_id='"+req.body.ticketId+"'",
            success: (dats) => {
                try{
                    sockets[req.body.ticketId] && sockets[req.body.ticketId].send('扫码成功')
                }catch(e){
                    delete sockets[req.body.ticketId];
                }

                if(!dats[0]){code='0009';msg='无此优惠券'}else{code='0000';msg='查询成功'}
                res.jsonp({data:dats[0],code:code,mess:msg})
            }
        })
    }
    sql.Connect(query)
})

router.post('/saoOk',(req,res,next)=>{
    var ab='sOk'
    switch(req.body.type){
        case 'ok':
            ab='ok'
            break;
        case 'nOk':
            ab='nOk'
            break;
        default:
            ab='sOk'
            break;
    }
    sockets[req.body.ticketId] && sockets[req.body.ticketId].send(ab);
    res.write('<h4>成功了呢</h4>');
})




/***/
router.post('/selectCKImg',(req,res,next)=>{
    var query = (connection)=>{
        sql.query({
            connection:connection,
            sql:"SELECT ID FROM lx_workmainsheet WHERE REPORTNO ='"+req.body.reportno+"' AND PLATENO = '"+req.body.plateno+"' AND DELFLAG='0' AND PUSHTASKNO='"+req.body.pushtaskno+"'",
            fun:(dat)=>{
                console.log(dat);
                sql.query({
                    connection:connection,
                    sql:"SELECT * from lx_sheetpicture WHERE WORKID='"+dat+"'",
                    success:(dats)=>{
                        var m=[];
                        for(var i in dats){
                            m.push({
                                id:dats[i].ID,
                                ImgPath:'/damagePicture/'+dats[i].ZZBH+'/'+dats[i].WORKNO+'/chakan/small/'+dats[i].DAMAGEPICTURE,
                                type:dats[i].DAMAGEAREAS
                            })
                        }
                        res.jsonp(m)
                    }
                })
            }
        })
    }
    sql.Connect(query)
})
router.post('/selectWXImg',(req,res,next)=>{
    var query = (connection)=> {
        sql.query({
            connection: connection,
            sql: "SELECT TP.ID,TP.pictype,PK.REPORTNO,PK.PLATENO,PK.PUSH_TASK_NO,PK.PUSH_TARGET_ID,WK.WORKNO,TP.PICTURENAME,TP.PICFROM FROM lx_xlc_task_picture TP,xlc_pushtask PK ,lx_workmainsheet WK WHERE TP.PUSHTASKID='"+req.body.pushTaskId+"'  AND PK.id=TP.PUSHTASKID AND PK.REPORTNO=WK.REPORTNO AND PK.PLATENO = WK.PLATENO AND PK.PUSH_TASK_NO=WK.PUSHTASKNO",
            success: (dat) => {
                var data=[]
                for(var i=0;i<dat.length;i++){
                    console.log('aa:'+dat[i].WORKNO ,'dd'+dat[i].PUSH_TASK_NO);
                    data.push({
                        ImgPath:'/damagePicture/'+dat[i].PUSH_TARGET_ID+'/'+(dat[i].PICFROM*1 !=4 ?dat[i].WORKNO : dat[i].PUSH_TASK_NO)+'/weixiu/small/'+dat[i].PICTURENAME+'',
                        bigImgPath:'/damagePicture/'+dat[i].PUSH_TARGET_ID+''+(dat[i].PICFROM*1 !=4 ?dat[i].WORKNO : dat[i].PUSH_TASK_NO)+'/weixiu/'+dat[i].PICTURENAME+'',
                        type:dat[i].pictype
                    })
                }
                res.jsonp({data:data,code:'0000'})
                /*sql.query({
                    connection: connection,
                    sql: "SELECT WORKNO FROM lx_workmainsheet WHERE REPORTNO ='"+dat[0].REPORTNO+"' AND PLATENO = '"+dat[0].PLATENO+"' AND DELFLAG='0' AND PUSHTASKNO='"+dat[0].PUSH_TASK_NO+"'",
                    success: (dat2) => {
                        sql.query({connection: connection})

                    }
                })*/
            }
        })
    }
    sql.Connect(query)
})


module.exports = router;