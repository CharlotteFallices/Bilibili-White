"use strict";
GM.xmlHttpRequest = GM_xmlhttpRequest;
GM.getResourceText = GM_getResourceText;
GM.getResourceURL = GM_getResourceURL;
GM.getValue = GM_getValue;
GM.setValue = GM_setValue;
GM.deleteValue = GM_deleteValue;
/**
 * 核心模块
 */
const baseModule = ["xhr.js", "toast.js", "format.js", "debug.js"];
/**
 * 脚本配置数据
 */
const CONFIG = {};
/**
 * 脚本配置数据代理，用于监听变化
 */
const config = new Proxy(CONFIG, {
    set: (_target, p, value) => {
        CONFIG[p] = value;
        GM.setValue("config", CONFIG);
        return true;
    },
    get: (_target, p) => CONFIG[p]
});
class Main {
    /**
     * 已引入模块列表
     */
    static modules = {};
    /**
     * 本地模块列表
     */
    static moduleList = [];
    /**
     * 页面`head`
     */
    static cssFlag;
    GM = GM;
    Handler = [GM.info.scriptHandler, GM.info.version].join(" ");
    Name = GM.info.script.name;
    Virsion = GM.info.script.version;
    config = config;
    constructor() {
        /**
         * 读取模块列表
         */
        Main.moduleList = GM.info.script.resources.reduce((s, d) => { s.push(d.name); return s; }, []);
        /**
         * 初始化脚本设置
         */
        Main.initConfig();
        /**
         * 开发者模式暴露核心变量
         */
        config.developer && (unsafeWindow.API = this);
        /**
         * 载入基础模块
         */
        baseModule.forEach(d => this.importModule(d));
    }
    /**
     * 初始化脚本设置
     */
    static initConfig() {
        let doc = JSON.parse(GM.getResourceText("config.json") || "{}");
        let ini = GM.getValue("config", {});
        Object.entries(ini).forEach(k => config[k[0]] = k[1]);
        Object.entries(doc).forEach(k => config[k[0]] || (config[k[0]] = k[1][0]));
    }
    /**
     * 导入模块
     * @param moduleName 模块名字
     * @param args 传递给模块的变量
     * @returns 模块返回值或者提示信息
     */
    importModule(moduleName, args = {}) {
        return moduleName ? Main.modules[moduleName] ? Main.modules[moduleName] : (Main.moduleList.includes(moduleName) ?
            (Main.modules[moduleName] =
                new Function("API", "GM", "config", "importModule", ...Object.keys(args), GM.getResourceText(moduleName))(this, GM, config, this.importModule, ...Object.keys(args).reduce((s, d) => {
                    s.push(args[d]);
                    return s;
                }, []))) : new Error(`未知模块：${moduleName}`)) : Main.modules;
    }
    /**
     * 获取`cookies`信息
     * @returns `cookies`对象
     */
    getCookies() {
        return document.cookie.split('; ').reduce((s, d) => {
            let key = d.split('=')[0];
            let val = d.split('=')[1];
            s[key] = val;
            return s;
        }, {});
    }
    /**
     * 添加网页节点
     * @param div 节点名字
     * @param attribute 节点属性组成的对象
     * @param parrent 父节点
     * @param innerHTML 节点的`innerHTML`
     * @param top 是否在父节点置顶
     * @param replaced 被替换的节点，忽略父节点参数
     * @returns 所添加的节点
     */
    addElement(div, attribute, parrent, innerHTML, top, replaced) {
        let element = document.createElement(div);
        attribute && (Object.entries(attribute).forEach(d => element.setAttribute(d[0], d[1])));
        parrent = parrent || document.body;
        innerHTML && (element.innerHTML = innerHTML);
        return replaced ? replaced.replaceWith(element) : top ? parrent.insertBefore(element, parrent.firstChild) : parrent.appendChild(element);
    }
    /**
     * 移除或隐藏页面节点
     * @param name 检索名称
     * @param type 检索类型`class`、`id`还是`div`
     * @param hidden 隐藏而不移除
     * @param index 检索结果有复数个时的序号
     * @param callback 移除后的回调函数
     */
    removeElement(name, type, hidden = false, index = 0, callback) {
        let node;
        switch (type) {
            case "id":
                node = document.querySelector("#" + name);
                break;
            case "class":
                name = name.replace(/ /g, ".");
                node = document.querySelectorAll("." + name)[index];
                break;
            case "tag":
                node = document.querySelectorAll(name)[index];
                break;
        }
        if (!node || node.getAttribute("hidden"))
            return;
        hidden ? node.setAttribute("hidden", "hidden") : node.remove();
        callback && callback();
    }
    /**
     * 添加CSS样式
     * @param text 样式
     * @param id 样子在页面中唯一ID，防止重复
     */
    addCss(text, id) {
        if (!document.head) {
            if (Main.cssFlag)
                return;
            return setTimeout(() => { Main.cssFlag = 1; this.addCss(text, id); });
        }
        let style = document.createElement("style");
        if (id) {
            if (document.querySelector("#" + id))
                return;
            style.setAttribute("id", id);
        }
        style.setAttribute("type", "text/css");
        style.appendChild(document.createTextNode(text));
        if (document.head)
            document.head.appendChild(style);
    }
    /**
     * json化xhr返回值
     * @param data xhr返回的response
     * @returns 转化成`json`的xhr.response
     */
    jsonCheck(data) {
        let result = typeof data === "string" ? JSON.parse(data) : data;
        if ("code" in result && result.code !== 0) {
            let msg = result.msg || result.message || "";
            throw [result.code, msg];
        }
        return result;
    }
}
const main = new Main();
