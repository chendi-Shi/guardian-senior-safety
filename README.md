---
title: Guardian 银盾陪护
emoji: 🛡️
colorFrom: green
colorTo: blue
sdk: docker
app_port: 7860
fullWidth: true
short_description: 在危险动作前提醒，面向老人的数字安全带
---

# Guardian 银盾陪护

老年人的数字安全带。持续跟踪对话如何诱导危险动作，在值得打扰的时刻给出具体提醒。

这是可运行的黑客松 MVP，包含网页演示、四层算法、可选在线模型适配器、公开测试脚本与答辩材料。默认使用本地规则，不需要安装依赖或填写 API Key。

源码仓库：[chendi-Shi/guardian-senior-safety](https://github.com/chendi-Shi/guardian-senior-safety)。

魔搭已上线的公开体验：[直接打开演示](https://kevin711-guardian-senior-safety.ms.show/) · [魔搭创空间](https://modelscope.cn/studios/kevin711/guardian-senior-safety)。已设置“仅公开体验”，应用可免登录访问，平台空间文件仅所有者可见。

Hugging Face 已上线的免费静态演示：[fall2028/guardian-senior-safety](https://huggingface.co/spaces/fall2028/guardian-senior-safety)。仓库和 Space 当前都设置为私有，需使用有权限的账号访问。

## 30 秒启动

需要 Node.js 20.6 或更高版本。在项目文件夹内运行：

```sh
node server.mjs
```

打开 <http://127.0.0.1:4173/>。Windows 也可以双击 `start.cmd`。请通过本地服务访问；直接双击 HTML 可能因浏览器的模块加载限制而无法运行。

1. 选择「冒充客服 · 取消保障」。
2. 点击「播放演示」，或用「下一句」控制节奏。
3. 第 4 句显示安装软件提醒，并预测共享屏幕。
4. 第 5 句风险升至 95，老人端提示「请不要共享屏幕」。
5. 点击「请家人帮我确认」，再点击「模拟：我已陪同核实」。

勾选「语音提醒」可播放浏览器 TTS。中文声音是否可用取决于浏览器和系统；无声时以屏幕提醒为准。

## 已实现与边界

| 能力 | 状态 |
|---|---|
| 12 类行为信号、证据片段 | 本地规则已运行 |
| 有序对话图、风险更新、分级介入 | 已实现，参数未经真实数据校准 |
| 下一动作预测 | 图谱启发式权重，不是训练得到的概率 |
| 老人端、评委分析台、家属回应 | 可交互；家属流程仅在同一网页内模拟 |
| 在线模型特征提取 | 适配器与本地服务已实现；无真实密钥，未做供应商联调 |
| 真实电话 / STT | 未接入 |
| 自动挂断、屏幕共享 / 转账拦截 | 未实现 |
| “成功防止损失” | 没有真实操作与效果证据，不能如此宣称 |

默认网页不向模型发送输入，不持久保存对话。在线模式是可选项：只有本地服务配置完成才出现开关，选择后手动输入会发送最近最多 8 句至配置的模型服务。演示脚本始终使用本地规则，便于复现。语音提醒只包含安全建议；浏览器 / 系统可能使用其语音服务。

## 可选：接入真实语义模型

将 `.env.example` 复制为 `.env`，填入供应商完整 HTTPS 地址、模型名与自己的密钥；密钥仅保留在本地服务，不发送到网页、不纳入 Git 或交付包。

适配器使用 Chat Completions JSON 输出协议。可参考 [DeepSeek 官方接口](https://api-docs.deepseek.com/api/create-chat-completion/) 和 [JSON 模式说明](https://api-docs.deepseek.com/zh-cn/guides/json_mode/)。供应商需支持相应请求字段；不保证所有兼容服务完全一致。

```dotenv
GUARDIAN_LLM_URL=https://api.deepseek.com/chat/completions
GUARDIAN_LLM_MODEL=deepseek-v4-flash
GUARDIAN_LLM_KEY=在本地填入自己的密钥
```

```sh
node --env-file=.env server.mjs
```

服务配置后，网页输入框上方出现「手动输入使用在线模型提取」。只在清楚发送范围的情况下勾选，再试「短信里那六个数，念一遍」。模型仅返回特征，最终分数和策略仍由本地四层逻辑计算。超时或上游失败时明确提示回退本地规则；模型输出无效时不采纳。切换场景会丢弃旧请求返回，避免污染新会话。

也可单句运行：

```sh
node --env-file=.env scripts/model_demo.mjs "短信里那六个数，念一遍"
```

提供了模拟响应的接口测试，但没有真实在线模型成绩。当前 Sites 和 Hugging Face 演示都使用浏览器内规则；源码提供的 Docker 配置可运行完整 Node.js 服务，支持模型代理与健康检查，但当前未部署该后端。

## Hugging Face Spaces 部署

仓库含 Dockerfile 与 Space 元数据。容器以非 root 用户运行，监听 `0.0.0.0:7860`，健康检查为 `/healthz`。应用没有安装依赖或模型下载步骤。

在 Space 的 Settings 中可选配置：`GUARDIAN_LLM_URL` 和 `GUARDIAN_LLM_MODEL` 为 Variables，`GUARDIAN_LLM_KEY` 必须作为 Secret。没有密钥时完整规则演示仍可使用。网页只在服务报告配置完成后显示在线模型开关。

若使用自定义域名，在 `GUARDIAN_ALLOWED_ORIGINS` 填写精确 HTTPS origin，多个值以逗号分隔。平台提供的 `SPACE_HOST` 会自动加入允许列表。模型代理每实例最多同时处理 2 个请求、每分钟最多 30 次；它不是多用户鉴权系统，私有演示应保留 Space 的访问限制。

本地 Docker：

```sh
docker build -t guardian .
docker run --rm -p 7860:7860 guardian
```

免费静态演示包可运行 `node scripts/export-static.mjs` 生成到 `work/huggingface-static/`，将目录中的文件上传至 Static Space 根目录，保留 `core/` 子目录。静态包的 README 已设置 `sdk: static`，不要用仓库根目录的 Docker 元数据替换它。静态版明确关闭模型代理探测。导出器把同一份模块和样式内嵌到入口 HTML，减少私有 Space 内嵌页面中的额外认证资源请求；其余源码文件保留供查看。新增打包一致性测试覆盖四个演示场景的全部对话轮次。

2026-09-14 已在在线 Space 验证：客服场景风险分依次为 10、24、35、45、95，安装和共享请求分别触发提醒，家属模拟确认闭环可用；正常客服与反诈科普场景保持静默。Hugging Face 部署提交为 `f107a3015a53c4e9bbf99b164c684ff9d8a1596e`。

CPU Basic 无小时硬件费用，但 Hugging Face 当前文档要求个人账号具备 PRO 才能新建 Docker Space；实际资格以账号创建页面为准。不需要选择 GPU。参考 [Docker Spaces](https://huggingface.co/docs/hub/spaces-sdks-docker) 和 [Space 资格与硬件说明](https://huggingface.co/docs/hub/spaces-overview)。

## 魔搭创空间部署

运行 `node scripts/export-modelscope.mjs`，将 `work/modelscope-static/` 中的文件上传到创空间根目录。部署设置选择 **Static** 和免费资源，确认后发布；`ms_deploy.json` 提供初始配置，提交前仍需核对页面上的 SDK 类型。入口包含同一份规则模块、交互和样式，不依赖在线模型、外部前端资源或 API 密钥。

2026-09-14 已部署到 `kevin711/guardian-senior-safety`，平台状态为“运行中”，可见性为“仅公开体验”，OAuth 关闭。已验证五轮客服场景的风险分 10、24、35、45、95、屏幕共享提醒、家属模拟确认与重置。对 `https://kevin711-guardian-senior-safety.ms.show/` 的无 Cookie、无认证 HTTP 请求返回 200 和完整演示页面。上传的应用入口与已验证的 Hugging Face 版本字节相同。

## 核心结构

```text
dist/
  index.html, style.css, app.js    三种使用视图与演示交互
  scenarios.js                   四条现场演示脚本
  core/
    signal_extractor.js          本地规则提取、否定过滤、特征校验
    scam_graph.js                有序证据图和动作预测
    risk_engine.js               动态风险、危险动作下限
    intervention_policy.js       介入强度、提醒保留与去重
    guardian.js                  会话状态与导出
providers/llm_extractor.mjs       可替换的在线模型特征层
server.mjs                       本地静态服务及模型代理
tests/                           核心及接口契约测试
evaluation/                      50 条开发样本、逐例结果、评估报告
docs/                            参赛方案、演示稿、答辩与接口约定
```

沿用原思路的四层职责，统一使用 JavaScript，使浏览器、测试与本地服务共用一份核心代码。

## 验证

```sh
node scripts/test.mjs
node scripts/evaluate.mjs
```

核心 18 项、接口契约 3 项、部署服务 4 项、静态打包 2 项，共 27 项测试。服务测试涵盖首页、健康检查、未配置模型、Space 来源校验和请求验证；不代表已在本地运行 Docker 构建。50 条开发脚本结果见 `evaluation/REPORT.md`。Guardian 在 20 条危险场景中有 15 条在脚本假定执行前给出目标动作提醒，另外 5 条隐晦表达漏检。正常 20 条与边界 10 条没有主动提醒误扰。该数据由本项目编写，没有独立测试集，不能作为真实防护率。

## 参赛材料

- `docs/参赛方案.md`：定位、创新假设、算法、48 小时分工、真实接入路线。
- `docs/演示与答辩.md`：3 分钟路演逐字稿、1 分钟操作流程、8 页演示文稿提纲、问答。
- `docs/接口与评估.md`：特征、数据契约、BHAR 严格定义、后续实验。

本项目没有替代国家反诈中心或官方求助渠道的定位。现有国家级产品能力以官方公开资料为准，未进行同条件竞品效果对照。
