# 14. Backend Architecture Patterns

## 14.1 How to Read This Chapter

In this chapter, we will connect several backend topics you have already seen. These include the API Server, database, cache, queue, logs, dashboards, admin tools, Remote Config, rewards, and operations. Earlier chapters introduced these pieces one by one. This chapter asks a different question:

```text
How should these responsibilities be organized inside one backend system?
```

This chapter is a concept-first introduction. You are not expected to build microservices, queues, serverless functions, or distributed systems in this guide. Instead, focus on the reason for using each pattern.

As you read, keep asking these questions.

- What problem is this pattern trying to solve?
- What new trade-off does this pattern introduce?
- Is this pattern needed now, or could it wait until a real problem appears?
- Can the current team understand, test, operate, and debug this structure?

Keep this sentence in mind:

```text
Architecture patterns are not trophies. They are tools for managing trade-offs.
```

This chapter is especially important after studying dashboards and admin tools. Backend systems are used not only by players, but also by operators, support staff, and LiveOps teams. Architecture choices affect both player-facing features and internal tools.

By the end of the chapter, you should be able to explain why a simple architecture can be a good starting point, why microservices are not automatically better, when a cache or queue may help, and how to judge architecture decisions by cost, complexity, performance, reliability, security, operability, data correctness, and team understanding.

---

## 14.2 What You Will Learn

By the end of this chapter, you should be able to:

- Explain why backend architecture is about responsibilities, connections, and trade-offs.
- Describe the difference between a monolith and a modular monolith.
- Explain why a modular monolith can be a strong starting point for a small game backend.
- Describe what changes when a system moves toward microservices.
- Distinguish a module boundary from a service boundary.
- Explain synchronous and asynchronous processing with game backend examples.
- Distinguish a queue, a job, and a domain event.
- Explain why cache can improve read performance but should not become the only source of truth for important player data.
- Describe the basic role of load balancing, serverless execution, and managed services.
- Use architecture decision criteria such as cost, complexity, performance, reliability, security, operability, data correctness, and team understanding.

This chapter does not require you to design a large live-service backend. It gives you vocabulary and judgment tools so that later architecture discussions become easier to understand.

The most important learning goal is not memorizing pattern names. The most important goal is matching a pattern to a problem.

```text
Problem first.
Pattern second.
Trade-off always.
```

---

## 14.3 Why Architecture Patterns Matter

A backend is not just a list of APIs. It is a connected system of responsibilities.

Imagine a player finishes a match and submits a score.

```text
Game Client
→ Score Submission API
→ Authentication check
→ Score validation
→ Database save
→ Leaderboard update
→ Mission or reward check
→ Analytics event
→ Log entry
→ Response to client
```

From the player’s point of view, this may look like one simple action: “I submitted my score.” Inside the backend, several responsibilities are connected.

Now imagine that the same score later appears in an admin review screen. An operator may need to check whether the score is suspicious, see when it was submitted, compare it with previous scores, and possibly take action. This means the backend structure must also support internal tools, audit logs, permissions, and safe investigation.

Architecture is the way we reason about questions like these.

```text
Which responsibilities should live together?
Which responsibilities should be separated?
Which data is the source of truth?
Which data can be copied to a cache?
Which work must happen immediately?
Which work can happen later?
Which delays or temporary inconsistencies are acceptable for a few seconds?
Which failures should stop the request?
How will operators understand what happened?
```

A pattern is a reusable way to organize part of this structure. However, a pattern is not automatically good or bad on its own. A pattern becomes useful only when it solves a real problem in the current context.

For example:

- A cache can help when many players read the same leaderboard repeatedly. However, it can also introduce stale data and invalidation problems.
- A queue can help move slow work out of the immediate request path. However, it also introduces retry, duplicate processing, and failure-handling questions.
- Microservices can help teams or systems scale independently. However, they also add network calls, deployment complexity, monitoring needs, and data consistency challenges.

So architecture is not about drawing impressive diagrams. It is a thinking tool for deciding how to divide, connect, change, and operate backend features.

A good architecture should help the team answer practical questions.

| Question | Why it matters |
|---|---|
| Can we understand the system? | A structure that the team cannot understand becomes risky. |
| Can we change one feature safely? | Live game services change often after launch. |
| Can we debug failures? | Logs, metrics, traces, and clear ownership matter. |
| Can operators use the system safely? | Admin tools can affect live player data. |
| Can the system handle expected traffic? | Performance problems should be solved with the simplest effective tool. |
| Can we afford the system? | More services and infrastructure can increase cost. |

