# 12. Observability, Logging, and Operations

## 12.1 How to Read This Chapter

In the previous chapter, we looked at backend security.
Security asks whether requests, users, permissions, inputs, and secrets are being handled safely.
In this chapter, we add another operational question:

```text
When the backend is running, how can we understand what is happening inside it?
```

A backend can start successfully and still be difficult to operate.
A backend may respond to a simple health check.
At the same time, login may be slow, rewards may fail, or leaderboard updates may be delayed.
Operators may also not know which players are affected.
That is why this chapter focuses on **Observability**, **Logging**, and **Operations**.

This chapter is a concept-first introduction.
You are not expected to set up a real observability stack, install Prometheus, create production dashboards, or add OpenTelemetry instrumentation here.
At this stage, focus on the operational questions that logs, metrics, traces, alerts, and dashboards help answer.

In this chapter, an **operational signal** means a piece of information produced by the backend that helps developers and operators understand service behavior.

A key message for this chapter is:

> A server that runs is not automatically ready to operate safely.

Treat this chapter as a map.
The goal is to understand what information a backend should provide.
These operational signals help developers and operators notice problems, investigate them, and respond with better context.

## 12.2 What You Will Learn

By the end of this chapter, you should be able to explain:

- Why a running server is not always ready to operate safely.
- What an operational signal means in backend operations.
- The difference between logs, metrics, and traces.
- Why monitoring and observability are related but not identical.
- How technical metrics and game operations metrics answer different operational questions.
- Why alerts should point to situations that may require human attention.
- Why dashboards should answer operational questions instead of only showing graphs.
- Why sensitive data such as passwords, tokens, secrets, and payment information must not be logged in raw form.
- How logs, metrics, and traces can work together during a simple backend investigation.
- Why observability prepares the way for dashboards and internal tools in the next chapter.

## 12.3 Why Observability Matters in Game Backend Operations

A game backend is not a one-time program.
It is part of a live service.
After launch, players may log in every day, claim rewards, submit scores, join events, check leaderboards, and purchase items.
They may also contact support when something goes wrong.

If the backend has no operational signals, the team may not notice problems quickly.
Even when players report an issue, developers may not know where to look.
For example, suppose players say:

```text
I cannot claim my daily reward.
```

Without observability, the team may have to guess:

- Is the API returning errors?
- Is the database slow?
- Is the reward configuration wrong?
- Is only one region affected?
- Did the issue start after an event update?
- How many players are affected?
- Did the system recover after a change?

Observability helps a backend team move from guessing to investigation.
It does not prevent every problem or automatically fix the system.
However, it gives the team enough information to understand what happened and decide what to do next.

For game backends, observability is especially important because many backend problems are not visible in the same way as client-side bugs.
A character animation bug may be visible on the screen.
A failed reward grant, slow inventory lookup, suspicious score submission, or broken event configuration may only become visible through backend signals.

Observability also supports safer operations.
When operators change Remote Config, start an event, adjust rewards, or investigate a support case, the backend should leave clear operational records.
Those records should show what changed and what happened afterward.
This connects directly to Chapter 13, where we will study dashboards, internal tools, customer support tools, LiveOps tools, permissions, and audit logs.

## 12.4 Core Concepts

In this section, we will move through these ideas:

1. Running server vs operational signals
2. Monitoring vs Observability
3. Logs, Metrics, and Traces
4. Technical Metrics and Game Operations Metrics
5. Alerts and Dashboards
6. SLIs and SLOs as a short preview
7. Sensitive Data and Operational Safety

### A Running Server Is Not Automatically Ready to Operate Safely

A beginner may think that a server is healthy if it starts and returns `200 OK` from a `/health` endpoint.
That check is valuable, but it is only the beginning.

A running backend may still have serious operational problems:

