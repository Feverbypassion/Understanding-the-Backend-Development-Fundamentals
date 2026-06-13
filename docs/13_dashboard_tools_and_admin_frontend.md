# 13. Dashboard, Tools, and Admin Frontend

## 13.1 How to Read This Chapter

In the previous chapter, we studied observability, logging, dashboards, alerts, and operations. Those concepts help backend teams understand what is happening in a running service.

This chapter looks at the next question:

```text
After the team sees what is happening, how do operators safely act on it?
```

A game backend is not used only by players. After a game becomes a live service, many internal users also depend on the backend:

- operators who manage events and notices,
- customer support staff who investigate player issues,
- LiveOps staff who adjust events and configuration,
- developers who diagnose incidents,
- team leads who approve high-risk changes.

These people often use Dashboards, Admin Tools, CS Tools, Remote Config screens, Feature Flag screens, Event Tools, and audit log viewers. Together, they belong to the LiveOps / Tools Backend area of backend development.

This chapter is a concept-first introduction. You are not expected to create a working admin portal or implement a production-level Admin API here. Instead, focus on the safety questions behind internal tools:

```text
Who is allowed to do this?
What are they allowed to see?
What are they allowed to change?
What must be validated before the change?
What record should be created after the change?
How can the team recover if the change causes a problem?
```

Treat this chapter as a map. Later, in a more advanced LiveOps / Tools Backend course, you can study their implementation in more depth.

## 13.2 What You Will Learn

By the end of this chapter, you should be able to explain:

- why live game services need safe internal tools,
- why direct production database modification is risky,
- how Dashboards, Admin Tools, CS Tools, and LiveOps Tools differ,
- why an Admin Frontend is another client of the backend,
- why Admin APIs require authentication, authorization, validation, approval checks, duplicate execution checks, and audit logs,
- why customer support tools should follow minimum necessary access,
- what audit logs and change history are used for,
- why audit logs should be protected from casual editing or deletion,
- how Remote Config and Feature Flags help LiveOps work,
- why Event Tools need preview, validation, segments, trusted backend time sources, time zones, and rollback planning,
- how safe operational UX reduces human mistakes.

The key idea of this chapter is simple:

```text
Backend systems are used not only by players, but also by operators and support teams.
```

When you understand this idea, backend development becomes more than player-facing APIs. It becomes the foundation for operating a live game safely.

## 13.3 Why Internal Tools Matter

Let’s start with a common live game situation.

```text
A player contacts support:
"I participated in the weekend event, but I did not receive the reward."
```

From the player’s point of view, this is one support question. From the backend point of view, several things must be checked.

The operator may need to know:

- whether the player account exists,
- whether the player joined the event,
- whether the event was active at that time,
- whether the player met the reward condition,
- whether the reward was already granted,
- whether a reward grant failed,
- whether the reward should be reissued,
- who approved the reissue,
- what record should be created after the operation.

A beginner might think that a developer can simply connect to the database and inspect or change data manually. These two actions should be separated.

A controlled read-only database query may sometimes be used by developers for investigation, especially in a test environment or a restricted support environment. Even read-only investigation should be controlled. In real teams, this may use read-only credentials, a read replica, an audited query tool, or a restricted support view instead of unrestricted access to the production primary database.

Directly modifying production data through the database is much more dangerous.

In this chapter, the main warning is about direct production data changes, not every form of read-only investigation. Direct production database modification can bypass validation, permission checks, approval flow, duplicate execution checks, and audit logging.

Direct production database modification has several risks.

| Risk | Example |
|---|---|
| Wrong target | The operator intends to update `player_001` but changes `player_010`. |
| Wrong value | A reward of 500 gold becomes 5,000 gold by mistake. |
| Missing validation | The change bypasses normal reward rules. |
| Duplicate operation | The same reward is granted twice because the normal request flow was bypassed. |
| No clear reason | Later, nobody remembers why the change happened. |
| No approval | A dangerous production change is made by one person without review. |
| No audit trail | The team cannot trace who changed what and when. |

Internal tools reduce these risks by turning repeated operations into safer workflows.

