# docs/ Markdown 문서 2차 검토 리포트

검토일: 2026-06-13

범위:

- `/Users/chris/Downloads/00_*.md` 정책/참고 문서
- `docs/` 아래의 모든 Markdown 파일

이 리포트는 용어 일관성, 기술적 정확성, 부족하거나 약한 설명, 구조적 흐름, Markdown 구조, 영어 문법/자연스러움, 번역문처럼 느껴지는 표현을 중심으로 검토한 결과입니다. 이 리포트는 장별 본문 파일을 수정하지 않습니다.

## 전체 결론

현재 `docs/` 문서 세트는 이전보다 훨씬 깔끔하고 일관적입니다. 큰 차단 수준의 기술 오류나 Markdown 구조 손상은 발견하지 못했습니다. 남은 이슈는 대부분 중간 또는 낮은 우선순위의 정리 사항입니다.

- 개정된 정책 용어는 `cross-cutting concerns`를 선호하지만, 일부 문장에 아직 `specialization`이 남아 있습니다.
- 일부 player profile API 예시는 인증된 개인 플레이어 흐름에서는 `/players/{playerId}`보다 `/players/me`가 더 안전하고 일관적입니다.
- 일부 H3 제목이 sentence case를 사용하고 있어, 대부분의 장에서 쓰는 title case와 스타일이 맞지 않습니다.
- Chapter 8에 `For example`이 연속 반복되는 작은 문장 흐름 문제가 있습니다.
- Unity Matchmaker 관련 참고는 보수적으로 유지해야 합니다. Unity 공식 문서가 Multiplay Hosting 지원 종료일을 2026년 3월 31일로 언급하고 있으며, 이 검토일 기준으로 이미 지난 날짜입니다.
- Chapter 12의 `operation-ready backend` 개념 자체는 유효하지만, 반복 사용하면 내부에서 만든 용어처럼 느껴질 수 있습니다. 일부 후속 문장에서는 표현을 다양화하면 더 자연스럽습니다.

## Markdown 구조 검사

자동 검사와 수동 검토 결과는 다음과 같습니다.

| 검사 항목 | 결과 |
|---|---|
| 문서당 H1 1개 | 코드 펜스를 제외하면 15개 파일 모두 통과 |
| 코드 펜스 | 모두 닫혀 있음 |
| H3 번호 사용 | 번호가 붙은 H3 제목 없음 |
| `Learning Practice` H2 제목 | 모든 장에 정확히 1번씩 존재 |
| 퀴즈 답/해설 짝 | 질문, 답, 해설 개수가 일치 |
| 퀴즈 선택지 | 확인한 모든 퀴즈 질문이 A-D 선택지 구조 |
| Markdown 링크/코드 밖 raw URL | 발견되지 않음 |
| Markdown 링크 | Markdown 링크 127개, 고유 링크 96개; 명백한 raw-link 형식 문제 없음 |

참고: 단순 제목 검사기는 Chapter 10의 코드 블록 안 `#` 주석을 추가 H1 제목으로 잘못 인식할 수 있습니다. 코드 펜스를 제외하면 Chapter 10도 실제 H1은 정확히 1개입니다.

## 상세 발견사항 및 제안

### 1. Chapter 1: `specialization` 용어가 일부 남아 있음

우선순위: 중간

위치:

- `docs/01_about_the_course.md:224`
- `docs/01_about_the_course.md:343`
- `docs/01_about_the_course.md:381`

문제:

개정된 과정 용어는 Security and Observability를 별도 specialization이 아니라 cross-cutting concerns로 설명합니다. 몇몇 문장에 아직 `specialization`이 남아 있어, 독자가 Security and Observability를 모든 backend area에 걸쳐 나타나는 관심사가 아니라 선택 가능한 별도 트랙처럼 이해할 수 있습니다.

기존:

```markdown
In addition to these tracks, the Security and Observability specialization appears in every backend path because every backend system needs access control, validation, logs, metrics, and ways to investigate problems.
```

