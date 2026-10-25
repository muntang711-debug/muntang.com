# 문탕닷컴

문탕이의 영상과 제작 과정을 소개하는 Cloudflare Workers 사이트입니다.

- 한국어: https://muntang.com/
- 영어: https://muntang.com/en/
- MLL (Muntang Level List): https://muntang.com/mll
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

## MLL 데몬리스트

메뉴는 `lib/navigation.js` 한 곳에서 생성하며 같은 언어의 메인·MLL 목록·맵 상세 페이지 모두 동일한 카테고리와 링크를 표시합니다. 문탕닷컴 아래에 제작 과정·자막·전체 영상, MLL 아래에 데몬리스트를 배치하고 공통 LDM·외부 링크를 제공합니다. 메뉴 패널 크기는 유지합니다.

목록은 `/mll`, 개별 맵 정보는 `/mll/1`~`/mll/150`에서 표시합니다. 영어 상세 주소는 `/en/mll/1`~`/en/mll/150`입니다. 상세 페이지 언어 전환은 현재 순위를 유지합니다. 목록과 상세에 최근 확인 시간을 짧게 표시하고 전체 확인 일시·동기화 주기는 시간 위에 마우스를 올리면 확인할 수 있습니다. MLL 메뉴에는 번호를 붙이지 않으며 메인 사이트 메뉴의 MLL 링크도 페이지 내부 메뉴와 분리합니다.

`/mll`(한국어), `/en/mll`(영어)은 Muntang Level List의 별도 진입점입니다. 메인 페이지의 헤더·메뉴 스타일을 재사용하며 MLL 전용 브랜드·메뉴·언어 전환·LDM을 제공합니다. 레벨명, 업로더, 베리파이어, ID 검색은 일치 부분을 강조합니다. 레벨 선택 시 개별 상세 페이지로 이동해 유튜브 영상을 직접 재생하고, Pointercrate 바로가기는 내부 ID 대신 순위를 사용합니다.

`lib/demonlist.js`가 공식 `/api/v2/demons/listed/` API를 사용합니다. Rated+ 도입 후 API의 `position`에는 미레이트 레벨도 포함되므로, 실제 Demonlist 순위인 `rated_position`을 사용합니다. 각 요청은 남은 순위 수만큼만 가져와 실제 Demonlist 151위 이후는 조회·비교·저장하지 않습니다. 현재 목록에서는 3회 요청으로 150개를 수집하며 미레이트 항목은 저장하지 않습니다. 순위 연속성·고유 ID·페이지 완전성을 검증한 뒤 전체 목록을 교체하고 실패 시 기존 데이터를 보존합니다.

Cron Trigger (`*/5 * * * *`)가 방문자 유무와 관계없이 5분마다 동기화해 `MLL_DATA` KV에 저장합니다. 순위·표시 정보가 같으면 `updatedAt`을 유지하고 `checkedAt`만 갱신합니다. `/api/mll`은 저장된 데이터를 읽으며, 저장소가 비어 있는 첫 실행에서는 공식 API로 초기화합니다. 화면도 5분마다 자체 API를 다시 읽습니다. KV 전파에 따라 표시에는 추가 지연이 있을 수 있습니다.

순위 데이터는 코드나 빌드 결과에 포함하지 않습니다. 브라우저는 첫 진입부터 `/api/mll`을 통해 실제 API 기반 데이터를 가져옵니다. 동기화 장애에는 KV의 마지막 정상 목록을 유지하고 갱신 지연을 표시합니다. 저장된 데이터도 읽을 수 없으면 503 및 재시도 UI를 제공합니다. 정상 상태에는 동기화 안내 줄을 표시하지 않습니다.

배포 시 Wrangler 자동 프로비저닝이 `MLL_DATA` KV를 생성하고 연결합니다. 기존 네임스페이스 재사용 시 `kv_namespaces`에 해당 `id`를 설정합니다. 개발은 로컬 KV를 사용하고 운영 동기화는 배포 후 시작됩니다. Cron 설정 전파에는 시간이 걸릴 수 있습니다.

```sh
npx wrangler dev --host localhost --test-scheduled
curl "http://localhost:8787/cdn-cgi/local/scheduled?cron=*/5+*+*+*+*"
curl http://localhost:8787/api/mll
```

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
