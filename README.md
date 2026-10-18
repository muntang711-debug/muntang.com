# 문탕닷컴

문탕이의 유튜브 채널과 영상 링크를 한곳에서 보여 주는 개인 웹사이트입니다.

- 채널 색상: `#FF7700`
- 런타임: Cloudflare Workers
- 소스: `worker.js`
- 배포 설정: `wrangler.jsonc`

## 링크

- YouTube 채널: https://www.youtube.com/@%EB%AC%B8%ED%83%95%EC%9D%B4
- 추천 영상 01: https://youtu.be/5D9M7hhDNlY
- 추천 영상 02: https://www.youtube.com/watch?v=JupaczQCTFk&t=1s

## 개발 및 배포

Node.js가 설치된 환경에서 아래 명령어를 실행합니다.

```bash
npm install --save-dev wrangler
npx wrangler deploy
```

Cloudflare Workers Builds를 사용하는 경우 저장소의 `main` 브랜치를 연결하고 배포 명령을 `npx wrangler deploy`로 설정합니다. `wrangler.jsonc`의 Worker 이름은 Cloudflare Worker 이름인 `muntang-com`과 일치해야 합니다.

## 프로젝트 구조

```
.
├── worker.js
├── wrangler.jsonc
├── README.md
└── .gitignore
```
