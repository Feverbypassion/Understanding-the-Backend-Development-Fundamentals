# Backend Self-Study Guide — Chapter Role Map

> 이 문서는 새 프로젝트에서 15개 장을 다시 작성할 때 사용할 **장별 역할 지도(Chapter Role Map)** 입니다.  
> 각 장의 역할, 유지할 내용, 제거할 내용, Learning Practice 방향, Quiz 방향, 후속 심화 과정 경계선을 미리 고정하기 위해 사용합니다.

---

## 1. Purpose of This Document

이 문서의 목적은 각 장이 맡는 역할을 명확히 나누어, 전체 self-study guide가 다음 기준을 일관되게 유지하도록 하는 것입니다.

```text
English-only self-study guide
Concept-first introduction
Light Learning Practice
Multiple-choice Quiz only
No full implementation project
No Godot dice game dependency
Preparation for advanced courses
```

최종 문서는 장별 웹페이지로 제공됩니다. 따라서 각 장은 독립적으로 읽혀도 자연스러워야 하며, 동시에 전체 흐름 안에서도 중복과 충돌 없이 이어져야 합니다.

---

## 2. Overall Chapter Flow

전체 흐름은 다음과 같습니다.

| Chapter | Role in the Guide |
|---:|---|
| 1 | Introduce the guide, backend areas, learning attitude, and future paths. |
| 2 | Prepare backend mindset and a basic learning workspace. |
| 3 | Build the big-picture map of modern backend systems. |
| 4 | Explain networking fundamentals needed for backend and real-time concepts. |
| 5 | Explain Web, HTTP, and API contracts. |
| 6 | Explain conceptual API server flow without implementation. |
| 7 | Explain backend data and database concepts. |
| 8 | Introduce common game backend service features. |
| 9 | Introduce real-time communication and dedicated game server concepts. |
| 10 | Introduce infrastructure, deployment, and cloud concepts. |
| 11 | Introduce backend security basics. |
| 12 | Introduce observability, logging, and operations. |
| 13 | Introduce dashboards, internal tools, and LiveOps tool concepts. |
| 14 | Introduce backend architecture patterns and trade-offs. |
| 15 | Summarize learning paths and help students choose a next direction. |

---

## 3. Chapter 1 — About the Course

| Item | Direction |
|---|---|
| Chapter Role | Introduce the purpose, scope, study method, and future learning paths of the guide. |
| Main Focus | Big-picture distinction between Web Backend, Real-time Multiplayer, LiveOps / Tools Backend, Infrastructure, and Operations. |
| Keep | Overall backend map, self-study learning attitude, distinction among backend areas, future learning paths. |
| Remove / Avoid | Godot dice game, dice rolling game repository, mini project implementation flow, full backend project expectation. |
| Learning Practice | Classify simple game service scenarios into Web Backend, Real-time Communication, LiveOps / Tools, or Infrastructure. |
| Quiz Direction | Purpose of the guide, backend area distinction, what this guide does and does not aim to do. |
| Advanced Course Boundary | Actual API implementation, real-time server implementation, production LiveOps tools, and cloud deployment belong to later courses. |
| Transition | Move to Chapter 2 by explaining that students next need a backend learning mindset and workspace. |

Recommended Chapter 1 message:

```text
This guide gives you a map before asking you to go deep into implementation.
```

---

## 4. Chapter 2 — Backend Mindset and Development Environment

| Item | Direction |
|---|---|
| Chapter Role | Prepare students to think like backend learners and set up a basic learning workspace. |
| Main Focus | Terminal, code editor, Git/GitHub basics, API testing tools, local development environment, learning notes. |
| Keep | Development mindset, local vs production distinction, terminal basics, learning notes, simple folder setup. |
| Remove / Avoid | Full project setup, framework-specific setup, production backend workspace, Mini Game Backend Lab language. |
| Learning Practice | Create a simple learning folder and write short notes. Optionally run basic terminal commands. |
| Quiz Direction | Local vs production, terminal role, Git/GitHub role, API testing tool purpose, learning note purpose. |
| Advanced Course Boundary | Git deep dive, CI/CD, framework setup, and full local server implementation belong elsewhere. |
| Transition | Move to Chapter 3 by saying that once the learning workspace is ready, students can understand the backend system map. |

