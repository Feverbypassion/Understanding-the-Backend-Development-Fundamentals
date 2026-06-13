# Backend Self-Study Guide — Chapter Revision Plan Template

> 이 문서는 각 장을 새로 작성하기 전에 사용하는 **작업 계획 템플릿(Chapter Revision Plan Template)** 입니다.  
> 모든 장은 본문을 작성하기 전에 이 템플릿을 채워서 장의 역할, 범위, 삭제할 내용, Learning Practice, Quiz 방향을 먼저 확정합니다.

---

## How to Use This Template

각 장 작업 전 다음 순서로 진행합니다.

```text
1. Global Revision Guide를 확인한다.
2. Chapter Role Map에서 해당 장의 역할을 확인한다.
3. 기존 backend.md에서 해당 장의 좋은 내용과 삭제할 내용을 파악한다.
4. 이 템플릿을 채워 Chapter Revision Plan을 만든다.
5. 계획을 기준으로 새 장 파일을 작성한다.
6. 작성 후 Review Checklist로 검토한다.
```

최종 학생용 본문은 영어로 작성하지만, 이 계획 문서는 한국어로 작성해도 됩니다. 단, 실제 장 제목과 섹션 제목은 최종 영어 표현을 함께 적는 것이 좋습니다.

---

# Chapter N Revision Plan

## 1. Chapter Identity

| Item | Value |
|---|---|
| Chapter Number | N |
| Chapter Title |  |
| Target Output File | `NN_chapter_slug.md` |
| Final Language | English only |
| Document Type | Self-study guide webpage |
| Main Reader | Beginner students learning backend concepts |

예시:

```text
Chapter Number: 5
Chapter Title: Web, HTTP, and API
Target Output File: 05_web_http_and_api.md
```

---

## 2. Chapter Role

이 장이 전체 guide 안에서 맡는 역할을 한 문단으로 정리합니다.

작성 질문:

```text
- 이 장은 학생에게 어떤 큰 그림을 제공해야 하는가?
- 이전 장에서 무엇을 받아 오는가?
- 다음 장으로 어떤 질문을 넘겨야 하는가?
- 이 장은 구현 장인가, 개념 장인가, 관찰 실습 장인가?
```

작성 예시:

```markdown
This chapter explains HTTP request/response and API contracts. It helps students understand how a client and server exchange data through methods, paths, headers, body, JSON, and status codes. It does not teach a full API server implementation. It prepares students for Chapter 6, where they will study how an API server conceptually handles requests.
```

---

## 3. Connection to Previous and Next Chapters

### Previous Chapter Connection

이전 장에서 이어받는 개념을 정리합니다.

```markdown
Previous chapter: Chapter X — Title
Connection:
- ...
- ...
```

### Next Chapter Transition

다음 장으로 넘길 질문 또는 연결 문장을 정리합니다.

```markdown
Next chapter: Chapter Y — Title
Transition idea:
- ...
- ...
```

주의: 5장 → 6장 → 7장에서는 실제 API 구현 흐름을 만들지 않습니다.

---

## 4. Keep

기존 문서에서 유지할 내용을 정리합니다.

```markdown
Keep:
- Explanation of ...
- Table comparing ...
- Example scenario about ...
- Warning about ...
```

유지할 내용은 그대로 복사하기보다, 새 기준에 맞게 다시 작성합니다.

---

## 5. Remove

삭제할 내용을 정리합니다.

공통 삭제 대상:

```markdown
Remove:
- Godot dice game references
- Dice rolling game repository references
- Small Practice / Small Exercise naming
- Checkpoints / Self-Assessment naming
- Full implementation expectations
- Production-ready wording
- Internal metadata such as Document filename, Target length, en_v09
```

장별 삭제 대상도 함께 적습니다.

예시:

```markdown
Chapter-specific remove:
- Statements saying Chapter 6 will implement APIs in actual server code
- Framework setup steps
- Long implementation tutorial
```

---

## 6. Rewrite

다시 써야 할 내용을 정리합니다.

```markdown
Rewrite:
- Change "Hands-on Exercise Overview" to "Learning Practice Overview".
- Change project-based wording to concept-first guide wording.
- Replace Godot-specific examples with engine-independent game backend scenarios.
- Convert Checkpoints into multiple-choice Quiz.
```

---

## 7. Advanced Course Boundary