```text
Unsafe path:
Developer connects to the production database directly
→ manually edits data
→ may bypass validation, approval, and audit logging

Safer path:
Operator uses an internal tool
→ the tool checks permission
→ the Admin API validates the request
→ the Admin API checks whether the operation was already processed
→ the operation is executed through controlled logic
→ an audit log records the action
```

Internal tools usually support three basic activities.

| Activity | Meaning | Game backend example |
|---|---|---|
| View | Check the current state. | View event status, player reward history, API error rate. |
| Change | Modify a controlled setting or request an operation. | Change Remote Config, disable an event, request reward reissue. |
| Record | Leave traceable evidence. | Audit logs, support notes, change history, approval records. |

The goal is not to give everyone powerful tools. The goal is to let the right person perform the right operation with the right safety checks and traceable records.

Direct production database modification should be a last resort, used only through a controlled emergency process. If it happens, the team should still record who approved it, who performed it, what changed, why it was necessary, and how the result was verified.

## 13.4 Dashboards, Admin Tools, CS Tools, and LiveOps Tools

The terms Dashboard, Admin Tool, CS Tool, and LiveOps Tool are sometimes mixed together. In this chapter, CS means customer support. A CS Tool is a customer support tool.

In a small project, these tools may all appear inside one internal portal. For example, the left menu may contain Overview, Players, Remote Config, Events, Permissions, and Audit Logs.

A simple internal portal might look like this:

```text
[Internal Portal]
  ├── Overview          → Dashboard
  ├── Player Support    → CS Tool
  ├── Remote Config     → LiveOps Tool
  ├── Events            → LiveOps Tool
  ├── Permissions       → Admin Tool
  └── Audit Logs        → Admin Tool
```

The menus may live in one portal, but each menu has a different user, purpose, risk level, and permission model.

| Tool type | Main users | Main question | Example features |
|---|---|---|---|
| Dashboard | Operators, developers, team leads | What is happening now? | DAU (Daily Active Users), CCU (Concurrent Users), request count, error rate, latency, reward failure count. |
| Admin Tool | Tool admins, operations leads, selected developers | How should high-risk system actions be controlled? | Account status change, admin permission management, audit log search. |
| CS Tool | Customer support staff | Can we understand and resolve a player issue? | Player lookup, purchase history, reward grant history, support notes. |
| LiveOps Tool | LiveOps staff, product operators | Can we operate events and settings safely? | Remote Config, Feature Flags, event schedules, segments, reward settings. |

A dashboard is mostly for observing. It helps people understand current service status. A dashboard may show metrics from Chapter 12, such as error rate, response time, request volume, and alerts. In a game, it may also show product or LiveOps metrics such as event participation, reward claim count, and CCU.

An Admin Tool is more powerful and more dangerous. It may manage account restrictions, admin permissions, system settings, or audit log review. Because the impact can be large, Admin Tools need strong authorization and clear records.

A CS Tool helps customer support staff solve player-specific problems. It should not expose everything in the database. A support agent may need to see purchase status, reward history, or recent login history, but they should not see password hashes, access tokens, session tokens, internal secrets, or unnecessary private data.

A LiveOps Tool helps teams operate the game after launch. It may manage time-limited events, Remote Config values, Feature Flags, reward settings, and target segments. It is designed for controlled change, not only observation.

Here is one way to remember the difference:

```text
Dashboard: What is happening?
Admin Tool: How should high-risk system actions be controlled?
CS Tool: What happened to this player?
LiveOps Tool: Which live setting or event needs a controlled change?
```

These tools often depend on the same backend data, but they should not have the same permissions. A person who can view reward history should not automatically be able to grant rewards. A person who can see event performance should not automatically be able to change production event settings.

## 13.5 Admin Frontend and Admin API Concept

An Admin Frontend is an internal user interface for operators, support staff, developers, or team leads. It may look like a web application with menus, tables, forms, filters, buttons, and confirmation dialogs.

However, the Admin Frontend is not the source of authority. It is a client of the backend.

The Admin API is the backend interface that receives internal tool requests and decides whether they are allowed.

A simplified flow looks like this:

