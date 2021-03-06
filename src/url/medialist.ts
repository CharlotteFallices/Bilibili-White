interface modules {
    /** 重构playlist页面 */
    readonly "medialist.js": string;
    readonly "playlist.html": string;
}
namespace API {
    class Playlist extends Rewrite {
        /** url参数 */
        route = Format.urlObj(location.href);
        /** medialist类型 */
        type = 3;
        /** 伪造的pl号 */
        pl = /\d+/.exec(path[5]) && Number((<RegExpExecArray>/\d+/.exec(path[5]))[0]);
        /** 真的是playlist页面？ */
        playlist = Boolean(path[5].startsWith("pl"));
        /** 滚动加载锚 */
        oid = "";
        /** playlist toview模板 */
        toview = {
            "attr": 2,
            "count": 100,
            "cover": "https://i0.hdslb.com/bfs/archive/a45ef4fcde397247032cf4ce0c8f71815f9e28d0.jpg",
            "ctime": 1529021131,
            "description": "bilibili moe 2018 动画角色人气大赏日本动画场应援视频播单 / 每天不定时更新最新的一批",
            "faved_count": 0,
            "favored": 0,
            "favorite": false,
            "id": 1826036,
            "is_favorite": false,
            "like_count": 0,
            "list": [],
            "mid": 26468955,
            "mlid": 182603655,
            "mtime": 1533874759,
            "name": "bilibili moe 2018 日本动画场应援",
            "owner": {
                "face": "http://i2.hdslb.com/bfs/face/57389d533621407d36981a99fed93834dd8b20e6.jpg",
                "mid": 26468955,
                "name": "萌战基"
            },
            "pid": 769,
            "play_count": 0,
            "recent_oids": [],
            "recent_res": [],
            "reply_count": 0,
            "share_count": 0,
            "stat": {
                "favorite": 1685,
                "pid": 769,
                "reply": 10,
                "share": 0,
                "view": 298928
            },
            "state": 0,
            "type": 2
        };
        /** 滚动到底了？ */
        has_more = false;
        /** 滚动监听 */
        observer = new MutationObserver(d => this.Observer(d));
        constructor(html: keyof modules) {
            super(html);
            this.initPlayerQueryData();
            history.replaceState(null, "", Format.objUrl(`https://www.bilibili.com/playlist/video/pl${this.pl}`, Format.urlObj(location.href))); // 伪造为playlist页面，便于重构，重构完会还原回去
            this.script = [
                {
                    type: "text/javascript",
                    src: "//s1.hdslb.com/bfs/static/jinkela/long/js/jquery/jquery1.7.2.min.js"
                },
                {
                    type: "text/javascript",
                    src: "//static.hdslb.com/js/jquery.qrcode.min.js"
                },
                {
                    type: "text/javascript",
                    src: "//s1.hdslb.com/bfs/seed/jinkela/header/header.js"
                },
                {
                    type: "text/javascript",
                    src: "//static.hdslb.com/common/js/footer.js"
                },
                {
                    type: "text/javascript",
                    src: "//static.hdslb.com/js/swfobject.js"
                },
                {
                    type: "text/javascript",
                    src: "//static.hdslb.com/mstation/js/upload/moxie.js"
                },
                {
                    type: "text/javascript",
                    src: "//static.hdslb.com/mstation/js/upload/plupload.js"
                },
                {
                    type: "text/javascript",
                    src: "//static.hdslb.com/phoenix/dist/js/comment.min.js"
                },
                {
                    type: "text/javascript",
                    src: "//s1.hdslb.com/bfs/static/jinkela/playlist-video/1.playlist_video.87292febba67b03f65d05c15d03e325d9db4f56a.js"
                },
                {
                    type: "text/javascript",
                    src: "//s1.hdslb.com/bfs/static/jinkela/playlist-video/playlist_video.87292febba67b03f65d05c15d03e325d9db4f56a.js"
                }
            ];
            jsonphookasync("toview", undefined, async url => { // hook playlist初始化请求
                history.replaceState(null, "", path.join("/")); // 还原页面url
                try {
                    if (this.playlist || this.pl === 182603655) { // 备份页面
                        const result = await xhr({
                            url: "https://cdn.jsdelivr.net/gh/MotooriKashin/Bilibili-Old/Json/pl769.json",
                            responseType: "json"
                        });
                        this.toview = result.data;
                        return result;
                    } else {
                        const rqs = await Promise.all([ // toview数据来源
                            xhr.get(`https://api.bilibili.com/x/v1/medialist/info?type=${this.type}&biz_id=${this.pl}&tid=0`, { responseType: "json" }),
                            xhr.get(`https://api.bilibili.com/x/v2/medialist/resource/list?type=${this.type}&oid=${this.oid}&otype=2&biz_id=${this.pl}&bvid=&with_current=true&mobi_app=web&ps=20&direction=false&sort_field=1&tid=0&desc=true`, { responseType: "json" })
                        ]);
                        this.info(rqs[0]); // 分别填充模板
                        this.list(rqs[1]);
                        return { code: 0, data: this.toview, message: "0", ttl: 1 }
                    }
                } catch (e) {
                    toast.error("获取medialist数据失败！请刷新页面或者在脚本设置中关闭重构“medialist”选项");
                    throw e;
                }
            })
            switchVideo(() => { // 切p回调
                !(this.pl == 769) && history.replaceState(null, "", Format.objUrl(path.join("/"), Format.urlObj(location.href))); // 还原被原生脚本修改过的url
                const data: any = this.toview.list.find((d: any) => d.aid == aid);
                if (data) {
                    tid = data.tid;
                    mediaSession({ // 设置媒体面板
                        title: data.pages.find((d: any) => d.cid == cid).part || data.title,
                        artist: data.owner.name,
                        album: data.title,
                        artwork: [{
                            src: data.pic
                        }]
                    });
                    (Reflect.has(data, "attr") && !!+data.attr.toString(2)[data.attr.toString(2).length - 2] && toast.warning("限制视频，可能无法在播单中直接播放~"));
                }
                if (this.has_more) { // 继续滚动监听
                    runWhile(() => document.querySelector(".bilibili-player-playlist-item"), () => this.startObserver());
                }
            })
            this.flushDocument();
            this.onload = () => this.afterFlush();
        }
        /** 初始化medialist类型 */
        initPlayerQueryData() {
            if (this.route.business) switch (this.route.business) {
                case "space": this.type = 1;
                    break;
                case "space_series": this.type = 5; this.pl = Number(this.route.business_id);
                    break;
                case "space_channel": this.type = 6; this.pl = 10 * Number(this.route.business_id) + (<number>this.pl) % 10;
                    break;
                case "space_collection": this.type = 8; this.pl = Number(this.route.business_id);
                    break;
                default: this.type = 3;
            }
        }
        /**
         * 开始滚动监听
         */
        startObserver() {
            this.observer.observe(document.querySelector<any>(".bilibili-player-playlist-item").parentElement.parentElement, { attributes: true });
        }
        info(obj: Record<string, any>) {
            this.toview.attr = obj.data.attr;
            this.toview.count = obj.data.media_count;
            this.toview.cover = obj.data.cover;
            this.toview.ctime = obj.data.ctime;
            this.toview.description = obj.data.intro;
            this.toview.favored = obj.data.fav_state;
            this.toview.favorite = Boolean(obj.data.fav_state);
            this.toview.id = obj.data.id;
            this.toview.is_favorite = Boolean(obj.data.fav_state);
            this.toview.like_count = obj.data.like_state;
            this.toview.mid = obj.data.mid;
            this.toview.mlid = obj.data.id;
            this.toview.mtime = obj.data.ctime;
            this.toview.name = obj.data.title;
            this.toview.owner = obj.data.upper;
            this.toview.pid = obj.data.id;
            this.toview.stat.favorite = obj.data.cnt_info.collect;
            this.toview.stat.pid = obj.data.id;
            this.toview.stat.reply = obj.data.cnt_info.reply;
            this.toview.stat.share = obj.data.cnt_info.share;
            this.toview.stat.view = obj.data.cnt_info.play;
        }
        list(obj: Record<string, any>) {
            obj.data.media_list.reduce((s: any, d: any) => {
                s.push({
                    aid: d.id,
                    attr: d.attr,
                    attribute: 0,
                    cid: d.pages[0].id,
                    copyright: d.copy_right,
                    ctime: d.pubtime,
                    desc: d.intro,
                    dimension: d.pages[0].dimension,
                    duration: d.duration,
                    dynamic: "",
                    owner: d.upper,
                    pages: d.pages.reduce((s: any, b: any) => {
                        s.push({
                            cid: b.id,
                            dimension: b.dimension,
                            duration: b.duration,
                            from: b.from,
                            page: b.page,
                            part: b.title,
                            vid: "",
                            weblink: b.link
                        });
                        return s;
                    }, []),
                    pic: d.cover,
                    pubdate: d.pubtime,
                    rights: d.rights,
                    stat: {
                        aid: d.id,
                        coin: d.cnt_info.coin,
                        danmaku: d.cnt_info.danmaku,
                        dislike: d.cnt_info.thumb_down,
                        favorite: d.cnt_info.collect,
                        his_rank: 0,
                        like: d.cnt_info.thumb_up,
                        now_rank: 0,
                        reply: d.cnt_info.reply,
                        share: d.cnt_info.share,
                        view: d.cnt_info.play
                    },
                    state: 0,
                    tid: d.tid,
                    title: d.title,
                    tname: "",
                    videos: d.page
                });
                return s;
            }, this.toview.list);
            this.has_more = obj.data.has_more;
            this.oid = (<any>this).toview.list[this.toview.list.length - 1].aid;
        }
        afterFlush() {
            runWhile(() => document.getElementsByClassName("bili-header-m")[1], () => document.getElementsByClassName("bili-header-m")[1].remove()); // 移除上古顶栏
            if (this.playlist && !(this.pl == 769)) {
                history.replaceState(null, "", `https://www.bilibili.com/playlist/video/pl769`);
                toast.warning("原生playlist页面已无法访问，已重定向到脚本备份的pl769~");
            }
            if (document.compatMode === "BackCompat") { // 怪异模式下样式修复
                addCss(".bili-header-m .nav-menu .profile-info .i-face { top:5px; }")
            }
            importModule("descBV.js"); // 修复简介中超链接
            importModule("videoSort.js"); // 修正分区信息
            config.enlike && importModule("enLike.js"); // 添加点赞功能
            config.electric && jsonphook("api.bilibili.com/x/web-interface/elec/show", url => Format.objUrl(url, { aid: 1, mid: 1 }));
        }
        Observer(record: MutationRecord[]) {
            record.forEach(d => {
                this.calcScroll(<HTMLDivElement>d.target)
            })
        }
        calcScroll(node: HTMLDivElement) {
            const maxHeight = node.scrollHeight;
            const scroll = /\d+/.exec(node.style.top) ? Number(/\d+/.exec(node.style.top)) : 0;
            if (node.className.includes("hidden")) return;
            if (maxHeight - scroll > 0 && maxHeight - scroll < 600) {
                this.observer.disconnect(); // 暂停监听
                toast("loading...");
                xhr.get(`https://api.bilibili.com/x/v2/medialist/resource/list?type=${this.type}&oid=${this.oid}&otype=2&biz_id=${this.pl}&bvid=&with_current=true&mobi_app=web&ps=20&direction=false&sort_field=1&tid=0&desc=true`, { responseType: "json" }).then(d => {
                    this.formatMore(d);
                    this.has_more && this.startObserver(); // 重新监听
                }).catch(e => { toast.error("正在加载...", e) })
            }
        }
        /**
         * 重构加载更多
         * @param obj 接口返回数据（json）
         */
        formatMore(obj: any) {
            const result = obj.data.media_list.reduce((s: any, d: any) => {
                s.push({
                    ao: d.rights && d.rights.pay,
                    Sz: d.upper && d.upper.face,
                    Te: d.pages.reduce((s: any, f: any) => {
                        s.push({
                            Da: d.bangumi?.ep_id,
                            Fb: d.bangumi?.season?.season_id,
                            aid: d.id,
                            duration: f.duration,
                            from: f.from,
                            j: f.id,
                            ni: f.title,
                            page: f.page
                        })
                        return s;
                    }, []),
                    Tz: d.upper && d.upper.mid,
                    aid: d.id,
                    duration: d.duration,
                    ko: d.upper && d.upper.name,
                    lb: d.cover,
                    state: 0,
                    title: d.title,
                })
                return s;
            }, []);
            this.list(obj); // 记录更多数据
            this.has_more ? (<any>window).player?.updatePlaylist(result) : toast.warning("没有更多了！"); // 推送到播放器脚本
        }
    }
    new Playlist("playlist.html");
}
