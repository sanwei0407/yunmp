const express = require('express');
const  router = express.Router();

// 添加用户
router.post('/add', async (req,res)=>{
    const { User } = req.model; 
    const { wxInfo,phone,wxNickName,wxHeadPhoto,wxOpenId  } = req.body;
    console.log( wxInfo)
    // wxNickName,wxHeadPhoto,wxOpenId 这三个值都是从wxInfo
    
    // 数据过滤
    if(!wxNickName||!wxHeadPhoto||!wxOpenId) return res.send( {success:false,info:'请填写必要参数'});
    if( !/^1[23456789]\d{9}$/.test(phone)  )  return res.send( {success:false,info:'请填写一个正确的手机号码'});

    // 添加入库
    try{
        const one = await User.findOne({where:{ phone} }) // 找不到的话返回 null 
        if(one) return res.send({ success:false,info:'当前手机号码已经被占用' })

        const u = await User.create({
            wxNickName,
            wxHeadPhoto,
            wxInfo:JSON.stringify(wxInfo),
            wxOpenId,
            phone
        })
        let tokenscrect = 'iverson7';
        let token = req.jwt.sign({ wxOpenId,uid:u.uid},tokenscrect);
     
        res.send({success:true,info:'添加成功',token})

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