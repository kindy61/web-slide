
JS语言概述

涉及以下方面

* 字符串操作，数字-字符串转换
* 正则表达式
* 数组，对象
* 函数，闭包，变量，作用域

----

JS 基础数据类型

<div style="float:left;width:45%;">

* 字符串
* 数字
* 布尔值 true/false
* null 和 undefined

* 数组
* 对象
* 函数
</div>

<div style="float:left;width:45%;">
<br>语言内置<br><br>

* Date
* Math
* RegExp 正则表达式
* Error
</div>

----

变量定义

<pre.js>var v1 = 'abc',
    v2 = 2.6e2,
    v3 = true,
    v4 = null,
    v5,
    v6 = [1, 2, [0], {'x': 123}],
    v7 = {x: 1, 'y': 2},
    v8 = new Date(),
    v9 = /^x[\w]+?$/gmi;

function foo (a, b) {
    return a + b;
}
</pre>

----

字符串的常规操作

<pre.js>
var s1 = 'abcdefg';

s1.charAt()
    //获取某个字符, 虽然可以通过 s1[2] 这样的方式，不过没试过是不是是不是所有浏览器都支持

s1.charCodeAt()
    //获取某个字符的编码值 与 String.fromCharCode( ) 对应
String.fromCharCode('x'.charCodeAt(0)) == 'x'

s1.indexOf()
    //查找s1 是否包含某个字符，如果要查找是否包含某个字符串，使用 .search()
s1.lastIndexOf()


s1.match()
    //匹配正则表达式

s1.replace()
    //搜索替换
s1.replace('cd', 'xx') //只替换一次
s1.replace(/cd/, 'xx') //只替换一次
s1.replace(/c/g, 'xx') //替换多次


split()
    //分割字符串，生成数组

slice(start, end) //支持负数
substring(start, end) //不支持负数
substr() //不推荐使用

toLowerCase()
toUpperCase()
    //大小写转换
</pre>

----

数字-字符串转换

<pre.js>
'' + 3 === '3'
String(3) === '3'
'5' - 0 === 5
Number('5') === 5
parseInt('010', 10) === 10
parseInt('010', 10) != parseInt('010')
//如果想得到小数，用 parseFloat
</pre>

----

正则表达式

元字符

x<^ $ . * + ? | \ / ( ) [ ] { }>

在 [] 内， x<^ -> 是元字符

常用字符组
<pre.js>
/[..]/
/[^..]/
/./
/\w/
/\W/
/\s/
/\S/
/\d/
/\D/
</pre>

位置标记
<pre.js>
/^/
/$/
/\b/
/(?=..)/
/(?!..)/
</pre>

量词
<pre.js>
/.+/
/.*/
/.?/
/.+?/
/.*?/
/.{1}/
/.{1,}/
/.{0,3}/
</pre>

捕获型括号 - 一般用于搜索替换
<pre.js>
/(abc)/
</pre>

非捕获型括号 - 一般后面跟量词用，或者在搜索替换的时候避免干扰
<pre.js>
/(?:abc)/
</pre>

正则选项

x</g /m /i>
全局， 多行  忽略大小写

v<实例分析 slideshow.js 好了>

----

数组，对象(词典/hash/关联数组)

<pre.js>
var x = new Array(),
    y = Array(),
    i = new Array,
    z = [];

//上面的前3种定义形式这里也可用
var x = new Object(),
    y = Object(),
    i = new Object,
    z = {};
</pre>

jQuery 有 $.each 方法，可以遍历数组或者对象

<pre.js>
jQuery.each([1, 4, 3], function(idx, item){
    console.log(idx, item);
});

jQuery.each({a: 1, b: 4, c: 3}, function(key, val){
    console.log(key, val);
});
</pre>

<button class="run" rel="1">运行</button>

----

函数，闭包

<pre.js>
for (var i=0; i<5; i++) {
    setTimeout(function(){ console.log(i) }, i * 200);
}
</pre>

<button class="run">运行</button>

----

函数，闭包 - 2

JS 的变量作用域一般在函数内外是不同的。

<pre.js>
for (var i=0; i<5; i++) {
    setTimeout(
        (function(i){
            return function(){ console.log(i) }
        })(i),
        
        i * 200);
}
</pre>

<button class="run">运行</button>

----

变量，作用域

<pre.js>
var a,
    b,
    c;

function foo1(a, b){
    //此时 a, b, c 分别是
    
    a = 100;
    var b = 10;
    c = 20;
    
    var c;
    
    //此时 a, b, c 分别是
}

foo1(1, 2);

//此时 a, b, c 分别是
</pre>

----

代码习惯 - 避免污染

