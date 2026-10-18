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

## 자동 배포

이 저장소의 `main` 브랜치는 Cloudflare Workers Builds에 연결되어 있습니다. `main`에 커밋을 푸시하면 Cloudflare가 저장소 루트의 `wrangler.jsonc` 설정을 사용해 자동으로 빌드하고 배포합니다.

- Worker 이름: `muntang-com`
- 배포 명령: `npx wrangler deploy`
- 미리보기 주소: https://muntang-com.muntang711.workers.dev

## 로컬 개발 및 수동 배포

Node.js가 설치된 환경에서 아래 명령어를 실행합니다.

```bash
npm install --save-dev wrangler
npx wrangler deploy
```

## 프로젝트 구조

```
.
├── worker.js
├── wrangler.jsonc
├── README.md
└── .gitignore
```