| Situation | Why `/health` may not be enough |
|---|---|
| Daily reward claims are failing. | The server process may be alive, but reward logic or database access may be broken. |
| Leaderboard queries are slow. | The server may respond, but latency may still be too high for a good player experience. |
| Login failures increased after an update. | A basic health check may not detect a specific authentication problem. |
| Only one region has high errors. | A global health check may hide region-specific problems. |
| A Remote Config change caused unexpected results. | The server may be running, but operators need records of what changed and when. |

An **operation-ready backend** is a backend that provides enough operational signals for developers and operators to understand what is happening while the service is running.
It should help answer questions such as:

```text
What happened?
How often did it happen?
Which users or features were affected?
Where did the request slow down or fail?
Does someone need to respond now?
Did the system recover after the team responded?
```

This does not mean every small student project needs enterprise-grade monitoring.
It means that even when you are learning, you should understand that real backend work includes more than writing request handlers.
It also includes making the system observable and easier to operate.

### Monitoring and Observability

Monitoring and observability are related, but they are not exactly the same idea.

**Monitoring** usually means watching known signals.
For example:

- Is the API error rate above 5%?
- Is average latency or p95 latency higher than normal?
- Is CPU usage too high?
- Are login failures increasing?

Here, **p95 latency** means that 95% of requests were faster than that value, while the slowest 5% were slower.

In real systems, teams often look not only at average latency but also at percentile latency, such as p95 or p99.
A small number of very slow requests can hurt players even when the average looks acceptable.

Monitoring works well when you already know which signals matter.
It helps you check whether the system is inside an expected range.

**Observability** is broader.
It means the system emits enough signals for the team to investigate what is happening, even when they did not know the exact question in advance.
For example:

- Why did reward failures increase only for one event?
- Which backend step is slow for inventory lookup?
- Are errors connected to a specific request path, region, build version, or configuration change?
- Which request ID connects this player-facing error to server logs and traces?

A simple way to remember the difference is:

```text
Monitoring watches known conditions.
Observability helps investigate unknown or unclear conditions.
```

In practice, teams use monitoring and observability together.
A metric or alert may tell the team that something is wrong.
Logs and traces may help the team understand why.

Now that we have separated a server that only runs from a backend that provides operational signals, let’s look at the three observability signals beginners usually meet first: logs, metrics, and traces.

### Logs

A **log** is a record of an event that happened in the system.
Logs are useful when you want to investigate a specific event, request, error, or operational action.

A simple log line might look like this:

```text
2026-05-16T09:30:00Z ERROR POST /rewards/daily status=500 latencyMs=1240 requestId=req_20260516_0001 playerId=player_1001 errorCode=DB_TIMEOUT
```

This log tells us that a daily reward request failed, returned status `500`, took `1240 ms`, and had the error code `DB_TIMEOUT`.
The `requestId` can help connect this log to other records from the same request.

Logs can be unstructured, semi-structured, or structured.
For backend operations, structured logs are often easier to search and analyze.
A structured log might look like this:

```json
{
  "timestamp": "2026-05-16T09:30:00Z",
  "level": "error",
  "method": "POST",
  "path": "/rewards/daily",
  "statusCode": 500,
  "latencyMs": 1240,
  "requestId": "req_20260516_0001",
  "playerId": "player_1001",
  "rewardId": "spring_event_day_3",
  "errorCode": "DB_TIMEOUT",
  "message": "Daily reward grant failed"
}
```

Good operational logs often include:

- Timestamp
- Log level
- Request method and path
- Status code
- Latency
- Request ID or correlation ID
- Error code
- Feature or operation name
- Relevant internal identifiers, such as `playerId`, `rewardId`, or `eventId`, when needed and allowed

A `requestId` or correlation ID helps connect records from the same request.
An internal `playerId` can support investigation, but it should still be treated carefully.
It is safer than logging an email address, phone number, device identifier, or real name, but access to logs should remain controlled.

Logs are especially useful for questions such as:

- What happened to this request?
- Which error code appeared?
- Which player, reward, event, or request was involved?
- What did the server record before and after the failure?

However, logs can create risk if they include sensitive data.
We will return to this caution later in this section.

