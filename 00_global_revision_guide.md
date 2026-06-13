# Backend Self-Study Guide — Global Revision Guide

> 이 문서는 새 프로젝트에서 `Backend Development Fundamentals` self-study guide를 장별로 다시 작성할 때 적용할 **전역 작성 기준(Global Revision Guide)** 입니다.  
> 모든 장의 작성자는 본문 작성 전에 이 문서를 먼저 확인해야 합니다.

---

## 1. Document Identity

최종 학생용 문서는 **영어 only self-study guide**입니다.

이 문서 세트는 게임 개발자 또는 게임 백엔드 입문자가 다음 내용을 넓게 이해하도록 돕기 위한 안내 자료입니다.

- Backend fundamentals
- Web Backend concepts
- HTTP and API basics
- Data and database concepts
- Game backend service concepts
- Real-time communication concepts
- LiveOps / Tools Backend concepts
- Infrastructure, security, logging, observability, and operations overview
- Future learning paths into advanced backend courses

이 guide는 특정 프레임워크를 깊게 배우는 강의도 아니고, 하나의 완성된 서버 프로젝트를 만드는 구현 과정도 아닙니다. 학생이 백엔드의 큰 그림을 이해하고, 짧은 학습 실습을 통해 개념을 관찰한 뒤, 이후 심화 과정으로 자연스럽게 넘어가도록 돕는 문서입니다.

---

## 2. Target Reader

대상 독자는 다음과 같습니다.

- Backend development를 처음 배우는 학생
- 게임 개발 경험은 있지만 서버와 백엔드가 아직 낯선 학생
- Web Backend, Real-time Multiplayer Backend, LiveOps / Tools Backend의 차이를 알고 싶은 학생
- 이후 심화 과정으로 들어가기 전에 전체 지도를 만들고 싶은 학생

학생은 초급자로 가정합니다. 따라서 모든 설명은 명확하고 친절해야 하며, 새로운 용어가 등장하면 게임 백엔드 예시와 연결해 설명해야 합니다.

---

## 3. Final Language

최종 학생용 문서는 **영어로만 작성**합니다.

작성 기준 문서나 내부 지침은 한국어로 작성할 수 있지만, 실제 학생에게 제공되는 각 장의 본문은 영어로 작성합니다.

최종 본문에서는 다음 원칙을 지킵니다.

- English only
- Clear beginner-friendly explanations
- Natural self-study guide tone
- No awkward translation-like phrasing
- Consistent terminology
- Consistent section names

---

## 4. Core Direction

이 guide의 핵심 방향은 다음과 같습니다.

```text
Concept-first introduction
Light Learning Practice
No full production implementation
No commercial-level backend result
Preparation for advanced courses
```

학생은 이 문서를 통해 다음을 이해해야 합니다.

- Backend systems solve service-side problems.
- HTTP APIs are useful for request/response service features.
- Databases store persistent backend data.
- Real-time communication is a separate and deeper backend area.
- LiveOps tools help operate a game after launch.
- Security, logging, observability, infrastructure, and operations are part of backend thinking.
- The guide is a foundation for future advanced courses, not the final destination.

---

## 5. Non-goals

이 guide는 다음을 목표로 하지 않습니다.

- A complete production backend
- A commercial-level game server
- A full REST API implementation course
- A full WebSocket chat server implementation
- A real-time multiplayer server implementation
- A complete LiveOps / admin tool implementation
- A production cloud deployment tutorial
- A specific game engine tutorial
- A Godot dice game client workflow
- A framework-specific course such as Express, FastAPI, ASP.NET Core, or Spring Boot
- A full authentication, payment, or store system
- A Kubernetes or large-scale infrastructure course

본문에서 학생에게 실제 상용 수준의 결과물을 기대하게 만드는 표현은 피합니다.

사용하지 말아야 할 표현 예시:

```text
You will build a complete backend server.
You will implement a production-ready API.
You will create a commercial game backend.
You will implement a real-time multiplayer server in this guide.
```

대신 다음처럼 씁니다.

```text
You will study the concept flow.
You will observe how the idea works through a short learning practice.
You will read and interpret a small example.
You will prepare for a later advanced course.
```

---

