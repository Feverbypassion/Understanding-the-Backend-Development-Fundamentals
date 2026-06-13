# Docs Revision Review Report - 2026-06-13

검토 대상: `docs/*.md` 15개 문서  
기준 문서:

- `/Users/chris/Downloads/00_global_revision_guide.md`
- `/Users/chris/Downloads/00_chapter_role_map.md`
- `/Users/chris/Downloads/00_document_revision_workflow.md`
- `/Users/chris/Downloads/00_chapter_revision_plan_template.md`

검토 기준일: 2026-06-13

## 1. 전체 결론

전체 문서는 정책 문서의 큰 방향과 잘 맞습니다. 특히 초보자용 개념 설명, 게임 백엔드와 일반 웹 백엔드의 연결, 직접 구현보다 학습 실습 중심으로 안내하는 방식은 전반적으로 일관됩니다.

큰 구조 문제는 발견하지 못했습니다.

- 모든 문서에 H1이 1개씩 있습니다.
- 모든 문서의 코드 fence가 닫혀 있습니다.
- H2 번호 체계는 장 번호와 맞습니다.
- 모든 장에 `Learning Practice`, `Quiz`, `Further Reading` 섹션이 있습니다.
- Quiz의 Question/Answer/Explanation 개수도 장별로 맞습니다.
- 정책상 금지된 Godot dice game 의존성, production-ready 구현 약속, 과한 실전 구현 과제 흐름은 발견하지 못했습니다.

다만 다음 항목은 수정하면 문서 품질이 더 좋아집니다.

- H3 번호 사용 방식이 장마다 다릅니다.
- 일부 `Learning Practice` H2 제목이 정책의 표준 섹션명보다 길게 작성되어 있습니다.
- 일부 예제가 초보자에게 잘못된 API 권한 모델을 암시할 수 있습니다.
- Chapter 8의 `clientRunId` 표현은 앞뒤 장의 서버 신뢰 모델과 약간 충돌합니다.
- Chapter 7의 ledger 설명은 실제 운영 감사 로그 관점에서 오해될 수 있습니다.
- Chapter 9, 15에는 최신성 확인 문구가 더 명확해야 합니다.
- 일부 영어 표현은 의미는 통하지만 문서 내부 용어처럼 느껴지거나 번역투처럼 보일 수 있습니다.

## 2. Markdown 구조 검사

### 2.1 자동 검사 결과

| 검사 항목 | 결과 | 비고 |
| --- | --- | --- |
| 문서 수 | 15개 | `docs/*.md` |
| H1 개수 | 모든 문서 1개 | 정상 |
| H2 번호 체계 | 정상 | 장 번호와 일치 |
| 코드 fence | 모두 닫힘 | 정상 |
| `Learning Practice` 섹션 | 모든 문서 존재 | 일부 제목 형식만 조정 권장 |
| `Quiz` 섹션 | 모든 문서 존재 | 정상 |
| `Further Reading` 섹션 | 모든 문서 존재 | 정상 |
| Quiz Question/Answer/Explanation | 모든 문서에서 개수 일치 | 정상 |
| 내부 메타데이터 노출 | 발견 안 됨 | 정상 |
| Markdown 링크 | 대체로 정상 | 자동 링크 점검에서 명확한 404 없음 |

### 2.2 구조 수정 제안