제안:

```markdown
In addition to these tracks, Security and Observability appear across every backend path because every backend system needs access control, validation, logs, metrics, and ways to investigate problems.
```

기존:

```markdown
- The Security and Observability specialization appears whenever trust, validation, logs, metrics, or investigation matter.
```

제안:

```markdown
- Security and Observability appear whenever trust, validation, logs, metrics, or investigation matter.
```

기존:

```markdown
The Security and Observability specialization affects every backend area. It is not a separate topic that can always be added safely at the very end.
```

제안:

```markdown
Security and Observability affect every backend area. They are not separate topics that can always be added safely at the very end.
```

### 2. Chapter 1: 섹션 제목을 업데이트된 용어와 더 맞출 수 있음

우선순위: 낮음

위치:

- `docs/01_about_the_course.md:78`

기존:

```markdown
## 1.4 Core Concepts: Backend Areas and Supporting Concerns
```

문제:

본문은 이제 `cross-cutting concerns`를 사용하지만, 제목은 `Supporting Concerns`라고 되어 있습니다. 이해에는 문제가 없지만, 제목도 본문 및 정책 가이드의 표현과 맞추면 용어가 더 단단해집니다.

제안:

```markdown
## 1.4 Core Concepts: Backend Areas and Cross-Cutting Concerns
```

### 3. Chapter 1: `Security and Observability` 관련 사소한 문법/자연스러움

우선순위: 낮음

위치:

- `docs/01_about_the_course.md:91`
- `docs/01_about_the_course.md:301`

기존:

```markdown
This guide also introduces one set of cross-cutting concerns that appears across the core areas.
```

제안:

```markdown
This guide also introduces Security and Observability as cross-cutting concerns that appear across the core areas.
```

기존:

```markdown
Even when Security and Observability are the main concern in a scenario, they still support a backend flow rather than replacing the core backend areas.
```

제안:

```markdown
Even when Security and Observability are the primary concern in a scenario, they still support a backend flow rather than replacing the core backend areas.
```

### 4. Chapter 3: `backend` 표현 반복

우선순위: 낮음

위치:

- `docs/03_introduction_to_modern_backend.md:31-32`

기존:

```markdown
By the end of this chapter, the word “backend” should feel less vague. You should be able to see it as a set of connected
backend responsibilities.
```

문제:

문법적으로는 맞지만 `backend`가 조금 딱딱하게 반복됩니다.

제안:

```markdown
By the end of this chapter, the word “backend” should feel less vague. You should be able to see it as a set of connected responsibilities.
```

### 5. Chapter 3: 여러 기술 예시가 들어간 긴 문장

우선순위: 낮음

위치:

- `docs/03_introduction_to_modern_backend.md:244-246`

기존:

```markdown
The game client is the application running on the player's device. It may be built with a commercial engine,
an open-source engine, a browser stack, a custom engine, or another technology. The backend is the server-side system that the client
communicates with.
```

문제:

내용은 좋고, 특정 게임 엔진에 과도하게 묶이지 않습니다. 다만 마지막 문장의 줄바꿈이 어색해서 조금 더 부드럽게 만들 수 있습니다.

제안:

```markdown
The game client is the application running on the player's device. It may be built with a commercial engine, an open-source engine, a browser stack, a custom engine, or another technology.
The backend is the server-side system that the client communicates with.
```

### 6. Chapter 5: 인증된 player update 예시는 `/players/me`를 선호하는 것이 좋음

우선순위: 중간

위치:

- `docs/05_web_http_and_api.md:243-244`

기존:

```markdown
| `PUT` | Replace a resource with a new complete version. | `PUT /players/{playerId}/profile` could replace a full profile. |
| `PATCH` | Partially update a resource. | `PATCH /players/{playerId}/nickname` could update only a nickname. |
```

문제:

문서의 다른 부분에서는 인증된 자기 프로필 접근과 public player lookup을 올바르게 구분하고 있습니다. 하지만 이 예시는 초보자가 자신의 private profile을 수정할 때 임의의 `playerId`를 클라이언트가 선택해도 된다고 배울 위험이 있습니다.