When you study architecture patterns, avoid asking only, “Which pattern is more modern?” A better question is:

```text
What problem do we have, and what is the simplest structure that solves it safely enough?
```

---

## 14.4 Start Simple: Monolith and Modular Monolith

A **monolith** is a backend structure where multiple features live inside one application.

A small game backend may begin like this.

```text
[Game Client]
     |
     v
[Backend API Server]
     |
     v
[Database]
```

Inside the same backend application, you may have features such as authentication, player profile, inventory, score submission, leaderboard, daily rewards, Remote Config, and an Admin API area.

```text
Backend API Server
  - Auth
  - Player Profile
  - Inventory
  - Score
  - Leaderboard
  - Reward
  - Remote Config
  - Admin API
```

This structure is not automatically bad. For a small team or a learning project, one backend application can be easier to understand, run, test, deploy, and monitor.

A monolith becomes dangerous when every feature is mixed together without clear responsibility. For example, score logic should not randomly change inventory data without a clear rule. Admin operations should not bypass validation just because they are internal. Reward logic should not be copied in three unrelated places. When code grows without boundaries, the system becomes harder to understand even if it is still one application.

A **modular monolith** keeps one deployable backend application, but divides the code by responsibility.

```text
Backend API Server
  - Auth Module
  - Player Module
  - Inventory Module
  - Leaderboard Module
  - Reward Module
  - Config Module
  - Admin Module
```

This is often a strong starting point.

A modular monolith gives you operational simplicity while encouraging clear internal design. You still deploy one backend application, but you think carefully about which module owns which data and which rules.

The difference between a module boundary and a service boundary is important.

| Boundary type | Meaning | Beginner-friendly view |
|---|---|---|
| Module boundary | Code is separated inside one application. | One application, clearer internal sections. |
| Service boundary | A feature becomes a separately deployable service. | Multiple applications that communicate over a network. |

A module boundary is easier to start with. A service boundary is more powerful but also more expensive to operate.

For example, in a small game called Mini Arena, a modular monolith might begin like this.

| Feature | Starting structure | Future change to consider |
|---|---|---|
| Player profile | Player module inside one API Server | May stay as a module for a long time. |
| Inventory | Inventory module inside one API Server | Consider stronger separation if economy rules grow. |
| Leaderboard | Leaderboard module inside one API Server | Add cache if reads become heavy. |
| Daily reward | Reward module inside one API Server | Keep immediate player claims simple. |
| Season reward | Reward module plus background worker later | Add queue if many players need rewards at once. |
| Remote Config | Config module connected to admin features | Add permissions and audit logs carefully. |
| Admin review | Admin module or Admin API area | Strengthen authorization and audit logs. |

The practical lesson is:

```text
You do not need to split everything from the beginning.
But you should separate responsibilities from the beginning.
```

A monolith can be a good starting point. A modular monolith can be an even better learning structure because it teaches boundaries without forcing distributed system complexity too early.

---

## 14.5 When Systems Grow: Microservices and Service Boundaries

**Microservices** are an architectural style where a larger system is divided into smaller, independently deployable services. For example, a game backend might eventually have separate services for account, inventory, leaderboard, notification, purchase, or analytics.

A very simplified structure might look like this.

```text
[Game Client]
     |
     v
[API Gateway / Edge API (optional)]
     |
     +--> [Account Service]
     +--> [Inventory Service]
     +--> [Leaderboard Service]
     +--> [Reward Service]
     +--> [Notification Service]
```

An API Gateway or Edge API can route requests and apply cross-cutting checks such as authentication, rate limiting, or request routing. However, it should not become a catch-all layer where unrelated domain rules are mixed together. Domain rules still need clear ownership.

This kind of split can be useful when different parts of the system have very different needs. For example, leaderboard reads may need caching and high read throughput. Notification sending may be asynchronous. Purchase-related logic may need stricter security and auditability. Real-time match servers may have a completely different runtime model from Web Backend APIs.

Microservices can help in situations such as these:

- Different teams need to work on different areas independently.
- One feature needs to scale differently from the rest of the system.
- One area has stronger reliability or security requirements.
- A background processing pipeline grows large enough to need separate ownership.
- Deployment schedules are different across feature areas.
- A service needs a different technical stack for a clear reason.

