const express = require('express');
const app = express();
const db =  require('./db')
const config = require('./config')
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


// express 当中使用自带的json方法和urlencoded方法来解析body内容
app.use(express.urlencoded({ extended: false })) // urlencoded
app.use(express.json()) // json 



app.use((req,res,next)=>{
        // 腾讯地图Key
        req.tenMapKey = config.tenMapKey;
        // 处理sequelize Model挂在在组件上
        req.model = {};
        for(const item in db){
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