제안:

```markdown
| `PUT` | Replace a resource with a new complete version. | `PUT /players/me/profile` could replace the authenticated player's full profile. |
| `PATCH` | Partially update a resource. | `PATCH /players/me/nickname` could update only the authenticated player's nickname. |
```

`/players/{playerId}`는 public profile 조회나 admin/support 흐름처럼 서버가 authorization을 확인하는 경우에 유지하는 것이 좋습니다.

### 7. Chapter 5: 텍스트 열에 숫자 정렬이 사용됨

우선순위: 낮음

위치:

- `docs/05_web_http_and_api.md:321`
- `docs/05_web_http_and_api.md:411`
- `docs/05_web_http_and_api.md:700`

기존:

```markdown
|---|---:|---:|---|
```

문제:

`Type`과 `Required?` 열에는 `string`, `number`, `Yes` 같은 텍스트 값이 들어갑니다. 오른쪽 정렬이 Markdown 오류는 아니지만, 시각적으로 불필요하며 초보자 친화적인 표 읽기에는 덜 자연스럽습니다.

제안:

```markdown
|---|---|---|---|
```

### 8. Chapter 6: API contract 표에서 `/players/me`가 더 안전할 수 있는 자리에 `/players/{playerId}`가 사용됨

우선순위: 중간

위치:

- `docs/06_understanding_your_first_backend.md:154-160`

기존:

```markdown
| `GET` | `/players/{playerId}` | Read player info | None | `200 OK` | `404` |
```

문제:

장 도입부에서는 인증된 자기 프로필 조회에 `GET /players/me`를 사용하지만, 뒤의 표에서는 `/players/{playerId}`와 일반적인 목적 설명인 `Read player info`로 바뀝니다. 175-178행에서 public/private profile 규칙이 다르다고 설명하지만, 초보자에게는 표가 가장 기억에 남는 자료가 될 수 있습니다. 이 표만 보면 private player info를 임의의 client-selected player ID로 읽어도 된다고 오해할 수 있습니다.

제안 옵션 A, 이 행이 인증된 자기 프로필을 의미한다면:

```markdown
| `GET` | `/players/me` | Read the authenticated player's own profile | None | `200 OK` | `401`, `404` |
```

제안 옵션 B, 이 행이 public profile lookup을 의미한다면:

```markdown
| `GET` | `/players/{playerId}` | Read a limited public player profile | None | `200 OK` | `404` |
```

옵션 B를 사용할 경우, private data와 admin/support data에는 authentication과 authorization checks가 필요하다는 주변 경고를 유지하거나 더 강화하는 것이 좋습니다.

### 9. Chapter 6: routing 예시는 선택한 player profile contract와 맞춰야 함

우선순위: 중간

위치:

- `docs/06_understanding_your_first_backend.md:238-243`

기존:

```text
GET  + /players/{playerId} -> player lookup handler
```

문제:

이 부분은 Finding 8에서 선택한 방향과 맞아야 합니다. 초보자 예시가 인증된 자기 프로필이라면 `/players/me`가 더 명확합니다. public lookup이라면 handler 이름이 그 점을 드러내야 합니다.

제안 옵션 A:

```text
GET  + /players/me -> authenticated player profile handler
```

제안 옵션 B:

```text
GET  + /players/{playerId} -> public player profile lookup handler
```

### 10. Chapter 6: path parameter 예시는 맞지만 맥락을 더 분명히 해야 함

우선순위: 낮음

위치:

- `docs/06_understanding_your_first_backend.md:368-372`
- `docs/06_understanding_your_first_backend.md:479-485`

기존:

```http
GET /players/player_001
```

문제:

