var express = require('express');
var path =require('path');
var swig = require('swig');
var bodyParser = require('body-parser');
var superagent = require('superagent');
var app=express();
var router = express.Router();
app.use(bodyParser.urlencoded({extended:true}));
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/');
app.use('/dist', express.static('dist'));
app.use('/lexiugo', express.static('dist/lexiugo'));
app.use('/server/dist', express.static('dist'));
app.use('/server/lexiugo', express.static('dist/server/lexiugo'));
app.use('/server', express.static('dist'));

console.log(process.env.NODE_ENV,'nodeserver=jj ');
if(process.env.NODE_ENV ==='dev'){

}else{
    var ripath='/server/dist/';
}

app.use('/lexiugo-app', require('./api'));
app.get('/server/:a',(req,res,next)=>{
    if(req.params.a == 'isAdd'){
        var data=req.query;
        var url='https://api.weixin.qq.com/cgi-bin/user/info?access_token='+data.token+'&openid='+data.openid+'&lang=zh_CN'
        console.log(data);
        superagent
            .get(url)
            .end(function(rese){
                console.log(rese);
                res.json({res:rese,name:'我发了'})
            });
    }else{
        var arr={loveCarRepair:'维修记录',lexiuApp:'修理厂',reportStatistics:'透明修车',newBuild:'案件推修'}
        var dataList={//'http://qq328532063.6655.la/dist/'+req.query.action ||
            path:'http://116.62.162.134:8090/server/dist/'+req.query.action || ripath+(req.query.action || 'lexiuApp'),
            title:arr[req.query.action]
        }
        res.render('index',{dataList:dataList});
    }

})
app.get('/server',(req,res,next)=>{
    console.log(req.query);
    var arr={loveCarRepair:'维修记录',lexiuApp:'修理厂',reportStatistics:'透明修车',newBuild:'案件推修',repairState:'运营管理'}
    var dataList={//'http://qq328532063.6655.la/dist/'+req.query.action ||
        path:'http://116.62.162.134:8090/server/dist/'+req.query.action || ripath+(req.query.action || 'lexiuApp'),
        title:arr[req.query.action]
    }
    res.render('index',{dataList:dataList});
})

//app.use('/lexiugo-app',require('./api'))  ;



app.listen(8090,()=>{
    console.log('local:localhost:８０90');
});