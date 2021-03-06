interface modules {
    /** 下载功能 */
    readonly "download.js": string;
    readonly "download.css": string;
}
namespace API {
    /** 一个下载记录 */
    type DownloadRocord = {
        /** 下载数据类型 */
        type: string,
        /** 下载url，也可以是字符串形式的文本内容，将转为了objectURL以下载 */
        url: string,
        /** 下载项目上标，一般是画质 */
        quality: string,
        /** 下载项目下标，一般是大小 */
        size: string,
        /**
         * 文件名（含文件名）  
         * 若url是链接，一般不需要设置此值，否则请额外添加_name属性为true  
         * 若是文本，则一定要提供本值
         */
        filename?: string,
        /** 以objectURL方式下载时的编码格式，一般为text/plain */
        contentType?: string,
        /**
         * 备用链接，B站一般会同时返回两条备用源  
         * 此数据未必可用，使用前请先进行真值检查！
         */
        backupUrl?: string[],
        /** flv专用，flv一般只返回一种画质却可能分成很多段，这里用于标记分段索引 */
        flvSplit?: number,
        /** 是否以直链形式添加到下载面板a标签，无需二次检查下载方式 */
        amylose?: boolean
    }
    class Download {
        /** 下载面板 */
        table = addElement("div");
        /** 已获取类型列表 */
        type: string[] = [];
        /** 整理出的链接列表 */
        links: DownloadRocord[] = [];
        /** url序号对应的质量信息  */
        quality = {
            100029: '4K',
            100028: '1080P60',
            100027: '1080P+',
            100026: '1080P',
            100024: '720P',
            100023: '480P',
            100022: '360P',
            30280: "320Kbps",
            30260: "320Kbps",
            30259: "128Kbps",
            30257: "64Kbps",
            30255: "AUDIO",
            30250: "ATMOS",
            30232: "128Kbps",
            30216: "64Kbps",
            30127: "8K",
            30126: "Dolby",
            30125: "HDR",
            30121: "4K",
            30120: "4K",
            30116: '1080P60',
            30112: '1080P+',
            30106: '1080P60',
            30102: '1080P+',
            30080: '1080P',
            30077: '1080P',
            30076: '720P',
            30074: '720P',
            30066: '720P',
            30064: '720P',
            30048: "720P",
            30033: '480P',
            30032: '480P',
            30016: '360P',
            30015: '360P',
            30011: '360P',
            464: '预览',
            336: "1080P",
            320: "720P",
            288: "480P",
            272: "360P",
            208: "1080P",
            192: "720P",
            160: "480P",
            127: "8K",
            126: "Dolby",
            125: "HDR",
            120: "4K",
            116: "1080P60",
            112: "1080P+",
            80: "1080P",
            74: "720P60",
            64: "720P",
            48: "720P",
            32: "480P",
            16: "360P",
            15: "360P"
        };
        /** 视频编码信息对应的id，可能不完整 */
        codec = {
            hev: [30127, 30126, 30125, 30121, 30106, 30102, 30077, 30066, 30033, 30011],
            avc: [30120, 30112, 30080, 30064, 30032, 30016],
            av1: [100029, 100028, 100027, 100026, 100024, 100023, 100022]
        }
        /** 颜色表 */
        color = {
            "8K": "background-color: #ffe42b;background-image: linear-gradient(to right, #ffe42b, #dfb200);",
            "Dolby": "background-color: #ffe42b;background-image: linear-gradient(to right, #ffe42b, #dfb200);",
            "ATMOS": "background-color: #ffe42b;background-image: linear-gradient(to right, #ffe42b, #dfb200);",
            "AUDIO": "background-color: #ffe42b;background-image: linear-gradient(to right, #ffe42b, #dfb200);",
            "HDR": "background-color: #ffe42b;background-image: linear-gradient(to right, #ffe42b, #dfb200);",
            "4K": "background-color: #c0f;background-image: linear-gradient(to right, #c0f, #90f);",
            "1080P60": "background-color: #c0f;background-image: linear-gradient(to right, #c0f, #90f);",
            "1080P+": "background-color: #f00;background-image: linear-gradient(to right, #f00, #c00);",
            "1080P": "background-color: #f00;background-image: linear-gradient(to right, #f00, #c00);",
            "720P60": "background-color: #f90;background-image: linear-gradient(to right, #f90, #d70);",
            "720P": "background-color: #f90;background-image: linear-gradient(to right, #f90, #d70);",
            "480P": "background-color: #00d;background-image: linear-gradient(to right, #00d, #00a);",
            "360P": "background-color: #0d0;",
            "mp4": "background-color: #e0e;",
            "av1": "background-color: #feb;",
            "avc": "background-color: #07e;",
            "hev": "background-color: #7ba;",
            "aac": "background-color: #07e;",
            "flv": "background-color: #0dd;",
            "320Kbps": "background-color: #f00;background-image: linear-gradient(to right, #f00, #c00);",
            "128Kbps": "background-color: #f90;background-image: linear-gradient(to right, #f90, #d70);",
            "64Kbps": "background-color: #0d0;"
        }
        constructor() {
            switchVideo(() => { this.type = []; this.links = []; this.table && this.table.remove() }); // 切P后清除下载数据并移除下载面板
        }
        /**
         * 整理playurl返回值并提取其中的媒体链接记录到links
         * @param playinfo ajax返回的JSON数据
         */
        decodePlayinfo(playinfo: any) {
            playinfo.data && this.decodePlayinfo(playinfo.data); // data型
            playinfo.result && this.decodePlayinfo(playinfo.result); // result型
            playinfo.durl && this.durl(playinfo.durl); // 顶层durl型
            playinfo.dash && this.dash(playinfo.dash); // 顶层dash型
        }
        /**
         * 根据url确定画质/音质信息  
         * 需要维护quality表
         * @param url 多媒体url
         * @param id 媒体流id
         * @returns 画质/音质信息
         */
        getQuality(url: string, id?: number) {
            return this.quality[<keyof typeof this.quality>this.getID(url)] || (id && this.quality[<keyof typeof this.quality>id]) || "N/A";
        }
        /**
         * 从url中提取可能的id
         * @param url 多媒体url
         */
        getID(url: string) {
            return Number((<any>/[0-9]+\.((flv)|(mp4)|(m4s))/.exec(url))[0].split(".")[0]);
        }
        /**
         * 整理dash部分
         * @param dash dash信息
         */
        dash(dash: any) {
            dash.video && this.dashVideo(dash.video, dash.duration); // dash视频部分
            dash.audio && this.dashAudio(dash.audio, dash.duration); // dash音频部分
            dash.dolby && dash.dolby.audio && Array.isArray(dash.dolby.audio) && this.dashATMOS(dash.dolby.audio, dash.duration); // 杜比音效部分
        }
        /**
         * 整理dash视频部分
         * @param video dash视频信息
         * @param duration duration信息，配合bandwidth能计算出文件大小
         */
        dashVideo(video: any[], duration: number) {
            video.forEach(d => {
                const url = d.baseUrl || d.base_url;
                let type = "";
                if (!url) return;
                if (d.codecs) {
                    type = d.codecs.includes("avc") ? "avc" : d.codecs.includes("av01") ? "av1" : "hev"; // 编码类型
                } else {
                    const id = this.getID(url);
                    type = this.codec.hev.find(d => d === id) ? "hev" : "avc";
                }
                !this.type.includes("dash") && this.type.push("dash");
                this.links.push({
                    type: type,
                    url: url,
                    quality: this.getQuality(url, d.id),
                    size: Format.sizeFormat(d.bandwidth * duration / 8),
                    backupUrl: d.backupUrl || d.backup_url
                })
            })
        }
        /**
         * 整理dash音频部分
         * @param audio dash音频信息
         * @param duration duration信息，配合bandwidth能计算出文件大小
         */
        dashAudio(audio: any[], duration: number) {
            audio.forEach(d => {
                const url = d.baseUrl || d.base_url;
                url && this.links.push({
                    type: "aac",
                    url: url,
                    quality: this.getQuality(url, d.id),
                    size: Format.sizeFormat(d.bandwidth * duration / 8),
                    backupUrl: d.backupUrl || d.backup_url
                })
            })
        }
        /**
         * 整理dash杜比全景声部分
         * @param audio 杜比全景声信息
         * @param duration duration信息，配合bandwidth能计算出文件大小
         */
        dashATMOS(audio: any[], duration: number) {
            audio.forEach(d => {
                const url = d.baseUrl || d.base_url;
                url && this.links.push({
                    type: "aac",
                    url: url,
                    quality: this.getQuality(url, d.id),
                    size: Format.sizeFormat(d.bandwidth * duration / 8),
                    backupUrl: d.backupUrl || d.backup_url
                })
            })
        }
        /**
         * 整理durl部分
         * @param durl durl信息
         */
        durl(durl: any[]) {
            let index = 0; // flv分段标记
            durl.forEach(d => {
                const link: DownloadRocord = {
                    type: "",
                    url: d.url,
                    quality: this.getQuality(d.url, d.id),
                    size: Format.sizeFormat(d.size),
                    backupUrl: d.backupUrl || d.backup_url
                }
                switch (d.url.includes("mp4?")) {
                    case true: link.type = "mp4";
                        !this.type.includes("mp4") && this.type.push("mp4");
                        break;
                    case false: link.type = "flv"; index++; link.flvSplit = index;
                        !this.type.includes("flv") && this.type.push("flv");
                        break;
                }
                this.links.push(link);
            })
        }
        /**
         * 右键下载响应
         */
        async contentMenu() {
            if (aid && cid) {
                if (!this.links[0]) {
                    !config.TVresource && __playinfo__ && this.decodePlayinfo(__playinfo__); // tv源无法从播放器里读取
                    const result = await Promise.all(config.downloadList.reduce((s: Promise<any>[], d) => {
                        !this.type.includes(d) && s.push(this.getContent(d));
                        return s;
                    }, []));
                    result.forEach(d => d && this.decodePlayinfo(d));
                    await this.getOther(); // 其他下载
                }
                const title = this.getTitle();
                this.links.forEach(d => { // 初始化文件名
                    !d.filename && (d.filename = title);
                })
                this.showTable();
            }
        }
        /**
         * 添加视频之外的下载数据
         */
        async getOther() {
            if (!config.ifDlDmCC) return;
            if (danmaku.danmaku) {
                const url = config.dlDmType == "json" ? JSON.stringify(danmaku.danmaku, undefined, "\t") : danmaku.toXml(danmaku.danmaku);
                this.links.push({
                    url: url,
                    type: "其他",
                    quality: "弹幕",
                    size: Format.sizeFormat(strSize(url)),
                    filename: `${this.getTitle()}-${cid}.${config.dlDmType}`
                })
            }
            if (closedCaption.subtitle) {
                closedCaption.subtitle.forEach(d => {
                    this.links.push({
                        url: !d.subtitle_url.includes(":") ? d.subtitle_url.replace("//", "https://") : d.subtitle_url,
                        type: "其他",
                        quality: d.lan_doc,
                        size: "N/A"
                    })
                })
            }
            const data = await getAidInfo(aid);
            data && data?.View?.pic && this.links.push({
                url: data.View.pic,
                type: "其他",
                quality: "封面",
                size: "N/A",
                amylose: true
            })
        }
        /**
         * 封装请求链接  
         * 用于过滤Promise.all请求错误
         * @param d 请求类型
         * @returns 请求结果
         */
        async getContent(d: string) {
            let result: any;
            try {
                switch (d) {
                    case "dash": result = pgc ?
                        await url.getJson(config.TVresource ? "api.bilibili.com/pgc/player/api/playurltv" : "api.bilibili.com/pgc/player/web/playurl", { avid: aid, cid: cid, fnver: 0, fnval: fnval }, true) :
                        await url.getJson(config.TVresource ? "api.bilibili.com/x/tv/ugc/playurl" : "api.bilibili.com/x/player/playurl", { avid: aid, cid: cid, fnver: 0, fnval: fnval }, true);
                        break;
                    case "flv": result = pgc ?
                        await url.getJson(config.TVresource ? "api.bilibili.com/pgc/player/api/playurltv" : "api.bilibili.com/pgc/player/web/playurl", { avid: aid, cid: cid, qn: config.downloadQn }, true) :
                        await url.getJson(config.TVresource ? "api.bilibili.com/x/tv/ugc/playurl" : "api.bilibili.com/x/player/playurl", { avid: aid, cid: cid, qn: config.downloadQn }, true);
                        break;
                    case "mp4": result = pgc ?
                        await url.getJson("api.bilibili.com/pgc/player/api/playurlproj", { cid: cid }, true) :
                        await url.getJson("app.bilibili.com/v2/playurlproj", { cid: cid }, true);
                        break;
                }
            } catch (e) { }
            return result;
        }
        /**
         * 呼出下载面板
         */
        showTable() {
            if (!this.links[0]) return toast.warning("未获取到任何下载数据！")
            this.table && this.table.remove(); // 移除已存在的下载面板
            this.table = addElement("div");
            const real = this.table.attachShadow({ mode: "closed" });
            const root = addElement("div", { class: "table" }, real);
            const cells: { [name: string]: HTMLElement } = {};
            new ClickRemove(this.table); // 点击外部移除
            addCss(getCss("download.css"), undefined, real);
            this.links.forEach(d => { // 添加下载项
                const cell = cells[d.type] || addElement("div", { class: "cell" }, root);
                if (!cells[d.type]) {
                    cells[d.type] = cell;
                    const div = addElement("div", { class: "type" }, cell, d.type);
                    this.color[<keyof typeof this.color>d.type] && div.setAttribute("style", this.color[<keyof typeof this.color>d.type]);
                }
                const item = addElement("a", { class: "item", target: "_blank" }, cell);
                const up = addElement("div", { class: "up" }, item, d.quality + (d.flvSplit ? "x" + d.flvSplit : ""));
                this.color[<keyof typeof this.color>d.quality] && up.setAttribute("style", this.color[<keyof typeof this.color>d.quality]);
                addElement("div", { class: "down" }, item, d.size);
                d.amylose ? item.href = d.url : (item.onclick = () => { // 点击下载
                    /^https?:\/\/([\w-]+\.)+[\w-]+(\/[\w-,.\/?%&=]*)?/.test(d.url) ?
                        this.postData(d) :
                        saveAs(d.url, d.filename || `download ${Format.timeFormat(undefined, true)}.txt`, d.contentType || "text/plain"); // 文本类型
                })
            })
        }
        /**
         * 点击下载按钮回调
         * @param data 被点击的下载数据
         */
        postData(data: DownloadRocord) {
            !Reflect.has(data, "_name") && (data.filename = this.setFinalName(data));
            switch (config.downloadMethod) {
                case "ef2": ef2.sendLinkToIDM({ url: data.url, out: data.filename });
                    break;
                case "aria2": aria2.shell({ urls: [data.url], out: data.filename })
                    .then(() => toast.success(`已复制aria2命令行到剪切板，在cmd等shell中使用即可下载~`))
                    .catch(e => toast.error(`复制aria2命令行失败！`, e))
                    break;
                case "aira2 RPC": aria2.rpc({ urls: [data.url], out: data.filename })
                    .then(GID => toast.success(`已添加下载任务到aria2 RPC主机，任务GID：${GID}`))
                    .catch(e => toast.error(`添加下载任务到aria2 RPC主机出错！`, e))
                    break;
                default: (config.TVresource && (data.type === "flv" || data.type === "avc" || data.type === "hev" || data.type === "av1" || data.type === "aac")) ? toast.warning("TV源视频流不支持本方式下载，请在设置中另选下载方式或关闭请求TV源！") : this.rightKey(data);
            }
        }
        /**
         * 获取当前视频标题
         * @returns 标题
         */
        getTitle() {
            const title = document.title.split("_哔哩")[0];
            const p = location.href.includes("p=") ? (<any>location.href.match(/p=\d+/))[0].split("=")[1] : "";
            return p ? title + p : title;
        }
        /**
         * 从URL中提取可能的文件名和拓展名
         * @param url 
         * @returns [文件名，拓展名]
         */
        getUrlFileName(url: string) {
            url = url.split("?")[0];
            const arr = url.split("/");
            return <[string, string]>arr[arr.length - 1].split(".")
        }
        /**
         * 合成最终文件名
         * @param obj.url 下载url，从中提取可能的文件名，优先级最低
         * @param obj.type 下载资源类型，用于决定后缀名，优先级次之
         * @param obj.filename 预设定文件名，优先级最高
         * @returns 文件名
         */
        setFinalName(obj: DownloadRocord) {
            let adv = "";
            let arr = this.getUrlFileName(obj.url);
            let ars = (<any>obj).filename.split(".");
            switch (obj.type) {
                case "mp4": adv = ".mp4";
                    break;
                case "flv": adv = ".flv";
                    break;
                case "aac": adv = ".m4a";
                    break;
                case "avc": adv = ".avc.m4v";
                    break;
                case "hev": adv = ".hevc.m4v";
                    break;
            }
            adv = ars[1] ? `.${ars.pop()}` : adv ? adv : arr[1] ? `.${arr.pop()}` : "";
            Reflect.set(obj, "_name", true);
            return (obj.filename || arr[0]) + `${obj.flvSplit ? "x" + obj.flvSplit : ""}.${obj.quality}${adv}`;
        }
        /**
         * 右键下载
         * @param data 下载数据
         */
        rightKey(data: DownloadRocord) {
            const root = ElementComponent.popupbox({ width: "300px" });
            addElement("div", { style: "text-align: center;font-weight: bold;padding-block-end: 10px;" }, root, data.filename);
            addElement("div", { style: "padding-block-end: 10px;" }, root, `<a href=${data.url} target="_blank" download="${data.filename}">请在此处右键“另存为”以保存文件，IDM的话也可以右键“使用 IDM下载链接”。</a>`);
            addElement("div", { style: "font-size: 10px; padding-block-end: 10px;" }, root, '本方式下载不太稳定，不嫌麻烦的话可在设置中更换下载方式。');
        }
    }
    const _ = new Download();
    /**
     * 拉起下载面板
     */
    export function download() { _.contentMenu(); }
}