설명은 이미 서버가 caller의 읽기 권한을 확인해야 한다고 말하고 있고, private profile flow에는 `/players/me`가 더 안전하다고 설명합니다. 기술적으로는 맞습니다. 다만 장의 다른 부분에서 `/players/me`를 사용한다면, 이 예시는 권장 private profile pattern이 아니라 path parameter를 이해하기 위한 예시임을 명시하면 좋습니다.

제안 추가 문장:

```markdown
This example is only for understanding path parameters. For a private "my profile" API, this guide uses `GET /players/me`.
```

### 11. Chapter 7: H3 title case 일관성

우선순위: 낮음

위치:

- `docs/07_data_and_databases.md:368`
- `docs/07_data_and_databases.md:1852`
- `docs/07_data_and_databases.md:1866`

기존:

```markdown
### A simple classification table
### Short note
### Possible interpretation
```

문제:

가이드의 대부분 H3 제목은 `What to Observe`, `Short Note`처럼 title case를 사용합니다. 이 제목들은 sentence case입니다.

제안:

```markdown
### A Simple Classification Table
### Short Note
### Possible Interpretation
```

### 12. Chapter 7: 인지 부담이 큼

우선순위: 낮음-중간

위치:

- `docs/07_data_and_databases.md` 전체

문제:

Chapter 7은 가장 긴 장이며 data categories, relational modeling, score history, maintained best-score state, inventory, currency ledgers, reward claims, transactions, uniqueness, indexes, cache, NoSQL을 다룹니다. 내용은 기술적으로 일관되지만, introductory self-study 장으로는 밀도가 높습니다.

제안 구조 옵션:

1. 장은 그대로 두되 cache/NoSQL 섹션 전에 짧은 전환 문장을 추가합니다.

```markdown
At this point, you have seen the reliable database model. The next sections are optional beginner previews of supporting storage and performance ideas. You do not need to master them before continuing.
```

2. 또는 현재 source-of-truth 경고는 유지하되, cache/NoSQL 세부 내용 일부를 later advanced course note로 옮깁니다.

정책상 `Learning Practice`를 선호하므로 `Checkpoint`, `Exercise`, `Self-Assessment` 같은 라벨은 추가하지 않는 것이 좋습니다.

### 13. Chapter 8: `For example` 반복

우선순위: 낮음

위치:

- `docs/08_game_backend_services.md:253-257`

기존:

```markdown
For example, the server might create a run ticket before gameplay starts and later accept only one result for that ticket. This is only a preview of a safer design idea; not every small game needs this pattern.

For example, a daily reward claim can use a claim record for the reward period. If the record already exists, the server can return a safe response instead of granting the reward again.
```

문제:

연속된 두 문단이 모두 `For example`로 시작해 약간 기계적으로 읽힙니다.

제안:

```markdown
For example, the server might create a run ticket before gameplay starts and later accept only one result for that ticket. This is only a preview of a safer design idea; not every small game needs this pattern.

Similarly, a daily reward claim can use a claim record for the reward period. If the record already exists, the server can return a safe response instead of granting the reward again.
```

### 14. Chapter 8: H3 title case 일관성

우선순위: 낮음

위치:

- `docs/08_game_backend_services.md:664`
- `docs/08_game_backend_services.md:674`
- `docs/08_game_backend_services.md:688`
- `docs/08_game_backend_services.md:700`

기존:

```markdown
### Choose one feature
### Fill in the analysis table
### Example answer: Daily reward
### What to observe
```

제안:

```markdown
### Choose One Feature
### Fill in the Analysis Table
### Example Answer: Daily Reward
### What to Observe
```

### 15. Chapter 8: Unity Matchmaker 링크와 일정 문구는 보수적으로 유지해야 함

우선순위: 중간

위치:

- `docs/08_game_backend_services.md:854-855`

기존:

```markdown
- [Unity Matchmaker documentation](https://docs.unity.com/en-us/matchmaker)  
  Use this as a conceptual reference for how a platform describes matchmaking, hosting-provider integration, rule-based matching, and rule relaxation. Unity service integrations and hosting timelines can change, so check the current hosting-provider support status, deprecation notes, and migration guidance before relying on any specific server allocation flow.
```

