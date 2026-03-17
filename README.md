# Speak Again 再說話 / 再说话

A compassionate speech therapy app for stroke patients, built with love for elderly users.

## Features

- 🗣️ **Speech Practice** — Record your voice, get instant AI-powered feedback on pronunciation
- 🖼️ **AAC Picture Board** — Augmentative & Alternative Communication using emoji-rich picture boards
- 🧠 **Cognitive Exercises** — Word-picture matching, naming, sentence completion games
- 📷 **Gesture Camera** — Point your camera and tap what you need from a quick-pick menu
- 📊 **Progress Tracking** — Streaks, accuracy trends, weekly charts
- ⚙️ **Fully Configurable** — Change language, font size, AI provider, speech provider

## Language Support

| Code | Language |
|------|----------|
| `en` | English |
| `zh-TW` | Traditional Chinese (繁體中文) |
| `zh-CN` | Simplified Chinese (简体中文) |

## AI Provider Support

The app is designed to work **in China without VPN** by default, with the ability to upgrade providers as funding allows:

| Provider | China Access | Free Tier | Notes |
|----------|-------------|-----------|-------|
| **Offline** (default) | ✅ | ✅ Free | No API key needed |
| **Baidu ERNIE** | ✅ | ✅ 50M tokens/mo | Best for China |
| **Alibaba Tongyi** | ✅ | ✅ Free quota | Great quality |
| **OpenAI GPT** | ⚠️ VPN needed | ❌ Paid | Premium quality |

## Speech Recognition

| Provider | China Access | Notes |
|----------|-------------|-------|
| **Device Built-in** (default) | ✅ | iOS/Android native |
| **Baidu ASR** | ✅ | 50,000 req/month free |

## Design Philosophy

Built specifically for elderly stroke patients (60+):
- **Large text** (minimum 20px, scalable to 1.5×)
- **Big touch targets** (minimum 48px height)
- **Simple navigation** (clear emoji icons)
- **High contrast** option
- **Vibration feedback** on button press
- **Slow speech** mode for text-to-speech

## Setup

```bash
npm install
npx expo start
```

## Configuration

Open the app → Settings to:
1. Choose your language (English / 繁體中文 / 简体中文)
2. Set text size
3. Configure AI provider (start with Offline, add API key when ready)
4. Configure speech recognition provider

## Upgrading AI

When funding is available, upgrade seamlessly:
1. Go to Settings → AI Provider
2. Select Baidu ERNIE or Alibaba Tongyi
3. Enter your API key
4. The app immediately uses the upgraded AI

## Built With

- [Expo](https://expo.dev) / React Native
- [expo-router](https://expo.github.io/router) for navigation
- [i18next](https://www.i18next.com/) for internationalization
- [Zustand](https://zustand-demo.pmnd.rs/) for state management
- [expo-av](https://docs.expo.dev/versions/latest/sdk/av/) for audio recording
- [expo-camera](https://docs.expo.dev/versions/latest/sdk/camera/) for gesture detection
- [expo-speech](https://docs.expo.dev/versions/latest/sdk/speech/) for text-to-speech