However, microservices are not automatically better. They introduce several new challenges.

| Added difficulty | What it means |
|---|---|
| Network communication | Services must call each other over the network. |
| Deployment complexity | Each service may need its own deployment process. |
| Observability complexity | Logs, metrics, and traces must connect across services. |
| Data consistency | One request may affect data owned by multiple services. |
| Local development complexity | Running the whole system locally can become harder. |
| Failure handling | One service may fail while another succeeds. |
| Team understanding | Students and new developers must understand more moving parts. |

A common mistake is creating a **distributed monolith**. This means the system has many services, but the services are still tightly coupled. They must be deployed together, changed together, and understood together. In that case, the team gets the complexity of microservices without getting enough independence.

Before splitting a service, ask these questions.

```text
Does this feature really need independent deployment?
Does this feature really need independent scaling?
Does the team have the operational skill to run more services?
Do we understand who owns the data?
Can we observe requests across service boundaries?
What happens if one service is unavailable?
```

**Data ownership** is one of the most important ideas in service boundaries. If an inventory service owns inventory data, other services should not freely modify inventory tables behind its back. If a leaderboard service owns ranking data, other services should not update ranking state without a clear contract.

A service boundary also needs a clear API contract. Other services should know how to call it, what data it returns, what errors it may produce, and how changes will remain compatible. Versioning and backward compatibility become more important when several services depend on each other.

For beginners, the safest mental model is:

```text
Start with clear modules.
Split into services only when a real scaling, reliability, deployment, or team problem justifies it.
```

Microservices are powerful, but they belong after responsibility boundaries are already understood. Do not use them just because they look professional.

---

## 14.6 Synchronous and Asynchronous Processing

A backend does not need to process every piece of work in the same way. Some work should happen immediately. Other work can happen later.

**Synchronous processing** means the client waits while the server completes the required work and returns a response.

For example, when a player claims a daily reward, the server may need to check the claim status, grant the reward, save the result, and return the updated inventory immediately.

```text
Client
→ POST /rewards/daily
→ Server checks player and claim status
→ Server grants reward
→ Server saves result
← Response: reward granted
```

This flow is simple to understand. The player expects to see the result right away. For important state changes such as rewards, inventory, or currency, the immediate part should record the authoritative result reliably. If several changes must succeed together, the backend should treat them as one safe logical unit of work, so it does not save only half of the reward change.

**Asynchronous processing** means some follow-up work can happen after the immediate response. The server may save the most important result first, then send later work to a queue or background worker.

For example, when a player submits a score, the server may save the score immediately but process analytics later.

```text
Client
→ POST /scores
→ Server validates and saves score
→ Server creates a domain event, or it enqueues a follow-up work item for later processing
← Response: score accepted

Later:
Queue
→ Worker
→ update analytics
→ recalculate slow ranking data if needed
→ send analytics data to a reporting pipeline
```

This can make player-facing requests faster and reduce coupling with slow follow-up work because the client does not wait for every follow-up task. However, it does not remove failure handling; it moves some failures to the background path.

At the same time, asynchronous processing introduces **eventual consistency**. This means different parts of the system may become consistent after a short delay, not always immediately.

For example:

```text
The score is saved now.
The weekly leaderboard cache updates a few seconds later.
The analytics dashboard updates later.
```

This may be acceptable for some features. A leaderboard that updates after a few seconds may be fine. A premium currency purchase result should not be treated casually. Some features require immediate correctness.

When deciding whether work can be asynchronous, ask:

| Question | If yes |
|---|---|
| Does the player need the result immediately? | Keep the core result synchronous. |
| Can the work be retried safely? | It may fit asynchronous processing. |
| Can duplicate processing cause damage? | Design idempotency before using async. |
| Is a short delay acceptable? | Eventual consistency may be acceptable. |
| Is the work slow or heavy? | A queue and worker may help. |

**Idempotency** means that repeating the same operation does not create an incorrect extra result. This matters because asynchronous jobs may be retried after failure.

For example, granting the same season reward twice could damage the game economy. A reward job should record whether the reward was already granted, so retrying does not duplicate the reward.

At this stage, you do not need to implement retry systems. You only need to understand why asynchronous processing is not just “put it in a queue.” It also requires thinking about retries, duplicate work, failure handling, and data correctness.