문제:

주의 문구는 좋습니다. 다만 Unity Matchmaker 페이지가 현재 Unity Matchmaker는 Multiplay Hosting을 2026년 3월 31일 deprecation date까지 지원한다고 말하고 있고, 이 리포트의 검토일은 2026년 6월 13일입니다. 따라서 allocation flow를 기준으로 계획하기 전에 현재 hosting path를 반드시 확인해야 한다는 점을 더 명시하는 편이 안전합니다.

제안:

```markdown
- [Unity Matchmaker documentation](https://docs.unity.com/en-us/matchmaker)  
  Use this as a conceptual reference for how a platform describes matchmaking, hosting-provider integration, rule-based matching, and rule relaxation. As of June 2026, Unity's Matchmaker documentation includes migration/deprecation guidance for Multiplay Hosting, so verify the current hosting-provider support status and migration guidance before relying on any specific server allocation flow.
```

### 16. Chapter 10: Compose 설명의 긴 문단

우선순위: 낮음

위치:

- `docs/10_infrastructure_deployment_and_cloud.md:273`

기존:

```markdown
In this example, `api` and `db` are separate services. The API Server uses `db` as the database service name inside the Compose network. It should not use `localhost` to mean the database container, because inside the API container, `localhost` means the API container itself. The PostgreSQL version in this snippet is illustrative; real projects should choose a supported version intentionally.
```

문제:

설명은 정확하지만 중요한 아이디어가 한 문단에 많이 들어 있어 밀도가 높습니다.

제안:

```markdown
In this example, `api` and `db` are separate services. The API Server uses `db` as the database service name inside the Compose network.

It should not use `localhost` to mean the database container, because inside the API container, `localhost` means the API container itself. The PostgreSQL version in this snippet is illustrative; real projects should choose a supported version intentionally.
```

### 17. Chapter 10: H3 title case 일관성

우선순위: 낮음

위치:

- `docs/10_infrastructure_deployment_and_cloud.md:157`
- `docs/10_infrastructure_deployment_and_cloud.md:188`
- `docs/10_infrastructure_deployment_and_cloud.md:233`
- `docs/10_infrastructure_deployment_and_cloud.md:285`
- `docs/10_infrastructure_deployment_and_cloud.md:291`
- `docs/10_infrastructure_deployment_and_cloud.md:469`
- `docs/10_infrastructure_deployment_and_cloud.md:485`
- `docs/10_infrastructure_deployment_and_cloud.md:498`
- `docs/10_infrastructure_deployment_and_cloud.md:504`

기존 예시:

```markdown
### Configuration and secrets are not the same
### Secrets do not belong in the game client
### Ports and containers
### Beginner deployment checklist
```

문제:

읽기에는 문제가 없지만, 다른 장들은 대부분 H3 제목에 title case를 사용합니다. 가이드 전체의 제목 스타일을 통일하려면 이 제목들도 조정하는 편이 좋습니다.

제안 예시:

```markdown
### Configuration and Secrets Are Not the Same
### Secrets Do Not Belong in the Game Client
### Ports and Containers
### Beginner Deployment Checklist
```

### 18. Chapter 12: `operation-ready backend`는 유효하지만 만든 용어처럼 들릴 수 있음

우선순위: 낮음

위치:

- `docs/12_observability_logging_and_operations.md:27`
- `docs/12_observability_logging_and_operations.md:37`
- `docs/12_observability_logging_and_operations.md:90`
- `docs/12_observability_logging_and_operations.md:113`
- `docs/12_observability_logging_and_operations.md:574`
- `docs/12_observability_logging_and_operations.md:827-828`

기존:

```markdown
> A server that runs is not automatically an operation-ready backend.
```

문제:

개념은 명확하고 기술적으로 유용합니다. `operation-ready backend`라는 표현도 이해 가능하지만, 반복해서 사용하면 내부에서 만든 용어처럼 느껴질 수 있습니다. 자연스러운 영어를 원한다면 처음 한 번 정의하고 이후 문장에서는 표현을 조금 다양화하는 편이 좋습니다.

