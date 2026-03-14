const express = require('express');
const path = require('path');
const fs = require('fs');

// 1. 路径配置 (根据您的实际目录结构)
const distPath = path.join(__dirname, 'dist/build/h5');
const clientPath = path.join(distPath, 'client');
const serverPath = path.join(distPath, 'server');

// 2. 引入 manifest (静态资源清单)
let manifest = {};
try {
  manifest = require(path.join(serverPath, 'ssr-manifest.json'));
} catch (e) {
  console.log('Manifest not found, skipping...');
}

// 3. 引入服务端入口
const serverEntry = require(path.join(serverPath, 'entry-server.js'));

// ★★★ 核心修复：直接获取 render 函数 ★★★
// 日志显示 render 在导出的对象里，可能是直接属性，也可能是 default 的属性
const render = serverEntry.render || (serverEntry.default && serverEntry.default.render);

if (typeof render !== 'function') {
  throw new Error('Fatal Error: 无法在 entry-server.js 中找到 render 函数！请检查构建产物。');
}

const server = express();
const port = 3000;

// 4. 托管静态资源
server.use(express.static(clientPath, { index: false }));

// 5. 处理 SSR 请求 (使用正则匹配所有路径)
server.get(/.*/, async (req, res) => {
  try {
    // 读取 index.html 模板
    let template = fs.readFileSync(path.join(clientPath, 'index.html'), 'utf-8');

    // ★★★ 核心修复：直接调用 render 函数 ★★★
    // render 函数通常接受 (url, manifest) 作为参数
    // 它内部会处理路由跳转和 Vue 渲染
    const renderResult = await render(req.url, manifest);
    
    // 处理 render 的返回值 (可能是字符串，也可能是包含 html 的对象)
    let appHtml = renderResult;
    if (typeof renderResult === 'object' && renderResult.html) {
      appHtml = renderResult.html;
    }

    // 将渲染结果注入模板
    // UniApp 使用 <div id="app"></div> 作为占位符
    let html = template;
    if (html.includes('<div id="app"></div>')) {
      html = html.replace('<div id="app"></div>', `<div id="app">${appHtml}</div>`);
    } else {
      // 兼容其他可能的占位符格式
      html = html.replace('<!--app-html-->', appHtml);
    }

    res.status(200).set({ 'Content-Type': 'text/html' }).end(html);

  } catch (e) {
    console.error('SSR Render Error:', e);
    // 降级处理：如果 SSR 报错，返回普通 index.html 让浏览器去渲染 (CSR)
    // 这样用户至少能看到页面，虽然不是 SSR 的
    try {
        const fallbackHtml = fs.readFileSync(path.join(clientPath, 'index.html'), 'utf-8');
        res.status(500).send(fallbackHtml); 
    } catch (err) {
        res.status(500).send('Server Internal Error');
    }
  }
});

server.listen(port, () => {
  console.log(`✅ SSR Server running at http://0.0.0.0:${port}`);
  console.log('Render function found type:', typeof render);
});