| 위치 | 기존 내용 | 문제 | 새로운 제안 내용 |
| --- | --- | --- | --- |
| 여러 장 전체 | 일부 장은 H3에 `### 1.1.1`, `### 8.3.2`처럼 번호를 붙이고, 일부 장은 H3 번호가 없음 | 정책은 H2 번호를 요구하지만 H3 번호 정책은 불명확합니다. 장마다 다른 방식이라 웹 문서로 읽을 때 리듬이 달라집니다. | H2만 번호를 유지하고 H3는 번호 없는 제목으로 통일하는 것을 권장합니다. 예: `## 8.4 Matchmaking and Sessions`, `### Matchmaking Is More Than Picking Players` |
| `docs/02_backend_development_environment_and_tools.md:553` | `## 2.6 Learning Practice: Prepare a Simple Backend Learning Workspace` | 정책 문서는 섹션명을 `Learning Practice`로 고정하라고 안내합니다. 현재도 의미는 맞지만 장별 표준성과는 조금 다릅니다. | `## 2.6 Learning Practice`로 바꾸고, 다음 줄이나 H3에 `Prepare a Simple Backend Learning Workspace`를 둡니다. |
| `docs/13_dashboard_tools_and_admin_frontend.md:620` | `## 13.10 Learning Practice — Review a Remote Config Change Screen` | 같은 이유로 H2 제목이 표준 섹션명보다 깁니다. | `## 13.10 Learning Practice` + `### Review a Remote Config Change Screen` |
| `docs/15_future_of_backend_and_learning_paths.md:791` | `## 15.8 Learning Practice: Create a Three-Month Learning Plan` | 같은 이유로 H2 제목이 표준 섹션명보다 깁니다. | `## 15.8 Learning Practice` + `### Create a Three-Month Learning Plan` |
| `docs/06_understanding_your_first_backend.md:1010` | `### Self-Check` | 정책은 `Quiz` 중심을 선호하고 `Checkpoint`, `Self-Assessment` 류의 섹션을 피하라고 안내합니다. `Self-Check`는 금지어와 완전히 같지는 않지만 인상이 비슷합니다. | `### Suggested Review`, `### Review Notes`, 또는 `### Example Review`로 변경합니다. |

## 3. 용어 일관성 및 영어 표현

### 3.1 우선 수정 권장 표현

| 위치 | 기존 내용 | 문제 | 새로운 제안 내용 |
| --- | --- | --- | --- |
| `docs/01_about_the_course.md:149` | `Security and Observability as a Supporting Specialization` | 의미는 전달되지만 `supporting specialization`이 다소 내부 분류표처럼 들립니다. 보안과 관측성은 특정 전문 분야라기보다 모든 백엔드에 걸치는 관심사입니다. | `Security and Observability as Cross-Cutting Concerns` |
| `docs/01_about_the_course.md:151` | `This guide treats security and observability as a supporting specialization...` | 같은 이유로 약간 어색하고 번역투처럼 보입니다. | `This guide treats security and observability as cross-cutting concerns that support every backend role.` |
| `docs/12_observability_logging_and_operations.md` 여러 곳 | `Operation-Ready Backend` | 의도적으로 만든 용어처럼 보이지만 반복되면 다소 뻣뻣합니다. 일반 영어로는 lowercase가 자연스럽습니다. | 첫 등장에서는 `an operation-ready backend`로 설명하고, 이후에는 `operation-ready backend`, `backend that is ready to operate`, `service you can safely run` 등으로 자연스럽게 분산합니다. |
| `docs/07_data_and_databases.md:102`, `docs/11_security_authentication_and_operational_safety.md:47`, `docs/12_observability_logging_and_operations.md:395` | `live operations` | 일반 표현으로는 맞지만 정책 용어는 `LiveOps`입니다. 게임 운영 문맥에서는 표준 용어를 쓰는 편이 좋습니다. | 게임 콘텐츠 운영을 뜻하는 곳은 `LiveOps`; 일반 서비스 운영을 뜻하는 곳은 `service operations` 또는 `day-to-day operations`로 구분합니다. |
| `docs/01_about_the_course.md` 일부 | `service-side` | 뜻은 통하지만 `server-side` 또는 `service-level`이 더 자연스러운 경우가 있습니다. | 네트워크/백엔드 위치를 말하면 `server-side`, 운영 책임을 말하면 `service-level`을 사용합니다. |

### 3.2 전반적 용어 상태

아래 용어들은 전반적으로 잘 유지되고 있습니다.

- `Backend`
- `Web Backend`
- `Real-time Communication`
- `Real-time Multiplayer`
- `LiveOps`
- `Tools Backend`
- `Admin Tool`
- `Remote Config`
- `API Server`
- `Dedicated Game Server`
- `Authoritative Server`
- `Observability`
- `Logs`, `Metrics`, `Traces`

