interface modules {
    /** 预定义element组件工具 */
    readonly "element.js": string;
    readonly "ui-popup-box.css": string;
    readonly "hr.css": string;
    readonly "switch.css": string;
    readonly "icon.css": string;
    readonly "progress.css": string;
    readonly "select.css": string;
    readonly "button.css": string;
    readonly "input.css": string;
    readonly "checkbox.css": string;
}
namespace API {
    /** 进度条配置信息，双向绑定 */
    export interface ProgressDetial {
        /** 进度起点，必须小于max */
        min: number;
        /** 进度终点，必须大于min */
        max: number;
        /** 当前进度，取值范围[min,max] */
        value: number;
        /** 有进度部分颜色，CSS颜色允许的字符串，默认为rgb(26,115,232) */
        color?: string;
        /** 剩余部分颜色，CSS颜色允许的字符串，默认为rgb(183, 225, 205) */
        nocolor?: string;
        /** 是否在进度条下标志起讫信息，默认不显示，只有一行进度条 */
        display?: boolean;
    }
    /** 对一个节点添加监听，点击该节点之外的地方移除该节点 */
    export class ClickRemove {
        /** @param ele 目标节点 */
        constructor(ele: HTMLElement) {
            setTimeout(() => {
                function remove() {
                    ele.remove();
                    document.removeEventListener("click", remove);
                }
                document.addEventListener("click", remove);
                ele.addEventListener("click", e => e.stopPropagation());
            }, 100)
        }
    }
    /** 弹出一个空白浮动窗口，点击该窗口外的节点该窗口会自动关闭，浮动窗口上的内容请通过返回的节点进行后续添加 */
    export class ElementComponent {
        /**
         * @param style 添加style样式，直接写进element，具有最高优先级
         * @param hold 禁用自动关闭，转而提供一个关闭按钮
         * @returns 浮动窗口实际可操作节点，可以往上面添加需要显示在浮动窗口上的内容
         */
        static popupbox(style: Partial<CSSStyleDeclaration> = {}, hold?: boolean) {
            const box = addElement("div", { class: "ui-popup-box" });
            const real = box.attachShadow({ mode: "closed" });
            const div = addElement("div", { class: "box" }, real);
            const popup = addElement("div", { class: "contain" }, div);
            addCss(getModule("ui-popup-box.css"), undefined, real);
            Object.keys(style).forEach((d: any) => popup.style[d] = <any>style[d]);
            hold ? this.close(div, box) : new ClickRemove(box);
            return <HTMLDivElement>popup;
        }
        /**
         * 添加关闭按钮
         * @param ele 按钮所在节点
         * @param box 点击按钮关闭的节点，不存在则取ele
         */
        static close(ele: HTMLElement, box?: HTMLElement) {
            const svg = this.svg('<svg viewBox="0 0 100 100"><path d="M2 2 L98 98 M 98 2 L2 98Z" stroke-width="10px" stroke="#212121" stroke-linecap="round"></path></svg>');
            svg.setAttribute("style", "position: absolute;transform: scale(0.8);right: 10px;top: 10px;");
            svg.onclick = () => box ? box.remove() : ele.remove();
            ele.appendChild(svg);
        }
        /**
         * 封装hr标签，一条水平直线，一般用于隔断节点
         * @returns 封装好的节点
         */
        static hr() {
            const hr = document.createElement("div");
            const real = hr.attachShadow({ mode: "closed" });
            addElement("div", { class: "hr" }, real);
            addCss(getModule("hr.css"), undefined, real);
            return <HTMLDivElement>hr;
        }
        /**
         * 封装svg图标标签
         * @param svg svg节点字符串
         * @returns 封装好的节点
         */
        static svg(svg: string) {
            const root = document.createElement("div");
            const real = root.attachShadow({ mode: "closed" });
            addElement("div", { class: "icon" }, real, svg);
            addCss(getModule("icon.css"), undefined, real);
            return <HTMLDivElement>root;
        }
        /**
         * 封装好的滑块快关标签
         * @param callback 一个用于接收滑块开关响应的回调函数，必须，否则外部无法获取或响应开关状态
         * @param value 开关初始状态，非必须，默认为false
         * @returns 封装好的节点
         */
        static switch(callback: (this: HTMLDivElement, v: boolean) => void, value?: boolean) {
            const root = document.createElement("div");
            const real = root.attachShadow({ mode: "closed" });
            const div = addElement("div", {
                class: "switch"
            }, real, `<span class="bar"></span>
            <span class="knob"><i class="circle"></i></span>`);
            addCss(getModule("switch.css"), undefined, real);
            value = value ? true : false;
            value && (div.children[0].setAttribute("checked", "checked"),
                div.children[1].setAttribute("checked", "checked"),
                div.children[1].children[0].setAttribute("checked", "checked"));
            div.onclick = () => {
                value = !value;
                value ? (div.children[0].setAttribute("checked", "checked"),
                    div.children[1].setAttribute("checked", "checked"),
                    div.children[1].children[0].setAttribute("checked", "checked")) : (
                    div.children[0].removeAttribute("checked"),
                    div.children[1].removeAttribute("checked"),
                    div.children[1].children[0].removeAttribute("checked"));
                callback.call(div, value);
            }
            return root;
        }
        /**
         * 封装好的下拉列表标签（单选）
         * @param list 下拉表值组
         * @param callback 一个用于接收下拉选择响应的回调函数，必须，否则外部无法获取或响应选择状态
         * @param value 初始选定值
         * @returns 封装好的节点
         */
        static select(list: (string | number)[], callback: (this: HTMLDivElement, v: string) => void, value?: string) {
            const root = document.createElement("div");
            const real = root.attachShadow({ mode: "closed" });
            const div = addElement("div", { class: "select" }, real);
            const select = list.reduce((s, d) => {
                addElement("option", {}, s, <string>d);
                return s;
            }, <HTMLSelectElement>addElement("select", {}, div));
            addCss(getCss("select.css"), undefined, real);
            select.value = value || select.options[0].text;
            select.onchange = () => callback.call(div, select.value);
            return root;
        }
        /**
         * 封装好的按钮标签
         * @param callback 响应按钮点击的回调函数，必须，否则无法响应按钮点击事件
         * @param text 按钮上的文字，默认为“确定”
         * @param disabled 点击按钮后的CD，单位：/s，默认为1，取0表示一直禁用
         * @returns 封装好的节点
         */
        static button(callback: (this: HTMLDivElement) => void, text?: string, disabled = 1) {
            const root = document.createElement("div");
            const real = root.attachShadow({ mode: "closed" });
            const div = addElement("div", { class: "button" }, real, text || "确定");
            addCss(getCss("button.css"), undefined, real);
            div.onclick = () => {
                div.setAttribute("disabled", "disabled");
                callback.call(div);
                disabled && setTimeout(() => div.removeAttribute("disabled"), disabled * 1000);
            }
            return root;
        }
        /**
         * 封装好的输入框，响应回车事件
         * @param callback 响应输入确认的回调函数，必须，否则无法响应输入
         * @param text 输入框内默认数据，非必须
         * @param attribute input标签的标准属性，用于指定输入框类型等
         * @param pattern 检测输入的正则表达式，将过滤非法输入并弹出toast警告
         * @param button 输入框右侧带上按钮，响应按钮点击事件而非回车事件
         * @param disabled 点击按钮后的CD，单位：/s，默认为1，取0表示一直禁用
         * @returns 封装好的节点
         */
        static input(callback: (this: HTMLInputElement, value: string) => void, text?: string, attribute?: input, pattern?: RegExp, button?: string, disabled?: number) {
            const root = document.createElement("div");
            const real = root.attachShadow({ mode: "closed" });
            const div = addElement("div", { class: "input" }, real);
            const input = <HTMLInputElement>addElement("input", {}, div);
            addCss(getCss("input.css"), undefined, real);
            attribute && Object.entries(attribute).forEach(d => { input.setAttribute(d[0], d[1]) });
            text && (input.value = text);
            button ? div.appendChild(this.button(function () {
                if (pattern && !pattern.test(input.value)) return toast.warning(`值 ${input.value} 不符合要求！`, `正则表达式：${pattern.toString()}`);
                callback.call(input, input.value);
            }, button, disabled)) : input.onchange = () => {
                if (pattern && !pattern.test(input.value)) return toast.warning(`值 ${input.value} 不符合要求！`, `正则表达式：${pattern.toString()}`);
                callback.call(input, input.value);
            }
            return root;
        }
        /**
         * 封装好的文件选择按钮，特化版的输入框
         * @param callback 响应文件选择结果的回调函数，必须，否则无法响应文件选择
         * @param multiple 是否允许多选，默认为false
         * @param text 选择按钮上的文字，默认为“选择”
         * @param accept 指定文件类型拓展名组，不指定默认取所有类型文件
         * @returns 封装好的节点
         */
        static file(callback: (this: HTMLInputElement, value: FileList) => void, multiple?: boolean, text = "选择", accept?: string[]) {
            const root = document.createElement("div");
            const real = root.attachShadow({ mode: "closed" });
            const input = <HTMLInputElement>addElement("input", { type: "file", style: "width: 0;position: absolute;" }, real);
            accept && (input.accept = accept.join(","));
            multiple && (input.multiple = true);
            real.appendChild(this.button(() => input.click(), text, 0));
            input.onchange = () => input.files && callback.call(input, input.files);
            return root;
        }
        /**
         * 封装好的复选框（多选）
         * @param list 复选框的值组
         * @param callback 响应选择操作的回调函数，必须，否则无法响应文件选择
         * @param value list中的默认选中数据组，非必须
         * @returns 封装好的节点
         */
        static checkbox(list: string[], callback: (this: HTMLDivElement, value: string[]) => void, value: string[] = []) {
            const root = document.createElement("div");
            const real = root.attachShadow({ mode: "closed" });
            const div = addElement("div", { class: "box" }, real);
            addCss(getCss("checkbox.css"), undefined, real);
            const checkboxs = list.reduce((s: HTMLDivElement[], d) => {
                s.push(<HTMLDivElement>addElement("div", { class: "checkbox" }, div, `<div class="checklabel">
                        <div class="disc-border"></div>
                        <div class="disc"></div>
                    </div>
                    <div class="checkvalue">${d}</div>`))
                return s;
            }, [])
            const checks = list.reduce((s: boolean[], d) => {
                s.push(value.includes(d))
                return s;
            }, []);
            checkboxs.forEach((d, i) => {
                checks[i] && (d.children[0].children[0].setAttribute("checked", "checked"),
                    d.children[0].children[1].setAttribute("checked", "checked"));
                d.onclick = () => {
                    checks[i] = !checks[i];
                    checks[i] ? (d.children[0].children[0].setAttribute("checked", "checked"),
                        d.children[0].children[1].setAttribute("checked", "checked")) : (
                        d.children[0].children[0].removeAttribute("checked"),
                        d.children[0].children[1].removeAttribute("checked"));
                    callback.call(div, checks.reduce((s: string[], d, i) => { d && s.push(list[i]); return s; }, []));
                }
            })
            return root;
        }
        /**
         * 封装好的进度条，自适应父节点width
         * @param detail 进度条配置，双向绑定：**修改其中的值会及时体现在该进度条上**
         * @returns 封装好的节点
         */
        static progress(detail: ProgressDetial) {
            let { min, max, value, color, nocolor, display } = detail;
            const root = document.createElement("div");
            const real = root.attachShadow({ mode: "closed" });
            addCss(getCss("progress.css"), undefined, real);
            const progress = addElement("div", { class: "progress" }, real);
            const progressContainer = addElement("div", { class: "progressContainer", title: "0%" }, progress);
            const secondaryProgress = addElement("div", { class: "secondaryProgress", style: "transform: scaleX(0);" }, progressContainer);
            const primaryProgress = addElement("div", { class: "primaryProgress", style: "transform: scaleX(0);" }, progressContainer);
            const progressTag = addElement("div", { class: "progressTag", style: "display: none;" }, progress, `<div>${min}</div><div>${max}</div>`);
            Object.defineProperties(detail, {
                "color": { get: () => primaryProgress.style.backgroundColor, set: (v) => primaryProgress.style.backgroundColor = v },
                "display": { get: () => progressTag.style.display, set: (v) => progressTag.style.display = v ? "" : "none" },
                "max": {
                    get: () => max, set: (v) => {
                        if (v < value || v <= min) return;
                        (<HTMLDivElement>progressTag.children[1]).innerText = max = v;
                        detail.value = value;
                    }
                },
                "min": {
                    get: () => min, set: (v) => {
                        if (v > value || v >= max) return;
                        (<HTMLDivElement>progressTag.children[0]).innerText = min = v;
                        detail.value = value;
                    }
                },
                "nocolor": { get: () => secondaryProgress.style.backgroundColor, set: (v) => secondaryProgress.style.backgroundColor = v },
                "value": {
                    get: () => value, set: (v) => {
                        if (v > max || v < min) return;
                        const per = Number(((v - min) / (max - min)).toFixed(3).slice(0, -1));
                        primaryProgress.style.transform = `scaleX(${per})`;
                        progressContainer.title = (per * 100) + "%";
                    }
                }
            })
            min >= max && (min = 0);
            (value > max || value < min) && (value = 0);
            detail.min = min, detail.max = max, detail.value = value, detail.color = color, detail.nocolor = nocolor, detail.display = display;
            return root;
        }
    }
}