### Metrics

A **metric** is a number measured over time.
Metrics help you understand scale, rate, trend, or current service health.

Examples:

| Metric | Example question it can answer |
|---|---|
| Request count | How many requests are coming in? |
| Error rate | What percentage of requests are failing? |
| Latency | How long do requests take? |
| Login failure count | Are login problems increasing? |
| Daily reward failure count | Are reward grants failing more than usual? |
| CCU (Concurrent Users; some teams also use Concurrent Connected Users) | How many users are connected at the same time? |
| Event participation count | Are players joining the current event? |

Metrics work well for dashboards and alerts because they can be graphed and compared to thresholds.
For example:

```text
A dashboard query that calculates a rate from the counter `reward_claim_failures_total`
shows that failures increased from 12 per minute to 450 per minute.
```

That number helps the team understand that the problem is not just one player.
It is a system-level signal that may require human attention.

Metrics often include labels, which are key-value pairs used for grouping.
A label might describe a `route`, `status_code`, `region`, or `feature`.
For example:

```text
api_request_duration_seconds{route="/rewards/daily", status_code="500", region="eu"}
```

The example above uses a clear unit in the metric name.
For duration metrics, using `seconds` consistently is usually safer than mixing milliseconds, seconds, and other units.

Labels add grouping information, but they must be chosen carefully.
A common beginner mistake is to put unique values into metric labels.
Examples include `playerId`, `requestId`, email address, device identifier, or other unbounded values.
That can create too many unique time series and make the metrics system expensive or difficult to use.

A useful rule is:

```text
Use metrics for grouped trends.
Use logs for specific investigation.
```

For example, `route`, `status_code`, `region`, and `feature` may be practical metric labels when their values are limited and predictable.
When a path contains unique values, such as `/players/player_1001`, avoid using the raw path as a metric label.
Prefer a stable route template such as `route="/players/{playerId}"`.
This keeps metric labels bounded and easier to aggregate.
In logs, the actual request path can be useful for investigation.
In metrics, a stable route label is usually safer because it keeps grouping predictable.
A specific `requestId` is usually better stored in logs for investigation.

### Traces

A **trace** shows the path of a request as it moves through several backend steps or services.
A trace shows where time was spent or where a request failed.

Imagine a daily reward request:

```text
POST /rewards/daily
  ├─ Check authentication
  ├─ Read reward configuration
  ├─ Check previous claim record
  ├─ Grant item to inventory
  ├─ Save reward claim record
  └─ Return response
```

If the request takes `1800 ms`, a trace may show that most of the time was spent in the database step.
For example:

```text
Trace: req_20260516_0001
  POST /rewards/daily                 1800 ms
  ├─ authenticate player                30 ms
  ├─ load reward config                 25 ms
  ├─ check claim record                110 ms
  ├─ update inventory                 1450 ms
  ├─ write reward claim record         160 ms
  └─ build response                     25 ms
```

This helps the team focus the investigation.
Without a trace, the team may only know that the request is slow.
With a trace, the team can see which backend step is slow.

Traces become especially valuable when a request passes through multiple services or components.
In a small beginner project, you may not need to implement tracing.
The idea matters because real backend systems often involve API servers, databases, caches, queues, external services, and internal tools.

### How Logs, Metrics, and Traces Work Together

Logs, metrics, and traces are different signals.
They answer different questions.

| Signal | Best at answering | Example |
|---|---|---|
| Logs | What happened in a specific event? | This request failed with `DB_TIMEOUT`. |
| Metrics | How often or how much is this happening? | Reward failures increased to 450 per minute. |
| Traces | Where did the request go and where did it slow down? | Inventory update took most of the request time. |

OpenTelemetry and other observability resources may also discuss related or advanced concepts such as baggage, events, or profiles.
This chapter keeps the scope smaller by focusing on the three signals beginners most often meet first: logs, metrics, and traces.

A common investigation flow often looks like this:

```text
Metric shows abnormal increase
→ Alert notifies the team
→ Dashboard shows scope and trend
→ Logs show specific failure examples
→ Traces show where slow or failing steps occurred
→ Team responds and watches metrics again
```

This is not a strict rule.
Sometimes logs reveal the first clue.
Sometimes a player report comes first.
Sometimes a dashboard catches the issue before players notice it.
The important idea is that each signal plays a different role.

### Technical Metrics and Game Operations Metrics

Game backend teams often need to look at both technical metrics and game operations metrics.

Technical metrics describe how the backend system is behaving.
Examples include:

| Technical metric | Question |
|---|---|
| API request count | How much traffic is reaching the API? |
| Error rate | How many requests are failing? |
| Latency | Are responses slow? |
| CPU and memory usage | Is the server under pressure? |
| Database query time | Is the database becoming slow? |
| Queue length | Is background work piling up? |

Game operations metrics describe how the live game service is behaving.
Examples include:

| Game operations metric | Question |
|---|---|
| DAU (Daily Active Users) | How many players were active today? |
| CCU | How many players are connected now? |
| Login failure count | Are players having trouble entering the game? |
| Reward claim count | Are players claiming the expected rewards? |
| Reward grant failure count | Are reward systems failing? |
| Event participation count | Are players joining the current event? |
| Purchase grant failure count | Are purchased items being granted safely? |

These two groups should not be treated as exactly the same thing.
DAU, retention, and event participation can be product or analytics signals.
Error rate, latency, and database time are system health signals.
Some game operations metrics are also product analytics signals.
In this chapter, treat them as operational context rather than as a full analytics course.

However, in LiveOps workflows they often need to be viewed together.
For example, a sudden DAU drop may be a product signal, but it may also point to a login API problem.
A reward claim count drop may mean players are not interested in an event, but it may also mean the reward API is failing.

A good operational review does not rely on one number in isolation.
Teams ask which technical and game operations signals tell the same story.

### Alerts

An **alert** is a notification that brings attention to a situation that may require action.

An effective alert is not simply any error.
Every backend has occasional errors.
An effective alert should help answer this question:

```text
Does someone need to look at this now?
```

Examples of actionable alert conditions:

- Login error rate stays above a threshold for several minutes.
- Daily reward grant failures increase sharply during an active event.
- API latency is higher than normal for a player-facing feature.
- Database connection errors continue for more than a short period.
- Purchase grant failures appear for successful purchase verification results.

Examples of noisy alerts:

- Alert on every single `404 Not Found` response.
- Alert on one temporary timeout that recovered immediately.
- Alert on a debug log from a development environment.
- Alert without enough information to identify the affected feature.

Too many low-value alerts can train teams to ignore alerts.
This creates risk because important alerts may be missed.

At the introductory level, remember this:

```text
An effective alert points to a situation that may need a human response.
```

An alert does not automatically mean there is a major incident, but it can be the first signal that starts an investigation.

### Dashboards

A **dashboard** is a screen that helps teams understand service status.
It may show graphs, numbers, tables, logs, alert states, or operational summaries.

A dashboard should not be only a collection of graphs.
An effective dashboard answers operational questions.

For example, a game backend operations dashboard may answer:

- Are players able to log in?
- Are the most important APIs healthy?
- Is latency within an acceptable range?
- Are reward grants succeeding?
- Is the current event working normally?
- Are purchase grants failing?
- Is the issue global or limited to one region?

A simple daily operations dashboard might include:

| Dashboard panel | Question it answers |
|---|---|
| Login success and failure rate | Can players enter the game? |
| API error rate by route | Which features are failing? |
| API latency by route | Which features are slow? |
| Daily reward claim success/failure | Are rewards being granted? |
| CCU by region | Where are players currently active? |
| Active alerts | What needs attention now? |
| Recent deployment or config change marker | Did a change happen near the start of the issue? |

A dashboard is also not a replacement for investigation.
It helps operators understand the current situation and decide where to look next.
For detailed investigation, logs and traces are often still needed.
A dashboard mainly helps teams understand the situation.
Admin tools, which we will study in the next chapter, help operators take controlled actions.

