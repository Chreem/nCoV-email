# 积累变强（tu）

## 目录结构

```md
chreem-blog-firebase
├── .babelrc
├── .firebaserc
├── README.md
├── components                      // 共用组件
│   └── hoc
│       └── StoreReceiver.tsx
├── config                          // webpack配置
│   ├── .babelrc                    // webpack.conf使用babel转义
│   ├── react.ejs                   // react热重载模板
│   └── webpack.conf.js
├── firebase.json
├── package-lock.json
├── package.json
├── postcss.config.js
├── public                          // Firebase所需最终生成目录
├── src
│   ├── .version                    // 版本控制
│   ├── app.tsx
│   ├── index.js
│   ├── index.template.html
│   └── style.less
├── tsconfig.json
└── webpack.config.js
```

## Webpack配置

使用：  

```js
const fs = require('fs');
const path = require('path');

// 配置文件使用了proposal-class-properties，以及其他node尚未支持的es语法
require('@babel/register')(JSON.parse(fs.readFileSync('./config/.babelrc')));
const WebpackConfig = require('./config/webpack.conf.js');
const config=new WebpackConfig('path/to/your/project');

/* api */
config.react('reactEnterPoint.tsx', { tsx:true });

config.addHtmlPlugin('second.page.template.html', 'second.html');
config.setDistPath(path.resolve(__dirname, './public'));
config.setBase64MaxSize(1024);
// 叠加or替换
config.lib('react', 'React');           // externals: {'react':'React'}
config.lib('react-dom', 'ReactDOM');    // externals: {'react':'React','react-dom':'ReactDOM'}
config.lib({'jquery':'jQuery'})         // externals: {'jquery':'jQuery'}  // jquery would replace react?

/* export */
config.dev({ browserSync:true })
config.prod('http://static.your.domain.or.cdn', {
    extractCSS: true, removeOld: true, version: true
})

```