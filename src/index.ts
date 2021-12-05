/**
 * 脚本主体，负责提供脚本与模块间沟通的桥梁
 */
(function () {
    GM.getResourceText = GM_getResourceText;
    // @ts-ignore 忽略unsafeWindow错误
    const root: Window = unsafeWindow;
    const modules: Record<string, any> = {};
    /* 模块占位 */
    /**
     * 初始化脚本设置数据
     */
    class API {
        static API: Object;
        GM = GM;
        module: (string | symbol)[] = [];
        Name: string = GM.info.script.name;
        Virsion: string = GM.info.script.version;
        Handler: string = [GM.info.scriptHandler, GM.info.version].join(" ");
        /**
         * 获取模块内容
         * @param name 模块名字
         * @returns json直接返回格式化对象，其他返回字符串
         */
        getModule = (name: string) => Reflect.get(modules, name);
        /**
         * 载入模块
         * @param name 模块名字
         * @param args 传递给对方的全局变量：格式{变量名：变量值}
         * @param force 是否强制载入，一般模块只会载入一次，需要二次载入请将本值设为真
         */
        importModule = (name?: string | symbol, args: { [key: string]: any } = {}, force?: boolean) => {
            if (!name) return Object.keys(modules);
            if (this.module.includes(name) && !force) return this.module;
            if (Reflect.has(modules, name)) {
                !this.module.includes(name) && this.module.push(name);
                new Function("API", "GM", ...Object.keys(args), Reflect.get(modules, name))
                    (API.API, GM, ...Object.keys(args).reduce((s: object[], d) => {
                        s.push(args[d]);
                        return s;
                    }, []))
            }
        }
        constructor() {
            API.API = new Proxy(this, {
                get: (t, p) => {
                    return Reflect.get(root, p) || Reflect.get(t, p) || (
                        Reflect.has(modules["apply.json"], p) ? (
                            t.importModule(modules["apply.json"][p], {}),
                            Reflect.get(t, p)
                        ) : undefined);
                },
                set: (t, p, value) => {
                    Reflect.has(root, p) ? Reflect.set(root, p, value) : Reflect.set(t, p, value);
                    return true;
                }
            })
            this.importModule("replyList.js");
        }
    }
    new API();
})();
declare namespace GM {
    interface cookieDetails {
        /**
         * 域
         */
        domain: string,
        /**
         * 截止日期时间戳（10位）
         */
        expirationDate: number;
        /**
         * 客户端专用，不会发送给服务端
         */
        hostOnly: boolean;
        /**
         * 服务端专用，客户端js无法获取/修改
         */
        httpOnly: boolean;
        /**
         * 名称
         */
        name: string;
        /**
         * 子页面路径
         */
        path: string;
        /**
         * 同源策略
         */
        sameSite: string;
        /**
         * 是否允许通过非安全链接发送给服务器
         */
        secure: boolean;
        /**
         * 会话型cookie，临时有效，随页面一起销毁
         */
        session: boolean;
        /**
         * 值
         */
        value: string
    }
    let getResourceText: typeof GM_getResourceText;
    const info: {
        downloadMode: string;
        isFirstPartyIsolation: boolean;
        isIncognito: boolean;
        scriptHandler: string;
        scriptMetaStr: string;
        scriptSource: string;
        scriptUpdateURL: string;
        scriptWillUpdate: string;
        version: string;
        script: {
            antifeatures: {};
            author: string;
            blockers: [];
            copyright: string;
            description: string;
            description_i18n: {};
            evilness: number;
            excludes: [];
            grant: [];
            header: string;
            homepage: string;
            icon: string;
            icon64: string;
            includes: [];
            lastModified: number;
            matches: [];
            name: string;
            name_i18n: [];
            namespace: string;
            options: {
                check_for_updates: boolean;
                comment: string;
                compat_foreach: boolean;
                compat_metadata: boolean;
                compat_prototypes: boolean;
                compat_wrappedjsobject: boolean;
                compatopts_for_requires: boolean;
                noframes: boolean;
                override: {
                    merge_connects: boolean;
                    merge_excludes: boolean;
                    merge_includes: boolean;
                    merge_matches: boolean;
                    orig_connects: [];
                    orig_excludes: [];
                    orig_includes: [];
                    orig_matches: [];
                    orig_noframes: boolean;
                    orig_run_at: string;
                    use_blockers: [];
                    use_connects: [];
                    use_excludes: [];
                    use_includes: [];
                    use_matches: [];
                }
                run_at: string;
            }
            position: number;
            requires: [];
            resources: [{ [name: string]: string }];
            "run-at": string;
            supportURL: string;
            sync: { imported: string };
            unwrap: boolean;
            updateURL: string;
            uuid: string;
            version: string;
            webRequest: string;
        }
    }
    const cookie: {
        /**
         * **警告：此实验性特性仅在Tampermonkey Beta中可用，否则将抛出语法错误！**
         */
        <T extends keyof typeof cookie>(method: T, ...args: Parameters<(typeof cookie)[T]>): ReturnType<(typeof cookie)[T]>;
        /**
         * 以数组形式返回所有cookie  
         * **警告：此实验性特性仅在Tampermonkey Beta中可用，否则将抛出语法错误！**
         * @param details 筛选条件，无条件请使用空对象{}会返回所有cookie
         * @returns 符合条件的cookie对象数组
         */
        list(details: Partial<Record<"domain" | "name" | "path", string>>): Promise<cookieDetails[]>;
        /**
         * 修改/添加cookie  
         * **警告：此实验性特性仅在Tampermonkey Beta中可用，否则将抛出语法错误！**
         * @param args cookie详细信息
         */
        set(details: Partial<cookieDetails>): Promise<void>;
        /**
         * 删除cookie  
         * **警告：此实验性特性仅在Tampermonkey Beta中可用，否则将抛出语法错误！**
         * @param args 删除条件
         */
        delete(details: Record<"name", string>): Promise<void>;
    }
}
declare function GM_getResourceText(name: string): string;
/**
 * 模块间的顶层变量，类似于`window`
 */
declare namespace API {
    /**
     * 脚本名字
     */
    let Name: string;
    /**
     * 脚本版本
     */
    let Virsion: string;
    /**
     * 脚本管理器名字
     */
    let Handler: string;
    /**
     * 载入模块
     * @param name 模块名字
     * @param args 传递给对方的全局变量：格式{变量名：变量值}
     * @param force 是否强制载入，一般模块只会载入一次，需要二次载入请将本值设为真
     */
    function importModule(name?: string | symbol, args?: { [key: string]: any; }, force?: boolean): string[];
    /**
     * 获取模块内容
     * @param name 模块名字
     * @returns json直接返回格式化对象，其他返回字符串
     */
    function getModule(name: string): any;
}