---

## 14.7 Queues, Jobs, and Domain Events

Queues, jobs, and domain events often appear together, but they are not the same concept.

A **queue** is a delivery mechanism. It holds messages or tasks so that another process can handle them later.

A **job** is a unit of work that a worker should perform.

A **domain event** is a statement that something meaningful already happened in the game domain.

Here is a simple comparison.

| Term | Simple meaning | Game backend example |
|---|---|---|
| Queue | A waiting line for later processing. | A queue holds season reward jobs. |
| Job | A command for a worker to do work. | “Grant season reward to player-1001.” |
| Domain event | A fact that already happened. | “ScoreSubmitted” or “DailyRewardClaimed.” |

A queue is like a delivery path. A job is like a work instruction. A domain event is like a meaningful fact.

Consider score submission.

```text
Player submits score.
Server saves score.
Server creates a domain event named ScoreSubmitted.
A queue delivers follow-up work.
A worker updates analytics or leaderboard cache.
```

The domain event expresses the fact:

```text
ScoreSubmitted happened.
```

A job may express a task:

```text
RecalculateWeeklyLeaderboard for season_2026_w22.
```

A queue may deliver that task to a worker:

```text
leaderboard-update-queue
```

This distinction helps you avoid confusing meaning with delivery.

Event-driven architecture is a style where meaningful events are used to connect different parts of a system. Instead of every feature directly calling every other feature, one part of the system can publish an event, and other parts can react.

For example:

```text
DailyRewardClaimed
  → update mission progress
  → record analytics
  → write an audit or operational log entry if needed
```

This can reduce direct coupling, but it can also make the system harder to trace if events are used carelessly. When a result appears later, you need logs and tracing to understand which event caused which action.

Be careful with the word **event**. A LiveOps event is a scheduled game operation, an analytics event is telemetry, and a domain event is a business fact such as `ScoreSubmitted`. They may all use the word event, but they are not the same thing.

Events may also be delivered late, more than once, or in a different order than expected. This is why idempotency, logging, and tracing matter when a backend becomes more event-driven.

Use events when they express real domain meaning. At this stage, focus on the meaning of the event, not on a specific event storage implementation. An event may be delivered through a queue, but the event itself is the meaning, not the delivery mechanism. Do not create events only to make the system look advanced.

A good beginner rule is:

```text
Use synchronous processing for simple immediate results.
Use queues or event-driven follow-up when delayed work has a clear reason.
```

---

## 14.8 Cache, Load Balancing, Serverless, and Managed Services

Architecture decisions are not limited to monoliths and microservices. Some choices are architectural patterns, while others are supporting mechanisms that affect performance, reliability, cost, or operations. Cache, load balancing, serverless execution, and managed services are not the same kind of choice, but they often appear when a backend grows.

### Cache

A **cache** is a fast storage layer used for data that is read often or expensive to compute repeatedly.

Good cache candidates may include:

- top leaderboard results,
- current event settings,
- Remote Config values,
- frequently requested public game configuration,
- session lookup data.

A cache can reduce repeated database work.

```text
Client
→ GET /leaderboard
→ API Server checks cache
→ If cache hit: return leaderboard quickly
→ If cache miss: read database, rebuild cache, return result
```

But cache introduces important risks.

| Cache risk | Meaning |
|---|---|
| Stale data | Cached data may be older than database data. |
| Invalidation | The system must decide when cached data should be updated or removed. |
| TTL choice | Too short may reduce benefit; too long may show outdated data. |
| Key design | Poor cache keys can mix unrelated data. |
| Source of truth confusion | Important final data should not exist only in cache. |

A cache should usually be treated as auxiliary storage. The database or another durable system should remain the source of truth for important player data.

For example, caching the top 100 leaderboard can be reasonable. Storing premium currency only in cache is dangerous.

### Load Balancing

A **load balancer** distributes incoming traffic across multiple backend instances.

```text
[Game Clients]
      |
      v
[Load Balancer]
   |      |      |
   v      v      v
[API 1] [API 2] [API 3]
```

Load balancing can help when one server instance is not enough. It can also improve availability because traffic can move away from unhealthy instances when health checks are configured correctly.

However, load balancing works best when the application is designed for it. For example, if login session data exists only inside one server instance’s memory, sending the next request to another instance may cause problems. This is one reason persistent data and session state are often stored in databases, caches, or shared services rather than only in one process memory.

