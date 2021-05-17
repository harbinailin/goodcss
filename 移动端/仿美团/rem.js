;
(function(win) {
    var doc = win.document;
    var docEl = doc.documentElement;  //html元素 根元素
    var tid;

    function refreshRem() {
        // 获取屏幕宽度
        var width = docEl.getBoundingClientRect().width;
        var rem = width / 6.4;  //320/6.4 = 50
        // 将根元素的字体大小设置成1份
        docEl.style.fontSize = rem + 'px';

    }

    win.addEventListener('resize', function() {
        clearTimeout(tid);
        tid = setTimeout(refreshRem, 10);
    }, false);
    win.addEventListener('pageshow', function(e) {
        if (e.persisted) {
            clearTimeout(tid);
            tid = setTimeout(refreshRem, 10);
        }
    }, false);

    refreshRem();

})(window);