# Backend Self-Study Guide — Document Revision Workflow

> 이 문서는 새 프로젝트에서 `Backend Development Fundamentals` self-study guide를 장별로 작성하고 검토하는 **작업 프로세스 문서**입니다.  
> `00_global_revision_guide.md`, `00_chapter_role_map.md`, `00_chapter_revision_plan_template.md`와 함께 프로젝트 source로 입력하여 사용합니다.

---

## 1. Purpose

이 workflow의 목적은 기존 통합 문서의 내용을 새 기준에 맞춰 장별 웹페이지 문서로 다시 작성할 때, 작업자가 매번 같은 절차를 따르도록 하는 것입니다.

새 문서의 최종 방향은 다음과 같습니다.

```text
English-only self-study guide
Concept-first backend introduction
Light Learning Practice
Multiple-choice Quiz only
No Godot dice game dependency
No full implementation project
No production-ready expectation
Preparation for advanced courses
```

---

## 2. Core Workflow Summary

전체 작업은 다음 순서로 진행합니다.

```text
1. Global Revision Guide 작성 및 확인
2. Chapter Role Map 작성 및 확인
3. Chapter Revision Plan Template 준비
4. Chapter 1 Revision Plan 작성
5. Chapter 1 본문 작성
6. Chapter 1 검토 및 수정
7. Chapter 1 결과를 기준으로 Global Revision Guide와 Chapter Role Map hard freeze
8. Chapter 2부터 동일한 방식으로 장별 작업 진행
9. 3~4장 단위로 group review 진행
10. 15장 완료 후 전체 consistency review 진행
```

핵심 원칙은 다음입니다.

```text
전체 기준은 먼저 확정한다.
본문은 한 장씩 작성한다.
각 장 작성 전에는 반드시 작업 계획을 만든다.
각 장 작성 후에는 즉시 검토한다.
3~4장 단위로 전체 흐름을 다시 확인한다.
```

---

## 3. Why Not Update the Whole Document at Once?

기존 문서는 분량이 크고, 장마다 문체와 구조가 다르며, 일부 장은 구현 중심 흐름처럼 읽힙니다. 전체를 한 번에 수정하면 다음 문제가 생길 수 있습니다.

```text
- Godot 관련 문장을 삭제한 뒤 문맥 공백이 생길 수 있다.
- 실제 구현 표현을 제거하다가 필요한 학습 실습까지 약해질 수 있다.
- 장별 Learning Practice 품질이 들쭉날쭉해질 수 있다.
- Quiz 형식이 일관되지 않을 수 있다.
- 5장 → 6장 → 7장 같은 연결 흐름을 놓칠 수 있다.
- 영어 문체를 세밀하게 다듬기 어렵다.
```

따라서 본문은 장별로 새 파일에 작성합니다.

---

## 4. Recommended Work Model

추천 방식은 다음과 같습니다.

```text
Soft Freeze → Sample Chapter → Hard Freeze → Chapter-by-Chapter Production
```

### 4.1 Soft Freeze

먼저 다음 세 문서를 초안으로 확정합니다.

```text
00_global_revision_guide.md
00_chapter_role_map.md
00_chapter_revision_plan_template.md
```

이 단계에서는 기준을 임시로 고정합니다. 아직 완전히 잠그지 않습니다.

### 4.2 Sample Chapter

Chapter 1을 기준 문서에 따라 실제로 작성합니다.

목적:

```text
- 전역 기준이 실제 본문 작성에 잘 작동하는지 확인한다.
- Learning Practice 명칭과 구조가 자연스러운지 확인한다.
- Quiz multiple-choice only 규칙이 적절한지 확인한다.
- Godot 삭제 후 문맥이 자연스럽게 유지되는지 확인한다.
- 영어 self-study guide 문체가 잘 맞는지 확인한다.
```

### 4.3 Hard Freeze

Chapter 1 샘플이 만족스럽다면 기준 문서를 최종 확정합니다.

이후 기준 변경이 필요하면 변경 로그를 남깁니다.

```markdown
## Change Log

- v1.0: Hard freeze after Chapter 1 sample.
- v1.1: Updated Quiz rule to require four options per question.
```

### 4.4 Chapter-by-Chapter Production

