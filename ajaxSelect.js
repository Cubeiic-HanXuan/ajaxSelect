/**
 * @author HanXuan
 * @date 2018-10-11 15:19:57
 * 实现功能：下拉框 带搜索 可实时查询 异步
 * 参数：
 *   ajaxUrl:''          //异步请求地址 (必传参数)
 *   param:''            //搜索必传参数名 (必传参数)
 *   pageIndex:1         //初始分页页码
 *   size:30             //初始分页条数
 *   defkv:[]            //返回数据 的key (必传参数)
 *   delay:200           // ajax回调 延时
 *   width:100           // input 宽度
 *   height:30           // input 高度
 *   selected:-1         //初始化数据 默认选中项,-1为不选中
 *   limit:20            //最大显示条数,0为不限制
 *   maxheight:250       //最大显示高度
 *   hoverbg:'#189FD9'   //悬浮背景色
 *   activebg:'#5FB878'  //选中项背景色
 *   style:''            //自定义样式
 *
 * 说明:使用该插件，select内置函数依然可以使用
 *
 * 如何使用ajaxSelect：
 *  通过 jQuery.ajaxSelect({ajaxUrl:ajaxUrl,param:'driverName',defkv:['driverName','personId']});初始化插件
 *  通过$select.on("change", function(){});绑定事件 ==> 等价于  $("#selectId").on("change")
 *  通过 $("#selectId").val() 拿到最新的值
 *  通过 $("#selectId").trigger("setEditSelectValue", 2); 设置选中的值为 2
 *  通过 $("#selectId").trigger("optionChange") 触发 更新 option 的值
 *
 **/