## 6. Required Chapter Structure

각 장은 최종적으로 별도 웹페이지로 제공됩니다. 따라서 각 장은 독립적으로 읽혀도 자연스러워야 합니다.

기본 장 구조는 다음을 사용합니다.

```markdown
# N. Chapter Title

## N.1 How to Read This Chapter

## N.2 What You Will Learn

## N.3 Why This Matters

## N.4 Core Concepts

## N.5 Example Scenario

## N.6 Learning Practice

## N.7 Common Mistakes

## N.8 Chapter Summary

## N.9 Quiz

## N.10 Further Reading
```

장 성격에 따라 일부 섹션명은 조정할 수 있습니다. 하지만 다음 섹션은 가능한 한 모든 장에 포함합니다.

- How to Read This Chapter
- What You Will Learn
- Learning Practice
- Chapter Summary
- Quiz
- Further Reading

15장처럼 학습 경로를 정리하는 장은 `Learning Practice` 대신 `Learning Plan`이나 `Reflection`을 추가할 수 있습니다. 그래도 `Quiz`는 반드시 포함합니다.

---

## 7. Learning Practice Rules

모든 실습 섹션 이름은 **Learning Practice**로 통일합니다.

사용할 명칭:

```text
Learning Practice
```

사용하지 않을 명칭:

```text
Small Practice
Small Exercise
Hands-on Assignment
Homework
Project Assignment
Checkpoint Practice
```

Learning Practice는 학생이 개념을 관찰하고 이해하기 위한 짧은 학습 활동입니다. 제출 과제가 아니며, 상용 개발에 사용할 수준의 결과물을 만드는 활동도 아닙니다.

각 Learning Practice 앞이나 내부에는 필요에 따라 다음 안내를 넣습니다.

```markdown
This Learning Practice is for observation and study. It is not a production-ready implementation.
```

Learning Practice에 적합한 활동:

- Run a very short command and observe the result.
- Read and interpret a JSON example.
- Identify parts of an HTTP request or response.
- Compare two backend scenarios.
- Draw or complete a simple flow diagram.
- Classify a feature as Web Backend, Real-time Communication, LiveOps / Tools, or Infrastructure.
- Read a log example and identify important fields.
- Review a small API contract example.
- Modify a tiny example only when it does not become a full implementation tutorial.

Learning Practice에 적합하지 않은 활동:

- Build a complete API server.
- Implement a full database integration.
- Build a real-time multiplayer server.
- Implement a full WebSocket chat server.
- Build a production admin dashboard.
- Create a commercial-ready backend project.
- Complete a long framework tutorial.

구현이 길어지는 항목은 직접 구현시키지 말고, 예시를 제공한 뒤 학생이 읽고 해석하게 합니다.

---

## 8. Quiz Rules

모든 장에는 `Quiz` 섹션이 있어야 합니다.

Quiz는 **객관식 multiple-choice only**로 작성합니다.

규칙:

- 모든 질문은 객관식입니다.
- 기본적으로 4지선다 A, B, C, D를 사용합니다.
- 정답은 하나만 둡니다.
- 답과 해설은 선택지 바로 뒤에 노출합니다.
- 해설은 짧고 명확하게 작성합니다.
- 암기보다 개념 구분을 확인하는 문항을 우선합니다.
- 기존 `Checkpoints`, `Self-Assessment`, `Self Review`는 모두 `Quiz`로 통일합니다.

권장 형식:

```markdown
## N.9 Quiz

### Question 1

Which statement best describes the role of a backend API server?

A. It only renders graphics for the game client.  
B. It receives requests, processes them, and returns responses.  
C. It replaces all game client code.  
D. It only stores image files.

**Answer: B**

**Explanation:**  
A backend API server receives requests from clients, processes service-side logic or data, and returns responses.
```

사용하지 않을 형식:

```markdown
Write your own answer.
Explain in your own words.
Discuss with your team.
Submit your answer.
```

단, 15장에서는 학습 방향 정리를 위해 `Reflection`을 추가할 수 있습니다. 하지만 `Reflection`은 Quiz를 대체하지 않습니다.

---

## 9. Topic Removal Rules

다음 내용은 새 문서에서 삭제합니다.