<pre.js>
//一般来说，一个比较独立的功能块尽可能的在函数内部执行，
//这样你的代码对别人影响较小，被别人的影响也较小。

(function(){
  //你的代码
  //你在这里定义的变量别人是访问不到的，
  //所以你的代码比较安全
  //如果想输出一个接口给别人用，
  //可以用 window.abc = xxo;
})();

</pre>

----

代码分析 - 截取字符串

<pre.js>
function x1(s){
    var s2 = '',
        s3 = '',
        c = 0;

    s.replace(/[\x00-\xff]|./g, function(m){
        c += /[\x00-\xff]/.test(m) ? .5 : 1;

        if (c <= 8) {
            s2 += m;
        } else if (c <= 9) {
            s3 += m;
        }
    });
    
    if (c > 9) {
        return s2 + '..';
    } else {
        return s2 + s3;
    }
}

var d = [ '一二三四五12六03八九十'
        , '一2二2三2四2五1x六03八九十'
        , '22,....2四2五1x六03八九十'];

for(var i=d.length-1; i>=0; i--) {
    console.log(x1(d[i]), ' <- ', d[i]);
}
</pre>

<button class="run">运行</button>

----

代码分析 - date

<pre.js>
(function(d, i, k, v){
  if (Date.prototype.fmt) return;

  // Y ~ FullYear
  // m ~ Month
  // d ~ Date
  // D ~ Day //do not set
  // H ~ Hours
  // M ~ Minutes
  // S ~ Seconds
  // s ~ Milliseconds
  // t ~ Time
  
  // d.fmt('%Y-%m-%d %H:%M:%S.%s %%s') == '2009-02-04 22:23:45 %s'
  
  d = [
    'Y', 'FullYear',
    'm', 'Month',
    'd', 'Date',
    'D', 'Day',
    'H', 'Hours',
    'M', 'Minutes',
    'S', 'Seconds',
    's', 'Milliseconds',
    't', 'Time'
  ];
  i = d.length;
  
  while (--i > -1) {
    v = d[i];
    k = d[--i];
    
    Date.prototype[k] = 
      (function(s,g){
        return function(v) {
          if (v!==undefined) {
            this[s](v);
            return this;
          } else {
            return this[g]();
          }
        }
      })('set' + v, 'get' + v);
  }
  
  Date.prototype.fmt = function(s){
    var d = this;

    function x(m) {
      var v = d[m]();
      (m == 'm') && v++;

      ('mdHMS'.indexOf(m) > -1) && (v < 10) && (v = '0' + v);

      return v;
    }

    return s.replace(/%./g, function(m){
      m = m.charAt(1);

      return m=='%' ? m :
          m in d ? x(m) :
          '*';
    });
  };
})();
</pre>

----

代码分析 - tv.sohu.com

<pre.js>
/*网友评分*/
var usp = function(v){return escape(escape(v))};
var ps = 4;//单页显示条数
var tt = ["4","3","2"]
var pp = tt.length;
 
var viewList = function (n,jsonstr){
    var s = 0;
    if(!jsonstr){
        s = parseInt(n) +1;
        if(n==2){ps=3}
        var rom = parseInt(Math.random()*5);
        var jsonstr = "video_f16_o"+rom+"_c_s_n1_p"+ps+"_chltv.sohu.com_k" + usp(tt[n]);
    }else{
        s = parseInt(n);
        n = n-1;
        pp = 0;
    }
    var cs2 = new createScript("","http://search.vrs.sohu.com/"+jsonstr+".json",sorceList,[n,"sorceId0"+s])
}
 
var sorceList = function (n,sorceId){
    try{            
        var str="",j=1,jsonData,jsonLength=0,_videoScore="",_videoName="",_videoUrl="";
        var totalCount="",pageNum="";
        
        jsonData = video_search_result.videos;
        jsonLength = jsonData.length;                           
        totalCount = video_search_result.totalCount>4 ? 4 : video_search_result.totalCount;
        
        var buffer = new stringBuffer();
        for(var i=0;i<jsonLength;i++){
            _videoScore = jsonData[i].videoScore.toFixed(1);
            _videoName= jsonData[i].videoName;
            _name = _videoName.length>14 ? _videoName.substr(0,13)+".." : _videoName;
            _videoUrl = jsonData[i].videoUrl;
            
            buffer.append('<li><span>' + _videoScore + '分</span>');
            buffer.append('<a href="' + _videoUrl + '" target=_blank>' + _name + '</a></li>');
        }
        str = buffer.toString();
        if (str) {
            $(sorceId).innerHTML = str;                 
        }
        
        if((pp-1)>n){
            n++;
            var vl = new viewList(n);
        }
    }
    catch(e){}
}
</pre>