Recommended Chapter 2 message:

```text
Backend learning is not only writing code; it is reading requests, responses, logs, data, and errors.
```

---

## 5. Chapter 3 — Introduction to Modern Backend

| Item | Direction |
|---|---|
| Chapter Role | Give students the big-picture map of modern backend components. |
| Main Focus | API Server, Database, Cache, Queue, Object Storage, Authentication, Admin Tools, Dedicated Game Server. |
| Keep | Backend component map, game service examples, distinction between game backend service and dedicated game server. |
| Remove / Avoid | Deep architecture design assignment, implementation-heavy service design, specific platform tutorial. |
| Learning Practice | Map a feature flow such as score submission or daily reward to backend components. |
| Quiz Direction | Identify the role of API server, database, cache, queue, storage, admin tool, and dedicated server. |
| Advanced Course Boundary | Actual component implementation belongs to later chapters or advanced courses. |
| Transition | Move to Chapter 4 by explaining that backend systems communicate through networks. |

Recommended Chapter 3 message:

```text
A backend is a system of connected responsibilities, not just one server file.
```

---

## 6. Chapter 4 — Internet and Networking Fundamentals

| Item | Direction |
|---|---|
| Chapter Role | Explain networking concepts required for backend and real-time communication. |
| Main Focus | IP, port, DNS, TCP, UDP, latency, jitter, bandwidth, packet loss, socket concept. |
| Keep | Required / Optional Deep Dive separation, simple command observation, game examples. |
| Remove / Avoid | Advanced socket programming, packet optimization, custom network engine implementation. |
| Learning Practice | Run or interpret `ping`, `nslookup`, `traceroute` / `tracert` examples and explain what they show. |
| Quiz Direction | TCP vs UDP, DNS, IP, port, latency, packet loss, client-server communication. |
| Advanced Course Boundary | Real-time game networking implementation belongs to Real-time Multiplayer advanced course. |
| Transition | Move to Chapter 5 by explaining that HTTP is one major protocol built on top of networking concepts. |

Recommended Chapter 4 message:

```text
You do not need to become a network engineer, but you need enough networking vocabulary to understand backend behavior.
```

---

## 7. Chapter 5 — Web, HTTP, and API

| Item | Direction |
|---|---|
| Chapter Role | Explain HTTP request/response and API contracts. |
| Main Focus | HTTP methods, status codes, headers, body, JSON, REST-style APIs, CORS, HTTPS, OpenAPI. |
| Keep | `/health`, `/players`, `/scores`, `/leaderboard` as API contract examples. |
| Remove / Avoid | Any statement that Chapter 6 will implement these APIs in actual server code. |
| Learning Practice | Read an API contract and identify method, path, request body, response body, and status code. |
| Quiz Direction | HTTP methods, status codes, JSON, CORS vs HTTPS, API documentation. |
| Advanced Course Boundary | Full API server implementation belongs to a later Web Backend course. |
| Transition | Move to Chapter 6 by saying that students will next study how an API server conceptually handles requests. |

Required transition wording idea:

```text
In Chapter 6, we will use these API examples to understand how a backend API server receives requests, chooses processing logic, validates data, and returns responses. We will focus on the server-side concept flow rather than building a complete server implementation.
```

---

## 8. Chapter 6 — Understanding Your First Backend API

| Item | Direction |
|---|---|
| Chapter Role | Explain what happens inside an API server conceptually. |
| Main Focus | Endpoint, route, handler, request body, response, validation, error response, status code. |
| Keep | Concept-first explanation, “not a server code tutorial” direction, small API examples. |
| Remove / Avoid | Framework setup, Express/FastAPI implementation, production API, full server code. |
| Learning Practice | Given a request example, identify the endpoint, route, handler responsibility, validation, and response. |
| Quiz Direction | Endpoint vs route vs handler, request body, validation, response, status code. |
| Advanced Course Boundary | Actual API implementation belongs to Web Backend advanced course. |
| Transition | Move to Chapter 7 by asking where handled data should be stored so it does not disappear. |

