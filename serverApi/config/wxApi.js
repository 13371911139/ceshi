var superagent = require('superagent');
const wxApi={
    getToken:()=>{
        superagent.get(global.getToken).accept('json').end(function(reqe,rese){
            console.log(rese,getHeader);
            res.json(rese.body)
        });
    }
}
module.exports = wxApi;