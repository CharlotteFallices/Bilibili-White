interface modules {
    /** 合作UP主 */
    readonly "upList.js": string;
    readonly "upList.css": string;
}
namespace API {
    runWhile(() => document.querySelector("#v_upinfo"), () => {
        try {
            let fl = '<span class="title">UP主列表</span><div class="up-card-box">';
            // @ts-ignore：该变量由主模块传入
            fl = staff.reduce((s, d) => {
                s = s + `<div class="up-card">
                <a href="//space.bilibili.com/${d.mid}" data-usercard-mid="${d.mid}" target="_blank" class="avatar">
                <img src="${d.face}@48w_48h.webp" /><!---->
                <span class="info-tag">${d.title}</span><!----></a>
                <div class="avatar">
                <a href="//space.bilibili.com/${d.mid}" data-usercard-mid="${d.mid}" target="_blank" class="${(d.vip && d.vip.status) ? 'name-text is-vip' : 'name-text'}">${d.name}</a>
                </div></div>`
                return s;
            }, fl) + `</div>`;
            (<HTMLElement>document.querySelector("#v_upinfo")).innerHTML = fl;
            addCss(getModule("upList.css"));
        } catch (e) { toast.error("upList.js", e) }
    })
}