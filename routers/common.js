const express = require('express');
const router = express.Router();
const smsClient = require('../utils/alisms')  // 引用配置号的aliyun短信sdk
// const redis = require('../utils/redis') // 引入redis
const axios =require('axios') // 发起请求使用的类库  npm i axios
const Flight = require("../model/flight")

const utils = require('utility');  // 通用工具类 npm i utility  用它来生成随机的字符

// 短信的发送
router.post('/sendSms',async (req,res)=>{

    const { phone }= req.body;
    if(!/^1[2-9]\d{9}$/.test(phone)) return res.send({sucess:false,info:'请填写手机号码'})

    try{

        const key = 'code_'+phone;
        // 先判断是否已经有验证码发出 避免用户频繁 发送短信
        const _code =  req.session[key];
        if(_code)  return   res.send({ success:true,code: _code, info:'已经发送请耐心等待' })

        // 生成随机的4位数

        const randomstr =  utils.randomString(4, '1234567890')

        // 发送短信
        // let _res = await smsClient.sendSMS({
        //     PhoneNumbers: phone,           // 手机号码
        //     SignName: '三微智能',          // 短信签名
        //     TemplateCode: 'SMS_193786026', // 短信模板 决定了短信内容
        //     TemplateParam: '{"code":"'+ randomstr + '"}' //  {"code": 要发送的验证码 }
        // },{method:'POST'})

        // let {Code}=_res

        if ('OK' === 'OK') {

            //处理返回参数 redis当中保存当前的短信和用户关联
            req.session[key] = randomstr
            res.send({ success:true,code: randomstr  })
        }
    }catch(e){

        console.log(e)
        res.send('no ok')
    }


})

// 首页热门线路
router.post('/hotline', async (req,res)=>{

       let _res = await Flight.findAll({});

        let _temarr = [];

        for(let item of _res){
            let _sc = item.startCity;
            let _ac = item.arriveCity;
            const one = _temarr.find(r=> r.startCity ==_sc && r.arriveCity == _ac);
            if(one) continue;
            _temarr.push({
                startCity:_sc,
                arriveCity:_ac
            })
        }

        res.send({
            sucess:true,
            data:_temarr
        })


})


router.post('/getMapGps',async (req,res)=>{
    let { site } = req.body;
    if(!site) return res.send({success:false,info:'请传入正确的site'});
    site = encodeURIComponent(site)
    let _res = await axios.get(`https://apis.map.qq.com/ws/geocoder/v1/?address=${site}&key=D4BBZ-PMQKG-UJJQZ-IM726-IXBNZ-YHFVX`);
    res.send({success:true,data:_res.data.result});
})

router.post('/getLine', async(req,res)=>{
    let { from,to } =req.body;
    const key = 'DC6BZ-TJ36W-THKRM-R5WLQ-LNVJ6-JMBV2';
    let _res = await axios.get(`https://apis.map.qq.com/ws/direction/v1/driving/?from=${from}&to=${to}&output=json&callback=cb&key=${key}`)
    res.send({success:true,data:_res.data})
})


//  设置系统信息
router.post('/sysSetting',async (req,res)=>{
        const { System } = req.model
        const { kefuPhone } = req.body;
        let changeData = {}
        if(kefuPhone) changeData.kefuPhone = kefuPhone;

        try{
            let sys = await System.findOne();
            await sys.update(changeData)
            res.success('修改成功')
        }catch(e){
            res.error('修改失败')
        }

})
// 获取系统信息
router.post('/getSysInfo', async (req,res)=>{
     const { System } = req.model
     let _sys = await System.findOne();
     if(!_sys) {
         await System.create({kefuPhone:123456});
         _sys = await System.findOne();
     }

     res.success('',_sys)
})

// 模拟异步接受
router.post('/payNotify', async (req,res)=>{
    const  {result_code,openid,total_fee,out_trade_no } = req.body;
    console.log('异步通知得到的信息',req.body)

    try {
        if(result_code === 'SUCCESS'){
            const order = await Order.findById(out_trade_no);
            if(order.amount  == total_fee) {
                // 更新订单状态
                await order.update({
                    orderState:2,
                    payAt: new Date() // 记录支付时间
                })
                return res.success('成功')
            }
        } else {
            res.error('失败')
        }
        // 失败了不用处理订单


    } catch (e) {
        res.error('失败')
    }

})

router.post('/checkUserByOpenId',async (req,res)=>{
    
    const { User }  = req.model;
    const openid = req.headers['X-WX-OPENID'];
    let u = await User.findOne({wxOpenId:openid});
    if(u)return res.send({userInfo:u ,exist:true })
    
    res.send({exist:false})
})
module.exports = router;
