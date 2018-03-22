var fs = require("fs");
var path = require("path");
var express= require('express');
var superagent = require('superagent');
var jsonp = require('superagent-jsonp')
var sql=require('./config/ConnectDatabase');
var http=require('http')
var wxApi = require('./config/wxApi')
var router = express.Router();
//express body-parser swig iconv-lite bluebird request
var projjj=true;

//pc端访问
router.use('/pc',require('./pc'));


/*ws*/
var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({ port: 8185 });
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



router.use('/getSignature',(req,res,next)=>{
    var nowTime=Date.parse( new Date());
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
                        req.singData=data;
                        next()
                    })
                })
            }
        })
    }else{
        wxApi.addSignature(req.body.url,(data)=>{

            data.appid=tokenData.appid;
            req.singData=data;
            console.log('从内存取得')
            next()
        })
    }
})
router.post('/getSignature',(req,res,next)=>{
    var nowTime=Date.parse( new Date());
    var reg = new RegExp("(^|&)" + 'code' + "=([^&]*)(&|$)");
    var r = req.body.url.substr(1).match(reg);
    var code=unescape(r[2]) || '';
    if(code){
        if(!req.cookies.refreshToken){
            wxApi.getOpenId(code,(dat)=>{
                //费缓存
                res.cookie('refreshToken', dat.refresh_token)
                req.singData.openid=dat.openid;
                res.json(req.singData)
            })
        }else{
            wxApi.refreshToken(req.cookies.refreshToken,(dat)=>{
                req.singData.openid=dat.openid;
                res.cookie('refreshToken', dat.refresh_token)
                res.json(req.singData)
            })
        }

    }
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

router.get('/goWhere/*',(req,res,next)=>{
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
})
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
    var keys=req.body.data.split("/")[1];
    var dats=req.body.data.split("/").pop();
    var arrs={
        brand:{url:'queryBrandApp',keys:'brandId'},
        family:{url:'queryFamilyApp',keys:'brandId'},
        group:{url:'queryGroupApp',keys:'familyId'},
        vehicle:{url:'queryVehicleApp',keys:'groupId'}
    }
    var data={}
    data[arrs[keys].keys]=dats.replace(/\s+/g,"") || 'a'
    console.log(data,arrs[keys].url)
    var urlse='http://beidouchaxun.cn/toumingxiu/app/'+arrs[keys].url+'.do'
    superagent
        .post(urlse)
        .type('form')
        .accept('json')
        .send(data)
        .end((reqe,rese)=>{
            rese ? res.json(rese.body) : res.json({code:'911',massage:'请求异常'})
        });


    /*console.log(req.body.data);
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
    });*/
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
router.get('/getQmap',(req,res,next)=>{
    res.render('./mapForOther/mapQ.html',{dataList:req.body});

})
router.get('/getXlcAddress',(req,res,next)=>{
    var query = (connection)=> {
        sql.query({
            connection: connection,
            sql: "SELECT * from ceshi_xlc_hotpoint",
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

router.get('/down',(req,res,next)=>{
    var ua = req.headers['user-agent'],vUrl
    if (/Android/.test(ua)){
        vUrl='https://www.pgyer.com/PKVF'
    }else{
        vUrl='https://itunes.apple.com/us/app/%E9%80%8F%E6%98%8E%E4%BF%AE%E8%BD%A6/id1271183608?l=zh&ls=1&mt=8'
    }
    res.write(
        '<script>' +
        'window.location.href="'+vUrl+'"'+
        '</script>'
    );
    console.log(vUrl);
    res.end();
})

/**聊天喽**/

var wsse = new WebSocketServer({ port: 8182 }),pList={};
wsse.on('connection',(ws)=>{
    console.log('client connected');
    ws.on('message',(message)=>{
        var newMes=JSON.parse(message);
        pList[ws._ultron.id]={wsObj:ws,name:newMes.name,id:ws._ultron.id};
        var newSend={id:ws._ultron.id,type:'jd'}
        console.log(newSend)
        var sendData=JSON.stringify(newSend);
        ws.send(sendData)
    });
    ws.on('close',(e)=>{
        delete pList[ws._ultron.id]
        console.log('关闭了'+e);
    })
});
router.post('/callMe',(req,res,next)=>{
    if(req.body.name){
        pList[req.body.id].name=req.body.name+req.body.id
    }
    var data={id:req.body.id,massage:req.body.massage,name:pList[req.body.id].name};
    if(!req.body.sendId){
        for(var i in pList){
            if(i==req.body.id){
                data.isMe=true;
            }else{
                data.isMe='';
            }
            var newJson=JSON.stringify(data);
            try{
                pList[i].wsObj.send(newJson)
            }catch (e){
                delete pList[i];
            }
        }
        res.end()
    }else{
        console.log(pList[req.body.sendId])
        if(pList[req.body.sendId]){
            var newJson=JSON.stringify(data);
            pList[req.body.sendId].wsObj.send(newJson);
            data.isMe=true;
            var newJson=JSON.stringify(data);
            pList[req.body.id].wsObj.send(newJson);
            res.json({msg:'发送成功'})
        }else{
            res.json({msg:'对方已下线'})
        }
    }
})

//**字体**//
var Fontmin = require('fontmin');
router.post('/fonts',(req,res,next)=>{
    return;
    var textData=req.query.data || req.body.data;
    var fontStyle=req.query.fontStyle || req.body.fontStyle
    var nowTime=Date.now();
    var srcPath = '/usr/webServer/ceshi/common/fonts/'+fontStyle+'.ttf'; // 字体源文件
    var destPath = '/usr/webServer/ceshi/common/fonts/'+nowTime;    // 输出路径
    var fontmin=new Fontmin()
        .src(srcPath)               // 输入配置
        .use(Fontmin.glyph({        // 字型提取插件
            text: textData.replace(/\s+/g,"")             // 所需文字
        }))
        .use(Fontmin.ttf2eot())     // eot 转换插件
        .use(Fontmin.ttf2woff())    // woff 转换插件
        .use(Fontmin.ttf2svg())     // svg 转换插件
        .use(Fontmin.css())         // css 生成插件
        .dest(destPath);
    // 执行
    fontmin.run(function (err, files, stream) {
        console.log(textData )
        if (err) {                  // 异常捕捉
            console.error(err);
        }
        res.json({
            path:nowTime,
            font:fontStyle,
            fontFamily:fontStyle+nowTime,
        })
        console.log('done');        // 成功
    });
})
/**定时任务 4小时**/
var schedule = require("node-schedule");
var rule3     = new schedule.RecurrenceRule();
var times3    = [1,5,9,13,17,21];
rule3.hour  = times3;
var j = schedule.scheduleJob(rule3, ()=>{
    return;
    var nowTime=Date.now();
    var newpath='/usr/webServer/ceshi/common/fonts'
    var files = fs.readdirSync(newpath);
    files.forEach((file,index)=>{
        console.log(nowTime-file)
        try{
            if(nowTime-file>=3600000){
                var newFiles = fs.readdirSync(newpath+'/'+file);
                newFiles.forEach((files,index)=>{
                    var curPath = newpath+'/'+file + "/" + files;
                    if(fs.statSync(curPath).isDirectory()) { // recurse
                        deleteFolderRecursive(curPath);
                    } else { // delete file
                        fs.unlinkSync(curPath);
                    }
                })
                fs.rmdirSync(newpath+'/'+file);
            }
        }catch (e){

        }
    })
});



/***/
router.get('/toweixin',(req,res,next)=>{
    res.write('<body>你好你好</body>' +
        '' +
        '<script>window.location.href="https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx4b3cc819d682ce0e&redirect_uri=http://www.beidouchaxun.cn/server?action=newBuild&response_type=code&scope=snsapi_base&state=1&connect_redirect=1"</script>' +
        '' +
        '')
    res.end();
})
router.post('/pcMapXlc',(req,res,next)=>{
    console.log(req.body)
    res.json({htmls:"" +
        "<div id='mapSelectBox' style='position:fixed;top:0px;left:0px;z-index:9999;width:100%;height:100vh;'>" +
        "<section id='appWrappers'></section>" +
        "<input type='hidden' id='xlcRepairLevelNode' value='"+req.body.xlcRepairLevel+"'>" +
        "<input type='hidden' id='brandCodeNode' value='"+req.body.brandCode+"'>" +
        "<input type='hidden' id='MapUseUserId' value='"+req.body.userId+"'>" +
        "<input type='hidden' id='cityName' value='"+req.body.cityName+"'>" +
        "<input type='hidden' id='brandName' value='"+req.body.brandName+"'>" +
        "<script src='http://116.62.162.134:8090/server/dist/pcSelectMap.js'></script>" +
        "</div>"
        })
    })
router.use('/U/:id',(req,res,next)=>{
    var nowTime=Date.parse( new Date());
    if(!tokenData.time || (nowTime-tokenData.time)>=7000000){
        wxApi.getToken((rest)=>{
            if(rest.access_token){
                tokenData.token=rest.access_token;
                tokenData.time=nowTime;
                wxApi.getTicket((resg)=>{
                    tokenData.ticket=resg.ticket;
                    var dataList={
                        path:ripath+('repairPlant'),
                        title:'修理厂信息',
                        tickets:tokenData.ticket
                    }
                    res.render('index',{dataList:dataList});
                })
            }
        })
    }else{
        var dataList={
            path:ripath+('repairPlant'),
            title:'修理厂信息',
            tickets:tokenData.ticket
        }
        res.render('index',{dataList:dataList});
    }





})

router.use('/forward',require('./forward'));
module.exports = router;