주의할 점:

- `API Server`와 `API server`가 섞여 있지만, 고유 역할명으로 쓸 때만 title case를 쓰고 일반 명사로 쓸 때 lowercase를 쓰는 현재 방식은 허용 가능합니다.
- `LiveOps`와 `live operations`는 의도적으로 구분하지 않으면 독자가 같은 개념인지 다른 개념인지 헷갈릴 수 있습니다.

## 4. 기술적 정확성 및 내용 보강 제안

### 4.1 API 예제의 권한 모델

| 위치 | 기존 내용 | 문제 | 새로운 제안 내용 |
| --- | --- | --- | --- |
| `docs/05_web_http_and_api.md:71`, `docs/05_web_http_and_api.md:545` | `GET /players/{playerId}` | 문서 안에서 권한 검사를 설명하므로 틀리지는 않습니다. 하지만 초보자에게는 임의의 `playerId`로 개인 정보를 조회해도 된다는 인상을 줄 수 있습니다. | 개인 프로필 예제는 `GET /players/me` 또는 `GET /me/profile`로 바꿉니다. 공개 프로필이나 관리자 조회 예제에서만 `GET /players/{playerId}`를 사용하고, `the server must check whether the caller is allowed to read this profile` 문장을 덧붙입니다. |
| `docs/06_understanding_your_first_backend.md:88`, `docs/06_understanding_your_first_backend.md:125` | `GET /players/player-001` | 첫 백엔드 설명에서 권한 모델보다 URL 구조가 먼저 각인될 수 있습니다. | 학습 초반에는 `GET /players/me`를 기본으로 쓰고, 이후 “public profile lookup” 예제에서 `GET /players/{playerId}`를 별도로 소개합니다. |

### 4.2 Score submission의 run ID 신뢰 모델

| 위치 | 기존 내용 | 문제 | 새로운 제안 내용 |
| --- | --- | --- | --- |
| `docs/08_game_backend_services.md:591`, `docs/08_game_backend_services.md:595` | `clientRunId` | 앞 장들과 같은 장의 다른 부분에서는 서버가 신뢰할 수 있는 세션/결과 검증을 강조합니다. `clientRunId`는 클라이언트가 만든 값처럼 보여 중복 제출 방지나 점수 검증 모델을 약하게 만들 수 있습니다. | `runId` 또는 `serverRunId`로 바꾸고, “The server should issue or record the run identifier before accepting duplicate-sensitive score submissions.”를 추가합니다. 만약 클라이언트 생성 ID를 유지한다면 “clientRunId is only a correlation hint, not a trusted proof”라고 명시합니다. |

### 4.3 Ledger 설명

| 위치 | 기존 내용 | 문제 | 새로운 제안 내용 |
| --- | --- | --- | --- |
| `docs/07_data_and_databases.md:1127-1129` | `These ledger rows show recent changes, not the player's complete lifetime currency history.` | 예시 테이블이 일부 행만 보여준다는 뜻이라면 괜찮지만, ledger가 완전한 이력일 필요가 없다는 뜻으로 오해될 수 있습니다. 경제/결제/고객지원 관점에서는 충분한 보존 정책이 중요합니다. | `The table shows only two recent example rows. A real backend should define a retention policy; for economy, purchase, support, or audit workflows, teams usually keep enough structured history to investigate and recover important account changes.` |

### 4.4 WebTransport 최신성 표현

| 위치 | 기존 내용 | 문제 | 새로운 제안 내용 |
| --- | --- | --- | --- |
| `docs/09_real-time_communication_and_dedicated_game_servers.md:374-379`, `docs/09_real-time_communication_and_dedicated_game_servers.md:1644-1649` | `At the time of writing, MDN lists WebTransport as a Baseline 2026 web API.` | 현재 공식 문서 기준으로는 맞습니다. 다만 날짜 의존적인 문장이라 문서가 오래되면 검토가 필요합니다. | `As of June 2026, MDN lists WebTransport as a Baseline 2026 web API. It can be useful for HTTP/3-based reliable streams and UDP-like datagrams, but teams should still verify older browser versions, secure-context requirements, HTTP/3 server support, and fallback behavior.` |

