# 문탕닷컴

문탕이의 유튜브 채널과 영상을 한곳에서 보여 주는 개인 웹사이트입니다.

- 채널 색상: `#FF7700`
- 런타임: Cloudflare Workers
- 프론트엔드: `public/index.html`, `public/styles.css`, `public/script.js`
- 백엔드 API: `worker.js`
- 정적 자산·배포 설정: `wrangler.jsonc`

## 링크

- YouTube 채널: https://www.youtube.com/@%EB%AC%B8%ED%83%95%EC%9D%B4
- 추천 영상 01: https://youtu.be/5D9M7hhDNlY
- 추천 영상 02: https://www.youtube.com/watch?v=JupaczQCTFk&t=1s
- 사이트 미리보기: https://muntang-com.muntang711.workers.dev

## YouTube 영상 정보

사이트는 공개 YouTube oEmbed 메타데이터를 이용해 지정한 영상의 제목과 썸네일을 가져옵니다. 채널의 최근 업로드는 공개 RSS 피드에서 불러옵니다. API 키나 유료 외부 서비스가 필요하지 않습니다.

- 메타데이터 경로: `/api/youtube`
- 제목이나 공개 피드를 가져올 수 없는 경우 임의의 제목을 만들어 표시하지 않고 기본 링크를 유지합니다.

## 자동 배포

이 저장소의 `main` 브랜치는 Cloudflare Workers Builds에 연결되어 있습니다. 커밋을 푸시하면 Cloudflare가 저장소 루트의 `wrangler.jsonc` 설정을 사용해 자동으로 빌드하고 배포합니다.

- Worker 이름: `muntang-com`
- 배포 명령: `npx wrangler deploy`

## 로컬 개발 및 수동 배포

Node.js가 설치된 환경에서 아래 명령어를 실행합니다.

```bash
npm install --save-dev wrangler
npx wrangler deploy
```

## 프로젝트 구조

```
.
├── worker.js              # YouTube API 및 백엔드 라우팅
├── wrangler.jsonc         # Cloudflare Workers 설정
├── public/
│   ├── index.html         # 페이지 구조
│   ├── styles.css         # 디자인·반응형·애니메이션
│   ├── script.js          # 상호작용·영상·LDM 로직
│   └── _headers           # 정적 자산 보안·캐시 헤더
├── README.md
└── .gitignore
```