For long-lived WebSocket connections or Dedicated Game Servers, load balancing needs extra care. These workloads may require session affinity, connection draining, server allocation, port mapping, or match/session routing. You do not need to memorize these terms yet. The key point is that long-lived real-time sessions often need more routing decisions than normal HTTP requests.

At this stage, you only need the concept: load balancers help spread traffic and improve availability, but they also require the backend to handle multiple instances correctly.

### Serverless

**Serverless** does not mean there are no servers. It means the cloud provider manages much of the server runtime, and developers deploy functions or services that run when triggered.

Serverless can be useful for event-driven tasks or occasional scheduled work, such as:

- processing uploaded files,
- handling scheduled maintenance tasks,
- reacting to a cloud event, webhook, or backend-triggered event,
- running small admin automation,
- processing short-running background jobs that fit the platform's time, memory, and concurrency limits.

But serverless does not remove operational responsibility. You still need to think about:

- logs,
- permissions,
- cost,
- limits,
- retries,
- cold starts,
- observability,
- debugging,
- data access control.

Serverless functions are usually not the default fit for long-running, low-latency, stateful real-time matches. Those cases often need a different hosting model, such as Dedicated Game Servers or another long-running server process designed to manage session state. A real-time match often needs continuous state, predictable latency, and a controlled session lifecycle.

Serverless can reduce some infrastructure work, but it can add new limits and debugging challenges.

### Managed Services

A **managed service** is a service operated by a provider. Examples include managed databases, managed caches, managed queues, authentication platforms, object storage, and monitoring tools.

Managed services can help a small team move faster because the provider handles part of the operational work. But using managed services still requires architecture judgment.

Ask:

```text
What responsibility does this managed service take away from us?
What responsibility remains ours?
How much does it cost as traffic grows?
How do we export or migrate data if needed?
How do permissions, logs, and incident response work?
```

A managed service reduces some work, but it does not remove architecture responsibility. It is a trade-off between building and operating everything yourself versus relying on a provider with its own limits, pricing, and behavior.

---

## 14.9 Architecture Trade-offs and Decision Criteria

There is no single correct backend architecture for every game. Architecture depends on the game type, team size, traffic, release stage, budget, reliability needs, and operational maturity.

A useful architecture decision should consider several criteria together.

| Criterion | Question to ask |
|---|---|
| Cost | Can the team afford the infrastructure, tools, and maintenance? |
| Complexity | Can the team understand and change this system safely? |
| Performance | Does the structure meet response time and throughput needs? |
| Reliability | What happens when one part fails, and how does the system recover? |
| Data correctness | Do rewards, currency, inventory, score records, and other important state remain correct as the system grows? |
| Security | Are sensitive data and risky operations protected? |
| Operability | Can developers and operators observe, debug, and manage the system? |
| Team understanding | Can the current team explain and maintain the architecture? |

These criteria often conflict.

For example, adding a cache may improve performance but increase complexity. Splitting a service may improve independent deployment but make debugging harder. Using a managed service may reduce maintenance but increase vendor dependency and cost. Serverless may reduce server management but introduce cold starts, limits, and permission complexity.

Data correctness deserves special attention in game backends. Rewards, currency, inventory, purchase-related records, and score records affect fairness and player trust. Even when a backend adds caching, queue-based processing, serverless functions, or new service boundaries, important player state must remain correct and traceable.

Good architecture decisions usually include both the reason and the trade-off.

A short architecture decision note can be enough for learning.

```text
Decision:
Use a modular monolith for the first version.

Reason:
The team is small, the product is early, and clear module boundaries are enough for now.

Trade-off:
The whole backend is deployed together, so one feature cannot be scaled independently yet.

Revisit when:
Leaderboard reads, season reward jobs, or team ownership boundaries become difficult to manage inside one application.
```

You do not need a long formal document for every small decision. But you should practice explaining why a structure was chosen, what risk it creates, and when the decision should be revisited.

Architecture judgment improves when you stop asking, “Is this pattern good?” and start asking:

```text
Good for what problem?
At what cost?
For which team?
At which stage of the game service?
```

---

## 14.10 Example Scenario: A Small Online Arena Game

Let’s connect the ideas through an engine-independent game example.

Mini Arena is a small online arena-style game. It has these features:

- login,
- player profile,
- inventory,
- score submission,
- weekly leaderboard,
- daily reward,
- Remote Config,
- simple admin review screen for suspicious scores,
- basic logs and metrics.

A reasonable first backend structure might be a modular monolith.

```text
[Game Client]
      |
      v
[Backend API Server]
  - Auth Module
  - Player Module
  - Inventory Module
  - Score Module
  - Leaderboard Module
  - Reward Module
  - Config Module
  - Admin Module
      |
      v
[Database]
```

This structure is simple. It has one API Server and one database. But responsibilities are still separated internally.

As the game grows, the team may notice specific problems.

### Problem 1: Leaderboard Reads Become Heavy

Many players open the weekly leaderboard after every match. The database sorting query becomes expensive.

A cache may help.

```text
[API Server]
   |
   +--> [Cache: Weekly Top 100]
   |
   +--> [Database: Score Records]
```

The trade-off is freshness. The cached leaderboard may update every few seconds instead of instantly. The database still stores the score records. The cache only stores a fast view that can be rebuilt from the database.

### Problem 2: Season-End Rewards Affect Many Players

At the end of a season, the game needs to grant rewards to thousands of players. Doing all reward grants inside one immediate API request would be risky.

A queue and worker may help.

```text
[Admin Action: Start Season Settlement]
      |
      v
[API Server]
      |
      v
[Queue: Season Reward Jobs]
      |
      v
[Worker]
      |
      v
[Database: Reward Grant Records]
```

The trade-off is failure handling. Jobs may need retries, duplicate prevention, progress tracking, and clear records so the same reward is not granted twice if a job is retried. The team also needs a way to see which jobs succeeded, failed, or are still pending.

### Problem 3: Admin Actions Are Risky

Operators can review suspicious scores and adjust event settings. These actions affect live data.

The architecture should include stronger safeguards:

- admin authentication,
- authorization by role,
- input validation,
- audit logs,
- review screens,
- clear separation between player-facing APIs and admin actions.

This does not always require a separate service at first. It does require careful boundaries and records.

### Problem 4: The Team Wants Microservices Immediately

The team may be tempted to split auth, inventory, leaderboard, rewards, and admin tools into separate services because microservices sound professional.

For this game stage, that may be too early. A modular monolith plus cache and queue may solve the immediate problems with less operational complexity.

A possible growth path is:

```text
Stage 1: Modular monolith + database
Stage 2: Add cache for heavy reads
Stage 3: Add queue and worker for heavy background jobs
Stage 4: Strengthen admin boundaries, audit logs, and observability
Stage 5: Consider service extraction only when a real boundary becomes painful
```

This path is not the only answer. It is a reasoning example. The main point is to let problems guide architecture choices.

---

## 14.11 Learning Practice

This Learning Practice is for observation and study. It is not a production-ready implementation.

### Goal

Practice matching backend architecture options to concrete problems in a small game scenario.

### Scenario

Use the Mini Arena scenario from Section 14.10. Mini Arena has login, player profiles, inventory, score submission, a weekly leaderboard, daily rewards, Remote Config, and a simple admin review screen for suspicious scores.

The team is small. The first version is not yet launched. They want the backend to be understandable, safe to operate, and easy to improve later.

### Steps

1. Read each situation.
2. Choose one option that fits the problem.
3. Write one reason for the choice.
4. Write one trade-off or risk introduced by the choice.
5. Compare your notes with the suggested observations below.

### Options

Use the following options when reading each situation.

A. Modular monolith  
B. Cache  
C. Queue and worker  
D. Stronger admin boundary with authorization and audit logs  
E. Consider microservices later, but not yet  
F. Serverless function, managed scheduler, or simple scheduled worker

### Situations

1. The team is preparing the first learning version of the backend. They need login, profiles, score submission, leaderboard, rewards, Remote Config, and a simple admin screen. The system should be easy to understand and run.

2. The weekly leaderboard is read very often, and repeated database sorting is becoming slow.

3. Season-end rewards must be granted to many players after the weekly season ends.

4. Operators can adjust event rewards and review suspicious scores. These actions must be traceable.

5. The team wants to split every feature into separate services before launch because microservices sound more professional.

6. A small scheduled task runs once a day to archive old temporary records. It does not need a long-running server process.

### Suggested Observations

Try answering first. Then compare your notes with the suggested observations below.

The goal is not to find one perfect architecture. The goal is to explain the reason and trade-off.

