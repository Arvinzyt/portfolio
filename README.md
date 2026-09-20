# 作品集网站（GitHub Pages + Decap CMS）

免托管费、带可视化编辑后台的单页作品集网站。

```
├── index.html          页面结构
├── styles.css          样式
├── main.js             内容渲染与动效
├── content/
│   ├── site.yml        站点文案（关于、能力、联系等）
│   └── projects.yml    项目列表
├── images/uploads/     图片（后台上传的图片也存这里）
├── admin/              可视化编辑后台（/admin）
└── .nojekyll           让 GitHub Pages 原样托管
```

所有文字、项目、图片都在 `content/` 里，**不需要改代码**。

## 绑定自己的域名

1. 在仓库根目录新建名为 `CNAME` 的文件（无扩展名），内容只有一行你的域名，例如 `www.example.com`。
2. 域名 DNS 加记录：
   - 子域名（如 www）：**CNAME** 指向 `Arvinzyt.github.io`
   - 根域名：**A** 记录指向 `185.199.108.153` `185.199.109.153` `185.199.110.153` `185.199.111.153`
3. 仓库 Settings → Pages → Custom domain 填域名，DNS 检查通过后勾选 **Enforce HTTPS**。

## 使用可视化后台（/admin）

### 方式 A：本地编辑（零配置）

装好 Node.js 后在项目文件夹运行：

```bash
npx decap-server     # 终端 1
npx serve .          # 终端 2
```

打开 `http://localhost:3000/admin` 直接编辑，保存即写入本地文件，`git push` 后网站自动更新。

### 方式 B：浏览器在线编辑

配置免费的 OAuth 桥（DecapBridge 或 Cloudflare Workers 自托管 decap-cms-github-oauth），
在 `admin/config.yml` 的 `base_url` 填入桥地址，之后打开 `/admin` 用 GitHub 登录即可。