Required transition wording idea:

```text
In this chapter, we studied the conceptual flow of a small API server. In the next chapter, we will ask where backend data should be stored so it can survive beyond a single request or server restart.
```

---

## 9. Chapter 7 — Data and Databases

| Item | Direction |
|---|---|
| Chapter Role | Explain why backend data needs storage and how databases help. |
| Main Focus | Relational database, SQL, table/row/column, CRUD, transaction, index, cache, NoSQL. |
| Keep | Player, score, inventory, reward examples; transaction and cache cautions; SQL vs NoSQL balance. |
| Remove / Avoid | “Chapter 6 built an API server” assumption, full DB integration tutorial, migration deep dive. |
| Learning Practice | Read a table example or short SQL example and identify what data is stored and queried. |
| Quiz Direction | Table/row/column, CRUD, transaction, index, cache, NoSQL, source of truth. |
| Advanced Course Boundary | DB integration, migrations, ORM, performance tuning belong to advanced Web Backend course. |
| Transition | Move to Chapter 8 by explaining that common game features use these data concepts. |

Required opening idea:

```text
In Chapter 6, we studied the conceptual flow of a small API server. Now, let’s ask a new question: if a backend handles player and score data, where should that data be stored so it does not disappear when the server restarts?
```

---

## 10. Chapter 8 — Game Backend Services

| Item | Direction |
|---|---|
| Chapter Role | Introduce common services used by game backends. |
| Main Focus | Account, authentication, profile, save data, inventory, leaderboard, rewards, economy, matchmaking, Remote Config, events, push notification, platforms. |
| Keep | Build vs buy, platform overview, service feature map, server-side validation mindset. |
| Remove / Avoid | Platform-specific tutorial, complete service implementation, Godot-specific client flow. |
| Learning Practice | Pick one feature such as daily reward, inventory, or leaderboard and identify required data, validation, and possible failure cases. |
| Quiz Direction | Match each game backend service with its responsibility. |
| Advanced Course Boundary | Actual game backend service implementation belongs to Web Backend, LiveOps, or Platform advanced courses. |
| Transition | Move to Chapter 9 by explaining that some game features require persistent connections or low-latency communication. |

Recommended feature template:

```text
What problem does it solve?
What data does it need?
What API shape might appear?
What should the server validate?
What can go wrong?
What advanced course will revisit this?
```

---

## 11. Chapter 9 — Real-time Communication and Dedicated Game Servers

| Item | Direction |
|---|---|
| Chapter Role | Introduce real-time communication vocabulary and mental model. |
| Main Focus | HTTP vs WebSocket vs TCP vs UDP, connection, room, session, match, relay server, dedicated game server, authoritative server. |
| Keep | Chat and chat room as conceptual examples, distinction between UDP and dedicated server, distinction between authoritative server and dedicated server. |
| Remove / Avoid | Working real-time practice, WebSocket chat server implementation, room join/leave tutorial, real-time game loop implementation. |
| Learning Practice | Compare scenarios and choose whether HTTP, WebSocket, or UDP-like real-time communication is more appropriate. |
| Quiz Direction | HTTP vs WebSocket vs UDP, room/session/match, dedicated server, authoritative server, server authority. |
| Advanced Course Boundary | Actual real-time implementation belongs to a later Real-time Multiplayer Backend course. |
| Transition | Move to Chapter 10 by explaining that servers need infrastructure to run reliably. |

Required scope note:

```text
This chapter is an introductory concept chapter. We will not implement a working real-time multiplayer server in this guide. Instead, we will learn the vocabulary and mental model needed for a later real-time multiplayer backend course.
```

---

## 12. Chapter 10 — Infrastructure, Deployment, and Cloud

