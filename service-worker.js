// 定义缓存名称和版本
const CACHE_NAME = 'zaizai-app-v1';

// 需要缓存的资源列表
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

// 安装Service Worker并缓存资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('已打开缓存');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// 激活Service Worker并清理旧缓存
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => self.clients.claim())
  );
});

// 拦截网络请求并从缓存中返回资源
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 如果缓存中有匹配的资源，返回缓存的资源
        if (response) {
          return response;
        }
        // 否则，发起网络请求
        return fetch(event.request).then(
          (response) => {
            // 检查响应是否有效
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // 克隆响应，因为响应流只能使用一次
            const responseToCache = response.clone();

            // 将响应添加到缓存中
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// 处理推送通知（可选）
self.addEventListener('push', (event) => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: 'https://file.icve.com.cn/file_doc/qdqqd/9531768740766697.jpg',
    badge: 'https://file.icve.com.cn/file_doc/qdqqd/9531768740766697.jpg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 处理通知点击事件
self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const action = event.action;

  if (action === 'close') {
    notification.close();
  } else {
    event.waitUntil(
      clients.matchAll({type: 'window'}).then((clientList) => {
        // 如果已经有打开的窗口，聚焦到该窗口
        for (const client of clientList) {
          if (client.url === './index.html' && 'focus' in client) {
            return client.focus();
          }
        }
        // 否则，打开一个新窗口
        if (clients.openWindow) {
          return clients.openWindow('./index.html');
        }
      })
    );
  }
});
