"use strict";
/**
 * 本模块负责检查url输入并返回对应aid/cid等值
 * 按需加载模块请先载入再使用相关方法
 */
(function () {
    API.urlInputCheck = async function (input) {
        let aid, cid, ssid, epid, p;
        API.toast("正在解析链接：" + input);
        if (input && !input.includes("?"))
            input = "?" + input; // 重整化输入便于提取参数
        let obj = API.urlObj(input); // 获取参数对象
        aid = input.match(/[aA][vV][0-9]+/) ? input.match(/[aA][vV][0-9]+/)[0].match(/\d+/)[0] : undefined;
        aid = aid || obj.aid || undefined;
        aid = aid || (/[bB][vV]1[fZodR9XQDSUm21yCkr6zBqiveYah8bt4xsWpHnJE7jL5VG3guMTKNPAwcF]{9}/.test(input) ? API.abv(input.match(/[bB][vV]1[fZodR9XQDSUm21yCkr6zBqiveYah8bt4xsWpHnJE7jL5VG3guMTKNPAwcF]{9}/)[0]) : undefined);
        aid = aid || (obj.bvid ? API.abv(obj.bvid) : undefined);
        try {
            if (aid) {
                // 直接获取到cid的情况
                cid = cid = obj.cid || undefined;
                if (!cid) {
                    p = obj.p || 1;
                    try {
                        // 尝试访问B站服务器获取信息
                        let data = API.jsonCheck(await API.xhr({ url: API.objUrl("https://api.bilibili.com/x/player/pagelist", { "aid": aid }) })).data[p - 1];
                        cid = data.cid;
                        API.toast("正在请求av视频数据", "分P名称：" + data.part);
                    }
                    catch (e) {
                        e = Array.isArray(e) ? e : [e];
                        API.debug.error("获取视频信息出错：aid：" + aid, "HOST：https://api.bilibili.com/x/player/pagelist", ...e);
                        try {
                            // 尝试访问BiliPlus获取信息
                            let data = API.jsonCheck(await API.xhr({ url: API.objUrl("https://www.biliplus.com/api/view", { "id": aid }) }));
                            data = (data.list && data.list[p - 1]) || (data.v2_app_api && data.v2_app_api.pages && data.v2_app_api.pages[p - 1]);
                            cid = data.cid;
                            API.toast("正在请求av视频数据", "分P名称：" + data.part);
                        }
                        catch (e) {
                            e = Array.isArray(e) ? e : [e];
                            API.debug.error("获取视频信息出错：aid：" + aid, "HOST：https://www.biliplus.com/api/view", ...e);
                        }
                    }
                }
            }
            else {
                // 输入的是番剧ss/ep链接的情况，尝试获取aid、cid
                ssid = input.match(/[sS][sS][0-9]+/) ? input.match(/[sS][sS][0-9]+/)[0].match(/\d+/)[0] : undefined;
                ssid = ssid || obj.season_id || undefined;
                epid = input.match(/[eE][pP][0-9]+/) ? input.match(/[eE][pP][0-9]+/)[0].match(/\d+/)[0] : undefined;
                epid = epid || obj.ep_id || undefined;
                try {
                    // 尝试访问bangumi接口
                    let data;
                    if (ssid)
                        data = await API.xhr({ url: API.objUrl("https://bangumi.bilibili.com/view/web_api/season", { season_id: ssid }) });
                    else if (epid)
                        data = await API.xhr({ url: API.objUrl("https://bangumi.bilibili.com/view/web_api/season", { ep_id: epid }) });
                    if (data) {
                        data = API.importModule("bangumi-season.js", { __INITIAL_STATE__: data, epid: epid }, true);
                        aid = data.epInfo.aid;
                        cid = data.epInfo.cid;
                        API.toast("正在请求Bangumi数据", "系列名称：" + data.mediaInfo.title, "分p名称：" + data.epInfo.index_title);
                    }
                }
                catch (e) {
                    e = Array.isArray(e) ? e : [e];
                    let data;
                    if (epid)
                        API.debug.error("获取视频信息出错：epid：" + epid, "HOST：https://bangumi.bilibili.com/view/web_api/season", ...e);
                    else if (ssid)
                        API.debug.error("获取视频信息出错：ssid：" + ssid, "HOST：https://bangumi.bilibili.com/view/web_api/season", ...e);
                    try {
                        if (epid) {
                            data = await API.xhr({ url: API.objUrl(`${config.limitServer}/intl/gateway/v2/ogv/view/app/season`, { ep_id: epid }) });
                        }
                        else if (ssid) {
                            data = await API.xhr({ url: API.objUrl(`${config.limitServer}/intl/gateway/v2/ogv/view/app/season`, { season_id: ssid }) });
                        }
                        data = API.importModule("bangumi-global.js", { __INITIAL_STATE__: data, epid: epid }, true);
                        aid = data.epInfo.aid;
                        cid = data.epInfo.cid;
                        API.toast("正在请求Bangumi数据", "系列名称：" + data.mediaInfo.title, "分p名称：" + data.epInfo.index_title);
                    }
                    catch (e) { }
                }
            }
        }
        catch (e) { }
        return { aid, cid, ssid, epid, p };
    };
})();