| Item | Direction |
|---|---|
| Chapter Role | Explain where backend systems run and how deployment/infrastructure concepts fit together. |
| Main Focus | Localhost, local vs production, server hosting, Docker, container, cloud, CDN, load balancer, DNS, HTTPS. |
| Keep | Local vs production distinction, Docker/container overview, cloud model overview, beginner checklist. |
| Remove / Avoid | Production deployment tutorial, Kubernetes deep dive, cloud certification-style details. |
| Learning Practice | Read or draw a simple deployment diagram and identify server, database, DNS, CDN, load balancer, and client. |
| Quiz Direction | Local vs production, Docker, container, cloud, DNS, HTTPS, load balancer. |
| Advanced Course Boundary | Actual cloud deployment, Kubernetes, CI/CD, scaling, and cost optimization belong to Cloud/Infrastructure advanced course. |
| Transition | Move to Chapter 11 by explaining that once servers receive external requests, security becomes essential. |

Recommended scope line:

```text
You are not expected to operate production cloud infrastructure after this chapter.
```

---

## 13. Chapter 11 — Security Basics for Backend

| Item | Direction |
|---|---|
| Chapter Role | Introduce the security mindset needed for backend systems. |
| Main Focus | HTTPS, authentication, authorization, input validation, rate limiting, CORS, secret management, API security, client trust, server authority. |
| Keep | Game cheating examples, client-sent value caution, authentication vs authorization distinction, secret management. |
| Remove / Avoid | Auth middleware implementation, OAuth deep dive, payment/security compliance implementation. |
| Learning Practice | Classify API risk for examples such as `POST /scores`, `POST /rewards/daily`, `GET /leaderboard`, `GET /admin/audit-logs`. |
| Quiz Direction | Authentication vs authorization, HTTPS, validation, rate limiting, secret, CORS, server authority. |
| Advanced Course Boundary | Production authentication, OAuth, payment validation, anti-cheat systems belong to advanced courses. |
| Transition | Move to Chapter 12 by explaining that secure systems also need logs and observability to operate safely. |

Recommended Chapter 11 message:

```text
A backend should not blindly trust the client, especially when player data, rewards, scores, or rankings are involved.
```

---

## 14. Chapter 12 — Observability, Logging, and Operations

| Item | Direction |
|---|---|
| Chapter Role | Explain how backend teams understand what is happening in a running system. |
| Main Focus | Logs, metrics, traces, alerts, dashboards, incident response, game operation metrics. |
| Keep | Logs vs metrics vs traces distinction, PII/secret logging caution, operation-ready backend concept. |
| Remove / Avoid | Prometheus/Grafana setup tutorial, full observability stack implementation, production incident process deep dive. |
| Learning Practice | Read a log example and identify method, path, status code, latency, error, and sensitive data risk. |
| Quiz Direction | Logs vs metrics vs traces, alert, dashboard, incident, PII/secret logging. |
| Advanced Course Boundary | Observability stack setup and production operations belong to Cloud/Operations advanced course. |
| Transition | Move to Chapter 13 by explaining that operators often need tools and dashboards built on backend data. |

Recommended Chapter 12 message:

```text
A server that runs is not automatically operation-ready.
```

---

## 15. Chapter 13 — Dashboard, Tools, and Admin Frontend

| Item | Direction |
|---|---|
| Chapter Role | Introduce backend tools used by operators, support teams, and LiveOps teams. |
| Main Focus | Admin dashboard, CS tool, LiveOps tool, Remote Config, feature flag, audit log, permission, safe editing. |
| Keep | Tool categories, permission and audit log importance, wireframe-style examples. |
| Remove / Avoid | Full admin frontend implementation, production LiveOps automation, direct database editing as a recommended path. |
| Learning Practice | Read or sketch a simple leaderboard review or Remote Config screen and identify required permissions and audit logs. |
| Quiz Direction | Dashboard vs admin tool vs CS tool vs LiveOps tool, permission, audit log, Remote Config, feature flag. |
| Advanced Course Boundary | Actual admin frontend and LiveOps tool implementation belongs to LiveOps / Tools advanced course. |
| Transition | Move to Chapter 14 by explaining that as systems grow, architecture patterns help organize responsibilities. |