One possible set of observations is:

| Situation | Possible option | Reason |
|---:|---|---|
| 1 | A. Modular monolith | It keeps operations simple while separating responsibilities internally. |
| 2 | B. Cache | Leaderboard data is frequently read and can often tolerate slight delay. |
| 3 | C. Queue and worker | Large reward grants can be processed safely outside the immediate request path. |
| 4 | D. Stronger admin boundary with authorization and audit logs | Admin actions affect live data and need traceability. |
| 5 | E. Consider microservices later, but not yet | Splitting too early may create unnecessary operational complexity. |
| 6 | F. Serverless function, managed scheduler, or simple scheduled worker | Occasional scheduled work may fit a scheduled worker, managed scheduler, or serverless approach. |

### Short Note

Write a short note using this format.

```text
Feature or situation:
Chosen structure:
Reason:
Trade-off:
What we will not do yet:
Future trigger for change:
```

Example:

```text
Feature or situation: Weekly leaderboard reads
Chosen structure: Cache
Reason: Many players read the same leaderboard repeatedly.
Trade-off: The leaderboard may be a few seconds behind the database.
What we will not do yet: We will not split the leaderboard into a separate service immediately.
Future trigger for change: Revisit if leaderboard traffic or ranking calculation becomes difficult to manage inside the current backend.
```

### What to Observe

After finishing the practice, check whether your decisions followed this order.

```text
1. Identify the problem.
2. Choose the simplest useful pattern.
3. Name the trade-off.
4. Decide what not to do yet.
5. Define when to revisit the decision.
```

---

## 14.12 Common Mistakes

### Mistake 1: Thinking Microservices Are Always Better

Microservices can be useful, but they are not the default answer. They add networking, deployment, observability, data consistency, and failure-handling complexity. A modular monolith may be better for an early-stage game or a small team.

### Mistake 2: Treating a Monolith as Unprofessional

A monolith is not automatically bad. The problem is not “one application.” The problem is unclear responsibility. A well-organized modular monolith can be easier to understand and safer to operate than poorly designed microservices.

### Mistake 3: Adding a Cache without Understanding Freshness

A cache may show older data than the database. If players expect immediate correctness, caching must be designed carefully. Do not store important final player data only in cache.

### Mistake 4: Treating Background Work as a Place to Hide Problems

Queues and workers are useful for delayed work, but not every task belongs in a queue. If the player needs an immediate result, the core decision should usually happen before the response. Background jobs may also be retried, so reward grants and similar operations need idempotency and clear progress records.

### Mistake 5: Confusing Events with Queues

A queue is a delivery mechanism. A domain event is a meaningful fact that happened. An event may be delivered through a queue, but the event itself is the meaning, not the delivery mechanism.

### Mistake 6: Treating Serverless as If It Removes Operational Work

Serverless reduces some server management tasks, but it still requires logs, permissions, platform limits, cost awareness, retries, observability, and debugging discipline. It is also usually not the default fit for long-running, low-latency, stateful real-time sessions.

### Mistake 7: Sharing One Database Freely Across Microservices

If several services freely read and write the same tables, the system may become a distributed monolith. A service boundary should include clear data ownership and clear contracts for how other parts of the system access that data.

### Mistake 8: Ignoring Admin, LiveOps, and Revisit Conditions

Admin tools are not just convenient screens. They can affect live player data, so architecture should consider authorization, audit logs, safe editing, and operational visibility. Architecture decisions should also include a reason, a trade-off, and a clear condition for revisiting the decision later.

---

## 14.13 Chapter Summary

In this chapter, you studied backend architecture patterns as tools for organizing responsibilities and managing trade-offs.

The most important ideas are:

- Architecture is a thinking tool, not just a diagram.
- A simple architecture can be a strong starting point.
- A modular monolith keeps one deployable application while separating responsibilities internally.
- Microservices are useful only when their benefits justify their complexity.
- Synchronous processing is useful for immediate results.
- Asynchronous processing is useful for delayed or heavy follow-up work, but it introduces eventual consistency and retry concerns.
- A queue, a job, and a domain event are related but different concepts.
- A cache can improve read performance, but important player data should not exist only in cache.
- Important player state, rewards, currency, inventory, and score records must remain correct even when architecture grows.
- Load balancing, serverless execution, and managed services can help, but each adds its own trade-offs.
- Good architecture decisions consider cost, complexity, performance, reliability, security, operability, data correctness, and team understanding together.