```text
[Operator]
    |
    v
[Admin Frontend]
    |
    v
[Admin API]
    |
    +--> Authenticate the operator
    +--> Authorize the requested operation
    +--> Validate the input
    +--> Check approval requirement and approval status
    +--> Do not execute the operation if required approval is missing
    +--> Check resource version or stale preview risk
    +--> Check duplicate execution risk
    +--> Execute the operation through controlled logic
    +--> Write the required audit, security, or access record
    +--> Return the result
```

This flow is important because hiding a button in the frontend is not enough.

For example, suppose the Admin Frontend hides the "Grant Reward" button from a support agent. That improves usability, but it is not real security by itself. A manipulated request could still be sent directly to the Admin API.

So the Admin API must enforce authorization on the server side.

```text
Frontend button hiding: helpful for user experience
Server-side authorization: required for safety
```

For high-risk Admin API requests, the system may need to record not only successful changes, but also rejected attempts, failed operations, duplicate submissions, and approval denials. These records help the team investigate suspicious activity and operational mistakes.

In this chapter, these records are closely related, but they do not always have the same purpose:

| Record type | Main focus |
|---|---|
| Audit log | Important human or administrative actions. |
| Security log | Suspicious access, authentication failures, permission failures, or rejected requests. |
| Personal data access log | Sensitive player or personal data viewed for a support or compliance reason. |

In real systems, teams may store and review these records separately.

Admin APIs are often higher-risk than ordinary player APIs because they can affect many users or high-value data.

| API type | Example request | Main risk |
|---|---|---|
| Player API | A player checks their own inventory. | Usually scoped to one player's data when properly controlled. |
| Admin API | An operator changes an event reward value. | May affect all players in the event. |
| Admin API | A support agent reissues a reward. | May affect player economy and support records. |
| Admin API | A lead changes admin permissions. | May expose dangerous operations to more people. |

For this reason, Admin APIs need a stricter safety path than ordinary client-facing APIs.

A beginner-friendly checklist is:

```text
1. Who is the operator?
2. Which role or permission do they have?
3. Which environment are they changing?
4. What exact operation are they requesting?
5. Is the input valid?
6. Is the operation allowed for this role?
7. Does it require approval?
8. Has the required approval been completed?
9. What audit, security, or access record should be created?
10. What should happen if the operation fails or is rejected?
11. Has the resource changed since the operator previewed it?
12. Could the same operation be submitted twice?
13. How should the system prevent accidental duplicate execution?
```

For reward grants or reissue operations, the Admin API should consider duplicate execution. If the operator refreshes the page, retries a request, or processes the same support case twice, the same reward should not be granted twice by accident.

Not every Admin API operation needs the same duplicate-prevention strategy. Reward grants, reissue operations, and mass data changes need strong idempotency protection. A simple Remote Config update may instead rely on a change request ID, resource version check, or duplicate submission warning.

You do not need to implement this flow in this chapter. The goal is to recognize that an Admin Frontend is only the visible part of a larger backend safety flow.

## 13.6 Permissions, Roles, and Safe Operations

Internal tools should follow the principle of least privilege. This means each person should receive only the access needed for their work. In simple terms, do not give a tool user more access than their job requires.

In game operations, permissions should usually be separated by both role and action.

| Role | Reasonable access example | Access to avoid by default |
|---|---|---|
| Viewer | View dashboards and basic metrics. | Change production settings. |
| CS Staff | View limited player support data. | Edit economy data directly. |
| LiveOps Staff | Prepare event settings and Remote Config changes. | Change admin permissions. |
| LiveOps Lead | Approve high-risk LiveOps changes. | Read unrelated secrets or tokens. |
| Tool Admin | Manage selected internal tool permissions. | Bypass audit logging. |
| Developer | Diagnose technical issues and review logs. | Perform business operations without process. |

Permissions should also separate read operations from write operations.

```text
Read operation:
View a player reward history.

Write operation:
Grant a missing reward to the player.
```

The difference matters. Read operations can still expose sensitive data, but write operations can change live service state. Many tools should start as read-only and add write operations only after validation, confirmation, approval, duplicate execution handling, and audit logging are ready.

High-risk operations may need extra protection.

Examples include:

- changing a production Remote Config value,
- enabling or disabling a feature for all players,
- granting rewards to many players,
- changing event start or end time,
- modifying account restrictions,
- changing admin permissions,
- exporting sensitive support data.

A safe internal tool often uses a default-deny mindset.

```text
Default-deny mindset:
An operation is blocked unless the system can prove that the operator is allowed to perform it.
```

This may feel strict, but it prevents accidents. In internal tools, convenience should not override safety.

For CS Tools, minimum necessary access is especially important. A support agent may need to confirm whether a purchase was completed or whether a reward was granted. They usually do not need raw authentication tokens, password hashes, internal service secrets, or unrelated player data.

When a support tool shows sensitive information, it may need a personal data access log. This record shows who viewed sensitive data, when, and for what support reason. You can think of this as a specialized audit log for sensitive data access.

Depending on the service and region, privacy and compliance requirements may also apply. This guide does not cover legal compliance in depth, but the backend design should assume that sensitive access must be controlled and traceable.

Safe operations depend on both policy and system design.

```text
Policy says what should be allowed.
The Admin API enforces what is actually allowed.
The audit log records what happened.
```

## 13.7 Audit Logs and Change History

An audit log records important operational actions so the team can trace what happened later.

A good audit log helps answer questions such as:

```text
Who performed the operation?
What operation did they request?
Which environment was affected?
Which player, event, config key, or resource was affected?
What was the previous value?
What was the new value?
Why was the change made?
Was approval required?
Who approved it?
Did the operation succeed, fail, or get rejected?
When did it happen?
Which request or support case was connected to it?
Was the operation a duplicate or retry?
```

Audit logs are not only for blaming people after a problem. They are also useful for incident investigation, support follow-up, operational review, and safer rollback planning.

Here is a simplified conceptual audit log example:

```json
{
  "auditLogId": "audit_20260601_0001",
  "timestamp": "2026-06-01T10:15:30Z",
  "environment": "production",
  "actorId": "operator_042",
  "actorRole": "liveops_lead",
  "operation": "remote_config.update",
  "resourceType": "remote_config",
  "resourceId": "dailyRewardGold",
  "previousValue": 100,
  "newValue": 150,
  "targetSegment": "all_players",
  "estimatedAffectedPlayers": 25000,
  "reason": "Weekend bonus event",
  "approvalId": "approval_7788",
  "approvalStatus": "approved",
  "requestId": "req_admin_abc123",
  "changeRequestId": "change_7788",
  "status": "succeeded"
}
```

This is not a production-ready audit log schema. It is a learning example that shows the kinds of questions an audit log should answer.

Audit logs and operation logs are related, but they are not exactly the same.

| Record type | Main purpose | Example |
|---|---|---|
| Audit log | Trace important human or administrative actions. | An operator changed `dailyRewardGold` from 100 to 150. |
| Operation log | Record technical execution details. | The Admin API returned 200 after 180 ms. |
| Change history | Show the past versions of a setting or resource. | Event reward table version 3 replaced version 2. |

A single tool may use all three. For example, a Remote Config editor can show change history to users, write an audit log for traceability, and emit operation logs for technical debugging.

Audit logs should also be protected from casual editing or deletion. A beginner does not need to implement an append-only log system here, but the design mindset is important: the same person who performs a dangerous operation should not be able to quietly erase the record of that operation.

A safer audit log design usually considers:

- append-only records,
- restricted access to audit log search,
- retention rules,
- masking for sensitive values,
- links to request IDs, support cases, approval records, or incident records.

Audit logs should avoid plain-text passwords and other sensitive values.

Do not store values such as:

- plain-text passwords,
- full access tokens,
- full session tokens,
- private API keys,
- payment card numbers,
- unnecessary personal data,
- unmasked sensitive fields.

Sometimes the team still needs to record that a sensitive operation happened. In that case, the log should record the sensitive action in a safe way, such as references, IDs, fingerprints, changed flags, or summaries instead of raw secrets.

For example:

```text
Unsafe:
accessToken = eyJhbGciOiJIUzI1NiIs...

Safer:
accessTokenChanged = true
rawTokenStored = false
tokenReferenceId = token_ref_1234
tokenFingerprint = sha256:ab12cd34...
```

The important idea is this:

```text
Audit logs should make operations traceable without creating a new security problem.
```

## 13.8 Remote Config, Feature Flags, and Event Tools

LiveOps teams often need to change parts of the game without asking every player to install a new app build. This is where Remote Config, Feature Flags, and Event Tools become useful.

### Remote Config

Remote Config means configuration values managed outside the game client, usually on a backend service. The game client or backend can read these values and adjust behavior.

Examples:

```json
{
  "dailyRewardGold": 100,
  "weekendExpMultiplier": 2.0,
  "shopBannerMessage": "Weekend bonus event is live!",
  "minimumClientVersion": "1.8.0"
}
```

Remote Config can be useful for values such as event messages, reward multipliers, banner visibility, tutorial tuning, or maintenance notices.

Some Remote Config values are safe to expose to the client, such as banner text or UI visibility. Other values may influence reward rules, economy behavior, or feature access. For high-risk values, the backend should treat Remote Config as an input to server-side logic, not as a replacement for server-side validation or server-side authority.

A value such as `minimumClientVersion` can help guide client behavior, but version enforcement should be designed carefully. For important access control, the backend should also check whether an outdated client is allowed to continue.

### Feature Flags

A Feature Flag is often used to enable or disable a feature for a given context.

Examples:

```text
new_shop_ui_enabled = true
weekend_event_enabled = false
battle_pass_enabled_for_region_eu = true
new_matchmaking_flow_enabled_for_5_percent = true
```

Remote Config and Feature Flags overlap in real systems, but this beginner distinction is useful:

| Concept | Beginner-friendly meaning | Example |
|---|---|---|
| Remote Config | Change a value. | Daily reward gold is 100 or 150. |
| Feature Flag | Enable, disable, or roll out behavior. | The new event screen is enabled for 5% of players. |

Feature Flags also need lifecycle management. After a rollout is complete, old flags should be removed, archived, or clearly marked. Too many stale flags can make both code and operations harder to understand.

### Event Tools

Event Tools manage time-limited LiveOps activities. They often include fields such as:

| Event field | Why it matters |
|---|---|
| Event ID | Identifies the event. |
| Name and description | Helps operators understand the event. |
| Start time and end time | Controls when the event is active. |
| Time zone | Prevents confusion across regions. |
| Server time rule | Defines which trusted backend time source decides whether the event is active. |
| Target segment | Limits which players see or receive the event. |
| Reward settings | Defines what players can receive. |
| Visibility setting | Controls whether the event appears in the client. |
| State | Draft, scheduled, active, paused, ended, or archived. |
| Owner and approver | Shows who prepared and approved the event. |

For reward eligibility, the backend should usually use a trusted backend time source rather than the player’s device clock. A client clock can be wrong, manipulated, or set to a different time zone. In simple terms, the event should follow the time used by the backend service, not the time shown on an individual player's device.

### Segments, Preview, and Rollback

Segments are groups of players selected by rules. For example:

```text
All players
New players under level 10
Players in a specific region
Players who joined during a campaign period
Players selected for a small rollout
```

Segments are powerful but risky. Choosing the wrong segment can affect the wrong players or exclude the intended players. That is why preview and estimated affected player counts are important.

A safe LiveOps Tool should let the operator preview the result before publishing.

Examples of preview questions:

- Which players are included in this segment?
- Which event banner will the client show?
- Which reward value will the backend apply?
- How many players are estimated to be affected?
- Which environment is this change targeting?
- Is the event time interpreted in the intended time zone?
- Which trusted backend time source decides whether the event is active?

Rollback is also important, but rollback has limits.

A configuration rollback may restore an old value, such as changing `dailyRewardGold` from 150 back to 100. But if 25,000 players already claimed 150 gold, rollback does not automatically remove or adjust those granted rewards.

So it is useful to distinguish:

| Recovery type | Meaning | Example |
|---|---|---|
| Configuration rollback | Revert a setting or event state. | Change reward value back from 150 to 100. |
| Data correction | Fix data that was already changed. | Adjust incorrectly granted rewards. |
| Compensation | Grant a compensation reward or send an apology message after an issue. | Send apology rewards after an event error. |