Chapter 2부터는 확정된 기준에 따라 한 장씩 작성합니다.

---

## 5. File Structure Recommendation

권장 파일 구조는 다음과 같습니다.

```text
project-root/
  sources/
    00_global_revision_guide.md
    00_chapter_role_map.md
    00_chapter_revision_plan_template.md
    00_document_revision_workflow.md

  plans/
    01_about_the_course_plan.md
    02_backend_mindset_and_development_environment_plan.md
    ...

  chapters/
    01_about_the_course.md
    02_backend_mindset_and_development_environment.md
    03_introduction_to_modern_backend.md
    04_internet_and_networking_fundamentals.md
    05_web_http_and_api.md
    06_understanding_your_first_backend_api.md
    07_data_and_databases.md
    08_game_backend_services.md
    09_realtime_communication_and_dedicated_game_servers.md
    10_infrastructure_deployment_and_cloud.md
    11_security_basics_for_backend.md
    12_observability_logging_and_operations.md
    13_dashboard_tools_and_admin_frontend.md
    14_backend_architecture_patterns.md
    15_future_of_backend_and_learning_paths.md

  reviews/
    group_01_chapters_01_03_review.md
    group_02_chapters_04_06_review.md
    group_03_chapters_07_09_review.md
    group_04_chapters_10_12_review.md
    group_05_chapters_13_15_review.md
    final_consistency_review.md
```

계획 파일은 대화 안에서만 작성해도 되지만, 장기 프로젝트라면 `plans/`에 남기는 것을 권장합니다.

---

## 6. Per-Chapter Workflow

각 장은 다음 순서로 작업합니다.

```text
1. Read source rules
2. Review old chapter content
3. Create Chapter Revision Plan
4. Write new chapter file
5. Review chapter against checklist
6. Revise chapter
7. Save final chapter file
8. Move to next chapter
```

---

## 7. Step 1 — Read Source Rules

각 장 작업 전에 반드시 다음 문서를 확인합니다.

```text
00_global_revision_guide.md
00_chapter_role_map.md
00_chapter_revision_plan_template.md
00_document_revision_workflow.md
```

확인할 핵심 질문:

```text
- 이 guide의 최종 성격은 무엇인가?
- 이 장의 역할은 무엇인가?
- 이 장에서 다루지 않아야 할 내용은 무엇인가?
- Learning Practice는 어떤 수준이어야 하는가?
- Quiz는 어떤 형식이어야 하는가?
```

---

## 8. Step 2 — Review Old Chapter Content

기존 `backend.md` 또는 기존 장 본문에서 해당 장을 읽고 다음을 분류합니다.

```text
Keep
Remove
Rewrite
Move to advanced course
```

### 8.1 Keep

좋은 개념 설명, 유용한 게임 백엔드 예시, 정확한 기술 설명은 유지합니다.

예:

```text
- CORS와 HTTPS를 구분하는 설명
- Cache는 source of truth가 아니라는 설명
- Authoritative Server와 Dedicated Game Server를 구분하는 설명
- Logs, Metrics, Traces를 구분하는 설명
```

### 8.2 Remove

다음은 삭제합니다.

```text
- Godot dice game
- Dice rolling game repository
- Full implementation project wording
- Small Practice / Small Exercise
- Checkpoints / Self-Assessment
- Production-ready implication
- Internal metadata
```

### 8.3 Rewrite

방향은 좋지만 새 기준과 맞지 않는 표현은 다시 씁니다.

예:

```text
Build this API → Read this API contract
Small Exercise → Learning Practice
Self-Assessment → Quiz
Implement a chat room → Understand how a chat room concept works
```

### 8.4 Move to Advanced Course

너무 깊은 구현은 후속 과정으로 넘깁니다.

예:

```text
- Real-time multiplayer server implementation
- WebSocket chat server implementation
- Full API server implementation
- Database migration and ORM implementation
- Cloud deployment tutorial
- Production admin dashboard implementation
```

---

## 9. Step 3 — Create Chapter Revision Plan

각 장의 본문을 쓰기 전에 `00_chapter_revision_plan_template.md`를 사용해 plan을 작성합니다.

계획에는 반드시 다음이 들어갑니다.

