const express = require('express');
const  router = express.Router();
const sequelize  =require('sequelize')
// 添加线路
router.post('/add' ,async (req,res)=>{
    const { Flight } = req.model
    let {
         flightNum,
         startCity,  
         arriveCity, 
         ticketPrice, 
         maxNum ,
         preDay ,
         startStations,
         arriveStations,
         startTime,
         often ,
         alias
        }  = req.body;
    
    if(!startCity)  return res.send({success:false,info:'请选择起点城市'})
    if(!arriveCity)  return res.send({success:false,info:'请选择到达城市'}) 
    if(!ticketPrice)  return res.send({success:false,info:'请填写票价'}) 
    if(!startStations) return res.send({success:false,info:'请设置可上车的站点'})
    if(!arriveStations) return res.send({success:false,info:'请设置到达可下车的站点'})
    if(!startTime) return res.send({success:false,info:'请设置出发时间'})
     if(!often) return res.send({success:false,info:'请设置发车频次'})

    
    
     if(!flightNum) {
          _d = new Date();
         // 如果没有指定的 航线编号就自动生成一个
         flightNum = 'qf'+   _d.getFullYear() + ( _d.getMonth() +1 ) + Date.now();

     }    
     maxNum =  maxNum || 30;
     preDay = preDay || 15;

     try {

         // 出发站点 和 到达站点需要关联一些具体的信息 
        
 

        await Flight.create({
            flightNum,
            startCity,  
            arriveCity, 
            ticketPrice, 
            maxNum ,
            preDay ,
            alias,
            startStations: JSON.stringify( startStations.map(item=>({...item,startTime:item.startTime ? item.startTime.slice(0,5):''})))  ,
            arriveStations: JSON.stringify( arriveStations.map(item=>({...item,startTime:item.startTime ? item.startTime.slice(0,5):''})) ),
            startTime,
            often: JSON.stringify(often)
        })
        res.send({success:true,info:'添加成功'})


     } catch(e) {
        res.send({success:false,info:'添加失败'})
     }

        

})


router.post('/edit' ,async (req,res)=>{
  const { Flight} = req.model
  let {
       flightNum,
       startCity,  
       arriveCity, 
       ticketPrice, 
       maxNum ,
       preDay ,
       startStations,
       arriveStations,
       id,
       alias,
       
      }  = req.body;



  
  if(!id)  return res.send({success:false,info:'请确定你要修改的航线id'})
  if(!startCity)  return res.send({success:false,info:'请选择起点城市'})
  if(!arriveCity)  return res.send({success:false,info:'请选择到达城市'}) 
  if(!ticketPrice)  return res.send({success:false,info:'请填写票价'}) 
  if(!startStations) return res.send({success:false,info:'请设置可上车的站点'})
  if(!arriveStations) return res.send({success:false,info:'请设置到达可下车的站点'})

   maxNum =  maxNum || 30;
   preDay = preDay || 15;

   try {

    
          
      await Flight.update({
          flightNum,
          startCity,  
          arriveCity, 
          ticketPrice, 
          maxNum ,
          preDay ,
          startStations: JSON.stringify( startStations.map(item=>({...item,startTime:item.startTime ? item.startTime.slice(0,5):''})))  ,
          arriveStations: JSON.stringify( arriveStations.map(item=>({...item,startTime:item.startTime ? item.startTime.slice(0,5):''})) ),
          alias:alias,
          // often: JSON.stringify(often),
          startTime:startStations[0].startTime
      },{
        where:{
          id
        }
      })
      res.send({success:true,info:'修改成功'})


   } catch(e) { 
     console.log('修改出错',e)
      res.send({success:false,info:'修改失败'})
   }

    
})

// 获取热门线路  
// http://127.0.0.1:3000/api/v1/flight/getHotFlight
//  a.com/api/v1/flight/getHotFlight
//  b.com/


router.post('/getHotFlight',async (req,res)=>{
    const { Flight } = req.model;
    let _res = await Flight.findOne({
      where:{
           isHot:true
      }
    })
    res.success('',_res)
})

// 查询所有的航班信息
router.post('/getAll', async (req,res)=>{
        const { Flight } = req.model;
        let { sdate,edate,page,limit,startCity,arriveCity ,startStationId,arriveStationId } = req.body;
        
        if(!startCity)  return res.send({success:false,info:'请选择起点城市'})
        if(!arriveCity)  return res.send({success:false,info:'请选择到达城市'})
       
         page = page || 1; // 当前第几页
         limit = limit || 20; // 单页返回的条数限制

          // 初始化 查询条件      
          let where = {  }
          // 设置了起始时间
          if(sdate && !edate )  where.createdAt = { $gt: sdate }
          // 设置了终点时间
          if(!sdate && edate )  where.createdAt = { $lt: edate }
          // 有起止时间
          if(sdate && edate )  where.createdAt = { $and: [ 
                                                            { $gt:sdate},
                                                             {$lt:edate } 
                                                    ] 
                                                  }
          if(startCity)  where.startCity = startCity; // 指定起点城市
          if(arriveCity) where.arriveCity = arriveCity  // // 指定到达城市   
          // 指定起点站点
          if(startStationId) where.startStations = { $in:startStationId } 
          // 指定到达站点
          if(arriveStationId) where.arriveStations = { $in: arriveStationId }
          
          const skip =  (page - 1 ) * limit; // 查询的起点（偏移量）
          try {
            let fights = await Flight.find(where,{},{skip,limit}) // 分页查询
            let count = await Flight.count(where) // 获取符合条件的总数
            res.send({success:true,info:'查询成功',data:fights,count});
          }catch(e){
              console.log(e)
            res.send({success:false,info:'获取失败'})
          }

})

