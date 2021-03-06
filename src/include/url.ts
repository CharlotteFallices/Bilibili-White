interface modules {
    /** 常用的url请求的封装，以方便提示参数信息及省略默认气息 */
    readonly "url.js": string;
}
namespace API {
    class Url {
        access_key = GM.getValue("access_key");
        /** url的默认参数，即UrlDetail未列出或可选的部分 */
        jsonUrlDefault = {
            "api.bilibili.com/pgc/player/web/playurl": { qn: 127, otype: 'json', fourk: 1 },
            "api.bilibili.com/x/player/playurl": { qn: 127, otype: 'json', fourk: 1 },
            "interface.bilibili.com/v2/playurl": { appkey: 9, otype: 'json', quality: 127, type: '' },
            "bangumi.bilibili.com/player/web_api/v2/playurl": { appkey: 9, module: "bangumi", otype: 'json', quality: 127, type: '' },
            "api.bilibili.com/pgc/player/api/playurlproj": { access_key: this.access_key, appkey: 1, build: "2040100", device: "android", expire: "0", mid: "0", mobi_app: "android_i", module: "bangumi", otype: "json", platform: "android_i", qn: 127, ts: new Date().getTime() },
            "app.bilibili.com/v2/playurlproj": { access_key: this.access_key, appkey: 1, build: "2040100", device: "android", expire: "0", mid: "0", mobi_app: "android_i", otype: "json", platform: "android_i", qn: 127, ts: new Date().getTime() },
            "api.bilibili.com/pgc/player/api/playurltv": { appkey: 6, qn: 127, fourk: 1, otype: 'json', platform: "android", mobi_app: "android_tv_yst", build: 102801 },
            "api.bilibili.com/x/tv/ugc/playurl": { appkey: 6, qn: 127, fourk: 1, otype: 'json', platform: "android", mobi_app: "android_tv_yst", build: 102801 },
            "app.bilibili.com/x/intl/playurl": { access_key: this.access_key, mobi_app: "android_i", fnver: 0, fnval: fnval, qn: 127, platform: "android", fourk: 1, build: 2100110, appkey: 0, otype: 'json', ts: new Date().getTime() },
            "apiintl.biliapi.net/intl/gateway/ogv/player/api/playurl": { access_key: this.access_key, mobi_app: "android_i", fnver: 0, fnval: fnval, qn: 127, platform: "android", fourk: 1, build: 2100110, appkey: 0, otype: 'json', ts: new Date().getTime() },
            "api.bilibili.com/view": { type: "json", appkey: "8e9fc618fbd41e28" },
            "api.bilibili.com/x/v2/reply/detail": { build: "6042000", channel: "master", mobi_app: "android", platform: "android", prev: "0", ps: "20" }
        }
        /**
         * 请求封装好的json请求
         * @param url 请求的url
         * @param detail 请求所需配置数据
         * @param GM 是否使用跨域请求
         * @returns Promise封装的返回值
         */
        getJson<T extends keyof jsonUrlDetail>(url: T, detail: jsonUrlDetail[T], GM = false) {
            let obj: any = { ...(this.jsonUrlDefault[url] || {}), ...detail };
            (Number(Reflect.get(obj, "appkey")) >= 0) && (obj = this.sign(obj));
            return GM ? xhr.GM({
                url: Format.objUrl(`//${url}`, obj),
                responseType: "json"
            }) : xhr({
                url: Format.objUrl(`//${url}`, obj),
                responseType: "json",
                credentials: true
            })
        }
        sign(obj: any) {
            return Format.urlObj(`?${urlsign("", obj, obj.appkey)}`);
        }
    }
    /**
     * 封装好json请求所需参数  
     * 请一并配置好Url.jsonUrlDefault默认值
     */
    export interface jsonUrlDetail {
        /** 网页端bangumi playurl */
        "api.bilibili.com/pgc/player/web/playurl": { avid: number | string, cid: number | string, qn?: number | string, fnver?: number | string, fnval?: number | string }
        /** 网页端一般视频playurl */
        "api.bilibili.com/x/player/playurl": { avid: number | string, cid: number | string, qn?: number | string, fnver?: number | string, fnval?: number | string }
        /** Interface playurl */
        "interface.bilibili.com/v2/playurl": { cid: number | string, quality?: number | string }
        /** Interface bangumi playuel */
        "bangumi.bilibili.com/player/web_api/v2/playurl": { cid: number | string, quality?: number | string }
        /** 投屏 bangumi playurl */
        "api.bilibili.com/pgc/player/api/playurlproj": { cid: number | string }
        /** 投屏 普通视频 playurl */
        "app.bilibili.com/v2/playurlproj": { cid: number | string }
        /** TV端 bangumi playurl */
        "api.bilibili.com/pgc/player/api/playurltv": { avid: number | string, cid: number | string, qn?: number | string, fnver?: number | string, fnval?: number | string, build?: number | string }
        /** TV 普通视频 playurl */
        "api.bilibili.com/x/tv/ugc/playurl": { avid: number | string, cid: number | string, qn?: number | string, fnver?: number | string, fnval?: number | string, build?: number | string }
        /** Android Play一般视频 */
        "app.bilibili.com/x/intl/playurl": { aid: number | string, cid: number | string, qn?: number | string, fnver?: number | string, fnval?: number | string, build?: number | string }
        /** Android Play bangumi视频 */
        "apiintl.biliapi.net/intl/gateway/ogv/player/api/playurl": { ep_id: number | string, cid: number | string, qn?: number | string, fnver?: number | string, fnval?: number | string, build?: number | string }
        /**
         * 获取aid信息，包括区域限制
         * @param id 视频aid
         * @param page 分p号
         */
        "api.bilibili.com/view": { id: number | string, page?: string | number }
        /** APP楼中楼详情 */
        "api.bilibili.com/x/v2/reply/detail": { oid: number | string, root: number | string, type: number | string }
    }
    /** 封装好的默认请求，已填好必须的参数 */
    export const url: Url = <any>undefined;
    Object.defineProperty(API, "url", { get: () => new Url() })
}