- Godot dice game
- Dice rolling game as a course project
- A separate public GitHub repository for the Godot dice game
- Godot HTTPRequest as a required course dependency
- Godot WebSocketPeer as a required course dependency
- Godot high-level multiplayer as a required path
- Mini Game Backend Lab as a full implementation project
- Building a complete API server in Chapter 6
- Assuming that students built an API server in Chapter 6
- WebSocket chat implementation in this guide
- Room join/leave implementation tutorial in this guide
- Production-ready LiveOps tool implementation
- Commercial backend result

Godot, Unity, Unreal, or other engines may be mentioned only as examples of possible game clients. They must not become required dependencies for this guide.

Use engine-independent examples instead:

```text
small arcade-style game scenario
score submission
leaderboard query
daily reward
inventory lookup
remote config example
chat as a conceptual example
room as a conceptual example
```

---

## 10. 5 → 6 → 7 Chapter Flow Rule

5장, 6장, 7장은 모두 concept-first 흐름으로 정리합니다.

### Chapter 5

5장은 HTTP, API, request/response, JSON, API contract를 설명합니다.  
5장에서 다음 장에 실제 서버 코드를 구현한다고 안내하지 않습니다.

삭제할 표현:

```text
In the next chapter, we will implement GET /health, POST /players, POST /scores, and GET /leaderboard in actual server code.
```

대체 표현:

```text
In the next chapter, we will use these API examples to understand how a backend API server receives requests, chooses processing logic, validates data, and returns responses. We will focus on the server-side concept flow rather than building a complete server implementation.
```

### Chapter 6

6장은 API server 내부 흐름을 concept-first로 설명합니다.  
실제 서버 코드, framework setup, route implementation tutorial을 넣지 않습니다.

유지할 방향:

```text
This chapter is not a guide for writing server code.
```

### Chapter 7

7장은 Chapter 6에서 API server를 실제로 만들었다고 가정하지 않습니다.

삭제할 표현:

```text
In Chapter 6, we built a simple API server.
In Chapter 6, we assumed that we built a simple API server.
```

대체 표현:

```text
In Chapter 6, we studied the conceptual flow of a small API server. Now, let’s ask a new question: if a backend handles player and score data, where should that data be stored so it does not disappear when the server restarts?
```

---

## 11. Real-time and LiveOps Boundary

9장과 관련 장에서는 실시간 통신을 개념적으로 소개합니다. 실제 구현은 다음 심화 과정으로 넘깁니다.

9장 초반에 다음과 같은 범위 안내를 넣을 수 있습니다.

```text
This chapter is an introductory concept chapter. We will not implement a working real-time multiplayer server in this guide. Instead, we will learn the vocabulary and mental model needed for a later real-time multiplayer backend course.
```

채팅과 채팅방은 예시로 사용할 수 있습니다. 하지만 다음을 구현하지 않습니다.

- Full WebSocket chat server
- Full chat room implementation
- Room join/leave coding tutorial
- Real-time movement synchronization
- Authoritative game loop
- Tick-based server implementation
- Lag compensation
- Client prediction
- State reconciliation

LiveOps / Tools Backend도 개념과 예시 중심으로 다룹니다. 구현하지 않을 것:

- Full admin frontend
- Production CS tool
- Complete Remote Config editor
- Complete audit log system
- Production LiveOps automation

---

## 12. Tone and English Style

문체는 학생에게 직접 설명하는 self-study guide 스타일로 작성합니다.

권장 스타일:

```text
In this chapter, we will...
Let’s look at...
At this stage, focus on...
This guide keeps the scope small by focusing on...
You will observe...
You will read and interpret...
You will practice identifying...
```

지양할 스타일:

```text
This specification defines...
The system shall...
The reader is expected to...
The implementation must...
```

반복을 줄일 표현:

```text
You do not need to memorize...
For now, it is enough to...
The goal is not to...
This chapter does not...
```

이 표현들이 필요할 때는 사용할 수 있지만, 장 전체에서 지나치게 반복하지 않습니다.

더 자연스러운 표현 예시:

| Less Natural / Overused | Preferred |
|---|---|
| JSON is a data agreement between the client and the server. | JSON is a shared data format that helps the client and server agree on what data is being sent. |
| POST is used for requesting processing. | POST is often used when the client asks the server to create data or perform an action. |
| You will build a complete server. | You will examine how a server would handle this request. |
| This is a project assignment. | This is a Learning Practice for observation and study. |

---

## 13. Terminology Rules

용어 표기를 일관되게 유지합니다.

| Use | Avoid inconsistent variants |
|---|---|
| Backend | back-end, backend system을 무작위 혼용 |
| Web Backend | Web backend / web backend 혼용 |
| Real-time Multiplayer | Real-Time Multiplayer / realtime multiplayer 혼용 |
| Real-time Communication | realtime communication |
| LiveOps | Live Ops / live operations 혼용 |
| Tools Backend | Tool Backend / tools backend 혼용 |
| Admin Tool | admin tool은 일반 명사일 때만 소문자 가능 |
| Remote Config | remote configuration과 혼용 시 설명 필요 |
| API Server | backend API server와 혼용 시 의도적으로 사용 |
| Dedicated Game Server | dedicated server만 쓸 때 문맥 확인 |
| Authoritative Server | server-authoritative model과 구분해서 설명 |
| Observability | monitoring과 같은 뜻으로 쓰지 않기 |
| Logs / Metrics / Traces | 세 개념 구분 유지 |

---

## 14. Markdown Rules

각 장은 Markdown 웹페이지로 제공됩니다.

규칙:

- 각 장은 H1 하나로 시작합니다.
- H2 제목은 장 번호를 붙여 통일합니다.
- 내부 메타데이터를 본문에 노출하지 않습니다.
- 코드 블록은 반드시 열고 닫습니다.
- 링크는 Markdown 링크 형식으로 작성합니다.
- reference-style link가 줄바꿈으로 깨지지 않게 합니다.
- raw URL만 단독으로 나열하지 않습니다.
- 표는 너무 길어지면 bullet list로 바꿉니다.
- 학생용 문서에서 `Document filename`, `Target length`, `Document type`, `en_v09` 같은 내부 정보는 제거합니다.

권장 링크 형식:

```markdown
- [MDN — HTTP overview](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview)  
  Use this when you want to review the basic structure of HTTP requests and responses.
```

피할 형식:

```markdown
- MDN HTTP overview: https://developer.mozilla.org/...
```

---

## 15. Further Reading Rules

Further Reading은 학생에게 부담을 주지 않아야 합니다.

원칙:

- 공식 문서를 우선합니다.
- 너무 많은 링크를 한꺼번에 넣지 않습니다.
- 각 링크에 “언제 읽으면 좋은지”를 짧게 설명합니다.
- vendor service는 변경될 수 있음을 필요할 때 알립니다.
- Godot 관련 링크는 삭제합니다.
- WebSocket이나 game server framework 링크는 개념 참고로만 제시합니다.

권장 안내 문구:

```text
You do not need to read all of these resources immediately. Use them as references when the topic appears in the chapter.
```

---

## 16. Review Checklist for Every Chapter

각 장 작성 후 다음 항목을 확인합니다.

```text
1. Is the chapter written in English only?
2. Is it clearly a self-study guide, not an implementation course?
3. Is the tone friendly and beginner-oriented?
4. Does the chapter avoid production-ready or commercial-level expectations?
5. Are all Godot dice game references removed?
6. Is "Learning Practice" used instead of Small Practice / Small Exercise?
7. Is the Learning Practice short and suitable for observation?
8. Does the chapter avoid full implementation tutorials unless explicitly allowed?
9. Is the Quiz multiple-choice only?
10. Are answers and explanations provided immediately after quiz options?
11. Are headings consistent?
12. Are links formatted as Markdown links?
13. Are internal metadata and draft labels removed?
14. Is the chapter readable as an independent webpage?
15. Does the transition to the next chapter match the Chapter Role Map?
```

---

## 17. Final Summary

이 guide의 작성 기준은 다음 한 줄로 정리할 수 있습니다.

```text
Write an English-only, concept-first, beginner-friendly backend self-study guide with light Learning Practice, multiple-choice Quiz, no Godot dependency, no production implementation expectation, and clear preparation for advanced backend courses.
```