The chapter’s main message is:

```text
Start simple.
Separate responsibilities clearly.
Add caching, queue-based processing, serverless functions, or microservices only when a real problem justifies the trade-off.
```

Now that you have seen how backend responsibilities can be organized, the final chapter will help you choose which backend direction to study next.

---

## 14.14 Quiz

### Question 1

Which statement best describes the role of architecture patterns in this chapter?

A. They are trophies that show a backend is advanced.  
B. They are tools for managing trade-offs and organizing responsibilities.  
C. They are rules that every game backend must follow exactly.  
D. They are only useful after a game has millions of players.

**Answer: B**

**Explanation:**  
Architecture patterns help teams organize responsibilities and manage trade-offs. They should be chosen because they solve a problem, not because they sound impressive.

### Question 2

Why can a modular monolith be a good starting point for a small game backend?

A. It allows the team to separate responsibilities while keeping one deployable application.  
B. It removes the need for a database.  
C. It guarantees that the backend will never need to change.  
D. It is the same thing as having many independent microservices.

**Answer: A**

**Explanation:**  
A modular monolith keeps operations relatively simple while encouraging clear internal boundaries between responsibilities. It can be easier for a small team to understand, run, and change than many separate services.

### Question 3

Why are microservices not automatically better than a monolith?

A. Because microservices cannot use databases.  
B. Because microservices add complexity such as network calls, deployment, observability, and data consistency issues.  
C. Because microservices are only for frontend development.  
D. Because microservices cannot support game backends.

**Answer: B**

**Explanation:**  
Microservices can be useful, but they introduce operational and design complexity. They should be adopted only when a real scaling, reliability, deployment, or team-ownership problem justifies the trade-off.

### Question 4

A player submits a score. The server saves the score immediately, returns success, and updates analytics later through a worker. Which statement best explains this design?

A. All work is synchronous because the server responded successfully.  
B. The important score save is synchronous, while analytics is asynchronous follow-up work.  
C. The player client becomes the source of truth for the score.  
D. The analytics worker removes the need for logs and retry handling.

**Answer: B**

**Explanation:**  
The score must be saved reliably before the response, but slower follow-up work can happen later. This design can improve player-facing response time, but the background path still needs retry, idempotency, logging, and failure handling.

### Question 5

Which statement best describes supporting architecture choices such as cache, queues, domain events, and serverless functions?

A. Cache is the safest place to store final premium currency values.  
B. A queue, a job, and a domain event mean exactly the same thing.  
C. Serverless removes the need for logging, permissions, limits, and cost control.  
D. Cache, queues, domain events, and serverless functions can help in specific situations, but each introduces trade-offs.

**Answer: D**

**Explanation:**  
A cache can improve read performance, but it may become stale. Queues and jobs can move work to the background, but they require retry and duplicate-handling design. Domain events express meaningful facts, not just delivery mechanics. Serverless functions can reduce some server instance management, but they still have limits, cost, permissions, logs, and debugging concerns.

---

## 14.15 Further Reading

You do not need to read all of these resources immediately. Use them as references when the topic appears in your study.

- [Martin Fowler — MonolithFirst](https://martinfowler.com/bliki/MonolithFirst.html)  
  Use this when reviewing why starting with a monolith can be a reasonable early choice.

- [Martin Fowler — Microservices](https://martinfowler.com/articles/microservices.html)  
  Use this when you want a broader conceptual overview of microservices and their trade-offs.

- [Redis — Key Eviction](https://redis.io/docs/latest/develop/reference/eviction/)  
  Use this when you want to understand why cache data should usually be safe to remove and rebuild from durable data.

- [RabbitMQ Documentation](https://www.rabbitmq.com/docs)  
  Use this when you want to understand queues and message-based processing. If you use RabbitMQ later, choose the documentation version that matches your installation.

- [AWS Lambda Developer Guide](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html)  
  Use this when reviewing serverless execution concepts and the responsibilities that remain even when a platform handles server instance management.

- [Google Cloud Architecture Framework](https://docs.cloud.google.com/architecture/framework)  
  Use this when exploring architecture decision criteria such as reliability, security, cost, performance, and operational excellence.

Architecture resources can become very detailed. At this stage, use them as maps, not as checklists you must complete. The next chapter will help you choose which backend direction to study next.