제안 첫 정의:

```markdown
> A server that runs is not automatically ready to operate safely.
```

제안 정의 문장:

```markdown
An **operation-ready backend** is a backend that provides enough operational signals for developers and operators to understand what is happening while the service is running.
```

제안 후속 표현:

```markdown
The main idea is that a running server is not enough. A backend also needs actionable signals for noticing, investigating, and responding to problems.
```

### 19. Chapter 15: AI-Assisted Learning 내용은 훨씬 좋아졌지만, 더 작은 note처럼 만들 수 있음

우선순위: 낮음

위치:

- `docs/15_future_of_backend_and_learning_paths.md:554-564`
- `docs/15_future_of_backend_and_learning_paths.md:1054-1066`

기존:

```markdown
### AI-Assisted Learning as a Small Supporting Habit
```

문제:

현재 섹션은 AI tools가 study aid일 뿐이며 자세한 advanced workflow는 later course에 속한다고 올바르게 말합니다. 하지만 여전히 future learning paths/trends 근처의 H3 섹션이기 때문에, 의도보다 더 눈에 띄는 항목처럼 보일 수 있습니다.

제안 옵션:

```markdown
### A Short Note on AI-Assisted Learning
```

더 줄이는 것이 목표라면 Quiz Question 6을 primary advanced learning track 선택 관련 질문으로 교체하고, AI safety note는 본문 안의 짧은 note로만 유지할 수 있습니다.

### 20. Chapter 15: Unity Services 주의 문구는 좋지만 Matchmaker/Hosting을 조금 더 직접 언급할 수 있음

우선순위: 낮음

위치:

- `docs/15_future_of_backend_and_learning_paths.md:1142-1143`

기존:

```markdown
- [Unity Docs — Services](https://docs.unity.com/en-us/services)
  Use this to explore platform services such as authentication, cloud save, economy, leaderboards, analytics, Remote Config, LiveOps, and multiplayer services. Check current deprecation notes, migration guidance, and supported hosting or matchmaking paths before planning around a specific Unity service.
```

문제:

이미 충분히 괜찮습니다. Chapter 8의 Matchmaker note를 업데이트한다면, Chapter 15는 그대로 두어도 되고 약간 더 명시적인 표현으로 바꾸어도 됩니다.

제안:

```markdown
- [Unity Docs — Services](https://docs.unity.com/en-us/services)
  Use this to explore platform services such as authentication, cloud save, economy, leaderboards, analytics, Remote Config, LiveOps, and multiplayer services. Check current deprecation notes, migration guidance, and supported matchmaking, relay, and hosting paths before planning around a specific Unity service.
```

## 기술 정확성 메모

### WebTransport

Chapter 9의 WebTransport note는 2026년 6월 13일 기준 introductory guide에 충분히 최신입니다. MDN은 WebTransport를 Baseline 2026으로 표시하고, 2026년 3월부터 사용 가능하다고 설명하며, HTTP/3, reliable streams, UDP-like datagrams를 언급합니다. 해당 장에서 older devices, browser differences, secure context requirements, HTTP/3 server support, fallback behavior, deployment environment를 확인하라고 주의하는 것도 적절합니다.

변경이 필요하지 않습니다.

### OWASP API Security

OWASP API Security Top 10 참고는 2023 edition을 기준으로 적절하게 사용되고 있습니다. Chapter 11의 API security 설명은 authorization, authentication, resource consumption, sensitive business flows, SSRF, misconfiguration, inventory management, unsafe consumption of APIs 등 현재 OWASP API Security 범주와 개념적으로 잘 맞습니다.

변경이 필요하지 않습니다.

### Observability Signals

Chapter 12의 logs/metrics/traces 설명은 OpenTelemetry가 지원하는 signal categories와 잘 맞습니다. profiles와 advanced instrumentation을 introductory path 밖으로 둔 것도 적절합니다.

