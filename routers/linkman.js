const express = require('express');
const  router = express.Router();

// 添加乘车人
router.post('/add', async (req,res)=>{
    const { Linkman} = req.model;
    const {  realName,idNum,phone,type} = req.body;
    if(!realName) return res.send( {success:false,info:'请填写真实姓名'});
    if(!idNum) return res.send( {success:false,info:'请填写身份证号码'});
    if( !/^1[23456789]\d{9}$/.test(phone)  )  return res.send( {success:false,info:'请填写一个正确的手机号码'});

     // 使用openid来用 联系人的归属
    const uid = req.headers['x-wx-openid'];

    // todo 我们需要对用户的 真实姓名和身份证号码进行检验

    // 添加入库
    try{
        const one = await Linkman.findOne({ where: { phone  } }) // 找不到的话返回 null
        if(one) return res.send({ success:false,info:'当前手机号码已经被占用' })

        await Linkman.create({
            realName,
            idNum,
            phone,
            uid,
            type
        })
        res.send({success:true,info:'添加成功'})

    } catch(e) {
        console.log('e',e)
        res.send( {success:false,info:'未知错误 请于网站管理员联系'});
    }

})

// 修改乘车人信息 只允许修改 手机号码
router.post('/edit',async (req,res)=>{
    const { Linkman } = req.model;
    const { phone,LinkManId  } = req.body;
    if(!LinkManId) return res.send( {success:false,info:'请填写必要参数'});
    if( !/^1[23456789]\d{9}$/.test(phone)  )  return res.send( {success:false,info:'请填写一个正确的手机号码'});

    // 要修改的数据
    let updateData= { phone }
    // 执行修改
    try{
        let one = await Linkman.findByPk( LinkManId )
        await one.update(updateData)
        res.send({success:true,info:'修改成功'})
    } catch(e) {
        res.send( {success:false,info:'未知错误 请于网站管理员联系'});
    }

})

router.post('/getOne',async (req,res)=>{
    const { Linkman } = req.model;
    const { id } = req.body;
    const uid = req.headers['x-wx-openid'];
    const info = await Linkman.findOne({
        where:{
            uid,
            id
        }

    });
    res.send({
        success:true,
        data:info
    })

})

// 获取全部的乘车人信息
router.post('/getAll', async (req,res)=>{
    const { Linkman ,User} = req.model;
     const uid = req.headers['x-wx-openid'];
     try{
        const linkmans = await Linkman.findAll({
            where:{
                uid
            },
            order:[['id','desc']],
            raw: true
        })
        res.send({success:true,info:'查询成功',data:linkmans})
     }catch(e){
        console.log('e',e)
        res.send( {success:false,info:'未知错误 请于网站管理员联系'});
     }
})

// 删除乘车人

router.post('/del', async (req,res)=>{
    const { Linkman } = req.model;
    const { id } = req.body;
    const uid = req.headers['x-wx-openid'];
    try {
         let _res =  await Linkman.destroy({where:{id,uid}});
         if(_res) return  res.send({success:true})
         res.send( {success:false,info:'删除失败'});
    } catch(e) {
         res.send( {success:false,info:'删除失败'});
    }

})

module.exports = router;
