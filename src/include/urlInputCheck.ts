interface modules {
    /** 从url输入中获取aid，cid，ssid等参数 */
    readonly "urlInputCheck.js": string;
}
namespace API {
    /** 将数据缓存起来，以免重复查询 */
    const catchs: {
        aid: { [name: string]: any },
        ssid: { [name: string]: any },
        epid: { [name: string]: any }
    } = { aid: {}, ssid: {}, epid: {} };
    /**
     * 解析B站相关url以获取aid/cid等参数  
     * @param input URL链接
     * @returns 解析结果
     */
    export async function urlInputCheck(input: string) {
        let aid: any, cid: any, ssid: any, epid: any, p: any, pgc: boolean = false;
        toast("正在解析链接：" + input);
        if (input && !input.includes("?")) input = "?" + input; // 重整化输入便于提取参数
        let obj: any = Format.urlObj(input); // 获取参数对象
        aid = input.match(/[aA][vV][0-9]+/) ? (<any>input.match(/[aA][vV][0-9]+/))[0].match(/\d+/)[0] : undefined;
        aid = aid || obj.aid || undefined;
        aid = aid || (/[bB][vV]1[fZodR9XQDSUm21yCkr6zBqiveYah8bt4xsWpHnJE7jL5VG3guMTKNPAwcF]{9}/.test(input) ? abv((<any>input.match(/[bB][vV]1[fZodR9XQDSUm21yCkr6zBqiveYah8bt4xsWpHnJE7jL5VG3guMTKNPAwcF]{9}/))[0]) : undefined);
        aid = aid || (obj.bvid ? abv(obj.bvid) : undefined);
        p = obj.p || 1;
        try {
            if (aid) {
                if (aid == aid) cid = cid;
                // 有缓存数据的情况
                cid = catchs.aid[aid] && catchs.aid[aid][p - 1].cid;
                // 直接获取到cid的情况
                cid = cid || obj.cid || undefined;
                if (!cid) {
                    try {
                        // 尝试访问B站服务器获取信息
                        catchs.aid[aid] = jsonCheck(await xhr({ url: Format.objUrl("https://api.bilibili.com/x/player/pagelist", { "aid": aid }) })).data;
                        cid = catchs.aid[aid][p - 1].cid;
                        toast("正在请求av视频数据", "分P名称：" + catchs.aid[aid][p - 1].part);
                    } catch (e) {
                        debug.error("获取视频信息出错：aid：" + aid, "HOST：https://api.bilibili.com/x/player/pagelist", e);
                        try {
                            // 尝试访问BiliPlus获取信息
                            let data = jsonCheck(await xhr({ url: Format.objUrl("https://www.biliplus.com/api/view", { "id": aid }) }));
                            catchs.aid[aid] = data.list || (data.v2_app_api && data.v2_app_api.pages);
                            cid = catchs.aid[aid][p - 1].cid;
                            toast("正在请求av视频数据", "分P名称：" + catchs.aid[aid][p - 1].part);
                        } catch (e) {
                            debug.error("获取视频信息出错：aid：" + aid, "HOST：https://www.biliplus.com/api/view", e);
                        }
                    }
                }
            } else {
                // 输入的是番剧ss/ep链接的情况，尝试获取aid、cid
                ssid = input.match(/[sS][sS][0-9]+/) ? (<any>input.match(/[sS][sS][0-9]+/))[0].match(/\d+/)[0] : undefined;
                ssid = ssid || obj.season_id || undefined;
                epid = input.match(/[eE][pP][0-9]+/) ? (<any>input.match(/[eE][pP][0-9]+/))[0].match(/\d+/)[0] : undefined;
                epid = epid || obj.ep_id || undefined;
                try {
                    // 尝试访问bangumi接口
                    let data: any;
                    if (epid) data = JSON.stringify(catchs.epid[epid]) || await xhr({ url: Format.objUrl("https://bangumi.bilibili.com/view/web_api/season", { ep_id: epid }) });
                    else if (ssid) data = JSON.stringify(catchs.ssid[ssid]) || await xhr({ url: Format.objUrl("https://bangumi.bilibili.com/view/web_api/season", { season_id: ssid }) });
                    if (data) {
                        data = new InitialStateOfBangumi(data, epid).season();
                        ssid && (catchs.ssid[ssid] = data);
                        epid && (catchs.epid[epid] = data);
                        aid = data.epInfo.aid;
                        cid = data.epInfo.cid;
                        pgc = true;
                        toast("正在请求Bangumi数据", "系列名称：" + data.mediaInfo.title, "分p名称：" + data.epInfo.index_title);
                    }
                } catch (e) {
                    let data: any;
                    if (ssid) debug.error("获取视频信息出错：ssid：" + ssid, "HOST：https://bangumi.bilibili.com/view/web_api/season", e);
                    else if (epid) debug.error("获取视频信息出错：epid：" + epid, "HOST：https://bangumi.bilibili.com/view/web_api/season", e);
                    try {
                        if (epid) {
                            data = await xhr({ url: Format.objUrl(`${config.limitServer}/intl/gateway/v2/ogv/view/app/season`, { ep_id: epid }) });
                        } else if (ssid) {
                            data = await xhr({ url: Format.objUrl(`${config.limitServer}/intl/gateway/v2/ogv/view/app/season`, { season_id: ssid }) });
                        }
                        data = new InitialStateOfBangumi(data, epid).global();
                        aid = data.epInfo.aid;
                        cid = data.epInfo.cid;
                        pgc = true;
                        toast("正在请求Bangumi数据", "系列名称：" + data.mediaInfo.title, "分p名称：" + data.epInfo.index_title);
                    } catch (e) { }
                }
            }
        } catch (e) { toast.error("urlInputCheck.js", e) }
        return { aid, cid, ssid, epid, p, pgc }
    }
}