기술적 변경이 필요하지 않습니다.

### Prometheus Metrics and Labels

Chapter 12의 labels/cardinality 주의는 Prometheus의 dimensional data model과 개념적으로 맞습니다. Prometheus에서는 label value가 distinct time series를 만들 수 있습니다. 초보자용 설명으로 적절합니다.

기술적 변경이 필요하지 않습니다.

### Unity Services and Matchmaker

Unity service 문서는 자주 업데이트됩니다. Unity Matchmaker 페이지는 현재 Matchmaker가 Multiplay Hosting을 2026년 3월 31일까지 지원하고, Multiplay Hosting deprecation 이후에는 Relay와 Distributed Authority와 함께 계속 작동한다고 설명합니다. 이 날짜가 이미 지났으므로, Chapter 8은 독자가 현재 support/migration status를 반드시 확인해야 한다는 강한 문구를 유지해야 합니다.

## 영어 문법 및 번역문 같은 표현 메모

전체 영어는 교육용 문서로서 대체로 명확하고 자연스럽습니다. 직접 번역문처럼 강하게 느껴지는 표현은 많지 않았습니다. 주요 자연스러움 이슈는 다음과 같습니다.

- Chapter 3 line 31-32의 `backend` 반복
- Chapter 8 line 253-257의 `For example` 반복
- Chapter 12의 `operation-ready backend` 반복 사용. 이해는 되지만 여러 번 나오면 만든 용어처럼 느껴질 수 있습니다.
- Chapters 7, 8, 10의 lowercase H3 headings. 문법 오류는 아니지만 편집 일관성을 낮춥니다.

## 변경하지 않아도 된다고 판단한 항목

다음 영역은 검토 후 문제가 없다고 판단했습니다.

- `Learning Practice` H2 제목은 모든 장에서 일관적입니다.
- Quiz format은 일관적입니다. 각 질문에 A-D 선택지, 답, 해설이 있습니다.
- 남아 있는 `Godot` dependency 또는 특정 engine 전제는 발견하지 못했습니다.
- `Homework`, `Exercise`, `Self-Check`, `Checkpoint` 라벨이 남아 있는 명백한 사례는 발견하지 못했습니다.
- Chapter 9의 WebSocket/UDP/Dedicated Game Server 구분은 개념적으로 타당합니다.
- Chapter 15의 AI-assisted learning 내용은 이미 full track이 아니라 짧은 보조 학습 습관 수준으로 크게 줄었고, advanced workflows는 later advanced course에 속한다고 올바르게 말합니다.
- Markdown links는 raw URLs가 아니라 Markdown link 형식으로 작성되어 있습니다.

## 확인 질문

원하면 아래 사항은 질문 없이 바로 반영할 수 있습니다. 다만 편집 의도가 필요한 선택지는 다음 3개입니다.

1. Chapter 6의 기본 player profile 예시를 authenticated self-profile access인 `GET /players/me`로 통일하고, `/players/{playerId}`는 public profile 또는 admin/support 예시로만 남길까요?
2. Chapters 7, 8, 10을 포함해 가이드 전체 H3 제목을 title case로 통일할까요?
3. Chapter 15의 AI quiz question을 safety reminder로 유지할까요, 아니면 AI-assisted learning을 본문 안의 짧은 note로만 남기기 위해 다른 질문으로 교체할까요?

## 확인한 공식 출처

- [MDN — WebTransport API](https://developer.mozilla.org/en-US/docs/Web/API/WebTransport_API)
- [Unity Matchmaker documentation](https://docs.unity.com/en-us/matchmaker)
- [Unity Docs — Services](https://docs.unity.com/en-us/services)
- [OWASP API Security Top 10 2023](https://owasp.org/API-Security/editions/2023/en/0x00-header/)
- [OpenTelemetry — Signals](https://opentelemetry.io/docs/concepts/signals/)
- [Prometheus — Data model](https://prometheus.io/docs/concepts/data_model/)
