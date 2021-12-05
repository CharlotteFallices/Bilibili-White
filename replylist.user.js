// ==UserScript==
// @name         Bilibili 翻页评论区
// @namespace    MotooriKashin
// @version      1.0.0
// @description  恢复原来的翻页评论区，同时修复评论楼层号。
// @author       MotooriKashin
// @homepage     https://github.com/MotooriKashin/Bilibili-Old
// @supportURL   https://github.com/MotooriKashin/Bilibili-Old/issues
// @icon         https://static.hdslb.com/images/favicon.ico
// @match        *://*.bilibili.com/*
// @grant        GM_getResourceText
// @run-at       document-start
// @license      MIT
// @resource     comment.min.js https://cdn.jsdelivr.net/gh/MotooriKashin/Bilibili-Old/dist/comment.min.js
// ==/UserScript==

/**
 * 脚本主体，负责提供脚本与模块间沟通的桥梁
 */
(function () {
    GM.getResourceText = GM_getResourceText;
    // @ts-ignore 忽略unsafeWindow错误
    const root = unsafeWindow;
    const modules = {};
    
    modules["comment.css"] = `.bb-comment .comment-header .header-page, .comment-bilibili-fold .comment-header .header-page {
    float: right;
    line-height: 36px;
}
.bb-comment .comment-list .list-item .user .text-con, .comment-bilibili-fold .comment-list .list-item .user .text-con {
    margin-left: initial;
}
.bb-comment .comment-list .list-item .reply-box .reply-item .reply-con .user>a, .comment-bilibili-fold .comment-list .list-item .reply-box .reply-item .reply-con .user>a {
    margin-left: initial;
}
.user-card .info .user .vip-icon {
    max-width: 58px;
    height: 16px;
    border-radius: 2px;
    margin-left: 8px;
    background-color: #FF6699;
    font-size: 12px;
    font-weight: 400;
    color: #fff;
    white-space: nowrap;
    padding: 1px;
    padding-inline: 4px;
}
.user-card .info .verify {
    color: #9499A0;
    line-height: 17px;
    margin-top: 11px;
}
.user-card .info .verify .auth {
    display: inline-block;
    vertical-align: bottom;
    position: relative;
    left: -3px;
    width: 16px;
    height: 16px;
}
.reply-item .reply-con .user .stick {
    zoom: 0.9;
}`;
    modules["apply.json"] = {
    "runWhile": "extend.js",
    "addCss": "extend.js",
    "addElement": "extend.js",
    "scriptIntercept": "Node.js",
    "jsonphook": "Node.js",
    "removeJsonphook": "Node.js"
};
    modules["extend.js"] = `/**
 * 本模块负责拓展一些小工具，这些工具不便写在主模块中
 */
(function () {
    async function addCss(txt, id, parrent) {
        if (!parrent && !document.head) {
            await new Promise(r => API.runWhile(() => document.body, r));
        }
        parrent = parrent || document.head;
        const style = document.createElement("style");
        style.setAttribute("type", "text/css");
        id && !parrent.querySelector(\`#\${id}\`) && style.setAttribute("id", id);
        style.appendChild(document.createTextNode(txt));
        parrent.appendChild(style);
    }
    API.addCss = (txt, id, parrent) => addCss(txt, id, parrent);
    function addElement(tag, attribute, parrent, innerHTML, top, replaced) {
        let element = document.createElement(tag);
        attribute && (Object.entries(attribute).forEach(d => element.setAttribute(d[0], d[1])));
        parrent = parrent || document.body;
        innerHTML && (element.innerHTML = innerHTML);
        replaced ? replaced.replaceWith(element) : top ? parrent.insertBefore(element, parrent.firstChild) : parrent.appendChild(element);
        return element;
    }
    API.addElement = (tag, attribute, parrent, innerHTML, top, replaced) => addElement(tag, attribute, parrent, innerHTML, top, replaced);
    function runWhile(check, callback, delay = 100, stop = 180) {
        let timer = setInterval(() => {
            if (check()) {
                clearInterval(timer);
                callback();
            }
        }, delay);
        stop && setTimeout(() => clearInterval(timer), stop * 1000);
    }
    API.runWhile = (check, callback, delay = 100, stop = 180) => runWhile(check, callback, delay, stop);
})();

//# sourceURL=API://@bilibili/dist/extend.js`;
    modules["Node.js"] = `/**
 * 本模块负责实现原生脚本拦截模块
 * 这里指的原生脚本是那些非直接写入原生HTML，而是后续由JavaScript添加进DOM的脚本
 * 本模块导入优先级极高
 */
(function () {
    class NodeHook {
        constructor() {
            this.jsonphook = (url, callback) => NodeHook.jsonp.push([url, callback]);
            this.removeJsonphook = (id) => NodeHook.jsonp.splice(id - 1, 1);
            this.appendChild();
            this.insertBefore();
        }
        intercept(rule, replaceURL) {
            NodeHook.rules.push([rule, replaceURL]);
        }
        appendChild() {
            Node.prototype.appendChild = function (newChild) {
                newChild.nodeName == 'SCRIPT' && newChild.src && (NodeHook.rules.forEach(d => {
                    d[0].every(d => newChild.src.includes(d)) && (d[1] ?
                        (newChild.src = d[1]) :
                        newChild.removeAttribute("src"));
                }), NodeHook.jsonp.forEach(d => {
                    d[0].every(d => newChild.src.includes(d)) && d[1](new Proxy(new Object(), {
                        set: (t, p, v) => {
                            p == "url" && (newChild.src = v);
                            return true;
                        },
                        get: (t, p) => {
                            return p == "url" ? newChild.src : undefined;
                        }
                    }));
                }));
                return NodeHook.appendChild.call(this, newChild);
            };
        }
        insertBefore() {
            Node.prototype.insertBefore = function (newChild, refChild) {
                newChild.nodeName == 'SCRIPT' && newChild.src && (NodeHook.rules.forEach(d => {
                    d[0].every(d => newChild.src.includes(d)) && (d[1] ?
                        (newChild.src = d[1]) :
                        newChild.removeAttribute("src"));
                }), NodeHook.jsonp.forEach(d => {
                    d[0].every(d => newChild.src.includes(d)) && d[1](new Proxy(new Object(), {
                        set: (t, p, v) => {
                            p == "url" && (newChild.src = v);
                            return true;
                        },
                        get: (t, p) => {
                            return p == "url" ? newChild.src : undefined;
                        }
                    }));
                }));
                return NodeHook.insertBefore.call(this, newChild, refChild);
            };
        }
    }
    NodeHook.appendChild = Node.prototype.appendChild;
    NodeHook.insertBefore = Node.prototype.insertBefore;
    NodeHook.rules = [];
    NodeHook.jsonp = [];
    const nodeHook = new NodeHook();
    API.scriptIntercept = (rule, replaceURL) => nodeHook.intercept(rule, replaceURL);
    API.jsonphook = (url, callback) => nodeHook.jsonphook(url, callback);
    API.removeJsonphook = (id) => nodeHook.removeJsonphook(id);
})();

//# sourceURL=API://@bilibili/dist/Node.js`;
    modules["replyList.js"] = `/**
 * 本模块负责恢复翻页评论区
 */
(function () {
    API.scriptIntercept(["comment.min.js"], "https://cdn.jsdelivr.net/gh/MotooriKashin/Bilibili-Old/dist/comment.min.js");
    class ReplyList {
        init() {
            // 拦截评论脚本
            if (window.bbComment)
                return this.cover(); // 评论已载入直接覆盖
            // 监听评论脚本载入并覆盖
            Object.defineProperty(window, "bbComment", {
                set: () => { this.cover(); },
                get: () => undefined,
                configurable: true
            });
        }
        cover() {
            delete window.bbComment; // 取消拦截
            new Function(GM.getResourceText("comment.min.js"))(); // 载入旧版脚本
            API.addElement("link", { href: "//static.hdslb.com/phoenix/dist/css/comment.min.css", rel: "stylesheet" }, document.head);
            API.addCss(API.getModule("comment.css"));
        }
    }
    new ReplyList().init();
    API.jsonphook(["api.bilibili.com/x/v2/reply?"], (xhr) => {
        !xhr.url.includes("mobi_app") && (xhr.url += \`&mobi_app=android\`);
    });
})();

//# sourceURL=API://@bilibili/dist/replyList.js`;
    /**
     * 初始化脚本设置数据
     */
    class API {
        constructor() {
            this.GM = GM;
            this.module = [];
            this.Name = GM.info.script.name;
            this.Virsion = GM.info.script.version;
            this.Handler = [GM.info.scriptHandler, GM.info.version].join(" ");
            /**
             * 获取模块内容
             * @param name 模块名字
             * @returns json直接返回格式化对象，其他返回字符串
             */
            this.getModule = (name) => Reflect.get(modules, name);
            /**
             * 载入模块
             * @param name 模块名字
             * @param args 传递给对方的全局变量：格式{变量名：变量值}
             * @param force 是否强制载入，一般模块只会载入一次，需要二次载入请将本值设为真
             */
            this.importModule = (name, args = {}, force) => {
                if (!name)
                    return Object.keys(modules);
                if (this.module.includes(name) && !force)
                    return this.module;
                if (Reflect.has(modules, name)) {
                    !this.module.includes(name) && this.module.push(name);
                    new Function("API", "GM", ...Object.keys(args), Reflect.get(modules, name))(API.API, GM, ...Object.keys(args).reduce((s, d) => {
                        s.push(args[d]);
                        return s;
                    }, []));
                }
            };
            API.API = new Proxy(this, {
                get: (t, p) => {
                    return Reflect.get(root, p) || Reflect.get(t, p) || (Reflect.has(modules["apply.json"], p) ? (t.importModule(modules["apply.json"][p], {}),
                        Reflect.get(t, p)) : undefined);
                },
                set: (t, p, value) => {
                    Reflect.has(root, p) ? Reflect.set(root, p, value) : Reflect.set(t, p, value);
                    return true;
                }
            });
            this.importModule("replyList.js");
        }
    }
    new API();
})();
