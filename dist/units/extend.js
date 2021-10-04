/**
 * 本模块负责拓展一些小工具，这些工具不便写在主模块中
 */
(function () {
    try {
        function getCookies() {
            return document.cookie.split('; ').reduce((s, d) => {
                let key = d.split('=')[0];
                let val = d.split('=')[1];
                s[key] = val;
                return s;
            }, {});
        }
        API.getCookies = () => getCookies();
        async function loginExit(referer) {
            if (!API.uid)
                return toast.warning("本就未登录，无法退出登录！");
            toast.warning("正在退出登录...");
            let data = API.jsonCheck(await xhr({
                url: "https://passport.bilibili.com/login/exit/v2",
                data: `biliCSRF=${API.getCookies().bili_jct}&gourl=${encodeURIComponent(location.href)}`,
                method: "POST",
                credentials: true
            }));
            if (data.status) {
                toast.success("退出登录！");
                if (referer)
                    return location.replace(referer);
                setTimeout(() => location.reload(), 1000);
            }
        }
        API.loginExit = (referer) => loginExit(referer);
        function jsonCheck(data) {
            let result = typeof data === "string" ? JSON.parse(data) : data;
            if ("code" in result && result.code !== 0) {
                let msg = result.msg || result.message || "";
                throw [result.code, msg];
            }
            return result;
        }
        API.jsonCheck = (data) => jsonCheck(data);
        function restorePlayerSetting() {
            var _a;
            let bilibili_player_settings = localStorage.getItem("bilibili_player_settings");
            let settings_copy = GM.getValue("bilibili_player_settings", {});
            if (bilibili_player_settings) {
                let settings = JSON.parse(bilibili_player_settings);
                if (((_a = settings === null || settings === void 0 ? void 0 : settings.video_status) === null || _a === void 0 ? void 0 : _a.autopart) !== "")
                    GM.setValue("bilibili_player_settings", settings);
                else if (settings_copy)
                    localStorage.setItem("bilibili_player_settings", JSON.stringify(settings_copy));
            }
            else if (settings_copy) {
                localStorage.setItem("bilibili_player_settings", JSON.stringify(settings_copy));
            }
        }
        API.restorePlayerSetting = () => restorePlayerSetting();
        function biliQuickLogin() {
            window.biliQuickLogin ? window.biliQuickLogin() : window.$ ? window.$.getScript("//static.hdslb.com/account/bili_quick_login.js", () => window.biliQuickLogin()) : false;
        }
        API.biliQuickLogin = () => biliQuickLogin();
        function getTotalTop(node) {
            var sum = 0;
            do {
                sum += node.offsetTop;
                node = node.offsetParent;
            } while (node);
            return sum;
        }
        API.getTotalTop = (node) => getTotalTop(node);
        async function saveAs(content, fileName, contentType = "text/plain") {
            const a = document.createElement("a");
            const file = new Blob([content], { type: contentType });
            a.href = URL.createObjectURL(file);
            a.download = fileName;
            a.click();
        }
        function getUrlValue(name) {
            const reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            const r = window.location.search.substr(1).match(reg);
            if (r != null)
                return decodeURIComponent(r[2]);
            return null;
        }
        API.getUrlValue = (name) => getUrlValue(name);
        API.saveAs = (content, fileName, contentType) => saveAs(content, fileName, contentType);
        function readAs(file, type = "string", encoding) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                switch (type) {
                    case "ArrayBuffer":
                        reader.readAsArrayBuffer(file);
                        break;
                    case "DataURL":
                        reader.readAsDataURL(file);
                        break;
                    case "string":
                        reader.readAsText(file, encoding || 'utf-8');
                        break;
                }
                reader.onload = () => resolve(reader.result);
                reader.onerror = e => reject(e);
            });
        }
        API.readAs = (file, type, encoding) => readAs(file, type, encoding);
        const aids = {};
        async function getAidInfo(aid) {
            if (!aids[aid]) {
                const data = await xhr({
                    url: `https://api.bilibili.com/x/web-interface/view/detail?aid=${aid}`,
                    responseType: "json",
                    credentials: true
                });
                aids[aid] = data.data;
            }
            return aids[aid];
        }
        API.getAidInfo = (aid) => getAidInfo(aid);
        function strSize(str) {
            let size = 0;
            for (let i = 0; i < str.length; i++) {
                const code = str.charCodeAt(i);
                if (code <= 0x007f)
                    size++;
                else if (code <= 0x07ff)
                    size += 2;
                else if (code <= 0xffff)
                    size += 3;
                else
                    size += 4;
            }
            return size;
        }
        API.strSize = (str) => strSize(str);
    }
    catch (e) {
        API.trace(e, "extend.js", true);
    }
})();