```text
- Chapter Identity
- Chapter Role
- Previous / Next Chapter Connection
- Keep
- Remove
- Rewrite
- Advanced Course Boundary
- Final Section Structure
- Learning Practice Plan
- Quiz Plan
- Further Reading Plan
- Style Notes
- Markdown Notes
```

계획이 명확하지 않으면 본문을 작성하지 않습니다. 먼저 계획을 보완합니다.

---

## 10. Step 4 — Write New Chapter File

계획이 확정되면 새 장 파일을 작성합니다.

작성 기준:

```text
- English only
- Self-study guide tone
- Beginner-friendly explanations
- Game backend examples
- Learning Practice, not Small Practice
- Multiple-choice Quiz only
- No implementation-heavy drift
- No Godot dice game dependency
- No internal metadata
- Webpage-readable chapter structure
```

작성 중 특히 주의할 점:

```text
- “build”라는 단어를 사용할 때 실제 구현을 의미하는지 확인한다.
- 실습이 상용 결과물처럼 보이지 않게 한다.
- 설명이 보고서식이 아니라 학생에게 직접 말하는 문체인지 확인한다.
- 장 마지막의 Quiz가 객관식인지 확인한다.
```

---

## 11. Step 5 — Review Chapter Against Checklist

작성 후 다음 체크리스트로 검토합니다.

```text
1. Is the chapter English only?
2. Is it a self-study guide rather than an implementation course?
3. Is the tone friendly and beginner-oriented?
4. Are all Godot dice game references removed?
5. Is "Learning Practice" used consistently?
6. Is the Learning Practice suitable for observation and study?
7. Does the chapter avoid production-ready expectations?
8. Is the Quiz multiple-choice only?
9. Does each Quiz question include answer and explanation?
10. Are headings consistent?
11. Are Markdown links formatted properly?
12. Are code blocks closed correctly?
13. Are internal metadata and draft labels removed?
14. Is the chapter readable as an independent webpage?
15. Does the transition to the next chapter match the Chapter Role Map?
```

---

## 12. Step 6 — Revise Chapter

검토에서 발견된 문제를 수정합니다.

수정 우선순위:

```text
1. Scope conflicts
2. Implementation drift
3. Godot or removed-topic remnants
4. Learning Practice mismatch
5. Quiz format mismatch
6. Technical inaccuracy
7. Chapter flow problem
8. English awkwardness
9. Markdown structure issues
10. Link formatting
```

---

## 13. Step 7 — Save Final Chapter File

장별 파일명은 다음 형식을 권장합니다.

```text
01_about_the_course.md
02_backend_mindset_and_development_environment.md
03_introduction_to_modern_backend.md
04_internet_and_networking_fundamentals.md
05_web_http_and_api.md
06_understanding_your_first_backend_api.md
07_data_and_databases.md
08_game_backend_services.md
09_realtime_communication_and_dedicated_game_servers.md
10_infrastructure_deployment_and_cloud.md
11_security_basics_for_backend.md
12_observability_logging_and_operations.md
13_dashboard_tools_and_admin_frontend.md
14_backend_architecture_patterns.md
15_future_of_backend_and_learning_paths.md
```

---

## 14. Group Review Workflow

각 장을 하나씩 작성하되, 3~4장 단위로 중간 일관성 검토를 진행합니다.

| Group | Chapters | Review Focus |
|---|---|---|
| Group 1 | 1–3 | Guide identity, self-study tone, backend map |
| Group 2 | 4–6 | Networking → HTTP → conceptual API server flow |
| Group 3 | 7–9 | Data → game backend services → real-time concepts |
| Group 4 | 10–12 | Infrastructure → security → observability |
| Group 5 | 13–15 | Tools → architecture → future learning paths |

---

## 15. Group Review Checklist

그룹 검토에서는 다음을 확인합니다.

```text
1. Do chapters in this group connect naturally?
2. Is any topic repeated too much?
3. Is any prerequisite missing?
4. Does the implementation scope remain controlled?
5. Are Learning Practice sections consistent in tone and difficulty?
6. Are Quiz sections consistent in format?
7. Are key terms used consistently?
8. Are advanced course boundaries clear?
9. Does each chapter still work as a standalone webpage?
10. Is the student experience smooth across the group?
```

