# 编写插件初衷
>公司前端选用的是layui 框架，由于layui 有很多地方侵入性很强，对用户的随心所欲的拓展增加了难度。
突然某一天公司有这样一个需求：
在一个新增页面中通过驾驶员ID搜索驾驶员的所有相关信息，并把这些详细信息回填到表单对应的地方，当然了驾驶员ID是来自于动态加载的下拉框，点击下拉框的option拿到ID。下拉选的数据是从后台动态加载的。
当数据量达到一定程度时，页面加载就会缓慢，对于我这个追求完美的人来说，怎么能接受慢，不存在的好吗。

**于是乎就想到了在网上找一个开源的异步搜索的插件，结果被layui封装的渲染层打败。为了不被产品经理批斗，下定决心开发一个专门针对layui 框架下的select 下拉异步搜索的插件。**

**经过作者反复的查阅资料，这个ajaxSelect 实时异步搜索插件就这样诞生了**

# 关于插件
* ajaxSelect插件是拓展jquery 库 实现的 完美支持JavaScript
* 实现的功能：

     select 实时搜索 ;
     
     异步请求;

     支持自定义扩展；

     支持自定义配置
     
# 插件效果

![qiniu.com](http://cubeiic.com/ajaxSelect.gif) 

# 插件使用

## 一、首先引用ajaxSelect.js 文件

```JavaScript
<script type="text/javascript" src="ajaxSelect.js"></script>
```

## 二、调用插件

```JavaScript
var ajaxUrl = "/license/vehicleChange/getVehicleAjaxSelect";
var $select = $("#ajaxSelect").ajaxSelect({
    ajaxUrl:ajaxUrl, //初始化搜索地址（必须参数）
    param:'vehicleNo', //条件搜索参数 （必须参数）
    defkv:['vehicleNo','id'], //返回数据 的key (必传参数)
    limit:30,
    selected:0,
});
```

## 三、参数解释

   ajaxUrl:''          //异步请求地址 (必传参数)
   
    param:''            //搜索必传参数名 (必传参数)
    
    expandParam:{}      //搜索非必传参数名(搜索条件传参)
    
    pageIndex:1         //初始分页页码
    
    defkv:[]            //返回数据 的key (必传参数)
    
    delay:200           // ajax回调 延时
    
    width:100           // input 宽度
    
    height:30           // input 高度
    
    selected:true       //初始化数据 默认选中项,false为不选中
    
    limit:20            //最大显示条数,0为不限制
    
    maxheight:250       //最大显示高度
    
    hoverbg:'#189FD9'   //悬浮背景色
    
    activebg:'#5FB878'  //选中项背景色
    
    style:''            //自定义样式
 
## 四、说明
  1.使用该插件: select内置函数依然可以使用
  
  2.回调函数： function (data) {
   //初始数据回调,可以过滤
   console.log(data.data);
   }
 
# 如何使用ajaxSelect：
  
   通过 jQuery.ajaxSelect({ajaxUrl:ajaxUrl,param:'driverName',defkv:['driverName','personId']});初始化插件
   
   通过$select.on("change", function(){});绑定事件 ==> 等价于  $("#selectId").on("change")
   
   通过 $("#selectId").val() 拿到最新的值
   
   通过 $("#selectId").trigger("setEditSelectValue", 2); 设置选中的值为 2
   
   通过 $("#selectId").trigger("optionChange") 触发 更新 option 的值