### 4.5 OWASP API Security 링크

| 위치 | 기존 내용 | 문제 | 새로운 제안 내용 |
| --- | --- | --- | --- |
| `docs/13_dashboard_tools_and_admin_frontend.md:869` | `[OWASP API Security Top 10 2023](https://owasp.org/API-Security/editions/2023/en/0x11-t10/)` | 링크 대상이 Top 10 risk list 쪽이어서 완전히 틀리지는 않지만, Chapter 11의 링크와 다르고 “Top 10 2023”의 시작점으로는 `0x00-header/`가 더 자연스럽습니다. | Chapter 11과 동일하게 `[OWASP API Security Top 10 2023](https://owasp.org/API-Security/editions/2023/en/0x00-header/)`로 맞추거나, 현재 링크를 유지한다면 라벨을 `OWASP API Security Top 10 risk list`처럼 더 정확하게 바꿉니다. |

### 4.6 Unity Matchmaker / Multiplay Hosting 최신성

| 위치 | 기존 내용 | 문제 | 새로운 제안 내용 |
| --- | --- | --- | --- |
| `docs/08_game_backend_services.md:854` | Unity Matchmaker further reading에 “provider support, deprecation, and migration guidance” 확인 문구가 있음 | 현재 문구는 좋습니다. Unity 공식 문서상 Multiplay Hosting 지원 종료일이 2026-03-31로 안내되어 있어, 2026-06-13 기준 이미 지난 날짜입니다. | 현재 주의 문구를 유지하거나 더 명확히 합니다. 예: `Because Unity's hosting integrations and deprecation timelines can change, verify the current supported hosting path before using these docs for an implementation.` |
| `docs/15_future_of_backend_and_learning_paths.md:1204` | `[Unity Docs — Services](https://docs.unity.com/)` | 넓은 서비스 문서 링크라 틀리지는 않지만, Chapter 15가 학습 경로를 제안하는 장이므로 특정 서비스 변화에 대한 주의 문구가 있으면 더 안전합니다. | `Use Unity's service docs as a current reference point, but check deprecation and migration notes before planning around Matchmaker, Relay, or hosting integrations.` |

## 5. 장별 흐름 및 설명 보강 제안

### Chapter 01 - About the Course

| 기존 내용 | 문제 | 새로운 제안 내용 |
| --- | --- | --- |
| Security/Observability를 `supporting specialization`으로 분류 | 의미는 알 수 있으나 책의 핵심 프레임으로는 조금 딱딱합니다. | `cross-cutting concerns`로 바꾸면 보안/관측성이 모든 역할에 걸친다는 메시지가 더 자연스럽습니다. |
| 역할 지도와 학습 범위를 매우 자세히 설명 | 초보자에게 유용하지만 시작 장에서 다소 분류표처럼 느껴질 수 있습니다. | 큰 구조는 유지하되 “you do not need to choose a role now” 류의 완충 문장을 더 앞쪽에 두면 부담이 줄어듭니다. |

### Chapter 02 - Backend Development Environment and Tools

| 기존 내용 | 문제 | 새로운 제안 내용 |
| --- | --- | --- |
| Learning Practice 제목에 실습 설명이 붙어 있음 | 표준 섹션명과 약간 다릅니다. | H2는 `Learning Practice`, 하위 제목은 `Prepare a Simple Backend Learning Workspace`로 분리합니다. |
| 도구 소개가 안전하고 개념 중심 | 큰 문제 없음 | 유지 권장 |

### Chapter 03 - Introduction to Modern Backend

| 기존 내용 | 문제 | 새로운 제안 내용 |
| --- | --- | --- |
| `Unity, Unreal Engine, Godot...` | 정책상 Godot dice game 의존성은 아니므로 위반은 아닙니다. 다만 특정 엔진 나열은 불필요하게 엔진 선택 문제로 독자의 주의를 돌릴 수 있습니다. | `It may be built with a commercial engine, an open-source engine, a browser stack, a custom engine, or another technology.` |

### Chapter 04 - From Browser to Backend