### A Short Preview of SLIs and SLOs

As backend teams mature, they often describe service quality using SLIs and SLOs.

An **SLI**, or Service Level Indicator, is a carefully defined quantitative measure of service quality.
For example:

```text
Percentage of successful login requests
API latency for daily reward requests
```

An **SLO**, or Service Level Objective, is a target or acceptable range for an SLI.
For example:

```text
99.5% of login requests should succeed over a 7-day period.
p95 daily reward API latency should stay below 500 ms during normal operation.
```

This chapter does not go deeply into SLI/SLO design.
At this stage, treat them as a preview of how reliability can be discussed with numbers.
You will study them more deeply in a later Cloud, Operations, or SRE-focused course.

### Sensitive Data in Logs

Logs are valuable, but they can also create security and privacy risks.

Logs should not record sensitive data in raw form.
Examples of data that should not be written directly into logs include:

- Passwords
- Authentication tokens
- Session tokens
- API keys
- Internal secrets
- Full payment information
- Sensitive personal data
- Private messages or support details that are not needed for investigation

This connects Chapter 11 and Chapter 12.
Security is not only about blocking bad requests.
It is also about making sure operational records do not expose data that should be protected.

For example, this is dangerous:

```json
{
  "level": "error",
  "path": "/rewards/daily",
  "playerId": "player_1001",
  "authToken": "eyJhbGciOi...raw-token-value",
  "message": "Reward claim failed"
}
```

The token should not be logged in raw form.
A safer log would remove, mask, or replace it with a safe reference such as a request ID:

```json
{
  "level": "error",
  "path": "/rewards/daily",
  "playerId": "player_1001",
  "requestId": "req_20260516_0001",
  "errorCode": "DB_TIMEOUT",
  "message": "Reward claim failed"
}
```

The goal is to keep enough information to support investigation without exposing sensitive or unnecessary personal data.
In real systems, teams also need to sanitize log data so that user-controlled text cannot break the log format or create misleading log entries.

Application logs help developers investigate system behavior.
Audit logs are a special kind of operational record that focuses on who changed what, when, and why.
Chapter 13 will return to audit logs when we discuss admin tools, permissions, and safe operator actions.

## 12.5 Example Scenario

### Daily Reward Failures During a Limited-Time Spring Event

Let’s walk through a simple game backend scenario.

This is a lightweight incident investigation example that shows the first observability step of incident response.
It is not a full incident response process, postmortem process, or on-call training exercise.

A limited-time spring event starts at 09:00 UTC.
Players can claim a special daily reward during the event.
At 09:30 UTC, an alert fires because daily reward failures have increased sharply.
Operators also begin to see player reports about reward claim failures.

A weak operational setup might only say:

```text
The server is running.
```

That is not enough.
A backend that is ready to operate safely should help the team ask better questions.

### Step 1: Notice the Signal Through an Alert and Dashboard

The dashboard shows that daily reward failures increased sharply after the event started.

```text
Daily reward grant failures
09:00  5 per minute
09:10  8 per minute
09:20  120 per minute
09:30  450 per minute
```

This metric shows that the issue is not only one player.
It is a system-level problem connected to a specific feature.

### Step 2: Check the Scope With Dashboard Signals and Metrics

The team checks related metrics:

| Dashboard signal | Observation |
|---|---|
| Daily reward request rate | Request rate increased after the event started. |
| Daily reward failure rate | Failure rate increased sharply. |
| API error rate for `/rewards/daily` | Error rate is high for one route. |
| API latency for `/rewards/daily` | Latency is higher than normal for the daily reward API. |
| Database timeout error rate | Database timeout errors increased. |

These metrics help narrow the scope.
The problem seems connected to the daily reward API and database access during reward granting.
You do not need to learn Prometheus query syntax here.
The important idea is that a counter can be used to calculate a rate over time.

