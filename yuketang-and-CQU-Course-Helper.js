// ==UserScript==
// @name         课程视频 - 强制后台持续播放（抗应用遮挡）
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  即使浏览器被其他应用盖住、最小化，也强制视频持续播放，不停止、不暂停
// @author       hyper152
// @match        https://courses.cqu.edu.cn/*
// @match        https://www.xuetangx.com/learn/*/video/*
// @match        https://*.yuketang.cn/*
// @grant        GM_addStyle
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    // 全局日志配置（可选，便于排查问题）
    const log = (...a) => console.log('[强制持续播放]', ...a);

    /**
     * 核心功能：强制视频持续播放（抗应用遮挡、最小化）
     * 1. 禁用所有场景下的自动暂停（前台/后台/遮挡/最小化）
     * 2. 突破浏览器自动播放策略，忽略文档可见性状态
     * 3. 兜底阻止平台脚本主动暂停视频
     */
    function forceContinuousVideoPlay() {
        // 遍历页面中所有视频元素
        const videoElements = document.querySelectorAll('video');
        if (videoElements.length === 0) {
            log('⚠️ 未检测到视频元素');
            return;
        }

        videoElements.forEach(video => {
            // 1. 基础播放配置（突破浏览器自动播放限制）
            video.muted = true; // 静音播放（核心，规避浏览器自动播放限制）
            video.loop = false; // 按需调整，false=不循环，true=循环播放
            video.autoplay = true; // 开启自动播放
            video.preload = 'auto'; // 预加载资源，确保播放流畅

            // 2. 移除所有可能导致视频暂停的平台属性（彻底兜底）
            video.removeAttribute('data-pause-on-blur');
            video.removeAttribute('data-stop-on-background');
            video.removeAttribute('data-stop-on-minimize');
            video.removeAttribute('visibilitychange');

            // 3. 强制设置视频样式，确保不被隐藏（不影响播放，仅兜底）
            video.style.display = 'block';
            video.style.visibility = 'visible';
            video.style.opacity = '1';
            video.style.pointerEvents = 'auto';

            // 4. 核心：阻止所有类型的暂停事件（无论前台/后台，忽略可见性）
            video.addEventListener('pause', (e) => {
                // 取消所有暂停行为，无论文档是否可见（关键：移除visible判断）
                e.preventDefault();
                e.stopImmediatePropagation();

                // 强制恢复播放，忽略浏览器/平台的限制
                video.play().then(() => {
                    const visibilityStatus = document.visibilityState;
                    log(`✅ 检测到视频暂停，已强制恢复播放（当前窗口状态：${visibilityStatus}）`);
                }).catch(err => {
                    log('⚠️ 强制恢复播放失败：', err.message);
                });
            }, { capture: true, passive: false }); // capture=true：优先拦截，passive=false：允许阻止默认行为

            // 5. 核心：忽略文档可见性变化，即使窗口被遮挡/最小化，也保持播放
            document.addEventListener('visibilitychange', (e) => {
                // 阻止可见性变化触发的默认行为（避免平台脚本监听该事件暂停视频）
                e.preventDefault();
                e.stopImmediatePropagation();

                // 若视频已暂停，强制恢复（无论当前是hidden还是visible）
                if (video.paused) {
                    video.play().then(() => {
                        log(`✅ 窗口状态变为${document.visibilityState}，已强制恢复视频播放`);
                    }).catch(err => {
                        log('⚠️ 窗口切换后恢复播放失败：', err.message);
                    });
                }
            }, { capture: true, passive: false });

            // 6. 初始化强制播放（页面加载完成后自动启动）
            video.play().then(() => {
                log('✅ 视频已强制启动，支持后台/遮挡持续播放');
            }).catch(err => {
                log('⚠️ 初始化播放失败（可手动点击视频激活一次）：', err.message);
            });
        });
    }

    /**
     * 监听页面动态加载的视频（适配异步渲染的课程平台）
     */
    function watchDynamicVideoElements() {
        // 配置MutationObserver，监听页面新增的视频元素
        const observer = new MutationObserver((mutations) => {
            let hasNewVideo = false;
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    // 检测新增节点是否为视频元素，或包含视频元素
                    if (node.tagName === 'VIDEO' || (node.querySelector && node.querySelector('video'))) {
                        hasNewVideo = true;
                    }
                });
            });

            // 若有新增视频，重新执行强制持续播放配置
            if (hasNewVideo) {
                forceContinuousVideoPlay();
            }
        });

        // 启动观察者，监听整个页面的DOM变化
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: false,
            characterData: false
        });

        log('✅ 已启动动态视频监听，适配异步加载内容');
    }

    // 脚本入口：先执行一次强制播放，再启动动态监听
    window.addEventListener('load', () => {
        forceContinuousVideoPlay();
        watchDynamicVideoElements();
    });

    // 初始化日志
    log('✅ 强制持续播放脚本已加载完成（支持浏览器被应用盖住、最小化）');
})();