| 기존 내용 | 문제 | 새로운 제안 내용 |
| --- | --- | --- |
| Raw URL처럼 보이는 문자열이 curl/code 예제 안에 있음 | Markdown 링크 문제는 아닙니다. | 유지 가능 |
| 요청/응답 흐름 설명 | 큰 문제 없음 | 유지 권장 |

### Chapter 05 - Web, HTTP, and API

| 기존 내용 | 문제 | 새로운 제안 내용 |
| --- | --- | --- |
| `GET /players/{playerId}`를 개인 플레이어 데이터 예제로 사용 | 권한 확인 설명은 있지만 초보자에게 ID 기반 직접 조회를 기본 패턴처럼 보이게 할 수 있습니다. | private profile은 `GET /players/me`; public/admin lookup은 `GET /players/{playerId}`로 구분합니다. |

### Chapter 06 - Understanding Your First Backend

| 기존 내용 | 문제 | 새로운 제안 내용 |
| --- | --- | --- |
| `GET /players/player-001` | Chapter 5와 같은 권한 모델 문제 | `GET /players/me`를 기본 예제로 변경 |
| `### Self-Check` | 정책상 피하고 싶은 자기평가 섹션과 비슷한 인상 | `### Suggested Review` 또는 `### Review Notes` |

### Chapter 07 - Data and Databases

| 기존 내용 | 문제 | 새로운 제안 내용 |
| --- | --- | --- |
| Ledger rows가 lifetime history가 아니라고 설명 | 예시 범위 설명이라면 괜찮지만 ledger 보존의 중요성을 약화할 수 있습니다. | 예시 테이블은 일부 행만 보여준다고 명확히 하고, 실제 서비스는 보존 정책과 감사/복구 요구를 정의한다고 덧붙입니다. |
| 트랜잭션, 인덱스, NoSQL tradeoff 설명 | 초보자용으로 적절 | 유지 권장 |

### Chapter 08 - Game Backend Services

| 기존 내용 | 문제 | 새로운 제안 내용 |
| --- | --- | --- |
| Score submission 예제의 `clientRunId` | 서버 신뢰 모델과 일관성이 약합니다. | `serverRunId` 또는 `runId`로 바꾸고 서버 발급/기록 식별자임을 명확히 합니다. |
| Unity Matchmaker further reading의 deprecation 주의 | 현재 방향은 좋습니다. | 현재 날짜 기준으로 더 명확한 주의 문구를 넣으면 좋습니다. |

### Chapter 09 - Real-time Communication and Dedicated Game Servers

| 기존 내용 | 문제 | 새로운 제안 내용 |
| --- | --- | --- |
| WebTransport를 Baseline 2026으로 설명 | 현재 공식 문서 기준으로 맞습니다. 다만 날짜 의존 문장입니다. | `As of June 2026`를 명시하고 fallback/older browser/HTTP/3 server support 확인을 같이 안내합니다. |
| Dedicated Game Server와 API Server 구분 | 매우 좋음 | 유지 권장 |

### Chapter 10 - Infrastructure, Deployment, and Cloud

| 기존 내용 | 문제 | 새로운 제안 내용 |
| --- | --- | --- |
| Docker Compose 예제의 `postgres:16` | 개념 예제로는 문제 없습니다. 장기적으로 최신 버전이 바뀔 수 있으므로 예제 버전이 절대 권장처럼 보이지 않게 하는 정도만 고려하면 됩니다. | `The version here is illustrative; real projects should choose a supported version intentionally.` 문구를 덧붙일 수 있습니다. |
| 인프라/배포/클라우드 설명 | 초보자용 균형이 좋음 | 유지 권장 |

### Chapter 11 - Security, Authentication, and Operational Safety

| 기존 내용 | 문제 | 새로운 제안 내용 |
| --- | --- | --- |
| OWASP API Security Top 10 링크 | Chapter 11은 시작점 링크를 잘 사용합니다. | Chapter 13도 같은 링크 정책으로 맞춥니다. |
| 보안 경고와 초보자 범위 | 적절 | 유지 권장 |