// 查询单个航班详情
router.post('/getOne', async (req,res)=>{

    const { id  } = req.body;

    if(!id) return res.send({success:false,info:'请传入一个正确的flighNum'})

    try{
        const flight = await Flight.findById(id)
         


        res.send({ success:true,info:'获取成功',data:flight })

    }catch(e){

        res.send({success:false,info:'获取失败'})
    }
})


//  for admin 

router.post('/admin/getAll', async (req,res)=>{
  const { Flight } = req.model;
  const { Op } = sequelize
  let { sdate,edate,page,limit,startCity,arriveCity ,startStationId,arriveStationId } = req.body;
  
  // if(!startCity)  return res.send({success:false,info:'请选择起点城市'})
  // if(!arriveCity)  return res.send({success:false,info:'请选择到达城市'})
 
   page = page || 1; // 当前第几页
   limit = limit || 20; // 单页返回的条数限制   
   

    // 初始化 查询条件      
    let where = {  }
    // 设置了起始时间
    if(sdate && !edate )  where.createdAt = { [Op.gt]: sdate }
    // 设置了终点时间
    if(!sdate && edate )  where.createdAt = { [Op.lt]: edate }
    // 有起止时间
    if(sdate && edate )  where.createdAt = { [Op.and]: [ 
                                                      { $gt:sdate},
                                                       {$lt:edate } 
                                              ] 
                                            }
    if(startCity)  where.startCity = startCity; // 指定起点城市
    if(arriveCity) where.arriveCity = arriveCity  // // 指定到达城市   
    // 指定起点站点
    if(startStationId) where.startStations = { [Op.in]:startStationId } 
    // 指定到达站点
    if(arriveStationId) where.arriveStations = { [Op.in]: arriveStationId }
    
    const offset =  (page - 1 ) * limit; // 查询的起点（偏移量）
    try {
   
      const _res = await Flight.findAndCountAll({
        where,
        offset,
        limit
      })
      res.send({success:true,info:'查询成功',data:_res.rows,count:_res.count});
    }catch(e){
        console.log(e)
      res.send({success:false,info:'获取失败'})
    }

})

// 根据id删除 航线信息
router.post('/del', async (req,res)=>{
  const { id } = req.body;
  
  try{
      await Flight.findByIdAndDelete(id);
      res.send({success:true,info:'删除成功'})
  }catch(e){ 
      res.send({success:false,info:'删除失败'})
  }
})



router.post('/tt',async (req,res)=>{
  
          // mongoose的聚合查询  
            let orders = await Flight.aggregate([
                {
                  $lookup: // 关联的表
                    {
                      from: "station", // 外部去关联那个表
                      localField: "flightNum", // 用orderb表当中哪个字段去关联
                     
                      foreignField: "flightNum", // 对应的外键字段
                      as: "flightinfo" //查询出来的结果 别名
                    },
                  
               },
               {
                $match: where // 条件
               },
               {
                   $unwind: '$flightinfo' // 打散查询出来的数组起一个别名 
                },
               {
                $project:{ // 指定查询的字段
                    orderDate:1,  
                    phone: 1,      // 当前订单的联系电话
                    startCity: 1,  // 起点城市
                    arriveCity: 1, // 到达城市
                    startStationId: 1, // 起点站点id
                    arriveStationId: 1, // 到达站点id
                      // 1 已下单未支付 2 已支付待确认 3 已确认 待核销 4 用户已乘车 5 用户未乘车单已过期 6 用户退票申请中 7用户退票成功 8 用户退票失败 9 取消
                    orderState: 1, 
                    payAt: 1, // 用户支付时间
                   
                    orderDate: 1, // 订单的乘车时间
                    checkDate: 1, // 乘车时的验票时间
                    linkMan: 1 , // 当前订单的乘车人
                    amount: 1, // 订单总金额 （以分为单位）
                    // flightinfo:1
                    flightinfo:'$flightinfo' // 在查询出来的数据当中 只把读取数组的第一个并赋值给flightinfo
                }
              
                
              },
              {$limit:limit },//查询五条
              { $skip :skip }
            ])
    
})

router.post('/isHot',async (req,res)=>{
  const {id} = req.body;
  try{
    const _flight = await Flight.findOne({
           _id:id
    })
    await _flight.update({
        isHot:!_flight.isHot
    })
    res.success('修改成功')
  }catch(e){
    console.log('e',e)
    res.error('修改失败')
  }
 
})
module.exports = router;