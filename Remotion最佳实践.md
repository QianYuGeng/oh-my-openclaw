# Remotion Skills 最佳实践指南

> 本文档整理自 ClawHub 上的 Remotion Skills 和官方文档
> 更新时间：2026-02-24

---

## 什么是 Remotion？

Remotion 是一个用 React 开发视频的工具库，让你能够用代码创建专业视频。支持：
- 个性化视频批量生成（如 Spotify Wrapped）
- 自动化社交媒体剪辑
- 动态广告和营销视频
- 数据可视化视频
- TikTok/Reels 字幕
- 产品展示视频
- 教育内容

---

## 必备 Skills

### 1. Remotion Video Toolkit ⭐⭐⭐⭐⭐
**作者**: @shreefentsar | **下载**: 4.2k
- 完整的 Remotion + React 视频创作工具箱
- 包含 29 条规则，覆盖所有主要功能
- 安全扫描：通过

**安装命令**:
```bash
npx clawhub install remotion-video-toolkit
```

### 2. Remotion Best Practices ⭐⭐
**作者**: @am-will | **下载**: 1.7k
- Remotion 最佳实践指南

---

## 环境要求

| 依赖 | 版本要求 |
|------|----------|
| Node.js | 18+ |
| React | 18+ |
| FFmpeg | 内置（随 @remotion/renderer） |

**初始化项目**:
```bash
npx create-video@latest my-video
cd my-video
npm run dev
```

---

## 核心操作方法

### 1. 渲染视频

**CLI 渲染**:
```bash
npx remotion render src/index.ts MyComposition out/video.mp4
```

**传递动态数据**:
```bash
npx remotion render src/index.ts MyComposition out.mp4 --props '{"title": "Hello"}'
```

**Node.js API 渲染**:
```javascript
import { renderMedia, serveStatic } from '@remotion/renderer';

const inputProps = { title: 'Hello', subtitle: 'World' };
await renderMedia({
  composition,
  serveUrl,
  outputPath: 'out/video.mp4',
  inputProps,
});
```

### 2. 渲染方式

| 方式 | 用途 |
|------|------|
| CLI | 快速预览、单次渲染 |
| Node.js API | 集成到现有应用 |
| AWS Lambda | 无服务器大规模渲染 |
| Cloud Run | GCP 无服务器渲染 |
| Express Server | 作为 HTTP 服务暴露 |

### 3. Compositions（组合）

定义视频、静态图、文件夹、默认属性：
```javascript
import { Composition } from 'remotion';

export const MyVideo = () => {
  return (
    <Composition
      id="MyVideo"
      durationInFrames={60}
      fps={30}
      width={1920}
      height={1080}
      component={MyComponent}
      defaultProps={{ title: 'Hello' }}
    />
  );
};
```

### 4. 动画与时序

**基本动画**:
```javascript
import { animate } from 'remotion';

// 淡入
<animated.div style={{ opacity: animate(0, 1) }} />

// 缩放
<animated.div style={{ transform: animate(0, scale(1.5)) }} />

// 旋转
<animated.div style={{ rotate: animate(0, '0deg') }} />
```

**时序控制**:
```javascript
// 插值曲线
import { interpolate, Easing } from 'remotion';

const opacity = interpolate(frame, [0, 30], [0, 1], {
  easing: Easing.bezier(0.8, 0, 0.2, 1),
  extrapolate: 'clamp',
});

// 弹簧物理
import { spring } from 'remotion';
const scale = spring({ frame, fps, config: { damping: 15 } });
```

### 5. 文字动画

**打字机效果**:
```javascript
import { useText } from 'remotion';

const text = useText({
  text: 'Hello World',
  charsVisible: frame,
});
```

**词高亮**:
```javascript
import { Word } from 'remotion';
<Text>{words.map((word) => (
  <Word
    style={{
      color: frame >= word.start && frame <= word.end ? 'red' : 'white'
    }}
  >
    {word.text}
  </Word>
))}</Text>
```

### 6. 媒体处理

**嵌入视频**:
```javascript
import { Video } from 'remotion';

<Video
  src="intro.mp4"
  startFrom={0}
  endAt={60}
  playbackRate={1}
  volume={0.5}
/>
```

**处理音频**:
```javascript
import { Audio } from 'remotion';

<Audio
  src="background.mp3"
  startFrom={0}
  volume={0.3}
/>
```

**图片**:
```javascript
import { Img } from 'remotion';

<Img src="logo.png" />
```

### 7. 字幕处理

**TikTok 风格词级高亮字幕**:
```javascript
// 使用 Whisper/Deepgram/AssemblyAI 转录
// 然后显示词级时间戳
<Text>
  {captionWords.map((word) => (
    <span style={{
      color: frame >= word.start && frame <= word.end ? '#FFD700' : 'white'
    }}>
      {word.text}{' '}
    </span>
  ))}
</Text>
```

### 8. 数据可视化

**图表**:
```javascript
// 使用 SVG 或专门的图表库
<svg>
  {data.map((item, i) => (
    <rect
      x={i * barWidth}
      height={item.value}
      width={barWidth - 2}
      fill="steelblue"
    />
  ))}
</svg>
```

### 9. 3D 内容

```javascript
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

<Canvas>
  <mesh>
    <boxGeometry />
    <meshStandardMaterial color="blue" />
  </mesh>
  <OrbitControls />
</Canvas>
```

### 10. TailwindCSS 集成

```bash
npm install tailwindcss postcss autoprefixer
npx tailwindcss init
```

在 Remotion 项目中使用 Tailwind 类名即可。

---

## 文件结构

典型 Remotion 项目结构：
```
my-video/
├── src/
│   ├── index.tsx          # 入口文件
│   ├── HelloWorld/
│   │   └── index.tsx     # 视频组件
│   └── assets/            # 静态资源
├── package.json
├── remotion.config.ts     # 配置文件
└── tsconfig.json
```

---

## 常见问题

### Q: Windows 上渲染失败？
A: 确保安装 WSL2 或使用 WSL 进行渲染

### Q: 如何处理中文字体？
A: 使用 `loadFont()` 加载本地字体或 Google Fonts

### Q: 如何实现无限循环？
A: 使用 `useVideoConfig()` 获取配置，用模运算处理循环

### Q: 如何渲染批量视频？
A: 通过 `--props` 传递 JSON 数据，用脚本循环调用渲染命令

---

## 相关资源

- 官方文档: https://www.remotion.dev/docs
- GitHub: https://github.com/remotion-dev/remotion
- Discord: https://remotion.dev/discord
- Prompt Gallery: https://remotion.dev/prompts
- ClawHub Skill: https://clawhub.ai/shreefentsar/remotion-video-toolkit

---

*本指南基于 Remotion Video Toolkit (v1.4.0) 和官方文档整理*