### Step 3: Inspect Specific Failures in Logs

Next, the team looks at logs for failed reward requests.

```json
{
  "timestamp": "2026-05-16T09:30:00Z",
  "level": "error",
  "method": "POST",
  "path": "/rewards/daily",
  "statusCode": 500,
  "latencyMs": 1240,
  "requestId": "req_20260516_0001",
  "playerId": "player_1001",
  "rewardId": "spring_event_day_3",
  "errorCode": "DB_TIMEOUT",
  "message": "Daily reward grant failed"
}
```

The logs show a specific error code, request path, reward ID, and request ID.
This helps the team connect the dashboard signal to real failure examples.

### Step 4: Use Traces to Find the Slow or Failing Step

A trace for the same request shows:

```text
Trace: req_20260516_0001
  POST /rewards/daily                 1240 ms
  ├─ authenticate player                25 ms
  ├─ load reward config                 30 ms
  ├─ check existing claim record        85 ms
  ├─ update inventory                 980 ms
  ├─ write reward claim record          failed: DB_TIMEOUT
  └─ build error response               20 ms
```

The trace suggests that the request slowed down during inventory update and failed while writing the claim record.
This does not automatically solve the issue, but it tells the team where to investigate next.

### Step 5: Observe Recovery After the Team Responds

After the team responds, they should keep watching the signals.
An operational response may include changing configuration, temporarily disabling a problematic event feature, reducing traffic pressure, or rolling back a recent change.
It may also include applying a fix.
The exact response depends on the team and the system.
In this chapter, focus on what observability shows before and after the response, not on the full response process itself.
The details belong to a later operations course.

The important point is what the team should observe after responding:

- Did the reward failure rate return to normal?
- Did API latency decrease?
- Did the database timeout error rate decrease?
- Are new logs showing successful reward grants?
- Are players still reporting the same issue?

Observability is not only for detecting problems.
It also helps confirm whether the system recovered.

## 12.6 Learning Practice

### Read an Operational Log and Identify What Matters

This Learning Practice is for observation and study.
It is not a production-ready implementation.
You will read a structured log example and identify which parts help investigation and which part creates a sensitive data risk.

### Goal

Practice reading an operational log from a game backend and connecting it to logs, metrics, alerts, and dashboard questions.

### Example Log

Read the following log carefully:

```json
{
  "timestamp": "2026-05-16T09:30:00Z",
  "level": "error",
  "method": "POST",
  "path": "/rewards/daily",
  "statusCode": 500,
  "latencyMs": 1240,
  "requestId": "req_20260516_0001",
  "playerId": "player_1001",
  "rewardId": "spring_event_day_3",
  "errorCode": "DB_TIMEOUT",
  "message": "Daily reward grant failed",
  "authToken": "raw-token-value-should-not-be-logged"
}
```

### Steps

1. Identify the HTTP method.
2. Identify the API path.
3. Identify the status code.
4. Identify the latency.
5. Identify the request ID.
6. Identify the player identifier and reward identifier.
7. Identify the error code.
8. Identify the sensitive data risk.
9. Suggest one metric that could help the team understand this situation.
10. Suggest one alert condition that might require attention.

### Example Observations

A careful reader should notice:

| Item | Observation |
|---|---|
| Method | `POST` |
| Path | `/rewards/daily` |
| Status code | `500` |
| Latency | `1240 ms` |
| Request ID | `req_20260516_0001` |
| Feature context | Daily reward claim for `spring_event_day_3` |
| Error code | `DB_TIMEOUT` |
| Sensitive data risk | `authToken` should not be logged in raw form. |

A meaningful metric could be:

```text
rate(reward_claim_failures_total{feature="daily_reward", event="spring_event"}[1m])
```

This example uses bounded labels such as `feature` and `event`.
It avoids labels such as `playerId` or `requestId`, which are better for logs than metric labels.
The `rewardId` is useful in the log because it helps investigate this specific failure.
For metrics, broader labels such as `feature` and `event` are usually safer.
You do not need to memorize the query syntax.
Focus on the idea that the team wants to observe the failure rate for a feature over time.