The key point is that changing live settings is not only a product decision. It is also a backend safety decision.

## 13.9 Operational Tool UX and Common Mistakes

Operational tool UX is not only about making the screen look clean. It is about helping people avoid mistakes while working with powerful backend features.

A safe internal tool should make risk visible.

| UX element | Why it helps |
|---|---|
| Clear environment display | Prevents applying a test change to production. |
| Diff view | Shows exactly what will change. |
| Preview | Lets the operator check the result before publishing. |
| Required change reason | Records why the change is being made. |
| Input validation | Blocks invalid values, dates, ranges, stale versions, and missing fields. |
| Estimated affected players | Shows the possible impact size. |
| Confirmation step | Adds friction before dangerous actions. |
| Approval step | Requires another person for high-risk changes. |
| Duplicate request warning | Reduces the risk of granting the same reward twice. |
| Audit log preview | Shows what will be recorded. |
| Rollback option | Gives the team a prepared recovery path for settings. |

Estimated affected player counts are not always exact. They are a safety signal that helps the operator notice whether a change is small, large, or unexpectedly broad.

An audit log preview helps the operator understand what will be recorded before the operation is submitted. This is useful because the audit record becomes part of the operation history, not just a hidden backend detail.

For example, a weak Remote Config screen might look like this:

```text
Key: dailyRewardGold
Value: 150
[Save]
```

This screen is fast, but it hides risk. It does not clearly show the environment, previous value, target segment, estimated impact, reason, approval, audit log, or duplicate execution risk.

A safer review screen might look like this:

```text
Remote Config Change Review

Environment: production
Config key: dailyRewardGold
Current value: 100
New value: 150
Target segment: all players
Estimated affected players: 25,000
Change reason: Weekend bonus event
Approval required: LiveOps Lead
Confirmation: type APPLY PRODUCTION CHANGE

[Preview] [Request Approval] [Cancel]
```

This screen is more deliberate, and the extra steps reduce the chance of a serious incident.

Common mistakes include:

| Mistake | Why it is dangerous |
|---|---|
| Treating internal tools as safe just because they are internal. | Internal accounts can still be misused or compromised. |
| Giving all operators the same permission. | Low-risk and high-risk tasks become mixed. |
| Relying only on hidden frontend buttons. | The Admin API still needs server-side authorization. |
| Adding audit logs later. | Missing records make incidents hard to investigate. |
| Allowing audit logs to be edited casually. | A dangerous operation could be hidden after the fact. |
| Logging raw tokens or secrets. | Logs can become a source of security leaks. |
| Editing production config without preview. | One small value may affect many players. |
| Confusing config rollback with data recovery. | Already-granted rewards may need separate correction. |
| Ignoring server time and time zones. | Events may start, end, or grant rewards at the wrong time. |
| Ignoring segment size. | A change intended for a small group may affect everyone. |
| Keeping old Feature Flags forever. | Stale flags make behavior difficult to understand and can create hidden operational risk. |
| Starting with too many write operations. | The tool becomes dangerous before safety systems exist. |

For a beginner project, it is often better to start with read-only internal views:

- service overview,
- player lookup summary,
- reward history viewer,
- Remote Config viewer,
- audit log viewer.

Write operations can be added later when the permission model, validation, confirmation, approval, duplicate execution handling, and audit logging are ready.

## 13.10 Learning Practice — Review a Remote Config Change Screen

This Learning Practice is for observation and study. It is not a production-ready implementation.

### Goal

You will review a simple Remote Config change screen and identify the permission, validation, confirmation, duplicate execution prevention, and audit log needs behind it.

### Scenario

A LiveOps staff member wants to change the daily login reward for a weekend event.

```text
Operation:
Change dailyRewardGold from 100 to 150.

Environment:
production

Target:
all players

Risk:
affects daily reward economy
```

### Screen to Review

```text
Remote Config Change Review

Environment: production
Config key: dailyRewardGold
Current value: 100
New value: 150
Target segment: all players
Estimated affected players: 25,000
Change reason: Weekend bonus event
Preview result: daily reward UI shows 150 gold
Confirmation required: type APPLY PRODUCTION CHANGE
Approval required: LiveOps Lead
```

