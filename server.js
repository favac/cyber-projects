const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const chokidar = require('chokidar');
const mime = require('mime-types');

const PORT = process.env.PORT || 3000;

const clients = new Set();
const moduleCache = new Map();

const server = http.createServer((req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host}`);
  const pathname = urlObj.pathname === '/' ? '/index.html' : urlObj.pathname;
  const filePath = path.join(__dirname, pathname);
  console.log(`Requesting: ${req.url} -> ${pathname} -> ${filePath}`);
  if (!filePath.startsWith(__dirname)) {
    res.statusCode = 403;
    res.end('Forbidden');
    return;
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.statusCode = 404;
        res.end('Not found');
      } else {
        res.statusCode = 500;
        res.end('Server error');
      }
      return;
    }
    const contentType = mime.lookup(filePath) || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (pathname.endsWith('.html')) {
      const hmrScript = `
        <script>
          ${getHMRClientCode()}
        </script>
      `;
      data = data.toString().replace('</body>', hmrScript + '</body>');
    }
    if (pathname.includes('/views/') && pathname.endsWith('.js')) {
      let jsContent = data.toString();
      const renderFunctionMatch = jsContent.match(/export\s+function\s+(render\w+)/);
      if (renderFunctionMatch) {
        const functionName = renderFunctionMatch[1];
        const viewName = pathname.split('/').pop().replace('.js', '');
        const storeMatches = jsContent.match(/const\s+(\w*Store)\s*=/g) || [];
        const storeNames = storeMatches.map(match => {
          const storeName = match.match(/const\s+(\w*Store)/)[1];
          return storeName;
        });
        const hmrCode = `

// 🔥 HMR Auto-injected - Automatic code for Hot Module Replacement
if (typeof window !== "undefined") {
  window.__HMR_VIEWS__ = window.__HMR_VIEWS__ || {};
  window.__HMR_VIEWS__["${viewName}"] = ${functionName};
  ${storeNames.map(storeName => `
  if (typeof ${storeName} !== 'undefined') {
    ${storeName}.subscribe(() => ${functionName}());
  }`).join('')}
}`;
        jsContent += hmrCode;
        data = Buffer.from(jsContent);
      }
    }
    res.end(data);
  });
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('HMR client connected');
  clients.add(ws);
  ws.on('close', () => {
    clients.delete(ws);
    console.log('HMR client disconnected');
  });
  ws.on('error', (error) => {
    console.error('Error WebSocket:', error);
    clients.delete(ws);
  });
});

function broadcast(message) {
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

const watcher = chokidar.watch([
  '**/*.js',
  '**/*.css',
], {
  ignored: /node_modules|\.git/,
  persistent: true
});

watcher.on('change', (filePath) => {
  console.log(`File changed: ${filePath}`);
  const ext = path.extname(filePath);
  const relativePath = path.relative(__dirname, filePath);
  const webPath = '/' + relativePath.replace(/\\/g, '/');
  console.log(`Sending update for: ${webPath}`);
  if (ext === '.js') {
    moduleCache.delete(webPath);
    broadcast({
      type: 'hmr:update',
      module: webPath,
      timestamp: Date.now()
    });
  } else if (ext === '.css') {
    broadcast({
      type: 'css:update',
      url: webPath,
      timestamp: Date.now()
    });
  } else if (ext === '.html') {
    broadcast({
      type: 'full-reload',
      timestamp: Date.now()
    });
  }
});

function getHMRClientCode() {
  return `
(function() {
  const WS_URL = 'ws://localhost:${PORT}';
  let ws;
  let reconnectTimer;
  window.__HMR_STATE__ = window.__HMR_STATE__ || {
    modules: new Map(),
    stores: new Map()
  };
  window.__HMR_CLEANUP__ = window.__HMR_CLEANUP__ || [];
  function connect() {
    ws = new WebSocket(WS_URL);
    ws.onopen = () => {
      console.log('🔥 HMR connected');
      clearTimeout(reconnectTimer);
    };
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleHMRMessage(data);
    };
    ws.onclose = () => {
      console.log('🔥 HMR disconnected, reconnecting...');
      reconnectTimer = setTimeout(connect, 1000);
    };
    ws.onerror = (error) => {
      console.error('HMR error:', error);
    };
  }
  function handleHMRMessage(data) {
    switch (data.type) {
      case 'hmr:update':
        updateModule(data.module);
        break;
      case 'css:update':
        updateCSS(data.url);
        break;
      case 'full-reload':
        window.location.reload();
        break;
    }
  }
  function updateCSS(url) {
    const links = document.querySelectorAll('link[rel="stylesheet"]');
    links.forEach(link => {
      if (link.href.includes(url)) {
        const newLink = link.cloneNode();
        newLink.href = url + '?t=' + Date.now();
        link.parentNode.insertBefore(newLink, link);
        link.remove();
      }
    });
  }
  async function updateModule(moduleId) {
    try {
      console.log('🔄 Updating module:', moduleId);
      saveState();
      const moduleUrl = moduleId + '?t=' + Date.now();
      const response = await fetch(moduleUrl);
      const code = await response.text();
      executeModule(moduleId, code);
      console.log('✅ Module updated:', moduleId);
    } catch (error) {
      console.error('❌ Error updating module:', error);
    }
  }
  function saveState() {
    if (window.stores) {
      Object.keys(window.stores).forEach(name => {
        window.__HMR_STATE__.stores.set(name, window.stores[name].get());
      });
    }
  }
  function executeModule(moduleId, code) {
    try {
      console.log('🔄 Executing cleanup for:', moduleId);
      if (window.__HMR_CLEANUP__ && window.__HMR_CLEANUP__.length > 0) {
        window.__HMR_CLEANUP__.forEach(function(cleanup) {
          try {
            cleanup();
          } catch (e) {
            console.warn('Error in cleanup:', e);
          }
        });
        window.__HMR_CLEANUP__ = [];
      }
      const oldScript = document.querySelector('script[data-module="' + moduleId + '"]');
      if (oldScript) oldScript.remove();
      const script = document.createElement('script');
      script.type = 'module';
      script.src = moduleId + '?t=' + Date.now();
      script.setAttribute('data-module', moduleId);
      script.onload = function() {
        console.log('✅ Module reloaded:', moduleId);
        setTimeout(function() {
          if (window.__HMR_STATE__ && window.__HMR_STATE__.stores && window.__HMR_STATE__.stores.size > 0) {
            window.__HMR_STATE__.stores.forEach(function(state, name) {
              if (window.stores && window.stores[name]) {
                window.stores[name].set(state);
              }
            });
          }
          if (moduleId.includes('/views/')) {
            const currentHash = window.location.hash.replace('#', '') || 'home';
            setTimeout(() => {
              console.log('🔄 Re-rendering view:', currentHash);
              if (window.__HMR_VIEWS__ && window.__HMR_VIEWS__[currentHash]) {
                try {
                  window.__HMR_VIEWS__[currentHash]();
                  console.log('✅ View re-rendered via __HMR_VIEWS__');
                  return;
                } catch (error) {
                  console.warn('⚠️ Error in __HMR_VIEWS__:', error);
                }
              }
              if (window.routes && window.routes[currentHash]) {
                try {
                  if (window.moduleCache) {
                    window.moduleCache.delete(currentHash);
                  }
                  window.routes[currentHash]().then(() => {
                    console.log('✅ View re-rendered via async routes');
                  }).catch(error => {
                    console.error('❌ Error re-rendering async view:', error);
                  });
                } catch (error) {
                  console.error('❌ Error re-rendering view:', error);
                }
              }
            }, 100);
          }
        }, 0);
      };
      script.onerror = function(error) {
        console.error('❌ Error reloading module:', moduleId, error);
      };
      document.head.appendChild(script);
    } catch (error) {
      console.error('❌ Error in executeModule:', error);
    }
  }
  connect();
})();
  `;
}

server.listen(PORT, () => {
  console.log(`🚀 HMR server running at http://localhost:${PORT}`);
  console.log('📁 Monitoring file changes...');
});

process.on('SIGTERM', () => {
  console.log('Shutting down server...');
  watcher.close();
  wss.close();
  server.close();
});
