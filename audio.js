/*
                   _ooOoo_
                  o8888888o
                  88" . "88
                  (| -_- |)
                  O\  =  /O
               ____/`---'\____
             .'  \\|     |//  `.
            /  \\|||  :  |||//  \
           /  _||||| -:- |||||-  \
           |   | \\\  -  /// |   |
           | \_|  ''\---/''  |   |
           \  .-\__  `-`  ___/-. /
         ___`. .'  /--.--\  `. . __
      ."" '<  `.___\_<|>_/___.'  >'"".
     | | :  `- \`.;`\ _ /`;.`/ - ` : | |
     \  \ `-.   \_ __\ /__ _/   .-` /  /
======`-.____`-.___\_____/___.-`____.-'======
                   `=---='
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
         God Bless Javascript
*/

/**
 * html5 audio播放器组件
 * @author bingozhang
 */
;(function(global){
	
	/**
	 * @param {object || null} 如果有传参数会调用init方法
	 * 	具体object参数参见 init 函数
	 * @return {object}
	 * 	{
	 * 		@function play 播放
	 * 		@function pause 暂停
	 * 		@function toggle 暂停或者回复播放
	 * 		@function setPlayTime 设置播放时间
	 * 		@function init 初始化播放器
	 * 	}
	 *
	 */
	 
	function myaudioplayer(param){
		
		// 页面中播放音乐的audio对象
		var g_audio = null;
			
		// 是否是第一次初始化
		var _hasBindEvent = false;
		
		// 回调配置对象 初始化的时候初始化需要监听的audio播放回调
		var	conf = {
			// 在多个实例创建时是否需要声音互斥 默认需要
			needVioceMutex : true
		};
		
		// 是否是安卓2.3标识
		var isAndroidLow = false;
		if(/android\s2\.3/i.test(navigator.userAgent)){
			isAndroidLow = true;
		}
		
		if(typeof window._vioceMutexList == 'undefined'){
			window._vioceMutexList = [];
		}
		
		/**
		 * 歌曲播放
		 * @param {string} 
		 * 如果播放是同一个播放url 会触 audio 的toggle方法内部实现了暂停或者恢复播放
		 */
		function play(playurl){
			if( g_audio && g_audio.src == playurl){ // 如果是当前播放歌曲
				toggle();
			}else{ 
				if( isAndroidLow ){ // 如果是安卓低版本
				
					/**
					 * 安卓低版本 
					 * 暂停之前的audio 移除它
					 * 	然后新创建一个新的audio 绑定事件并且赋值src 更新 g_audio对象
					 */
					if(g_audio && typeof g_audio.pause == 'function'){
						g_audio.pause();
						document.body.removeChild(g_audio);
					}
					
					setTimeout(function(){
						var newaudio = document.createElement('audio');
						bindEvent(newaudio);
						newaudio.setAttribute('style', 'height:0;width:0;display:none');
						newaudio.setAttribute('autoplay', '');
						newaudio.src = playurl;
						document.body.appendChild(newaudio);
						newaudio.load();
						// 这里千万不能调用 newaudio.play();
						g_audio = newaudio;
					}, 50);
					
				}else{
					// 高版本直接赋值src 调用播放
					g_audio.src = playurl;
					g_audio.play();
				}
			}
		};
		
		
		/**
		 * 暂停歌曲播放
		 */
		function pause(){
			if(g_audio && g_audio.pause == 'function'){
				g_audio.pause();
			}
		};
	
		/**
		 * 恢复播放或者暂停歌曲播放
		 * 无需关注现在播放状态 内部已经处理
		 * 
		 */
		function toggle(){
			if(g_audio){
				if( g_audio.ended || g_audio.paused ){
					if( g_audio.ended ){
						g_audio.currentTime = 0;
					}
					
					g_audio.play();
					
				}else{
					g_audio.pause();
				}
			}
		};
		
		/**
		 * 设置播放时间
		 * @param {number} 单位 s 
		 */
		function setPlayTime(time){
			if(typeof g_audio == 'object'){
				// 音频播放还没有进入第一次 timeupdate 的时候设置currentTime 会报错
				try{
					g_audio.currentTime = time;
				}catch(e){
					console.log('set audio currentTime error : '+ e );
				}
			}
		};
		
		/**
		 * 扩展对象 不多解释
		 * @param {object} 
		 * @param {object} 
		 * @return {object} 
		 */
		function extend(destination, source) {
			for (var property in source) {
				destination[property] = source[property];
			}
			return destination;
		};
		
		/**
		 * 为audio绑定各个回调函数
		 * @param {object} audio标签对象
		 */
		function bindEvent(audio){
			
			conf;
			g_audio;
		
			if(conf.needVioceMutex){
				_vioceMutexList.push(audio);
			}
			
			// 播放回调
			audio.addEventListener('play',function(e){
				try{	
					stopOther();
				}catch(e){}
				
				if(typeof conf.play == 'function'){
					conf.play(e);
				}
			}, false);
			
			// 播放完成回调
			audio.addEventListener('ended',function(e){
				if(typeof conf.ended == 'function'){
					conf.ended(e);
				}
			}, false);

			// 播放暂停回调
			audio.addEventListener('pause',function(e){
				if(typeof conf.pause == 'function'){
					conf.pause(e);
				}
			}, false);
			
			// 时间进度回调
			audio.addEventListener('timeupdate',function(e){
				if(typeof conf.timeupdate == 'function'){
					conf.timeupdate(e);
				}
			}, false);
		};
		
		
		function stopOther(){
			if(conf.needVioceMutex){
				for(var i =0, len = _vioceMutexList.length; i<len; i++){
					var item = _vioceMutexList[i];
					if(item && item != g_audio && typeof item.pause == 'function'){
						item.pause();
					}
				}
			}
		};
		
		/**
		 * 初始化播放器
		 * @param {object}
		 * 	{
		 * 		@function play 播放回调 
		 * 		@function pause 暂停回调 
		 * 		@function ended 播放结束回调 
		 * 		@function timeupdate 时间进度回调 
		 * 	}
		 */
		 
		function init( param ){
			
			if( _hasBindEvent ){ // 重复调用init只会更新conf回调配置
				if( typeof param == 'object' ){
					conf = extend(conf, param);
				}
				return;
			}else{
				
				conf = extend(conf, param);

				_hasBindEvent = true;

				var audio = document.createElement('audio');
				g_audio = audio;
				bindEvent(audio);
				audio.setAttribute('style', 'height:0;width:0;display:none');
				
				// 设置autoplay 属性除2.3之外就赋值audio的src就直接自动播放
				audio.setAttribute('autoplay', '');
				document.body.appendChild(audio);
				
				if( isAndroidLow ){ 
				
					/**
					 * android 2.3 播放 需要监听canplay状态才能调用play方法
					 * 为了不多次重复监听这个时间 在window上监听一次
					 * 	
					 */
					 
					window.addEventListener('canplay',function(e){
						if( e.target && typeof e.target.play == 'function'){
							e.target.play();
						}
					}, true);
					
				}
				
			}
			
		};
		
		if(typeof param == 'object'){
			init(param);
		}
		
		return {
			play : play,
			pause : pause,
			toggle : toggle,
			setPlayTime : setPlayTime,
			init : init
		}
		
	};
	
	// 设置全局别名
	if(typeof define == 'function'){
        define('AudioPlayer',[],function(){
            return myaudioplayer;
        });
    }else{
        global.AudioPlayer = myaudioplayer;
    }
	
})(window);
