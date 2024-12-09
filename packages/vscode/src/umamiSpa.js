// umami 单个页面版，没有路由改变
export const umamiSpa = (options = {}) => {
    const {
        screen: { width, height },
        navigator: { language },
        location,
        localStorage,
        document,
        history
    } = window;
    const hostname = '127.0.0.1';
    const href = '/index.html';
    const website = options.website;
    const tag = undefined;
    const excludeSearch = false;
    const endpoint = `https://tj.yicode.tech/api/send`;
    const screen = `${width}x${height}`;
    const eventRegex = /data-umami-event-([\w-_]+)/;
    const eventNameAttribute = 'data-umami-event';
    const delayDuration = 300;

    /* Helper functions */

    const encode = (str) => {
        if (!str) {
            return undefined;
        }

        try {
            const result = decodeURI(str);

            if (result !== str) {
                return result;
            }
        } catch (e) {
            return str;
        }

        return encodeURI(str);
    };

    const parseURL = (url) => {
        try {
            const { pathname, search } = new URL(url);
            url = pathname + search;
        } catch (e) {
            /* empty */
        }
        return excludeSearch ? url.split('?')[0] : url;
    };

    const getPayload = () => ({
        website,
        hostname,
        screen,
        language,
        title: encode(title),
        url: encode(currentUrl),
        referrer: encode(currentRef),
        tag: tag ? tag : undefined
    });

    /* Event handlers */

    const handlePush = (state, title, url) => {
        if (!url) return;

        currentRef = currentUrl;
        currentUrl = parseURL(url.toString());

        if (currentUrl !== currentRef) {
            setTimeout(track, delayDuration);
        }
    };

    const handlePathChanges = () => {
        const hook = (_this, method, callback) => {
            const orig = _this[method];

            return (...args) => {
                callback.apply(null, args);

                return orig.apply(_this, args);
            };
        };

        history.pushState = hook(history, 'pushState', handlePush);
        history.replaceState = hook(history, 'replaceState', handlePush);
    };

    const handleTitleChanges = () => {
        const observer = new MutationObserver(([entry]) => {
            title = entry && entry.target ? entry.target.text : undefined;
        });

        const node = document.querySelector('head > title');

        if (node) {
            observer.observe(node, {
                subtree: true,
                characterData: true,
                childList: true
            });
        }
    };

    const handleClicks = () => {
        document.addEventListener(
            'click',
            async (e) => {
                const isSpecialTag = (tagName) => ['BUTTON', 'A'].includes(tagName);

                const trackElement = async (el) => {
                    const attr = el.getAttribute.bind(el);
                    const eventName = attr(eventNameAttribute);

                    if (eventName) {
                        const eventData = {};

                        el.getAttributeNames().forEach((name) => {
                            const match = name.match(eventRegex);

                            if (match) {
                                eventData[match[1]] = attr(name);
                            }
                        });

                        return track(eventName, eventData);
                    }
                };

                const findParentTag = (rootElem, maxSearchDepth) => {
                    let currentElement = rootElem;
                    for (let i = 0; i < maxSearchDepth; i++) {
                        if (isSpecialTag(currentElement.tagName)) {
                            return currentElement;
                        }
                        currentElement = currentElement.parentElement;
                        if (!currentElement) {
                            return null;
                        }
                    }
                };

                const el = e.target;
                const parentElement = isSpecialTag(el.tagName) ? el : findParentTag(el, 10);

                if (parentElement) {
                    const { href, target } = parentElement;
                    const eventName = parentElement.getAttribute(eventNameAttribute);

                    if (eventName) {
                        if (parentElement.tagName === 'A') {
                            const external = target === '_blank' || e.ctrlKey || e.shiftKey || e.metaKey || (e.button && e.button === 1);

                            if (eventName && href) {
                                if (!external) {
                                    e.preventDefault();
                                }
                                return trackElement(parentElement).then(() => {
                                    if (!external) location.href = href;
                                });
                            }
                        } else if (parentElement.tagName === 'BUTTON') {
                            return trackElement(parentElement);
                        }
                    }
                } else {
                    return trackElement(el);
                }
            },
            true
        );
    };

    /* Tracking functions */

    const send = async (payload, type = 'event') => {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (typeof cache !== 'undefined') {
            headers['x-umami-cache'] = cache;
        }

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                body: JSON.stringify({ type, payload }),
                headers
            });
            const text = await res.text();

            return (cache = text);
        } catch (e) {
            /* empty */
        }
    };

    const init = () => {
        if (!initialized) {
            track();
            handlePathChanges();
            handleTitleChanges();
            handleClicks();
            initialized = true;
        }
    };

    const track = (obj, data) => {
        if (typeof obj === 'string') {
            return send({
                ...getPayload(),
                name: obj,
                data: typeof data === 'object' ? data : undefined
            });
        } else if (typeof obj === 'object') {
            return send(obj);
        } else if (typeof obj === 'function') {
            return send(obj(getPayload()));
        }
        return send(getPayload());
    };

    const identify = (data) => send({ ...getPayload(), data }, 'identify');

    /* Start */

    if (!window.umami) {
        window.umami = {
            track,
            identify
        };
    }

    let currentUrl = parseURL(href);
    let currentRef = `https://${options.macid}.from`;
    let title = document.title;
    let cache;
    let initialized;

    if (document.readyState === 'complete') {
        init();
    } else {
        document.addEventListener('readystatechange', init, true);
    }
};
