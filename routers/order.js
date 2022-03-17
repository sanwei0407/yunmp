const express = require('express');
const  router = express.Router();

const sequelize = require('sequelize')


// 添加预订单

router.post('/preOrder', async (req,res)=>{

        const { Order,Flight } = req.model;

        // uid 不能通过 客户端发送过来 ***
        // uid 都应该从token当中获取
        let { phone,startStationId,
        arriveStationId,orderDate,linkMan ,flightNum,code,xcmPic } = req.body;

        // 数据过滤
        // if(!/^1[2-9]\d{9}$/.test(phone)) return res.send({success:false,info:'手机号码有误'})
        // if(!startCity)  return res.send({success:false,info:'请选择起点城市'})
        // if(!arriveCity)  return res.send({success:false,info:'请选择到达城市'})
        if(!startStationId)  return res.send({success:false,info:'请选择上车站点'})
        if(!arriveStationId)  return res.send({success:false,info:'请选择下车站点'})
        if(!orderDate) return res.send({success:false,info:'请选择出发时间'})
        if(linkMan.length === 0) return res.send({success:false,info:'请添加至少一个乘车人'})


        // 检验验证码是否正确

        // const _code  = await redis.get('code_'+phone)
        // if(code!=_code ) return res.send({success:false,info:'短信验证码不正确'})

        const  openid  = req.headers['x-wx-openid'];


        // 先查询 航班信息 得到航班信息然后才能计算总价
        const flight = await Flight.findOne({where:{flightNum}})
        // linkMan.length 乘车人数量 需要区分成人和儿童票

          // 过滤去已经选中的乘车人
        console.log('linkMan',linkMan)

        const adult = linkMan.filter(item=>item.type=='成人').length;
        const child = linkMan.filter(item=>item.type=='儿童').length;

        const ticketPrice = flight.ticketPrice /100 ;
        const amount =  adult * ticketPrice  +  child * (ticketPrice/2)


        const ip = req.ip  // 用户下单ip

        const {   startCity,arriveCity} = flight;


        try {
            // 执行入库操作
            const order = await Order.create({
                // phone,
                startCity,
                arriveCity,
                startStationId,
                arriveStationId,
                orderDate,
                linkMan:JSON.stringify(linkMan) ,
                flightNum ,
                openid,
                amount:amount*100,//换算成分
                ip,
                payAt:null,
                checkDate: null,
                orderState: 1,
                xcmPic:xcmPic.join()
            })
            res.send({success:true,info:'添加成功', data: {
              id:order.orderid,
              amount:order.amount
            }})
        }catch(e){
            console.log(e)
            res.send({success:false,info:'添加失败'})

        }


})

// 用户查询自己的全部订单

router.post('/getAll', async(req,res)=>{

         const { Order,Flight } = req.model
         let { sdate,edate,page,limit,orderState  } = req.body;
         page = page || 1; // 当前第几页
         limit = limit || 20; // 单页返回的条数限制



        const  openid   = req.headers['x-wx-openid'];

        const { Op }  = sequelize;
        let where = { openid  }

        if(sdate && !edate )  where.createdAt = { [Op.gt]: sdate }
        if(!sdate && edate )  where.createdAt = { [Op.lt]: edate }
        if(sdate && edate )   where.createdAt = {  [Op.and]: [
                                                          { $gt:sdate},
                                                           {$lt:edate }
                                                  ]
                                                }

        if(orderState) where.orderState = orderState;


          const offset =  (page - 1 ) * limit; // 查询的起点（偏移量）

          try {

             await Order.belongsTo(Flight,{
              foreignKey:'flightNum',
              targetKey:'flightNum'
             })

            const _data = await Order.findAndCountAll({
              where,
              offset,
              limit,
              include:[ Flight],
              order:[['orderid','desc']]
            })
            const {rows,count} = _data;
            res.send({success:true,info:'查询成功',data:rows,count});
          }catch(e){
            res.send({success:false,info:'获取失败'})
          }


})

// 查询单个订单的信息

router.post('/getOne', async(req,res)=>{
    const { Order ,Flight} = req.model;
    const { orderId } = req.body;
    if(!orderId) return res.send({success:false,info:'请传入orderid'})

    try{
        const order = await Order.findByPk(orderId);
        const flight = await Flight.findOne({
          where:{flightNum: order.flightNum}
        })
        res.send({ success:true,info:'获取成功',data:{
          order,
          linkMan:JSON.parse(order.linkMan),
          flight }
        })

    }catch(e){

        res.send({success:false,info:'获取失败'})
    }
})

// 修改订单状态

router.post('/changeOrder', async(req,res)=>{
    const { Order } = req.model;
    const {orderId,state } = req.body;
    if(!orderId) return res.send({success:false,info:'请传入orderid'})
    if(!state) return res.send({success:false,info:'请传入status'})

    try{
        const order = await Order.findByPk(orderId);
        const { orderState } = order;
        // 不允许修改 当前的状态等于现在状态
        if(state == orderState)  return res.send({success:false,info:'不能修改为当前状态'})

        const one = await Order.findByPk(orderId)
        await one.update({ orderState:state })
        res.send({ success:true,info:'修改成功' })

    }catch(e){

        res.send({success:false,info:'修改失败'})
    }

})

// 核销订单接口
router.post('/checkOrder', async(req,res)=>{
    const { Order } = req.model;
    const {orderId,pwd } = req.body;
    if(!orderId) return res.send({success:false,info:'请传入orderid'})
    if(!pwd) return res.send({success:false,info:'请传入pwd'})

    const _pwd = 'abcd' // 这里是模拟了一个 存在数据库当中的管理员密码

    if(pwd!=_pwd) return res.send({success:false,info:'密码不正确'})

    try{
        const one = await Order.findByPk(orderId)
        await one.update({ checkDate: new Date(),orderState:4 })
         res.send({ success:true,info:'核销成功' })
    }catch(e){
        console.log(e)
        res.send({success:false,info:'核销失败'})
    }

})

// 订单退款
router.post('/refund', async(req,res)=>{
  const { Order } = req.model
  const { orderId,reason }= req.body;

  try{
    const one = await Order.findByPk(orderId)
    await one.update({
      reason,
      orderState:8
    })
    // 处理原来退回
    res.success()
  }catch(e){
    res.error()
  }

})

router.post('/admin/getAll', async(req,res)=>{
         const { Order,Flight } = req.model;
         let { sdate,edate,page,limit  } = req.body;
         page = page || 1; // 当前第几页
         limit = limit || 20; // 单页返回的条数限制

         const { Op }  = sequelize;
          let where = {  }

          if(sdate && !edate )  where.createdAt = { [Op.gt]: sdate }
          if(!sdate && edate )  where.createdAt = { [Op.lt]: edate }
          if(sdate && edate )  where.createdAt = {  [Op.and]: [
                                                            { $gt:sdate},
                                                             {$lt:edate }
                                                    ]
                                                  }
          const offset =  (page - 1 ) * limit; // 查询的起点（偏移量）

          try {

            await Order.belongsTo(Flight,{
              foreignKey:'flightNum',
              targetKey:'flightNum'
            })

            const _data = await Order.findAndCountAll({
              where,
              offset,
              limit,
              include:[ Flight],
              order:[['orderid','desc']]
            })
            const {rows,count} = _data;
            res.send({success:true,info:'查询成功',data:rows,count});
          }catch(e){
              console.log(e)
            res.send({success:false,info:'获取失败'})
          }


})
module.exports = router;