### Chapter 12 - Observability, Logging, and Operations

| 기존 내용 | 문제 | 새로운 제안 내용 |
| --- | --- | --- |
| `Operation-Ready Backend` 반복 | 의미는 좋지만 용어가 다소 무겁습니다. | 일반 문장에서는 lowercase로 자연스럽게 표현합니다. |
| Logs/Metrics/Traces 구분 | 공식 OpenTelemetry Signals 개념과 잘 맞습니다. | 유지 권장 |
| Metrics label/cardinality 설명 | Prometheus 권장사항과 잘 맞습니다. | 유지 권장 |

### Chapter 13 - Dashboard, Tools, and Admin Frontend

| 기존 내용 | 문제 | 새로운 제안 내용 |
| --- | --- | --- |
| Learning Practice 제목에 상세 설명 포함 | 표준 섹션명과 다릅니다. | H2는 `Learning Practice`, H3로 상세 제목 분리 |
| OWASP 링크 대상 | Chapter 11과 다르게 되어 있음 | `0x00-header/`로 통일하거나 라벨을 조정 |
| Admin Tool 위험성 설명 | 좋음 | 유지 권장 |

### Chapter 14 - Backend Architecture Patterns

| 기존 내용 | 문제 | 새로운 제안 내용 |
| --- | --- | --- |
| 모놀리스/서비스/이벤트/캐시/큐 설명 | 정책과 잘 맞습니다. 초보자에게 특정 아키텍처를 강요하지 않고 tradeoff 중심으로 설명합니다. | 유지 권장 |
| 구조 문제 | 큰 문제 없음 | 유지 권장 |

### Chapter 15 - Future of Backend and Learning Paths

| 기존 내용 | 문제 | 새로운 제안 내용 |
| --- | --- | --- |
| Learning Practice 제목에 상세 설명 포함 | 표준 섹션명과 다릅니다. | H2는 `Learning Practice`, H3로 상세 제목 분리 |
| Unity Services 링크 | 넓은 링크라 문제는 없지만 서비스/deprecation 변화에 대한 주의가 부족합니다. | Matchmaker/Relay/hosting 관련 학습에는 current docs와 migration notes 확인 문구를 추가합니다. |
| AI-assisted learning habits | 현재 흐름상 괜찮지만, 백엔드 기본서의 마지막 장에서 비중이 커지면 주제가 흐려질 수 있습니다. | “supporting habit” 정도로 유지하고, 핵심 학습 경로는 Web Backend, Game Backend, Real-time, LiveOps, Tools Backend에 둡니다. |

## 6. 업데이트가 필요한 최신성 항목

| 주제 | 현재 상태 | 권장 조치 |
| --- | --- | --- |
| WebTransport | MDN 기준 Baseline 2026으로 확인됨. 다만 older browsers, secure context, HTTP/3 server support는 계속 확인 필요. | Chapter 9 문장에 `As of June 2026`와 fallback 확인 문구 추가 |
| Unity Matchmaker / Multiplay Hosting | Unity 공식 문서에서 Multiplay Hosting 지원 종료일을 2026-03-31로 안내합니다. 검토일 기준 이미 지난 날짜입니다. | Chapter 8의 주의 문구 유지/강화, Chapter 15에도 deprecation/migration 확인 문구 추가 |
| OWASP API Security Top 10 | 2023 edition이 현재 문서의 reference 기준으로 적절합니다. | Chapter 11/13 링크 형태 통일 |
| Firebase Cloud Messaging token freshness | FCM 공식 문서의 stale/expired token 및 주기적 refresh 권장과 Chapter 8 내용이 잘 맞습니다. | 유지 권장 |
| OpenTelemetry signals | Logs/Metrics/Traces/Baggage 구분과 Chapter 12 내용이 잘 맞습니다. | 유지 권장 |
| Prometheus metric labels | high-cardinality label 주의와 Chapter 12 내용이 잘 맞습니다. | 유지 권장 |

## 7. 우선순위별 수정 목록

### P1 - 최신성/정확성

