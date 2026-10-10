# 鹿安东 / Andong Lu — Academic Homepage

静态学术主页，继续使用 GitHub Pages 部署。修改主分支会触发现有 Pages 工作流。

## 页面维护

- `index.html`：个人介绍、近期动态、研究方向与成果列表。
- `style.css`：浅色背景、绿色学术风格与电脑/手机布局。
- `script.js`：手机导航、按年份筛选和关键词检索。正文在 JavaScript 关闭时也保持可读。
- `assets/`：原始配图、静态框架图和保留的 PDF。框架图 PNG 由原站 PDF 渲染；SCDT 提取第一页中的 Figure 2 区域。
- 新增论文时，在 `article.publication` 上填写 `data-year`，并同步更新年份筛选与回归测试的数量。

## PDF 下载行为

主页只通过 `img` 加载静态图片。原始框架图 PDF 只放在普通 `a href` 链接中，点击后打开。
不要把 PDF 放进 `iframe`、`object`、`embed`、预加载标签，也不要在页面加载时点击链接或请求 PDF。
浏览器可能在用户主动点击 PDF 后下载文件，取决于其阅读器设置；加载主页不会请求这些 PDF。

## 成果资料（2026-10-10 核对）

保留原站已有论文与作者资料，新增以下条目：
- PMATrack，CVPR 2026：<https://openaccess.thecvf.com/content/CVPR2026/html/Jin_Progressive_Multi-cue_Alignment_for_Unaligned_RGBT_Tracking_CVPR_2026_paper.html>
- Multi-Modal Template Update，TIP 2026，35:6026–6040：<https://doi.org/10.1109/TIP.2026.3698355>；书目交叉核对：<https://dblp.org/rec/journals/tip/LiuLLZHCL26>
- QuadFusion / QuadTrack600，明确标为 2025 预印本：<https://arxiv.org/abs/2503.11218>
- 补充 SCDT 的公开论文页、页码与 arXiv 链接：<https://openaccess.thecvf.com/content/CVPR2026/html/Lu_Spatio-Temporal_Conditional_Denoising_Transformer_for_Modality-Missing_RGBT_Tracking_CVPR_2026_paper.html>；<https://arxiv.org/abs/2607.24701>
- 原站 TPF 条目的书目信息核对：<https://dblp.org/rec/journals/tip/LuGWLTL26>

## 本地预览与验证

无需构建即可部署；依赖仅用于浏览器验证。

```text
python -m http.server 8000
npm install
npx playwright install chromium
npm test
```

测试会启动临时本地服务器，检查：
- 首次访问、滚动所有配图和筛选时，PDF 请求及下载均为零；
- 14 项成果，2026 / 2025 / 更早年份分别为 4 / 5 / 5；
- 关键词检索、无结果提示、手机导航、Escape 关闭；
- 320、390、1440 像素宽度无横向溢出；
- 图片可解码、无缺失本地资源、无页面脚本错误；
- 关闭 JavaScript 后成果与导航仍可见。

预览图与检查结果写入 `.test-artifacts/`。可通过 `ARTIFACT_DIR` 修改位置。
如需本机 Chrome/Edge，可通过 `BROWSER_EXECUTABLES` 提供浏览器名称与可执行文件路径数组；`PLAYWRIGHT_MODULE` 可指定现有 Playwright 模块位置。
