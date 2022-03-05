const express = require('express');
const  router = express.Router();

// 添加用户
router.post('/add', async (req,res)=>{
    const { User } = req.model; 
    const {phone,wxNickName,wxHeadPhoto,wxOpenId  } = req.body;
    const openid =  req.headers['X-WX-OPENID'];
 
    
    // 数据过滤
    if(!wxNickName||!wxHeadPhoto) return res.send( {success:false,info:'请填写必要参数'});
    if( !/^1[23456789]\d{9}$/.test(phone)  )  return res.send( {success:false,info:'请填写一个正确的手机号码'});

    // 添加入库
    try{
        const one = await User.findOne({where:{ phone} }) // 找不到的话返回 null 
        if(one) return res.send({ success:false,info:'当前手机号码已经被占用' })

         await User.create({
            wxNickName,
            wxHeadPhoto,
            wxOpenId:openid,
            phone
        })

        res.send({success:true,info:'添加成功'})

    } catch(e) {
        console.log(e);
        res.send( {success:false,info:'未知错误 请于网站管理员联系'});
    }


})

// 修改用户信息
router.post('/edit',async (req,res)=>{
    const { User } = req.model; 
    const { phone,wxOpenId  } = req.body;
    if(!wxOpenId) return res.send( {success:false,info:'请填写必要参数'});
    if( !/^1[23456789]\d{9}$/.test(phone)  )  return res.send( {success:false,info:'请填写一个正确的手机号码'});

    let updateData= { phone }
    // 执行修改
    try{
        await User.update(updateData,{where:{wxOpenId}})
        res.send({success:true,info:'修改成功'})
    } catch(e) {
        res.send( {success:false,info:'未知错误 请于网站管理员联系'});
    }

})

module.exports = router;