;(function ($) {
    $.fn.ajaxSelect = (function(){

        let isInit = false;
        function initCss(extendCfg){
            isInit = true;

            let cssText = '.m-input-select{*display:inline;position:relative;-webkit-user-select:none;}\
                        \n.m-input-select ul, .m-input-select li{padding:0;margin:0;}\
                        \n.m-input-select .m-input{padding-right:22px;height:'+extendCfg.height+'px;line-height:'+extendCfg.height+'px;width:'+extendCfg.width+'%;}\
                        \n.m-input-select .m-input-ico{position:absolute;right:0;top:0;width:22px;height:100%;opacity:0.5;background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAATElEQVQoU2NkIBEwkqiegTwNcXFx/4m1CW4DMZoWLVrEiOIkfJpAikGuwPADNk0wxVg1gASRNSErxqkBpgldMV4NuEKNvHggNg5A6gBo4xYmyyXcLAAAAABJRU5ErkJggg==) no-repeat 50% 50%;}\
                        \n.m-input-select .m-list-wrapper{}\
                        \n.m-input-select .m-list{display:none;position:absolute;z-index:1;top:100%;left:0;right:0;max-width:100%;max-height:'+extendCfg.maxheight+'px;overflow:auto;border-bottom:1px solid #ddd;}\
                        \n.m-input-select .m-list-item{cursor:default;padding:5px;margin-top:-1px;list-style:none;background:#fff;border:1px solid #ddd;border-bottom:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}\
                        \n.m-input-select .m-list-item:hover{background:'+extendCfg.hoverbg+';}\
                        \n.m-input-select .m-list-item-active{background:'+extendCfg.activebg+';}\
                        \n.m-message-select{width:100%;height:50px;text-align:center;line-height: 50px;background-color: #bfcad2}\
                        \n.m-select-hide{display:none!important}\
						\n'+extendCfg.style;
            let style = $("<style>"+ cssText +"</style>")[0];

            let head = document.head || document.getElementsByTagName("head")[0];

            if(head.hasChildNodes()){
                head.insertBefore(style, head.firstChild);
            }else{
                head.appendChild(style);
            }

        }

        return function(cfg,filter,cb){
            let defcfg = {
                ajaxUrl:'',
                param:'',
                pageIndex:1,
                size:30,
                defkv:[],
                delay:200,
                width:100,
                height:30,
                selected:-1,
                limit:20,
                maxheight:250,
                hoverbg:'#189FD9',
                activebg:'#5FB878',
                style:''
            };
            let extendCfg = $.extend({},defcfg,cfg);

            !isInit && initCss(extendCfg);

            let $body = $("body");
            this.each(function(i, v){
                let ajaxTimer;
                let $sel = $(v), $div = $('<div class="m-input-select"></div>');
                let $input = $("<input type='text' class='layui-input input-click'/>");
                // let $wrapper = $("<div class='m-list-wrapper'><ul class='m-list'></ul></div>");
                let $wrapper = $("<ul class='m-list'></ul>");
                $div = $sel.wrap($div).addClass("m-select-hide").parent();
                $div.append($input).append("<span class='m-input-ico'></span>").append($wrapper);

                // 遮罩层显示 + 隐藏
                let wrapper = {
                    show: function(){
                        $wrapper.show();
                        this.$list = $wrapper.find(".m-list-item:visible");
                        this.setIndex(this.$list.filter(".m-list-item-active"));
                        this.setActive(this.index);
                    },
                    hide: function(){
                        $wrapper.hide();
                    },
                    next: function(){
                        return this.setActive(this.index + 1);
                    },
                    prev: function(){
                        return this.setActive(this.index - 1);
                    },
                    $list: $wrapper.find(".m-list-item"),
                    index: 0,
                    $cur: [],
                    setActive: function(i){
                        // 找到第1个 li，并且赋值为 active
                        let $list = this.$list, size = $list.size();
                        if(size <= 0){
                            this.$cur = [];
                            return;
                        }
                        $list.filter(".m-list-item-active").removeClass("m-list-item-active");
                        if(i < 0){
                            i = 0;
                        }else if(i >= size){
                            i = size - 1;
                        }
                        this.index = i;
                        this.$cur = $list.eq(i).addClass("m-list-item-active");
                        this.fixScroll(this.$cur);
                        return this.$cur;
                    },
                    fixScroll: function($elem){
                        // console.log($wrapper);
                        let height = $wrapper.height(), top = $elem.position().top, eHeight = $elem.outerHeight();
                        let scroll = $wrapper.scrollTop();
                        // 因为 li 的 实际　top，应该要加上 滚上 的距离
                        top += scroll;
                        if(scroll > top){
                            $wrapper.scrollTop(top);
                        }else if(top + eHeight > scroll + height){
                            // $wrapper.scrollTop(top + height - eHeight);
                            $wrapper.scrollTop(top + eHeight - height);
                        }
                    },
                    setIndex: function($li){
                        if($li.size() > 0){
                            this.index = this.$list.index($li);
                            $li.addClass("m-list-item-active").siblings().removeClass("m-list-item-active");
                        }else{
                            this.index = 0;
                        }
                    }
                };

                // input 的操作
                let operation = {
                    // 文字变更了，更新 li, 最低效率的一种
                    textChange: function(ajaxUrl){
                        if(!ajaxUrl){
                            val = $.trim($input.val());
                            $wrapper.find(".m-list-item").each(function(i, v){
                                if(v.innerHTML.indexOf(val) >= 0){
                                    $(v).show();
                                }else{
                                    $(v).hide();
                                }
                            });
                            wrapper.show();
                        }else{
                            if(ajaxTimer){
                                clearTimeout(ajaxTimer);
                            }
                            ajaxTimer = setTimeout(function(){
                                val = $.trim($input.val());
                                ajaxUrl += '?pageIndex='+ extendCfg.pageIndex +'&size=' + extendCfg.size + '&' + extendCfg.param + '=' + encodeURI(val);
                                ajaxQuery(ajaxUrl,{},function(data){
                                    if(filter){//初始数据回调,可以过滤
                                        data = filter(data)||data;
                                    }
                                    let html = '';

                                    $.each(extendCfg.limit===0?data:data.data.slice(0,extendCfg.limit),function(i,v){
                                        if(extendCfg.defkv&& Object.prototype.toString.call(extendCfg.defkv) === '[object Array]'&& extendCfg.defkv.length === 2){
                                            html += "<option value='"+v[extendCfg.defkv[1]]+"' >"+v[extendCfg.defkv[0]]+"</option>";
                                        }else{
                                            html += "<option value='"+v+"'>"+v+"</option>";
                                        }
                                    });
                                    $sel.empty();
                                    $sel.append(html);
                                    $sel.on("optionChange", resetOption).trigger("optionChange");
                                    cb&&cb();
                                });
                            },extendCfg.delay>33?extendCfg.delay:33);
                        }
                    },
                    // 设值
                    setValue: function($li){
                        if($li && $li.size() > 0){
                            let val = $.trim($li.html());
                            $input.val(val).attr("placeholder", val);
                            wrapper.setIndex($li);
                            $sel.val($li.attr("data-value")).trigger("change");
                        }else{
                            $input.val(function(i, v){
                                return $input.attr("placeholder");
                            });
                        };
                        wrapper.hide();
                        this.offBody();
                    },
                    onBody: function(){
                        let self = this;
                        setTimeout(function(){
                            self.offBody();
                            $body.on("click", self.bodyClick);
                        }, 10);
                    },
                    offBody: function(){
                        $body.off("click", this.bodyClick);
                    },
                    bodyClick: function(e){
                        let target = e.target;
                        if(target !== $input[0] && target !== $wrapper[0]){
                            wrapper.hide();
                            operation.setValue();
                            operation.offBody();
                        }
                    }
                };

                // 遍历 $sel 对象
                function resetOption(e,showSelected){
                    let html = '', val = '';
                    $sel.find("option").each(function(i, v){

                        if(v.selected && !val){
                            val = v.text;
                        };
                        html += '<li class="m-list-item'+ (v.selected ? " m-list-item-active" : "") +'" data-value="'+ v.value +'">'+ v.text +'</li>';
                    });
                    if(showSelected===true){
                        $input.val(val)
                    }
                    if (html === '') {

                        html = '<div class="m-message-select">无数据</div>';
                    }
                    $wrapper.html(html);
                };

                //ajax
                function ajaxQuery(url,data,successCb){
                    $.ajax({
                        type: "POST",
                        url: url,
                        data:data,
                        dataType: "json",
                        success: function(data){
                            successCb&&successCb(data);
                        },
                        error:function(){
                            if(layer){
                                layer.msg('网络异常！', {
                                    icon: 2,
                                    time: 2000
                                });
                                /*layer.alert("<p style='color:black'>网络异常！</p>", {
                                    skin: 'layui-layer-lan' //样式类名
                                    ,closeBtn: 1
                                });*/
                            }else{
                                alert("网络异常！");
                            }
                        }
                    });
                }

                $sel.on("optionChange", resetOption).trigger("optionChange");
                $sel.on("setEditSelectValue", function(e, val){
                    // console.log(val);
                    let $all = $wrapper.find(".m-list-item"), $item;
                    for(let i = 0, max = $all.size(); i < max; i++){
                        $item = $all.eq(i);
                        if($item.attr("data-value") === val){
                            operation.setValue($item);
                            return;
                        }
                    }
                });

                // input 聚焦
                $input.on("focus", function(){
//                this.value = "";
                    operation.textChange();
                    operation.onBody();
                }).on("input propertychange", function(e){
                    operation.textChange(extendCfg.ajaxUrl);
                }).on("keydown", function(e){
                    // 上 38, 下 40， enter 13
                    switch(e.keyCode){
                        case 38:
                            wrapper.prev();
                            break;
                        case 40:
                            wrapper.next();
                            break;
                        case 13:
                            operation.setValue(wrapper.$cur);
                            break;
                    }
                });

                let current = 0;

                $div.on("click", ".m-input-ico", function(){
                    // 触发 focus 和 blur 事件
                    // focus 是因为 input 有绑定
                    // 而 blur，实际只是失去焦点而已，真正隐藏 wrapper 的是 $body 事件
                    $wrapper.is(":visible") ? $input.blur() : ($input.val("").trigger("focus"));

                    current = (current+180)%360;

                    $(this).css('transform','rotate('+current+'deg)');
                    //$(this).css('transform', 'rotate(180deg)');
                });

                // 选中
                $wrapper.on("click", ".m-list-item", function(){
                    operation.setValue($(this));
                    return false;
                });

                setTimeout(function(){
                    // for ie
                    wrapper.hide();
                }, 1);

                if(extendCfg.ajaxUrl){

                    ajaxQuery(extendCfg.ajaxUrl+'?pageIndex='+ extendCfg.pageIndex +'&size=' + extendCfg.size,{},function(data){
                        //console.log(data);
                        if(filter){//初始数据回调,可以过滤
                            data = filter(data,'isInit')||data;
                        }
                        let html = '';
                        $.each(extendCfg.limit===0?data:data.data.slice(0,extendCfg.limit),function(i,v){
                            if(extendCfg.defkv&& Object.prototype.toString.call(extendCfg.defkv) === '[object Array]'&& extendCfg.defkv.length === 2){
                                html += "<option value='"+v[extendCfg.defkv[1]]+"' "+(i===extendCfg.selected?"selected":"")+">"+v[extendCfg.defkv[0]]+"</option>";
                            }else{
                                html += "<option value='"+v+"' "+(i===extendCfg.selected?"selected":"")+">"+v+"</option>";
                            }

                        });

                        $sel.empty();
                        $sel.append(html);
//					$sel.children("option:eq(0)").attr("selected","selected");
                        $sel.on("optionChange", resetOption).trigger("optionChange",true);
                        cb&&cb(data,'isInit');
                    });
                }

            });

            return this;
        };
    })();
})(jQuery);