An actionable alert condition could be:

```text
Alert if daily reward failures remain above the normal range for several minutes during an active event.
```

### What to Observe

This log is valuable because it includes method, path, status code, latency, request ID, feature context, and error code.
These fields help developers and operators investigate a specific event.

However, the log also includes `authToken`.
That is unsafe because raw authentication tokens should not be written into logs.
The log should be changed to remove, mask, or replace the token with a safe reference, such as a request ID.

You should also notice the difference between logs and metrics.
This log helps investigate one failed request.
A metric helps answer how many reward claims are failing over time.
An alert helps decide whether someone needs to respond.
A dashboard helps operators view the current situation.

## 12.7 Common Mistakes

### Mistake 1: Thinking a Health Check Means the Whole Service Is Healthy

A `/health` endpoint is useful, but it may only show that the server process is alive.
Important features such as login, inventory, reward grants, leaderboard updates, and Remote Config may still have problems.

A better mindset is:

```text
Health checks are valuable, but operation readiness requires more signals.
```

### Mistake 2: Using Logs, Metrics, and Traces as If They Were the Same Thing

Logs, metrics, and traces are connected, but they are not interchangeable.
Logs help with specific events.
Metrics help with trends and scale.
Traces help with request paths and timing.

When investigating an issue, ask which question you are trying to answer first.

### Mistake 3: Logging Sensitive Data

Logs should not contain raw passwords, authentication tokens, session tokens, API keys, secrets, full payment information, or unnecessary sensitive personal data.
Logs can be stored, searched, copied, exported, or viewed by internal tools.
That means unsafe logs can become a data exposure risk.

### Mistake 4: Creating Noisy Alerts

An alert should not fire for every small error.
If alerts are too noisy, teams may ignore them.
An actionable alert points to a condition that may require human attention.

### Mistake 5: Creating Dashboards That Do Not Answer Questions

A dashboard with many graphs is not automatically effective.
An effective dashboard helps answer operational questions such as:

- Are players able to log in?
- Which API is failing?
- Is latency higher than normal?
- Are reward grants working?
- Is the current event behaving normally?

### Mistake 6: Using Unique IDs as Metric Labels

Putting `playerId`, `requestId`, or other unique values into metric labels can create too many unique metric series.
This is called a high-cardinality problem.

Use metric labels for grouping.
Use logs for detailed investigation.

### Mistake 7: Ignoring the Game Operations Side

Backend teams should not only look at CPU and memory.
For game services, operational signals such as login failures, reward claim failures, CCU, event participation, and purchase grant failures may be just as important as CPU and memory.

Technical metrics and game operations metrics should help tell one combined story.

## 12.8 Chapter Summary

In this chapter, we studied how backend teams understand what is happening in a running system.
The main idea is that a running server is not enough.
A backend also needs actionable signals for noticing, investigating, and responding to problems.

We distinguished logs, metrics, and traces.
Logs record specific events.
Metrics measure numbers over time.
Traces show how a request moves through backend steps and where time is spent.
Together, these signals help teams understand both individual failures and system-level patterns.

We also looked at alerts and dashboards.
An effective alert points to a situation that may require human response.
An effective dashboard answers operational questions instead of only displaying graphs.

For game backends, technical metrics and game operations metrics often need to be viewed together.
Error rate, latency, and database timing matter, but so do login failures, reward claim failures, CCU, event participation, and purchase grant results and failures.

Finally, we connected observability with security.
Logs should include information needed for investigation, but they should not expose passwords, tokens, secrets, payment information, or unnecessary sensitive data.

In the next chapter, we will look at dashboards, tools, and admin frontends more directly.
Observability helps us understand what we need to see.
Internal tools help operators and support teams act on what they see safely.

## 12.9 Quiz

### Question 1

Which statement best describes a backend that is ready to operate safely?