### Steps

1. Identify whether this operation is read-only or a write operation.
2. Decide which role should be allowed to request the change.
3. Decide whether approval should be required.
4. Write down at least three validation checks the Admin API should perform.
5. Decide how the tool should prevent the same change from being submitted twice by accident.
6. Write down the confirmation message you would show before the change is applied.
7. List the audit log fields that should be recorded.
8. Explain whether rollback would be configuration rollback, data correction, compensation, or a combination of them.
9. Explain why direct database modification would be more dangerous than using this tool.

### Possible Validation Checks

Possible validation checks include:

- Is `dailyRewardGold` a number?
- Is the value within an allowed range?
- Is the target environment really production?
- Is the target segment intentionally set to all players?
- Does the operator have permission to request this change?
- Has the required approval been completed?
- Is the config version still current, or was it changed by someone else?
- Could the same change request be submitted twice by accident?

### What to Observe

You should notice that a small value change can affect many players. The value looks simple, but it changes the live reward economy.

You should also notice that the frontend screen is only one part of the safety design. The Admin API still needs to check the operator’s permission, validate the value, confirm the target environment, check for duplicate execution, record the reason, and write an audit log.

Finally, notice the rollback boundary. If the config is changed back from 150 to 100, that is configuration rollback. If some players already received too much or too little gold, the team may also need data correction or compensation.

### Suggested Observation Note

You can write a short note like this:

```text
This is a write operation because it changes a production Remote Config value.
It should require permission to modify production Remote Config and approval from a LiveOps Lead.
The Admin API should validate the value, environment, segment, approval state, config version, and duplicate submission risk.
The audit log should record actor, role, environment, config key, previous value, new value, reason, approval, timestamp, request ID, change request ID, and status.
Rollback can restore the config value, but already-granted rewards may need separate review.
```

## 13.11 Chapter Summary

In this chapter, we looked at backend systems from the operator side.

A live game backend is not used only by players. Operators, customer support staff, LiveOps staff, developers, and team leads also need safe ways to view information, change settings, investigate issues, and record actions.

The main ideas are:

- Internal tools help operators, CS staff, LiveOps staff, developers, and team leads use backend data safely.
- Controlled read-only investigation is different from direct production data modification, and direct modification should be a last resort.
- Dashboards, Admin Tools, CS Tools, and LiveOps Tools answer different operational questions and require different permissions.
- The Admin Frontend is only the visible client; the Admin API must enforce authentication, authorization, validation, approval, duplicate prevention, resource version checks, and audit logging.
- Permissions should follow least privilege, separate read from write, and limit sensitive data access.
- Audit logs should record important operational actions while avoiding raw secrets and unnecessary personal data.
- Remote Config changes values, while Feature Flags often enable, disable, or roll out behavior.
- Event Tools need careful handling of trusted backend time, time zones, segments, preview, and approval.
- Rollback, data correction, and compensation should be considered separately.
- Operational UX should make risk visible before a dangerous action is applied.

This chapter focused on internal tools as concepts, not as a full implementation project.

As backend systems grow, player APIs, Admin APIs, databases, logs, dashboards, Remote Config, Event Tools, and audit logs all become connected responsibilities.

In the next chapter, we will study architecture patterns that help teams organize these responsibilities and manage trade-offs.

## 13.12 Quiz

### Question 1

Which statement best describes the purpose of a dashboard?

A. It directly changes all production player data.  
B. It helps operators and developers understand current service status.  
C. It replaces authentication and authorization.  
D. It stores all player inventory records.

**Answer: B**

**Explanation:**  
A dashboard helps teams view service status through metrics, logs, alerts, and game operation indicators. It should not be treated as a direct data modification tool.

### Question 2

Which tool is most closely connected to investigating a specific player’s missing reward report?

A. Dashboard  
B. CS Tool  
C. LiveOps Tool  
D. Feature Flag screen

**Answer: B**

**Explanation:**  
A CS Tool helps customer support staff inspect limited player-related records such as purchase history, reward grant history, and support notes. A LiveOps Tool may configure events, rewards, Remote Config, or Feature Flags, but the player-specific support investigation belongs closer to the CS Tool.