이 장에서 소개만 하고 깊게 들어가지 않을 내용을 명확히 적습니다.

작성 질문:

```text
- 어떤 내용은 후속 심화 과정으로 넘길 것인가?
- 학생이 이 장에서 구현할 필요가 없는 것은 무엇인가?
- 어떤 표현을 쓰면 이 장이 구현 과정처럼 오해될 수 있는가?
```

예시:

```markdown
Advanced Course Boundary:
- Actual API server implementation belongs to the later Web Backend course.
- Real-time server implementation belongs to the later Real-time Multiplayer Backend course.
- Production deployment belongs to the Cloud / Infrastructure course.
```

---

## 8. Final Section Structure

최종 장 목차를 작성합니다.

기본 구조:

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

장 성격에 따라 조정할 수 있지만, `Learning Practice`, `Chapter Summary`, `Quiz`, `Further Reading`은 가능한 한 유지합니다.

---

## 9. Learning Practice Plan

Learning Practice는 짧고 관찰 중심이어야 합니다.

### Learning Practice Title

```markdown
Learning Practice: ...
```

### Learning Goal

```markdown
Students will observe / identify / compare / classify ...
```

### Practice Type

하나를 선택합니다.

```text
- Command observation
- Example reading
- JSON interpretation
- API contract reading
- Flow diagram completion
- Scenario classification
- Log reading
- Risk classification
- Learning plan creation
```

### Production Boundary Note

필요하면 다음 문장을 넣습니다.

```markdown
This Learning Practice is for observation and study. It is not a production-ready implementation.
```

### Expected Student Action

```markdown
Students will:
1. ...
2. ...
3. ...
```

### What Students Should Observe

```markdown
Students should notice:
- ...
- ...
- ...
```

---

## 10. Quiz Plan

Quiz는 모두 객관식입니다.

### Number of Questions

권장 범위:

```text
5–8 questions per chapter
```

### Question Types

사용할 문항 유형을 정합니다.

```text
- Concept definition
- Scenario selection
- Difference between two concepts
- Correct / incorrect statement
- Match a feature to a backend area
- Choose the safest backend decision
```

### Quiz Topics

```markdown
Quiz should check:
- ...
- ...
- ...
```

### Required Format

```markdown
### Question 1

Question text...

A. ...  
B. ...  
C. ...  
D. ...

**Answer: B**

**Explanation:**  
...
```

주의:

```text
- Do not use open-ended quiz questions.
- Do not use "write your answer" as Quiz.
- Do not hide the answer.
- Do not omit explanation.
```

---

## 11. Further Reading Plan

이 장에서 제공할 참고 자료를 정리합니다.

```markdown
Further Reading:
- [Title](URL)  
  Why / when students should read it.
```

원칙:

```text
- Prefer official documentation.
- Do not include too many links.
- Explain why each link is useful.
- Remove Godot-specific links unless the chapter is explicitly about engine examples, which this guide generally is not.
- If vendor services may change, include a short caution.
```

---

## 12. Style Notes

이 장에서 주의할 영어 문체와 용어를 정리합니다.

```markdown
Style Notes:
- Use beginner-friendly English.
- Use "you" and "we" naturally.
- Avoid sounding like an internal design document.
- Avoid repeating "You do not need to memorize" too often.
- Use "Learning Practice" consistently.
- Use "Quiz" consistently.
```

장별 용어 예시:

```markdown
Terminology:
- Use "Real-time Communication", not "realtime communication".
- Use "LiveOps", not "Live Ops".
- Use "API Server" when referring to the server that receives API requests.
```

---

## 13. Markdown Notes

```markdown
Markdown Notes:
- Use one H1 only.
- Use numbered H2 headings.
- Keep code fences balanced.
- Use Markdown links, not raw URLs.
- Remove internal metadata.
- Keep tables readable.
- Avoid very long tables if a list would be clearer.
```

---

## 14. Drafting Checklist Before Writing

본문 작성 전에 확인합니다.

```text
1. Did I read the Global Revision Guide?
2. Did I check this chapter in the Chapter Role Map?
3. Did I define this chapter's role clearly?
4. Did I identify what to keep from the old document?
5. Did I identify what to remove?
6. Did I define the Learning Practice?
7. Did I define Quiz topics and format?
8. Did I define the advanced course boundary?
9. Did I prepare the final section structure?
10. Did I check style and terminology notes?
```

---

