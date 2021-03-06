interface modules {
    /** 弹幕跳转 */
    readonly "loadByDmid.js": string;
}
namespace API {
    const dmid = Format.urlObj(location.href).dmid;
    let progress: any = Number(Format.urlObj(location.href).dm_progress);
    let first = 0;
    switchVideo(async () => {
        if (!(<any>window).player?.seek) {
            await new Promise(r => {
                runWhile(() => (<any>window).player?.seek, r)
            })
        }
        if (first) return;
        first++;
        if (progress) return (<any>window).player.seek(progress);
        if (dmid) {
            progress = await xhr({
                url: `https://api.bilibili.com/x/v2/dm/thumbup/detail?oid=${cid}&dmid=${dmid}`,
                credentials: true
            });
            progress = jsonCheck(progress).data.progress; // 检查xhr返回值并转化为json
            progress && (<any>window).player.seek(progress / 1000 - .2);
        }
    })
}