A. A server that only returns `200 OK` from `/health`.  
B. A backend that provides actionable signals so developers and operators can understand and investigate what is happening while it runs.  
C. A backend that never writes logs because logs take storage space.  
D. A backend that only works on a developer's local computer.

**Answer: B**

**Explanation:**  
A backend that is ready to operate safely is not only running.
It emits actionable signals such as logs, metrics, traces, alerts, and dashboard data.
Those signals help developers and operators investigate problems and understand service status.

### Question 2

Which option best describes the difference between logs and metrics?

A. Logs are only for frontend errors, while metrics are only for database records.  
B. Logs record specific events, while metrics measure numbers over time.  
C. Logs are always safer than metrics because they can contain any data.  
D. Metrics are detailed request stories, while logs are graphs.

**Answer: B**

**Explanation:**  
Logs support investigation of specific events, requests, and errors.
Metrics support counts, rates, trends, and thresholds over time.

### Question 3

A daily reward API request passes through authentication, reward configuration lookup, inventory update, and reward claim record writing.
Which signal best helps show where the request became slow?

A. Trace  
B. Raw password log  
C. Source code formatting rule  
D. Git commit message

**Answer: A**

**Explanation:**  
A trace shows the path of a request through backend steps and can show which step took the most time or failed.

### Question 4

Which alert condition is the most meaningful?

A. Alert whenever any single `404 Not Found` response happens.  
B. Alert whenever a developer prints a debug message locally.  
C. Alert when daily reward failures remain far above normal for several minutes during an active event.  
D. Alert every time a player opens the leaderboard screen.

**Answer: C**

**Explanation:**  
An actionable alert points to a situation that may require human attention.
A sustained increase in reward failures during an active event can affect many players and should be investigated.

### Question 5

Why is `playerId` usually a poor metric label?

A. Because player IDs can create too many unique metric series.  
B. Because metrics cannot have any labels.  
C. Because player IDs should always be removed from every log.  
D. Because metrics are only used for frontend rendering.

**Answer: A**

**Explanation:**  
Metric labels should be used for bounded grouping, such as route, status code, region, or feature.
Unique values like `playerId`, `requestId`, or raw paths containing IDs can create high-cardinality problems.
They are usually better kept in logs for investigation.

### Question 6

Which value should not be logged in raw form?

A. HTTP method  
B. Request path  
C. Status code  
D. Authentication token

**Answer: D**

**Explanation:**  
Authentication tokens are sensitive. Logs should not contain raw tokens, passwords, secrets, full payment information, or unnecessary sensitive personal data.

### Question 7

Which statement best describes an effective dashboard?

A. It is effective only if it has as many graphs as possible.  
B. It should answer operational questions such as whether players can log in and which APIs are failing.  
C. It replaces logs, metrics, traces, and alerts completely.  
D. It should only show code style problems.

**Answer: B**

**Explanation:**  
An effective dashboard helps teams understand service status by answering operational questions.
It may show graphs, numbers, alerts, or summaries, but the purpose is to support understanding and response.

## 12.10 Further Reading

You do not need to read all of these resources immediately.
Use them as references when you want to review the concepts introduced in this chapter.

- [OpenTelemetry — Concepts](https://opentelemetry.io/docs/concepts/)  
  Use this when you want to understand the general idea of telemetry data and observability signals.

- [OpenTelemetry — Signals](https://opentelemetry.io/docs/concepts/signals/)  
  Use this when you want to compare traces, metrics, and logs at a high level.

- [Prometheus — Metric and Label Naming](https://prometheus.io/docs/practices/naming/)  
  Use this when you want to review metric names, units, labels, and high-cardinality cautions.

- [Grafana — Dashboards](https://grafana.com/docs/grafana/latest/visualizations/dashboards/)  
  Use this when you want to understand dashboards as a way to query, visualize, and understand operational data.

- [OWASP — Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)  
  Use this when you want to review security cautions for logging.

- [Google SRE Book — Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/)  
  Use this later when you want a deeper view of monitoring and reliability concepts.