Recommended Chapter 13 message:

```text
Backend systems are used not only by players, but also by operators and support teams.
```

---

## 16. Chapter 14 — Backend Architecture Patterns

| Item | Direction |
|---|---|
| Chapter Role | Introduce architecture patterns and trade-offs after students have seen backend components. |
| Main Focus | Monolith, modular monolith, microservices, serverless, queue, cache, event-driven architecture, async jobs, cost, complexity, reliability. |
| Keep | Trade-off mindset, “patterns solve problems” framing, caution against overusing microservices. |
| Remove / Avoid | Pattern implementation tutorial, recommending microservices too early, complex distributed systems deep dive. |
| Learning Practice | Given a small game backend scenario, decide whether monolith, cache, queue, or async job could help and explain why through provided options. |
| Quiz Direction | Pattern roles and trade-offs: monolith vs microservices, synchronous vs asynchronous, queue, cache, serverless. |
| Advanced Course Boundary | Actual architecture implementation and distributed system design belong to advanced courses. |
| Transition | Move to Chapter 15 by explaining that students can now choose which backend direction to study next. |

Recommended Chapter 14 message:

```text
Architecture patterns are not trophies. They are tools for managing trade-offs.
```

---

## 17. Chapter 15 — Future of Backend and Learning Paths

| Item | Direction |
|---|---|
| Chapter Role | Summarize the guide and help students choose their next learning direction. |
| Main Focus | Web Backend, Real-time Multiplayer Backend, LiveOps / Tools Backend, Cloud / Infrastructure, Platform Backend, AI-assisted backend, future trends. |
| Keep | Learning paths, advanced course connections, personal next-step planning, three-month learning plan. |
| Remove / Avoid | Final mini project review, Godot-based starting point, claiming students have completed a production backend. |
| Learning Practice | Create a personal three-month learning plan and choose one advanced direction. |
| Quiz Direction | Identify which advanced track fits which interest or backend problem. |
| Advanced Course Boundary | Actual implementation happens in chosen advanced courses. |
| Transition | End the guide. |

Recommended Chapter 15 message:

```text
The purpose of this guide is not to finish backend learning, but to help you choose your next path with a clearer map.
```

---

## 18. Cross-Chapter Consistency Rules

### 18.1 Implementation Scope

Do not let any chapter drift into a full implementation course. When implementation is mentioned, frame it as future advanced learning.

### 18.2 Game Examples

Use general game backend examples:

```text
score submission
leaderboard query
daily reward
inventory lookup
player profile
remote config
event reward
chat concept
room concept
match concept
operator dashboard
```

Avoid Godot dice game examples.

### 18.3 Learning Practice Naming

Use `Learning Practice` in every chapter.

### 18.4 Quiz Naming

Use `Quiz` in every chapter. Do not use `Checkpoints` or `Self-Assessment` as the main final check section.

### 18.5 Quiz Format

Multiple-choice only. Include answer and explanation immediately after each question.

### 18.6 Webpage Independence

Each chapter must include enough context to be read as a separate webpage.

---

## 19. Group-Level Review Plan

Review chapters in groups after writing them.

| Group | Chapters | Review Focus |
|---|---|---|
| Group 1 | 1–3 | Guide identity, learning attitude, backend map |
| Group 2 | 4–6 | Networking → HTTP → conceptual API server flow |
| Group 3 | 7–9 | Data → game backend services → real-time concepts |
| Group 4 | 10–12 | Infrastructure → security → observability |
| Group 5 | 13–15 | Tools → architecture → future learning paths |

---

## 20. Final Summary

The Chapter Role Map should prevent three common problems:

```text
1. The guide drifting back into a full implementation course.
2. The same topic being repeated with different assumptions in multiple chapters.
3. Students becoming confused about what they are expected to build versus what they are expected to understand.
```

Each chapter should answer:

```text
What should students understand here?
What should they observe through Learning Practice?
What should they not be expected to implement yet?
Which advanced course will revisit this topic more deeply?
```