| 위치 | 기존 내용 | 새로운 제안 내용 |
| --- | --- | --- |
| `docs/15_future_of_backend_and_learning_paths.md:1204` | Unity Services를 일반 학습 링크로 제시 | Unity 서비스/호스팅/매치메이킹은 변경 가능성이 크므로 deprecation/migration notes 확인 문구 추가 |
| `docs/08_game_backend_services.md:591`, `docs/08_game_backend_services.md:595` | `clientRunId` | `serverRunId` 또는 `runId`; 서버 발급/기록 식별자임을 명확히 설명 |

### P2 - 오해 방지 및 개념 명확화

| 위치 | 기존 내용 | 새로운 제안 내용 |
| --- | --- | --- |
| `docs/05_web_http_and_api.md`, `docs/06_understanding_your_first_backend.md` | `GET /players/{playerId}`, `GET /players/player-001` | 개인 데이터는 `GET /players/me`; public/admin lookup은 명시적 authorization과 함께 `GET /players/{playerId}` |
| `docs/07_data_and_databases.md:1127-1129` | Ledger rows가 lifetime history가 아니라고 표현 | 예시 테이블은 일부 recent rows만 보여주며, 실제 서비스는 retention/audit/recovery 정책을 정의한다고 설명 |
| `docs/13_dashboard_tools_and_admin_frontend.md:869` | OWASP 링크가 Chapter 11과 다름 | `0x00-header/`로 통일하거나 라벨 조정 |

### P3 - 스타일/구조/자연스러움

| 위치 | 기존 내용 | 새로운 제안 내용 |
| --- | --- | --- |
| 여러 장 | H3 번호 사용 방식 혼재 | H2만 번호, H3는 번호 없는 제목으로 통일 |
| `docs/02`, `docs/13`, `docs/15` | `Learning Practice: ...` 또는 `Learning Practice — ...` | H2는 정확히 `Learning Practice`, 상세 주제는 H3/본문으로 이동 |
| `docs/06_understanding_your_first_backend.md:1010` | `Self-Check` | `Suggested Review` 또는 `Review Notes` |
| `docs/01_about_the_course.md:149-151` | `supporting specialization` | `cross-cutting concerns` |
| `docs/12_observability_logging_and_operations.md` | `Operation-Ready Backend` 반복 | `operation-ready backend` 또는 자연스러운 문장형 표현 |
| `docs/03_introduction_to_modern_backend.md:244-245` | 특정 엔진 이름 나열 | 엔진 중립 표현으로 변경 가능 |

## 8. 확인 질문

1. H3 제목도 H2처럼 번호를 붙이는 스타일을 원하시나요, 아니면 정책 문서처럼 H2 번호만 유지하고 H3는 번호 없는 제목으로 통일할까요?
2. `Learning Practice` H2는 모든 장에서 정확히 같은 제목만 쓰도록 강하게 통일할까요, 아니면 현재처럼 제목 뒤에 실습명을 붙이는 방식을 허용할까요?
3. Chapter 15의 AI-assisted learning 내용은 학습 습관으로 유지하면 괜찮아 보입니다. 다만 백엔드 fundamentals 범위를 더 엄격히 잡고 싶다면 이 부분을 줄이는 방향이 좋습니다. 어느 쪽을 원하시나요?

## 9. 참고한 공식 문서

- MDN Web Docs - WebTransport API: https://developer.mozilla.org/en-US/docs/Web/API/WebTransport_API
- MDN Web Docs - WebSocket API: https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API
- OWASP API Security Top 10 2023: https://owasp.org/API-Security/editions/2023/en/0x00-header/
- Amazon GameLift Servers Documentation: https://docs.aws.amazon.com/gameliftservers/
- Firebase Cloud Messaging - Manage registration tokens: https://firebase.google.com/docs/cloud-messaging/manage-tokens
- OpenTelemetry - Signals: https://opentelemetry.io/docs/concepts/signals/
- Prometheus - Data model / labels: https://prometheus.io/docs/concepts/data_model/
- Unity Matchmaker documentation: https://docs.unity.com/ugs/en-us/manual/matchmaker/manual/matchmaker-overview