## 15. Post-Draft Review Checklist

작성 후 검토합니다.

```text
1. Is the chapter English only?
2. Is it clearly a self-study guide?
3. Does it avoid full implementation expectations?
4. Does it remove Godot dice game references?
5. Does it use Learning Practice consistently?
6. Is the Learning Practice short and study-oriented?
7. Is the Quiz multiple-choice only?
8. Does each Quiz question include answer and explanation?
9. Are headings consistent?
10. Are links formatted properly?
11. Are internal metadata removed?
12. Is the chapter readable as an independent webpage?
13. Does it transition naturally to the next chapter?
14. Does it respect the advanced course boundary?
15. Is the English natural and beginner-friendly?
```

---

# Filled Example — Chapter 5 Revision Plan

아래는 Chapter 5 계획 예시입니다.

## 1. Chapter Identity

| Item | Value |
|---|---|
| Chapter Number | 5 |
| Chapter Title | Web, HTTP, and API |
| Target Output File | `05_web_http_and_api.md` |
| Final Language | English only |
| Document Type | Self-study guide webpage |
| Main Reader | Beginner students learning backend concepts |

## 2. Chapter Role

Chapter 5 explains HTTP request/response and API contracts. It helps students understand how clients and servers exchange data through methods, paths, headers, bodies, JSON, and status codes. It does not teach a full API server implementation. It prepares students for Chapter 6, where they will study how an API server conceptually handles requests.

## 3. Connection to Previous and Next Chapters

Previous chapter: Chapter 4 — Internet and Networking Fundamentals

Connection:
- Chapter 4 explains basic networking terms such as IP, port, DNS, TCP, and UDP.
- Chapter 5 explains HTTP as a common protocol used for Web Backend request/response communication.

Next chapter: Chapter 6 — Understanding Your First Backend API

Transition idea:
- Chapter 6 will use API examples to explain how an API server conceptually receives, validates, processes, and responds to requests.
- It will not implement a full server.

## 4. Keep

- HTTP request and response explanation
- Methods: GET, POST, PUT, PATCH, DELETE
- Status codes: 200, 201, 400, 401, 403, 404, 500
- JSON explanation
- CORS and HTTPS distinction
- OpenAPI / Swagger overview
- API examples such as `/health`, `/players`, `/scores`, `/leaderboard`

## 5. Remove

- Any sentence saying Chapter 6 will implement APIs in actual server code
- Any wording that turns API examples into required implementation tasks
- Godot-specific client examples
- Small Exercise / Checkpoints naming

## 6. Rewrite

- Present `/health`, `/players`, `/scores`, `/leaderboard` as API contract examples.
- Convert practice into API contract reading.
- Convert final check into multiple-choice Quiz.

## 7. Advanced Course Boundary

- Actual API server implementation belongs to the later Web Backend course.
- Framework tutorials such as Express or FastAPI are not included in this guide.

## 8. Final Section Structure

```markdown
# 5. Web, HTTP, and API

## 5.1 How to Read This Chapter
## 5.2 What You Will Learn
## 5.3 Why HTTP Matters in Backend Development
## 5.4 HTTP Request and Response
## 5.5 Methods, Paths, Headers, and Body
## 5.6 JSON and API Contracts
## 5.7 Status Codes
## 5.8 CORS, HTTPS, and API Documentation
## 5.9 Learning Practice
## 5.10 Common Mistakes
## 5.11 Chapter Summary
## 5.12 Quiz
## 5.13 Further Reading
```

## 9. Learning Practice Plan

Learning Practice: Read a Simple API Contract

Students will identify:
- Method
- Path
- Request body
- Response body
- Status code
- What the server should validate

Production note:

```markdown
This Learning Practice is for reading and understanding API contracts. You are not expected to implement these endpoints in this chapter.
```

## 10. Quiz Plan

5–8 multiple-choice questions.

Topics:
- HTTP method roles
- Status code meaning
- JSON as shared data format
- Difference between CORS and HTTPS
- Purpose of API documentation

## 11. Further Reading Plan

- MDN HTTP overview
- MDN HTTP request methods
- MDN HTTP response status codes
- OpenAPI Learn

## 12. Style Notes

- Use `API contract` consistently.
- Avoid saying `build` when the action is only `read`, `identify`, or `understand`.

## 13. Markdown Notes

- Use Markdown links.
- Keep API examples in fenced code blocks.