---

## 16. Final Consistency Review Workflow

15개 장이 모두 완료되면 최종 전체 검토를 진행합니다.

최종 검토 항목:

```text
1. Overall document identity
2. Chapter order and flow
3. Terminology consistency
4. Learning Practice consistency
5. Quiz consistency
6. Removal of Godot dice game references
7. Removal of full implementation expectations
8. Advanced course boundary consistency
9. English style consistency
10. Markdown structure consistency
11. Further Reading link consistency
12. Technical accuracy
13. Webpage independence
14. Student learning experience
15. Final learning path clarity
```

---

## 17. Handling Scope Conflicts

작업 중 다음과 같은 충돌이 생기면 Global Revision Guide를 우선합니다.

### Conflict Example 1

기존 문서가 “Chapter 6에서 실제 API를 구현한다”고 말하지만, 새 기준은 concept-first입니다.

Decision:

```text
Delete implementation promise.
Rewrite as conceptual API server flow.
```

### Conflict Example 2

기존 문서가 Godot dice game을 중심 예시로 사용합니다.

Decision:

```text
Remove Godot reference.
Replace with engine-independent game backend scenario.
```

### Conflict Example 3

기존 문서에 Checkpoints가 있습니다.

Decision:

```text
Convert to multiple-choice Quiz with answer and explanation.
```

### Conflict Example 4

기존 문서에 실제 WebSocket chat implementation이 있습니다.

Decision:

```text
Convert to conceptual example or move to Real-time Multiplayer advanced course boundary.
```

---

## 18. Recommended First Execution Plan

새 프로젝트에서 첫 작업은 다음 순서로 진행합니다.

```text
1. Add these four source documents to the project:
   - 00_global_revision_guide.md
   - 00_chapter_role_map.md
   - 00_chapter_revision_plan_template.md
   - 00_document_revision_workflow.md

2. Ask the assistant to read all four source documents.

3. Ask for Chapter 1 Revision Plan.

4. Review and approve the plan.

5. Ask for Chapter 1 full draft.

6. Review Chapter 1 against checklist.

7. Revise Chapter 1.

8. Hard freeze source rules if Chapter 1 works well.

9. Continue with Chapter 2.
```

Example prompt for new project:

```text
Read the project source documents first:
- 00_global_revision_guide.md
- 00_chapter_role_map.md
- 00_chapter_revision_plan_template.md
- 00_document_revision_workflow.md

Then create the Chapter 1 Revision Plan for `01_about_the_course.md`. Do not write the full chapter yet. Follow the workflow and make sure the plan removes Godot dice game references, uses Learning Practice, and prepares multiple-choice Quiz only.
```

---

## 19. Change Control

기준 문서는 작업 중 자주 바꾸지 않습니다.

변경이 필요할 때는 다음을 기록합니다.

```markdown
## Change Log

### v1.0
Initial source rules.

### v1.1
Changed all Small Practice naming to Learning Practice.

### v1.2
Confirmed all Quiz sections must be multiple-choice only.
```

변경이 발생하면 이미 작성된 장에 영향을 주는지 검토합니다.

---

## 20. Final Output Expectations

각 장의 최종 결과물은 다음 조건을 만족해야 합니다.

```text
- English-only Markdown file
- Standalone webpage-ready chapter
- Clear beginner-friendly self-study tone
- Concept-first content
- Engine-independent game backend examples
- Learning Practice section
- Multiple-choice Quiz section with answers and explanations
- Further Reading section with Markdown links
- No Godot dice game dependency
- No full production implementation expectation
```

---

## 21. Final Summary

이 workflow는 다음 원칙을 지키기 위해 존재합니다.

```text
Do not rewrite the entire long document at once.
Define the global rules first.
Define each chapter's role.
Plan each chapter before writing.
Write one chapter at a time.
Review immediately.
Review groups of chapters for consistency.
Finish with a full-document consistency pass.
```

이 절차를 따르면 기존 문서가 가지고 있던 좋은 개념 설명은 유지하면서도, 새 프로젝트의 목표인 **English-only concept-first backend self-study guide**로 안정적으로 재구성할 수 있습니다.
