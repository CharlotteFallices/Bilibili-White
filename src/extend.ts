/**
 * 本模块负责拓展一些小工具，这些工具不便写在主模块中
 */
(function () {
    async function addCss(txt: string, id?: string, parrent?: Node) {
        if (!parrent && !document.head) {
            await new Promise(r => API.runWhile(() => document.body, r));
        }
        parrent = parrent || document.head;
        const style = document.createElement("style");
        style.setAttribute("type", "text/css");
        id && !(<HTMLElement>parrent).querySelector(`#${id}`) && style.setAttribute("id", id);
        style.appendChild(document.createTextNode(txt));
        parrent.appendChild(style);
    }
    API.addCss = (txt: string, id?: string, parrent?: Node) => addCss(txt, id, parrent);
    function addElement<T extends keyof HTMLElementTagNameMap>(tag: T, attribute?: { [name: string]: string }, parrent?: Node, innerHTML?: string, top?: boolean, replaced?: Element): HTMLElementTagNameMap[T] {
        let element = document.createElement(tag);
        attribute && (Object.entries(attribute).forEach(d => element.setAttribute(d[0], d[1])));
        parrent = parrent || document.body;
        innerHTML && (element.innerHTML = innerHTML);
        replaced ? replaced.replaceWith(element) : top ? parrent.insertBefore(element, parrent.firstChild) : parrent.appendChild(element);
        return element;
    }
    API.addElement = <T extends keyof HTMLElementTagNameMap>(tag: T, attribute?: { [name: string]: string }, parrent?: Node, innerHTML?: string, top?: boolean, replaced?: Element) => addElement(tag, attribute, parrent, innerHTML, top, replaced);
    function runWhile(check: Function, callback: Function, delay: number = 100, stop: number = 180) {
        let timer = setInterval(() => {
            if (check()) {
                clearInterval(timer);
                callback();
            }
        }, delay);
        stop && setTimeout(() => clearInterval(timer), stop * 1000)
    }
    API.runWhile = (check: Function, callback: Function, delay: number = 100, stop: number = 180) => runWhile(check, callback, delay, stop);

})();
declare namespace API {
    /**
     * 添加css样式
     * @param txt css文本
     * @param id 样式ID，用于唯一标记
     * @param parrent 添加到的父节点，默认为head
     */
    function addCss(txt: string, id?: string, parrent?: Node): Promise<void>;
    /**
     * 创建HTML节点
     * @param tag 节点名称
     * @param attribute 节点属性对象
     * @param parrent 添加到的父节点，默认为body
     * @param innerHTML 节点的innerHTML
     * @param top 是否在父节点中置顶
     * @param replaced 替换节点而不是添加，被替换的节点，将忽略父节点相关参数
     */
    function addElement<T extends keyof HTMLElementTagNameMap>(tag: T, attribute?: { [name: string]: string }, parrent?: Node, innerHTML?: string, top?: boolean, replaced?: Element): HTMLElementTagNameMap[T];
    /**
     * 添加条件回调，条件为真时执行回调函数，用于检测函数运行时机  
     * @param check 一个返回布尔值的函数，用于轮询，当函数返回值为真时执行回调函数
     * @param callback 待执行的回调函数
     * @param delay 轮询间隔：/ms，默认100ms
     * @param stop 轮询最大延时：/ms，多长时间后终止轮询，不做无谓的等待，默认180ms，即3分钟。为0时永不终止直到为真。
     */
    function runWhile(check: Function, callback: Function, delay?: number, stop?: number): void;
}