# 문탕닷컴

문탕이의 영상과 제작 과정을 소개하는 Cloudflare Workers 사이트입니다.

- 한국어: https://muntang.com/
- 영어: https://muntang.com/en/
- www와 HTTP 요청은 경로·쿼리를 유지하며 HTTPS 루트 도메인으로 이동합니다.

## 개발과 검증

Node.js 22 이상을 사용합니다. 의존성과 전이 의존성은 package-lock.json에 고정합니다.

```sh
npm ci
npm run dev
```

로컬 주소는 Wrangler가 출력합니다. dev는 localhost 호스트를 사용하므로 운영 도메인의 HTTPS 리다이렉트와 충돌하지 않습니다.

```sh
npm run check
npm test
npx wrangler deploy --dry-run
npm run smoke -- http://localhost:8787
```

npm test는 먼저 배포 산출물을 빌드하고 회귀 검사를 실행합니다. HTTP smoke 검사는 실행 중인 서버에 대해 별도로 수행합니다.

## 배포

GitHub main 푸시 → Cloudflare Workers Builds로 자동 배포합니다. 빌드 명령은 npm run check && npm test, 배포 명령은 npx wrangler deploy입니다. 수동 배포는 npm run deploy를 사용합니다.

public/은 원본이며 dist/는 생성 결과입니다. 빌드 시 JavaScript·CSS를 묶고 최소화한 뒤 내용 해시가 포함된 파일명으로 바꿉니다. HTML은 매번 재검증하고 버전이 고정된 자산만 장기 캐시합니다. 헤더와 대표 호스트 처리는 worker.js에서 수행합니다.

## 영상 데이터

lib/youtube.js는 공개 채널의 동영상·쇼츠 페이지, RSS, oEmbed를 수집합니다. YouTube 내부 페이지 구조는 변경될 수 있습니다. 요청과 본문 읽기에는 시간·크기 제한이 있으며 실패는 구조화 로그에 기록합니다. 채널 ID는 UC6XrgnovmMLGkfLDYEUbHww입니다.

lib/catalog.js는 언어·종류·페이지 토큰만으로 캐시 키를 구성합니다. 정상 데이터는 5분간 최신으로 취급하고 최대 7일간 보존합니다. 오래된 데이터는 반환한 뒤 waitUntil로 다시 수집합니다. 첫 요청이나 장애에는 data/의 마지막 확인 목록을 stale 상태로 제공합니다. 실패 결과를 최신 정상 목록으로 캐시하지 않습니다. 페이지 수집 실패는 목록 끝과 구분합니다.

검색은 화면에 불러온 목록 안에서 동작하며 범위를 표시합니다. 동영상과 쇼츠의 다음 페이지 토큰은 각각 관리합니다. 번역된 제목은 YouTube에서 제공하는 경우에만 표시하며 임의로 번역하지 않습니다.

저장된 초기 목록은 다음 명령으로 갱신한 뒤 변경 내용을 검토하고 커밋합니다.

```sh
npm run snapshot
```

한국어·영어 페이지는 빌드 시 각각 생성됩니다. 영상 제목과 링크도 초기 HTML에 있으므로 JavaScript가 없어도 읽고 YouTube에서 열 수 있습니다. 구조·번역은 public/index.html과 lib/translations.js에서 수정합니다.

## 화면과 접근성

메인 영상은 이전·다음·일시정지를 지원합니다. 화면 밖, 키보드 카드 포커스, 메뉴 열림, 팝업 재생 및 동작 감소 설정에서 자동 전환을 멈춥니다. LDM에서는 이동 효과 없이 전환합니다. 첫 화면과 영상 목록은 원래 디자인의 팝업 플레이어로 재생하며, 닫기·배경 클릭·Escape와 포커스 복귀를 지원합니다. 모바일·LDM·동작 감소 모드의 제작 과정은 세로 목록입니다.

Pretendard 1.3.9의 가변 동적 서브셋을 사용하며 필요한 문자 범위만 CDN에서 받습니다. 원본 글꼴 라이선스는 public/fonts/LICENSE.txt에 있습니다.

## 구조

- worker.js: 라우팅·보안·응답 캐시 정책
- lib/: 영상 수집·캐시·파서·빌드용 번역
- public/: 화면·상호작용·WebGL·폰트 정의
- data/: 마지막 확인 영상 목록
- scripts/: 빌드·구문 검사·HTTP 검사·목록 갱신
- tests/: 장애·캐시·언어·페이지 처리 회귀 검사
- .github/workflows/: 푸시/PR 검증
