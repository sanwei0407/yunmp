const express = require('express');
const app = express();

const db =  require('./db')
// session的使用
var session = require('express-session');
app.use(session({
  secret: 'qfedu',
  resave: false,
  saveUninitialized: true,
  cookie: {
      maxAge:120*1000
   }
}))

// 跨域 cors
const cors = require('cors')
app.use(cors()); // 解除cors跨域限制

const  jwt = require('jsonwebtoken'); // token的操作  npm i jsonwebtoken

const bodyParser = require('body-parser')
// 针对表单格式传递的post body的参数 application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })
// 针对的是已json形式 body 传参的  application/json
var jsonParser = bodyParser.json()
app.use(jsonParser)
app.use(urlencodedParser)

// token 中间件  通过中间件的方式 让后面的路由都可以在req当中获取jwt对象来操作token
app.use((req,res,next)=>{
        req.jwt  = jwt;
        next()
})
// 处理sequelize Model挂在在组件上

app.use((req,res,next)=>{
         req.model = {};
       
        for(const item in db){
            console.log('item',item)
            /// 把首字母转成大写 做区别性 非必要 个人习惯而已
            const firstLetter = item.slice(0,1).toUpperCase();
            const last = item.slice(1);
            const newName = firstLetter+last

            req.model[newName] = db[item]

        }
        next();
})

// 自定义一个error方法和一个success方法 
app.use((req,res,next)=>{

    res.error = (info,code)=>{
        let _res = {
            success:false,
            info
        };
        if(code) _res.code = code;
        res.send(_res)
    }

    res.success = (info,data)=>{
        let _res = {
            success: true
        };
        if(info) _res.info = info;
        if(data) _res.data = data;
        res.send(_res)
    }


    next()
})

const checkapi = [
        '/api/v1/order/preOrder',
        '/api/v1/order/getAll',
        '/api/v1/linkman/add',
        '/api/v1/linkman/getAll',
        
]

//   // 如果请求的地址在检测检测范围以内 就需要对token进行检验
// app.use(async (req,res,next)=>{

//     const { url } = req;
  
//     console.log('url',url)
//     if(checkapi.find(item=> url.startsWith(item) )){
//         // 如果是在需要检测的api 就从请求头当中 获取 token
//         const openid = req.headers['X-WX-OPENID'];
//         const { User } = req.model;
//         let u = await User.findOne({
//             where: {
//                 openid
//             }
//         })
        
//         try{
//             if(!openid) throw new Error('openid不正确')
//             req.decode = { // 挂在uid在接口当中使用
//                 uid: u.uid
//             }
//             next()
//         } catch {
//            res.statusCode = 403
//            res.end()
//         }
       
      
//     } else {
//         next()
//     }

// })



// 各个路由的导入
const userRouter = require('./routers/user')   // 用户路由
const orderRouter = require('./routers/order') // 订单路由
const flightRouter = require('./routers/flight') // 航班线路路由
const stationRouter = require('./routers/station') // 站点路由
const linkmanRouter = require('./routers/linkman') // 乘车人路由
const cityRouter = require('./routers/city')  // 城市管理
const commonRouter = require('./routers/common') // 其他公共业务的路由 




// 前台用户流程
app.use('/api/v1/user', userRouter )
app.use('/api/v1/order', orderRouter)
app.use('/api/v1/flight', flightRouter)  // http://127.0.0.1:3000/api/v1/+
app.use('/api/v1/station', stationRouter)
app.use('/api/v1/linkman', linkmanRouter)
app.use('/api/v1/common', commonRouter )
app.use('/api/v1/city', cityRouter )


app.listen(80,()=>{
    console.log('srv is running at port 80')
})