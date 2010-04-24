jQuery(function($){
	
	function _log () {
	   try {
	       window.console && window.console.log && window.console.log.apply(window.console, arguments);
       } catch (ex) {
           try {
               alert([].join.call(arguments, '='));
           } catch (ex) {}
       }
	}
	
	var body = $(document.body),
        loc = window.location,
	    hash = lochash(),
	    sld,
	    animating,
    	height = $(window).height(),
    	slides,
    	keycache = '', //用于快捷键
    	
    	/*不知为何，doctype html 时，
    	    ff35 下可以设置 html.scrollTop，
    	    而 chromium 下可以设置 body.scrollTop，
    	    为了避免还有更多的浏览器问题，干脆检测一下
    	*/
    	scrollel = (function (b) {
    	        var x = $('<div style="height:'+height*2+'px"/>').prependTo(body);
    	        if (b.scrollTop(height).scrollTop() == height) {
    	            
    	        } else if ((b = b.parent()).scrollTop(height).scrollTop() == height) {
    	            
	            } else if ((b = $(window)).scrollTop(height).scrollTop() == height){
	                
	            } else {
	                b = null;
	            }
	            
	            x.remove();
	            x = null;
	            
	            return b;
    	    })(body);

	function lochash(x) {
	    var s;
	    
	    if (x) {
	        s = [];
	        $.each(x, function(k, v){
	            s.push(k + '=' + encodeURIComponent('' + v).replace(/%2f/ig, '/'));
	        });
	        loc.hash = '#' + s.join('&');
	    } else {
	        s = {};
	        $.each((loc.hash || '#').substr(1).split('&'), function (_, i) {
	            i = i.split('=');
	            s[i[0]] = decodeURIComponent(i[1]);
	        });
	        
	        s.p && (s.p = parseInt(s.p, 10));
	        return s;
	    }
	}
	
	
	function proc_sld (str) {
        slides = str.replace(/\r?\n/g, '\n').split(/\n+-{4,}\n+/);
        str = '';
        
        $.each(slides, function(idx, slide) {
            if (/^\s*$/.test(slide)) return;
            
            var prelvl = 0,
                custom_pre = false;
            
            slide = slide.replace(/^\s+/, '').replace(/\s+$/, '');
            
            if (!/^<[a-zA-Z]/.test(slide)) {
                if (!/^\.(\n|$)/.test(slide)) {
                    /* 这里有个 bug,
                        如果 标题最后是高亮关键词，如 abc x
                        那么生成标题后会变成 <h1>abc x</h1>
                        这个文本就会被后续的分析器变成
                        <h1>abc <span class="s-x">/h1</span>
                        所以，先在 </h1> 前加个空格吧
                    */
                    slide = slide.replace(/^([\s\S]+?)(\n\n|$)/, '<h1>$1 </h1><p>');
                } else {
                    slide = slide.replace(/^\.(\n|$)/, '<p>');
                }
            }
            
            slide = slide
                .replace(/\n\n+/g, '\n\n')
                .replace(/((?:\\ ?)?\n\n?)|(<pre(?:\.[\w\d-]+)*>)|(<\/pre>)|(\\)?(x|ci|c|xi|i|kw|tag|cm|v|key|att|au|date|t)<((?:>>|[^>])*)>|( {2,})/ig,
                    function (m, nl, pre1, pre2, nocls, cls, con, sp, offs, str) {
                        if (nl) {
                            if (prelvl > 0) {
                                return m;
                            }
                            
                            if (/\n\n/.test(m)) {
                                return '<p>';
                            } else if (m = m.match(/\\( )?\n/)) {
                                return m[1] ? '&nbsp;' : '';
                            } else {
                                /* 如果 \n 前面是标签(开始或者闭合)，都不插入 <br> */
                                if (0 && offs > 0 && /(?:<\/[\w:]+>|<[\w:]+[^>]*>)$/.test(str.substring(0, offs))) {
                                    return '';
                                } else {
                                    return '<br>';
                                }
                            }
                        } else if (pre1) {
                            prelvl++;
                            // 只处理一级 pre
                            if (prelvl == 1 && (con = pre1.match(/\.[\w\d-]+/g))) {
                                con = con.join('.').replace(/\.+/g, ' ').replace(/^ /, '');
                                pre1 = '<pre class="' + con + '">';
                            }
                            if (/\bcustom\b/.test(pre1)) {
                                custom_pre = true;
                            } else {
                                custom_pre = false;
                            }
                            return pre1;
                        } else if (pre2) {
                            prelvl--;
                            (prelvl < 0) && (prelvl = 0);
                            
                            return pre2;
                        } else if (prelvl > 0 && !custom_pre) {
                            return m;
                        } else if (sp) {
                            return prelvl > 0 ? sp : (sp.replace(/ /g, '&nbsp;'));
                        } else if (nocls) {
                            return m.substr(1);
                        } else {
                            return con
                                ? '<span class="s-' + cls.toLowerCase() + '">' + con.replace(/>>/g, '>') + '</span>'
                                : '';
                        }
                    }
                ).replace(/<\/li><br\/?>/g, '</li>');
            
            str += '<div class="slide">' + slide + '</div>';
        });
        
        slides = jQuery(str)
            .each(function (_, slide) {
                $('> *:empty', this).remove();
            })
            .appendTo(body.empty());
	}
	
	function time (o, mn, arg) {
	    var t = new Date().getTime();
	    o = arguments.length == 3 ? o[mn].apply(o, arg) : o[mn]();
	    _log('xx.'+mn+'() use: '+(new Date().getTime() - t)+'ms');
	    return o;
	}
	function proc_slide () {
	    time(jQuery("pre[class]"), 'chili') // .()
	        .filter('.javascript,.js')
    	        .html(function(i, html){
        		    html = html.replace(/\$\.(<span class="method">([\w\$]+)<\/span>)\(/g, function( all, span, name ) {
            			name = name === "$" ? "jQuery" : name;
            			return "$.<a href='http://api.jquery.com/jQuery." + name + "'>" + span + "</a>(";
            		});

            		html = html.replace(/(<span class="method">([\w\$]+)<\/span>)\(/g, function( all, span, name ) {
            			name = name === "$" ? "jQuery" : name;
            			return "<a href='http://api.jquery.com/" + name + "'>" + span + "</a>(";
            		});

            		return html;
        	    }).end()
    	    .filter('.run').each(analyze);
    	
        // console.log(slides);
        // return;
    	slides.each(function (i) {
    	    var h = this.offsetHeight,
    	        s = $(this).attr('id', i),
    	        metadata = {id: i},
    	        c;
    	    
    	    s.data('metadata', metadata);
    	    
    	    if (h > height) {
    	        metadata.height = s.height(h + 8).height();
    	    } else {
    	        metadata.height = s.height(height).height();
    	        
    	        c = s.find('> *');
    	        if (c.length == 1) {
    	            c.addClass('only-con').css({marginTop: (height - c[0].offsetHeight) * .4});
    	        }
    	    }
    	    
            // _log(metadata);
    	});
	}
	
	
	function analyze(){
		var t = jQuery(this),
		    slide = t.parents("div.slide");
		/* add idx support for button.run
		*/
		var text = slide.find('pre').filter('.javascript,.js');
		
		if (t.is('button.run') && t.attr('rel')) {
		    text = text.eq(parseInt(t.attr('rel'), 10));
		}
		
		text = text.text();
		
		if (!text) return;
		
		text = text
			.replace(/&lt;/g, "<").replace(/&gt;/g, ">")
			.replace(/&nbsp;/g, " ").replace(/\s/g, " ")
			.replace(/(\$\("|appendTo\(")/g, "$1#" + slide.attr("id") + " ");
		
		eval( text );
	}

	
	jQuery.fn.goto = function(){
		var s = this,
		    p,
		    metadata;
		
		if ( s.length ) {
			animating = true;
			
			metadata = s.data('metadata');
			(!metadata.offset) && (metadata.offset = s.offset());

			hash.p = p = metadata.id;
			lochash(hash);

			scrollel.stop(true).animate({scrollTop: metadata.offset.top}, 320, function(){
					animating = false;
					hash.p = p;
        			lochash(hash);
				});
		}
		
		return this;
	};
	
	
	if (hash && hash.sld) {
	    $.get(hash.sld, function (s) {
	        keycache = '';
	        proc_sld(s);
            proc_slide();
            slides.eq(hash.p || 0).goto();
	    });
	}
	
	body.delegate('button.run', 'click', analyze);
        // .delegate('h1', 'click', function(ev){
            // $(this).parent()[ev.clientY > (this.offsetHeight * .4) ? 'next' : 'prev']().goto();
        // });
	
	$(document).bind('keypress', function (ev) {
		    var k = String.fromCharCode(ev.charCode || ev.keyCode);
		    
		    (/[A-Z]/.test(k)) && (k = k.toLowerCase());
            
            // _log(ev.charCode, ev.keyCode);
            
            switch (k) {
                case '?':
                    alert('快捷键:\n\n' +
                    '   g 第一页  +shift 最后一页\n\n' +
                    '   j/k 下/上一页 +shift 翻 n 页\n\n' +
                    '   f/b 下/上一屏 意义在于，不会翻到另一页，\n' +
                    '        +shift 翻 0.8 屏');
                    
                    break;
                case 'd':
                    if (keycache.slice(-1) === 'd') {
                        keycache = keycache.slice(0, -1);
                        if (confirm('清空所有幻灯?')) {
                            alert('des');
                        }
                    } else {
                        keycache += k;
                    }
                    
                    break;
                case 'g':
                    if (ev.shiftKey) {
                        slides.eq(-1).goto();
                    } else {
                        slides.eq(0).goto();
                    }
                    
                    break;
                case 'j':
                    slides.eq(hash.p + (ev.shiftKey ? (parseInt(prompt('page step: ', 1), 10) || 0) : 1)).goto();
                    break;
                case 'k':
                    slides.eq(hash.p - (ev.shiftKey ? (parseInt(prompt('page step: ', 1), 10) || 0) : 1)).goto();
                    break;
                case 'f':
                    (function (s) {
                        s = s.data('metadata');
                        
                        scrollel.stop(true).animate({scrollTop:
                                Math.min(scrollel.scrollTop() + height * (ev.shiftKey ? .8 : 1),
                                    s.offset.top + s.height - height)}, 170);
                    })(slides.eq(hash.p));
                    break;
                case 'b':
                    (function (s) {
                        s = s.data('metadata');
                        
                        scrollel.stop(true)
                            .animate({scrollTop:
                                Math.max(scrollel.scrollTop() - height * (ev.shiftKey ? .8 : 1),
                                    s.offset.top)}, 170);
                    })(slides.eq(hash.p));
                    break;
                default:
                    keycache += k;
                    break;
            }
            
            if (keycache.length > 15) {
                keycache = keycache.slice(0, -15);
            }
            
            // return false;
		});
	
	setInterval(function(){
		if ( !slides || !hash.sld || animating ) {
			return;
		}
		
		var h = lochash(),
		    start = scrollel.scrollTop(),
			end = start + height,
			p = h.p;
		
		slides.each(function(id){
			var top = jQuery(this).offset().top,
				bottom = top + this.offsetHeight;

			if ( p !== id && (top > start && top < end || bottom > start && bottom < end) ) {
                // window.location.hash = id;
                
				jQuery(this).goto();
				return false;
			}
		});
	}, 200);
});