### Question 3

Why is direct production database modification risky in a live game service?

A. It always makes the UI slower.  
B. It can bypass validation, permissions, approval, duplicate execution checks, and audit records.  
C. It prevents dashboards from showing charts.  
D. It is the only way to use Remote Config.

**Answer: B**

**Explanation:**  
Direct production database modification can change live data without normal safety checks. It may also leave unclear records, making later investigation difficult.

### Question 4

Why is hiding a dangerous button in the Admin Frontend not enough?

A. Because buttons cannot be used in web tools.  
B. Because the Admin API must still enforce server-side authorization.  
C. Because hidden buttons always delete audit logs.  
D. Because dashboards cannot use authentication.

**Answer: B**

**Explanation:**  
Frontend hiding can improve usability, but the Admin API must enforce authorization on the server side.

### Question 5

Which principle should a CS Tool usually follow?

A. Show every database field to support staff.  
B. Give support staff the same permissions as developers.  
C. Provide only the information needed for the support case.  
D. Store raw access tokens in the support note.

**Answer: C**

**Explanation:**  
A CS Tool should follow minimum necessary access. It should expose only the data needed to solve the support problem.

### Question 6

Which statement best distinguishes Remote Config from a Feature Flag at a beginner level?

A. Remote Config usually changes values, while a Feature Flag often enables, disables, or rolls out behavior.  
B. Remote Config is only used for databases, while Feature Flags are only used for DNS.  
C. Remote Config is always safer than server validation.  
D. Feature Flags can only be used by customer support staff.

**Answer: A**

**Explanation:**  
Remote Config often controls values such as reward amounts or messages. Feature Flags often control whether a behavior is enabled, disabled, or gradually rolled out.

### Question 7

Which information is most appropriate for an audit log?

A. Plain-text password.  
B. Full access token string.  
C. Who changed what, when, why, and in which environment.  
D. Full payment card number.

**Answer: C**

**Explanation:**  
Audit logs should record traceable operational information. They should not store raw secrets or unnecessary sensitive values.

### Question 8

Which statement about rollback is most accurate?

A. Configuration rollback always fixes all already-granted rewards automatically.  
B. Configuration rollback can restore a setting, but already-applied data changes may need separate correction or compensation.  
C. Rollback is only needed for frontend color changes.  
D. Rollback removes the need for audit logs.

**Answer: B**

**Explanation:**  
Changing a config value back can help stop future impact. But if players already received rewards, the team may need data correction, compensation, or support follow-up.

## 13.13 Further Reading

You do not need to read all of these resources immediately. Use them when you want to connect the concepts in this chapter to real tools and official documentation.

### Game Backend and LiveOps Platforms

- [Microsoft Learn — PlayFab documentation](https://learn.microsoft.com/en-us/gaming/playfab/)  
  Use this when you want to explore how a game backend platform organizes player data, LiveOps, economy, analytics, and operations features.

- [Unity Documentation — Remote Config](https://docs.unity.com/en-us/remote-config)  
  Use this when you want to see a practical example of Remote Config concepts in a game service environment.

- [Nakama Documentation](https://heroiclabs.com/docs/)  
  Use this when you want to study an open-source game backend platform that includes accounts, storage, leaderboards, and real-time communication features.

### Feature Flags and Configuration

- [OpenFeature — Introduction](https://openfeature.dev/docs/reference/intro)  
  Use this when you want to understand Feature Flag concepts beyond a simple on/off value.

### API Security

- [OWASP API Security Top 10 2023](https://owasp.org/API-Security/editions/2023/en/0x11-t10/)  
  Use this when you want to study common API security risks such as broken authentication, broken authorization, and unsafe access control.

### Dashboards and Observability

- [Grafana Documentation](https://grafana.com/docs/grafana/latest/visualizations/dashboards/)  
  Use this when you want to learn how dashboards can visualize metrics, logs, and operational data.

- [OpenTelemetry — Observability Primer](https://opentelemetry.io/docs/concepts/observability-primer/)  
  Use this when you want to review how logs, metrics, traces, and observability fit together.

Vendor services and product documentation can change over time. Treat these links as references for further study, not as required reading for this introductory chapter.
