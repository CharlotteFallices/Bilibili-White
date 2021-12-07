// ==UserScript==
// @name         Bilibili 翻页评论区
// @namespace    MotooriKashin
// @version      1.0.1
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
    
    modules["comment.css"] = ".bb-comment .comment-header .header-page, .comment-bilibili-fold .comment-header .header-page {\n    float: right;\n    line-height: 36px;\n}\n.bb-comment .comment-list .list-item .user .text-con, .comment-bilibili-fold .comment-list .list-item .user .text-con {\n    margin-left: initial;\n}\n.bb-comment .comment-list .list-item .reply-box .reply-item .reply-con .user>a, .comment-bilibili-fold .comment-list .list-item .reply-box .reply-item .reply-con .user>a {\n    margin-left: initial;\n}\n.user-card .info .user .vip-icon {\n    max-width: 58px;\n    height: 16px;\n    border-radius: 2px;\n    margin-left: 8px;\n    background-color: #FF6699;\n    font-size: 12px;\n    font-weight: 400;\n    color: #fff;\n    white-space: nowrap;\n    padding: 1px;\n    padding-inline: 4px;\n}\n.user-card .info .verify {\n    color: #9499A0;\n    line-height: 17px;\n    margin-top: 11px;\n}\n.user-card .info .verify .auth {\n    display: inline-block;\n    vertical-align: bottom;\n    position: relative;\n    left: -3px;\n    width: 16px;\n    height: 16px;\n}\n.reply-item .reply-con .user .stick {\n    zoom: 0.9;\n}";
    modules["apply.json"] = {    "runWhile": "extend.js",    "addCss": "extend.js",    "addElement": "extend.js",    "scriptIntercept": "Node.js",    "jsonphook": "Node.js",    "removeJsonphook": "Node.js"};
    modules["extend.js"] = "/**\n * 本模块负责拓展一些小工具，这些工具不便写在主模块中\n */\n(function () {\n    async function addCss(txt, id, parrent) {\n        if (!parrent && !document.head) {\n            await new Promise(r => API.runWhile(() => document.body, r));\n        }\n        parrent = parrent || document.head;\n        const style = document.createElement(\"style\");\n        style.setAttribute(\"type\", \"text/css\");\n        id && !parrent.querySelector(`#${id}`) && style.setAttribute(\"id\", id);\n        style.appendChild(document.createTextNode(txt));\n        parrent.appendChild(style);\n    }\n    API.addCss = (txt, id, parrent) => addCss(txt, id, parrent);\n    function addElement(tag, attribute, parrent, innerHTML, top, replaced) {\n        let element = document.createElement(tag);\n        attribute && (Object.entries(attribute).forEach(d => element.setAttribute(d[0], d[1])));\n        parrent = parrent || document.body;\n        innerHTML && (element.innerHTML = innerHTML);\n        replaced ? replaced.replaceWith(element) : top ? parrent.insertBefore(element, parrent.firstChild) : parrent.appendChild(element);\n        return element;\n    }\n    API.addElement = (tag, attribute, parrent, innerHTML, top, replaced) => addElement(tag, attribute, parrent, innerHTML, top, replaced);\n    function runWhile(check, callback, delay = 100, stop = 180) {\n        let timer = setInterval(() => {\n            if (check()) {\n                clearInterval(timer);\n                callback();\n            }\n        }, delay);\n        stop && setTimeout(() => clearInterval(timer), stop * 1000);\n    }\n    API.runWhile = (check, callback, delay = 100, stop = 180) => runWhile(check, callback, delay, stop);\n})();\n\n//# sourceURL=API://@bilibili/dist/extend.js";
    modules["Node.js"] = "/**\n * 本模块负责实现原生脚本拦截模块\n * 这里指的原生脚本是那些非直接写入原生HTML，而是后续由JavaScript添加进DOM的脚本\n * 本模块导入优先级极高\n */\n(function () {\n    class NodeHook {\n        constructor() {\n            this.jsonphook = (url, callback) => NodeHook.jsonp.push([url, callback]);\n            this.removeJsonphook = (id) => NodeHook.jsonp.splice(id - 1, 1);\n            this.appendChild();\n            this.insertBefore();\n        }\n        intercept(rule, replaceURL) {\n            NodeHook.rules.push([rule, replaceURL]);\n        }\n        appendChild() {\n            Node.prototype.appendChild = function (newChild) {\n                newChild.nodeName == 'SCRIPT' && newChild.src && (NodeHook.rules.forEach(d => {\n                    d[0].every(d => newChild.src.includes(d)) && (d[1] ?\n                        (newChild.src = d[1]) :\n                        newChild.removeAttribute(\"src\"));\n                }), NodeHook.jsonp.forEach(d => {\n                    d[0].every(d => newChild.src.includes(d)) && d[1](new Proxy(new Object(), {\n                        set: (t, p, v) => {\n                            p == \"url\" && (newChild.src = v);\n                            return true;\n                        },\n                        get: (t, p) => {\n                            return p == \"url\" ? newChild.src : undefined;\n                        }\n                    }));\n                }));\n                return NodeHook.appendChild.call(this, newChild);\n            };\n        }\n        insertBefore() {\n            Node.prototype.insertBefore = function (newChild, refChild) {\n                newChild.nodeName == 'SCRIPT' && newChild.src && (NodeHook.rules.forEach(d => {\n                    d[0].every(d => newChild.src.includes(d)) && (d[1] ?\n                        (newChild.src = d[1]) :\n                        newChild.removeAttribute(\"src\"));\n                }), NodeHook.jsonp.forEach(d => {\n                    d[0].every(d => newChild.src.includes(d)) && d[1](new Proxy(new Object(), {\n                        set: (t, p, v) => {\n                            p == \"url\" && (newChild.src = v);\n                            return true;\n                        },\n                        get: (t, p) => {\n                            return p == \"url\" ? newChild.src : undefined;\n                        }\n                    }));\n                }));\n                return NodeHook.insertBefore.call(this, newChild, refChild);\n            };\n        }\n    }\n    NodeHook.appendChild = Node.prototype.appendChild;\n    NodeHook.insertBefore = Node.prototype.insertBefore;\n    NodeHook.rules = [];\n    NodeHook.jsonp = [];\n    const nodeHook = new NodeHook();\n    API.scriptIntercept = (rule, replaceURL) => nodeHook.intercept(rule, replaceURL);\n    API.jsonphook = (url, callback) => nodeHook.jsonphook(url, callback);\n    API.removeJsonphook = (id) => nodeHook.removeJsonphook(id);\n})();\n\n//# sourceURL=API://@bilibili/dist/Node.js";
    modules["replyList.js"] = "/**\n * 本模块负责恢复翻页评论区\n */\n(function () {\n    API.scriptIntercept([\"comment.min.js\"], \"https://cdn.jsdelivr.net/gh/MotooriKashin/Bilibili-Old/dist/comment.min.js\");\n    class ReplyList {\n        init() {\n            // 拦截评论脚本\n            if (window.bbComment)\n                return this.cover(); // 评论已载入直接覆盖\n            // 监听评论脚本载入并覆盖\n            Object.defineProperty(window, \"bbComment\", {\n                set: () => { this.cover(); },\n                get: () => undefined,\n                configurable: true\n            });\n        }\n        cover() {\n            delete window.bbComment; // 取消拦截\n            new Function(GM.getResourceText(\"comment.min.js\"))(); // 载入旧版脚本\n            API.addElement(\"link\", { href: \"//static.hdslb.com/phoenix/dist/css/comment.min.css\", rel: \"stylesheet\" }, document.head);\n            API.addCss(API.getModule(\"comment.css\"));\n            this.style();\n        }\n        async style() {\n            const arr = document.querySelectorAll(\"style\");\n            arr.forEach((d, i) => {\n                d.outerHTML.includes(\"/*热门评论分割线*/\") && arr[i].remove();\n            });\n        }\n    }\n    new ReplyList().init();\n    API.jsonphook([\"api.bilibili.com/x/v2/reply?\"], (xhr) => {\n        !xhr.url.includes(\"mobi_app\") && (xhr.url += `&mobi_app=android`);\n    });\n})();\n\n//# sourceURL=API://@bilibili/dist/replyList.js";
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
