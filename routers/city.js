const express = require('express');
const router = express.Router();

const pinyin = require("pinyin");

// 添加城市
router.post('/add', async(req,res)=>{
    const { name  } =  req.body;
    const { City } = req.model;
    console.dir(City)
    if(!name) return res.error('请填写正确的城市名称')
    
    try { 
        let _city = await City.findOne({where:{cityName:name}})
        if(_city) return res.error('该城市已经存在')
        await City.create({cityName:name});
        res.success('添加到成功')
    }catch(e){
        console.log('res',e)
        res.error('添加失败')
    }
  
})


// 城市列表
router.get('/cityList',async(req,res)=>{
    const { City } = req.model
    const { name } = req.query;
    let where = {}
    if(name) where.cityName = name

    try{
        let list = await City.findAll({where})
        res.success('',list)
    } catch(e){
        console.log('e',e)
        res.error('查询失败')
    }
})

// 删除城市

router.post('/del', async (req,res)=>{
    const { City } = req.model
    const { id } = req.body;
    if(!id) return res.error('请填写正确的城市id');

    try { 
         await City.destroy({where:{id}});
         res.success('删除成功')
    } catch (e) {
        console.log(e)
        res.error('删除失败')
    }
})

// 获取城市列表根据拼音
router.post('/cityByPy', async (req,res)=>{
    const { City } = req.model
    const { cityName } = req.body;
    let where = {};
    if(cityName) where.cityName =cityName;

    let _res = await City.findAll(where)
    // 先获取字母列表
    let letter = [];
    _res.forEach(item=>{
        const { cityName} = item;
        let lt = pinyin(cityName.slice(0,1),{
            style:pinyin.STYLE_FIRST_LETTER
        })
        const firstLetter = lt[0][0];
        letter.push(firstLetter)
    })
 
    const output = letter.map(lt => {
            let _temlist = _res.filter(item=>{
                const { cityName} = item;
                let _lt = pinyin(cityName.slice(0,1),{
                    style:pinyin.STYLE_FIRST_LETTER
                })
                const firstLetter = _lt[0][0];
                console.log('ffffff',firstLetter,lt)
                return lt === firstLetter
            })
            let _tem = {
                letter: lt,
                list: _temlist
            }
            return _tem;
    })
    res.success('成功',output)

})


module.exports = router;