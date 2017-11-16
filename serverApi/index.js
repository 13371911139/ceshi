var express= require('express');
var superagent = require('superagent');
var jsonp = require('superagent-jsonp')
var sql=require('./config/ConnectDatabase');
var http=require('http')
var $= require('jquery')
var router = express.Router();
//express body-parser swig iconv-lite bluebird request
var projjj=true;



//首页
router.get('/showEWM/:id',(req,res,next)=>{
    if(req.params.id == 'isAdd'){
        var data=req.query;
        var url='https://api.weixin.qq.com/cgi-bin/user/info?access_token='+data.token+'&openid='+data.openid+'&lang=zh_CN'
        console.log(data,url);
        superagent
            .get(url)
            .accept('json')
            .set('X-API-Key', 'foobar')
            .set('Accept', 'application/json')
            .end(function(reqe,rese){
                console.log(rese.body);
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
    var arr={loveCarRepair:'维修记录',lexiuApp:'修理厂',reportStatistics:'透明修车',newBuild:'案件维修',integral:'积分榜'}
    var dataList={
        path:ripath+(req.query.action || 'lexiuApp'),
        title:arr[req.query.action]
    }
    res.render('index',{dataList:dataList});
});
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
    var query = (connection)=> {
        sql.query({
            connection: connection,
            sql: "SELECT "+
            "a.id,a.task_id,a.user_id,a.ticket_name,a.ticket_limit,a.ticket_money,a.ticket_end_time,a.use_status,a.use_time,"+
            "b.PLATENO,b.CXMC,b.CUSTOMERNAME,b.TELEPHONE"+
            " FROM tmx_coupon_ticket_xlc_user a,xlc_pushtask b WHERE a.task_id = b.id and ticket_id='"+req.body.ticketId+"'",
            success: (dats) => {
                console.log(dats);
                res.jsonp({data:dats[0]})
            }
        })
    }
    sql.Connect(query)
})

module.exports = router;