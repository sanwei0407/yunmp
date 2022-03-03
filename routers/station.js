const express = require('express');
const { startSession } = require('mongoose');
const station = require('../model/station');
const Station = require('../model/station');
const  router = express.Router();

// 添加 站点
router.post('/add' ,async (req,res)=>{
    const { Station ,City} = req.model;

    let {
            stationName,
            cityName,  
            stationAdd, 
            stationGps, 

        }  = req.body;
    
    if(!stationName)  return res.send({success:false,info:'请填写站点名称'})
    if(!cityName)  return res.send({success:false,info:'请填写站点隶属于的城市'}) 
    if(!stationAdd)  return res.send({success:false,info:'请填写站点的地址'}) 
    if(!stationGps) return res.send({success:false,info:'请设置站点gps信息'})

    const city = await City.findOne({
      where: { cityName },
      attritubes:['id'],
      raw:true
    })

     try {
        await Station.create({
            stationName,
            cityid:city.id,  
            stationAdd, 
            stationLat:stationGps[0],
            stationLng: stationGps[1] 
        })
        res.send({success:true,info:'添加成功'})
     } catch(e) {
        res.send({success:false,info:'添加失败'})
     }

})
// 获取全部的 站点信息
router.post('/getAll', async (req,res)=>{
        const { Station,City } = req.model
        let { page,limit,stationName,cityName } = req.body;

         page = page || 1; // 当前第几页
         limit = limit || 20; // 单页返回的条数限制

          // 初始化 查询条件      
          let where = {  }
 
          if(stationName)  where.stationName = stationName; // 指定起点城市
          if(cityName) {
              const city = await City.findOne({
                where: { cityName },
                attritubes:['id'],
                raw:true
              })
             where.cityid = city.id  //  指定到达城市   

          }
      
          const offset =  (page - 1 ) * limit; // 查询的起点（偏移量）
          try {
            await Station.belongsTo(City,{ foreignKey:'cityid',targetKey:'id' })
            const _res = await Station.findAndCountAll({
              where,
              offset,
              limit,
              include:[City],
              order:[['id','DESC']]
            })
            let stations =_res.rows;
            let count = _res.count;
            res.send({
              success:true,
              info:'查询成功',
              data:stations,
              count}
            );

          }catch(e){
              console.log(e)
              res.send({success:false,info:'获取失败'})
          }

})

// 获取单个站点信息
router.post('/getOne', async (req,res)=>{
    const { Station ,City} = req.model
    const { stationId  } = req.body;
    
    

    if(!stationId) return res.send({success:false,info:'请传入一个正确的stationId'})

    try{
        await Station.belongsTo(City,{ foreignKey:'cityid',targetKey:'id'});
        const station = await Station.findOne({
          where:{id:stationId},
          include: [City]
        })
        res.send({ success:true,info:'获取成功',data:station })
    }catch(e){

        res.send({success:false,info:'获取失败'})
    }
})

// 修改站点信息
router.post('/edit' ,async (req,res)=>{
    const { Station ,City} = req.model

     let {
          stationName,
          cityName,  
          stationAdd, 
          stationGps, 
          stationId
      }  = req.body;

  if(!stationId) return res.send({success:false,info:'请传入一个正确的stationId'})

  
  // 初始化 即将要变更数据
   let updateData = {}

   if(stationName)  updateData.stationName = stationName;
   if(cityName){
        const city = await City.findOne({
          where: { cityName },
          attritubes:['id'],
          raw:true
        })
     updateData.cityid = city.id;
   } 
   if(stationAdd)  updateData.stationAdd = stationAdd;
   if(stationGps)  {
  
      updateData.stationLat =stationGps[0];
      updateData.stationLng= stationGps[1] 
   }
   try {
      await Station.update(updateData,{
        where:{
          id:stationId
        }
      })
      res.send({success:true,info:'修改成功'})
   } catch(e) {
      res.send({success:false,info:'修改失败'})
   }

})

// 删除站点的操作
router.post('/del', async (req,res)=>{
  const { Station } = req.model
  const { id } = req.body;
  
  try{
      let station = await Station.findByPk(id);
      await station.destroy();
      res.send({success:true,info:'删除成功'})
  }catch(e){ 
      res.send({success:false,info:'删除失败'})
  }
})

// for admin 
// 获取全部的 站点信息
router.post('/admin/getAll', async (req,res)=>{

  let { page,limit,stationName,cityName } = req.body;

   page = page || 1; // 当前第几页
   limit = limit || 20; // 单页返回的条数限制

    // 初始化 查询条件      
    let where = {  }

    if(stationName)  where.stationName = stationName; // 指定起点城市
    if(cityName){
        const city = await City.findOne({
            where: { cityName },
            attritubes:['id'],
            raw:true
        })
      where.cityid = city.id  //  指定到达城市   
    } 

    const offset =  (page - 1 ) * limit; // 查询的起点（偏移量）
    try {
      const _res = await Station.findAndCountAll({
        where,
        offset,
        limit
      })
      let stations = _res.rows // 分页查询
      let count = _res.count // 获取符合条件的总数
      res.send({
        success:true,
        info:'查询成功',
        data:stations,
        count
      });

    }catch(e){
      res.send({success:false,info:'获取失败'})
    }

})

module.exports = router;