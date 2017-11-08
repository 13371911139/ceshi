var express= require('express');
var superagent = require('superagent');
var jsonp = require('superagent-jsonp')
var sql=require('./config/ConnectDatabase');
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
    var url="http://assess-api.lexiugo.com/assess-api/assess-api"+req.body.data
    superagent
        .post(url)
        .use(jsonp)
        .query({
            userName:"lexiugo",
            passwd:"n27H3lNGL7wJSePFsrr0g16UTU0%2BtDfsGHMVZ2pmxsDaFV4cVSzVwQ%3D%3D"
        })
        .end((reqe,rese)=>{
            console.log(rese,'asdfasdf',reqe);
            res.json(rese.body)
        });
})




module.exports = router;