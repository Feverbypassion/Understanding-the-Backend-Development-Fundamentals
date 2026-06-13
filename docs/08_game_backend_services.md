# 8. Game Backend Services

## 8.1 How to Read This Chapter

In Chapter 7, we studied why backend data needs reliable storage, how databases preserve important data, how cache can speed up repeated reads, and how transactions help protect important changes. Now we will connect those data concepts to common game backend services such as accounts, inventory, rewards, leaderboards, Remote Config, events, and matchmaking.

This chapter is a concept-first map of common game backend services. You are not expected to implement account systems, inventory systems, matchmaking, Remote Config, push notification systems, premium-currency or store-related backend records, or platform integration in this chapter.

Instead, focus on these questions while reading:

- What problem does this service solve?
- What data does the server need?
- What API shape might appear?
- What should the server validate?
- What can go wrong?
- Where might a later advanced course revisit this topic?

A useful starting idea is this:

```text
Game backend services are the server-side features that manage player identity, player data, rewards, rankings, live-service configuration, rules, and decisions.
```

Many beginners hear "game server" and immediately imagine a Dedicated Game Server for a real-time match. Dedicated Game Servers are important, but they are not the only backend systems used in games. A game can need accounts, save data, inventory, daily rewards, leaderboards, events, and push notifications even when it does not have Real-time Multiplayer.

Treat this chapter as a map of service features. The goal is to understand responsibilities and risks, not to memorize a service catalog or choose one platform.

## 8.2 What You Will Learn

By the end of this chapter, you should be able to explain:

- Why game backend services are different from Dedicated Game Servers.
- How account, authentication, profile, and save data support player identity and progress continuity.
- Why inventory, economy, and rewards need careful server-side validation.
- How leaderboards, achievements, and matchmaking connect gameplay goals to backend data.
- How Remote Config, events, and push notifications support LiveOps.
- Why platform strategy is a trade-off between building custom services and adopting managed services.
- Why operators need logs, records, and support tools to investigate backend service problems.

You should also be able to look at a game screen and infer the backend service behind it.

| Game screen or action | Likely backend responsibility |
|---|---|
| Login screen | Account and authentication |
| Profile screen | Player profile and save data |
| Inventory screen | Player-owned items and currency |
| Daily reward button | Reward rule, server-side reward period, claim record, grant log |
| Ranking screen | Score storage, leaderboard query, suspicious score review |
| Event banner | Remote Config, event schedule, server-side eligibility |
| Match button | Matchmaking request, matchmaking ticket, match creation |
| Notification message | Push notification targeting and send history |

The table is not a strict architecture. It is a way to practice seeing the backend behind the player experience.

## 8.3 Why Game Backend Services Matter

Game backend services matter because online games are not only programs running on one device. They are services shared by many players over time.

If a player logs in on a new device, the game needs to load the correct account and save data. If a player claims a daily reward, the server needs to know whether that reward was already claimed. If a player submits a score, the server needs to decide whether the score is acceptable for a leaderboard. If an event is active, the game needs a reliable way to decide which rules and rewards apply.

These features depend on data, validation, and operations.

```text
Player action
→ Client sends a request
→ Backend checks identity, data, and rules
→ Backend records the result
→ Client shows the result to the player
→ Operators can investigate the result later if needed
```

The client can request an action, but the server should decide important game state changes. This is especially important for data connected to fairness, progress, ranking, currency, or rewards.

### Game Backend Services and Dedicated Game Servers

A game backend service is usually centered on request/response flows. The client asks for a profile, submits a score, claims a reward, or requests current event information. The backend checks data and returns a response. Some service work may continue asynchronously after the response, but the player-facing API often begins as a request/response flow.

A Dedicated Game Server is usually centered on low-latency shared state during a match. It may manage player movement, combat state, projectiles, hit decisions, match time, and result calculation.

| Category | Game Backend Services | Dedicated Game Server |
|---|---|---|
| Main question | What service data and rules are needed? | What shared match state must be updated quickly? |
| Common communication style | HTTP request/response | Persistent or frequent real-time communication |
| Time sensitivity | Usually request/response latency, not per-frame latency | Often very low latency with frequent state updates |
| Example features | Login, inventory, rewards, leaderboards, events | Position sync, combat validation, match state |
| Main concern | Data correctness, validation, operations, support | Latency, synchronization, authority, match lifecycle |

The boundary is not always perfectly clean. Matchmaking may start as a game backend service, but after a match is created, clients may connect to a Dedicated Game Server. A real-time match may later report results back to the backend service for rewards and rankings.

This chapter focuses on the game backend service side. Chapter 9 will focus on Real-time Communication and Dedicated Game Servers.

## 8.4 Core Concepts: Common Game Backend Service Areas

This section introduces major service areas used in many online games. Most areas are discussed through recurring questions: problem, data, API shape, validation, failure cases, and which parts may need deeper study later.

### Account, Authentication, Profile, and Save Data

Account and authentication answer the question:

```text
Who is this player?
```

Profile and save data answer a related question:

```text
What should the game remember for this player?
```

An account is the server-side identity of a player. Authentication is the process of checking that a request really belongs to that player. A profile stores player-facing and service-side information, such as nickname, avatar, level, title, or selected character. Save data stores progress such as cleared stages, unlocked content, quest state, tutorial state, and last played position.

#### What problem does this solve?

Without account and save data services, the game may not know which player is making a request or what progress should be loaded. This becomes a problem when the player changes devices, reinstalls the game, contacts support, or participates in events.

#### What data does it need?

| Data area | Example fields |
|---|---|
| Account | playerId, loginProvider, createdAt, accountStatus |
| Authentication | sessionId or sessionRef, tokenMetadata, tokenExpiresAt, lastLoginAt |
| Profile | nickname, avatarId, level, title, region |
| Save data | clearedStageIds, tutorialStep, unlockedContent, lastSaveAt |
| Support records | accountCreatedAt, loginHistory, linkedProvider, supportNotes |

A beginner-friendly way to separate these concepts is:

```text
Account: who the player is
Authentication: how the backend checks the player
Profile: how the player appears
Save data: what progress the game remembers
```

In real systems, raw tokens and session identifiers should be handled carefully and should not be written to normal logs. Some systems store session references, token metadata, or hashed token values instead of plain token values.

#### What API shape might appear?

```http
POST /auth/guest
GET /players/me
PATCH /players/me/profile
GET /players/me/save
PUT /players/me/save
POST /players/me/progress/stage-clear
```

These are example API shapes for study. You are not expected to implement them in this chapter.

Think of the generic save endpoints mainly as convenience cloud save examples, not as a safe default for every progression change. Sensitive progression often works better as smaller action-based requests, such as recording a validated stage clear.

#### What should the server validate?

The server should first check whether the request is authenticated and whether the token is valid.

It should then check whether the player is allowed to update that profile field, whether the nickname format is acceptable, and whether save data changes are consistent with game rules.

This is also an authorization question: even if the backend knows who the player is, it still needs to decide what that player is allowed to view or change. The same idea applies to inventory and support data: knowing who the player is does not automatically mean every record can be viewed or changed.

For example, if a client sends save data that says every stage is cleared, the server should not blindly accept it. The right amount of validation depends on the game design, but important progress should not rely only on the client.

For convenience data, a cloud save API may store client-provided state. Even for this kind of data, the server may still check schema version, size limits, and basic consistency.

For sensitive progression, the server often uses smaller action-based APIs, such as stage clear, reward claim, or inventory update requests, so that important changes can be validated more clearly.

#### What can go wrong?

Common problems include lost guest accounts, duplicate accounts, invalid or expired tokens, failed account linking, account recovery paths that the team cannot support, nickname abuse, corrupted save data, or a mismatch between client-visible data and server-stored data.

Account recovery and customer support also become difficult when the backend does not keep enough records.

#### What will a later advanced course revisit?

Authentication implementation, token handling, account linking, password storage, OAuth, and secure session management belong to security-focused parts of a later advanced course.

### Inventory, Economy, and Rewards

Inventory, economy, and rewards answer the question:

```text
What does the player own, and how did that ownership change?
```

Inventory stores player-owned items, equipment, characters, cards, consumables, and currencies. The economy system defines how currencies are earned, spent, granted, and recorded. Rewards are the controlled changes that add items, currency, progress, or benefits to the player.

This area needs special care because it directly affects fairness, player trust, game balance, and sometimes records connected to store or premium currency flows.

#### Static game data and user data

A key distinction is static game data versus user data.

| Data type | Meaning | Example |
|---|---|---|
| Static game data | Shared definitions used by the game | itemId, itemName, rarity, maxStack, basePrice |
| User data | Data owned by a specific player | playerId, ownedItemId, quantity, acquiredAt |

For example, an item definition may say that `potion-small` is a stackable consumable. A player inventory record says that player `player-001` owns 12 of that item.

```text
Item definition: What is this item?
Player inventory: Which player owns how many of it?
```

#### Stackable items and item instances

Some items can be represented as quantities. Potions, tickets, and soft currency are common examples. Other items may need their own record because they have individual properties. Equipment, characters, cards, and pets may have level, durability, rolled rarity, random option data, upgrade state, or unique identifiers.

| Item style | Example | Common data shape |
|---|---|---|
| Stackable item | potion x10 | playerId, itemId, quantity |
| Item instance | sword with upgrades | playerId, itemInstanceId, itemId, level, rolledRarity, optionData |
| Currency | gold or gems | playerId, currencyType, balance |

This distinction matters because inventory APIs, database design, support tools, and logs depend on the data shape. Premium or sensitive currency usually needs especially careful records and ledger-style history.

#### What API shape might appear?

```http
GET /players/me/inventory
GET /items/catalog
POST /players/me/rewards/daily
POST /players/me/economy/spend
GET /players/me/currencies
```

The first two examples are often read-only or read-heavy flows. The reward and spend examples are action flows and require stronger validation.

#### What should the server validate?

The server should validate ownership, quantity, currency balance, reward eligibility, duplicate claims, event status, server time, item definitions, and order of operations.

For rewards and economy changes, the server should also keep a change record.

```text
Before: player has 900 gold
Action: spend 300 gold to unlock item-iron-sword
After: player has 600 gold and owns item-iron-sword
Record: when, why, requestId, playerId, result
```

The record is useful for debugging, support, abuse review, and correction work.

#### Idempotency and duplicate requests

A reward claim request may be sent more than once because of network retry, client bug, or repeated button tapping. If the player sends the same daily reward request twice, the server should not grant the reward twice.

A common concept here is idempotency. In this chapter, you only need the idea:

```text
Repeating the same request should not accidentally create extra rewards or extra currency changes.
```

A `requestId` or idempotency key can help the server recognize a repeated request. When the game design supports it, sensitive gameplay results may also use a server-issued run or match identifier. This can be safer than relying only on a client-generated ID.

For example, the server might create a run ticket before gameplay starts and later accept only one result for that ticket. This is only a preview of a safer design idea; not every small game needs this pattern.

Similarly, a daily reward claim can use a claim record for the reward period. If the record already exists, the server can return a safe response instead of granting the reward again.

#### What can go wrong?

Common failures include duplicate reward grants, negative currency balances, item loss after partial failure, invalid item definitions, client time manipulation, incorrect event reward tables, missing grant logs, and missing records that make customer support investigations difficult.

A particularly dangerous failure is a partial economy update.

```text
Gold was subtracted,
but the item was not granted.
```

For important economy changes, a later advanced course will study transactions, locks, ledgers, and audit logs more deeply.

#### What will a later advanced course revisit?

Full inventory implementation, economy ledgers, premium currency records, other sensitive grant records, and safe transaction design belong to a later advanced course. At this introductory level, store-related flows are mentioned only lightly as examples of sensitive backend responsibility.

### Leaderboards, Achievements, and Matchmaking

Leaderboards, achievements, and matchmaking help games create goals, comparison, and connection between players.

A leaderboard asks:

```text
How should players be ranked?
```

An achievement asks:

```text
What progress or milestone has this player completed?
```

Matchmaking asks:

```text
Which players should be grouped together?
```

These systems often look simple in the game UI, but they raise important backend questions about data, validation, fairness, season rules, and operations.

#### Leaderboards

A leaderboard stores scores or records and returns rankings.

Common leaderboard decisions include:

| Decision | Example question |
|---|---|
| Ranking value | Is the ranking based on score, clear time, rating, or wins? |
| Scope | Is it global, friends-only, region-specific, or guild-specific? |
| Period | Is it all-time, daily, weekly, seasonal, or event-only? |
| Tie rule | How are equal scores ordered? |
| Validation | What happens to suspicious scores? |
| Reward | Does ranking grant season rewards? |

API shapes may look like this:

```http
POST /players/me/scores
GET /leaderboards/weekly?limit=100
GET /players/me/leaderboard-rank?period=weekly
```

Score submission is sensitive. If the client sends a score of `999999999` for a stage where normal scores are much lower, the backend should not simply accept it without review or rule checks. This is not a full anti-cheat system; it is a basic backend sanity check that helps reject impossible values or flag risky results for review.

Some leaderboards use cache for fast reads. For example, the top 100 weekly scores may be cached. The displayed leaderboard may be cached, but accepted score records should remain in persistent storage so suspicious scores, season rewards, and support cases can be reviewed later.

#### Achievements

Achievements track progress toward goals.

Examples include:

- Clear 10 stages.
- Defeat 100 monsters.
- Log in for 7 days.
- Collect 50 cards.
- Reach Silver rank.

Achievements often connect to rewards. This means the backend should know whether the achievement was already completed and whether the reward was already granted.

A simple API shape might look like this:

```http
GET /players/me/achievements
POST /players/me/achievements/{achievementId}/claim
```

For achievements, the server should validate progress, completion state, duplicate reward claims, and event status when needed. Sensitive achievement progress should come from trusted server-side records, validated gameplay events, or previously accepted gameplay results, not only from a client-sent completion flag.

A quick responsibility check can help separate the main concerns:

| Feature | Data needed | Server validation | Common failure |
|---|---|---|---|
| Leaderboard | playerId, score, seasonId, submittedAt | score plausibility, season rule, duplicate submission | suspicious score, stale cache, wrong season reward |
| Achievement | playerId, achievementId, progress, claimedAt | completion state, duplicate claim, event status | progress counted twice, reward granted twice |

#### Matchmaking

Matchmaking groups players for a match, room, dungeon, battle, or co-op session.

Common matching conditions include:

| Condition | Example |
|---|---|
| Game mode | ranked, casual, co-op, event dungeon |
| Player skill | rating, rank, win/loss history |
| Region | Asia, Europe, North America |
| Party state | solo, duo, premade group |
| Waiting time | gradually widen search conditions |
| Platform or version | same app version, compatible client build |

A request shape might look like this:

```http
POST /matchmaking/tickets
GET /matchmaking/tickets/{ticketId}
DELETE /matchmaking/tickets/{ticketId}
```

A ticket may move through states such as waiting, matched, canceled, or expired.

| Matchmaking concern | Data needed | Server validation | Common failure |
|---|---|---|---|
| Match ticket | playerId, mode, region, rating, partyId, clientVersion | eligibility, compatible version, queue state, cancellation state | poor match quality, expired ticket, incompatible clients |

At this chapter's concept level, matchmaking is introduced as a service that groups players. Some systems expose ticket-like APIs, while others require an active connection while the player waits in the matchmaking queue or pool.

Treat this as one possible API shape, not the only matchmaking design. Deeper topics, such as matchmaking algorithms, rating systems, server allocation, and Dedicated Game Server orchestration, belong to a later advanced course.

#### What can go wrong?

Leaderboards can be damaged by suspicious scores, poor tie rules, stale cache, or season settlement mistakes. Achievements can fail when progress is counted twice or rewards are granted multiple times. Matchmaking can create poor player experience if it ignores latency, skill gap, party size, or client version compatibility.

Operations are also important. Teams may need to remove suspicious scores, reprocess season rewards, inspect match tickets, or explain why a player did not receive an achievement reward.

#### What will a later advanced course revisit?

Large-scale leaderboard design, anti-cheat review, achievement pipelines, matchmaking algorithms, rating systems, and Dedicated Game Server allocation belong to a later advanced course.

### Remote Config, Events, and Push Notifications

Remote Config, events, and push notifications are closely connected to LiveOps. They help the team change some live-service rules or player-facing behavior after launch without rebuilding the client for every small update.

Remote Config asks:

```text
Which settings should the client or server read from the backend?
```

Events ask:

```text
Which time-limited rules, rewards, or content are active now?
```

Push notifications ask:

```text
Which players should receive which message outside the game?
```

#### Remote Config

Remote Config lets a game read configuration from the backend. Examples include banner text, feature flags, event display settings, tuning values, or client-visible notices.

A simple API shape might be:

```http
GET /config
GET /config?clientVersion=1.2.0&region=eu
```

Remote Config is useful, but it should not be treated as a magic replacement for server-side validation.

For example, the client may read a config value that says a weekend event is visible. But if the player claims a weekend reward, the backend should still check server time, event status, eligibility, and claim history before granting the reward.

A safe mental model is:

```text
Remote Config can help the client display or adjust behavior.
The server should still decide important data changes.
```

Clients may cache configuration, and updates may not apply at exactly the same moment for every player. This is another reason to use server-side checks for sensitive decisions.

Do not store secrets or confidential player data in Remote Config. Client-visible configuration may be accessible to app instances, so sensitive values and trusted decisions should stay on the server side.

#### Events

Events are time-limited service rules. They may change rewards, missions, banners, event exchange rules, login bonuses, or leaderboard seasons.

Event data may include:

| Data | Example |
|---|---|
| eventId | weekend-double-exp |
| startAt / endAt | server-side event time |
| region | global, South Korea, Europe |
| reward table | daily ticket, bonus currency |
| eligibility | minimum level, completed tutorial |
| display data | banner image key, title, description |
| operation state | draft, active, paused, ended |

Server time matters. If the client clock says the event is active but the server time says it has ended, the backend should use server-side rules for important decisions. Many systems store and compare event times in UTC or another single server-side standard, then convert them only for display.

Event operations also need audit logs. If an operator changes event rewards, start time, or target region, the system should record who changed what and when.

#### Push notifications

Push notifications can remind players about events, energy recovery, season ending, friend activity, or maintenance notices.

Examples:

- Your energy is full.
- A new event has started.
- The weekly season ends today.
- Maintenance will start soon.

Push notifications are not real-time game state synchronization. They may be delayed, disabled by the user, blocked by the platform, or delivered after the situation has changed. They are useful for communication, not for controlling live match state.

A push notification system often needs target segments, player notification settings, consent status, device tokens, `tokenUpdatedAt`, send history, message templates, localization, and failure records.

In this chapter, device token and push token both refer to the notification target token used by a push service. The backend should also consider quiet hours, time zones, token expiration, and platform delivery rules.

A simple push notification flow may include device registration, player targeting, message creation, send history, and delivery failure records. Device tokens can change or expire, so the backend should not assume that a token stored months ago will always work.

Token freshness fields such as `tokenUpdatedAt`, `lastSuccessfulSendAt`, `lastFailedSendAt`, or `invalidatedAt` can help the backend decide when a stored token may need review or cleanup.

Push tokens are not passwords, but they identify notification targets and may still be sensitive operational data. The backend should avoid exposing raw push tokens in normal logs and should limit access to stored token records.

Send history is also useful when support or LiveOps teams need to understand why a player did or did not receive a message.

#### What can go wrong?

Remote Config can cause inconsistent behavior if the client and server use different rules. Events can fail if time zones, reward tables, or eligibility rules are wrong. Push notifications can annoy players if they are too frequent, sent at the wrong time, or sent to the wrong segment.

Operational safety matters here. Live service changes should be reviewable, logged, and reversible when possible.

#### What will a later advanced course revisit?

Remote Config editors, feature flag systems, event management tools, push notification delivery infrastructure, segmentation, A/B testing, and LiveOps automation belong to a later advanced course.

### Build vs. Buy and Platform Strategy

A team does not always need to create every game backend service from scratch. Many teams use managed platforms, open-source platforms, custom services, or a hybrid approach.

This section helps you compare options, not choose a universal best platform.

| Approach | What it means | Possible strength | Possible trade-off |
|---|---|---|---|
| Build yourself | The team creates and operates the service directly | High customization and control | Higher engineering and operations burden |
| Use a managed platform | A vendor provides backend features | Faster start and less infrastructure work | Pricing, limits, vendor lock-in, API changes |
| Use a self-hostable platform | The team runs an existing backend platform | More control than managed services | Still requires operation and maintenance |
| Hybrid approach | Combine custom services with platform features | Flexible by feature area | Integration and ownership boundaries must be clear |

A team may use a platform to move faster, or build custom services when a feature needs special control. For example, a game may use a platform for authentication or push notifications while keeping some game-specific economy, inventory, matchmaking, or LiveOps rules in custom services.

The important question is not simply:

```text
Which platform is best?
```

A better question is:

```text
Which parts of this game backend need custom control, and which parts can safely use a platform?
```

#### Questions to ask before choosing a platform

| Question | Why it matters |
|---|---|
| Which features does the game need now? | Avoid adopting a large system only because it looks complete. |
| Which features may need custom rules later? | Economy, rewards, and matchmaking often become game-specific. |
| Who owns the player data? | Data access and export matter for operations and migration. |
| How does pricing change with traffic or users? | Cost can change as the game grows. |
| Can operators use the tools safely? | Admin permissions and audit logs matter. |
| What happens if the platform API changes? | Vendor documentation and support status can change. |
| Can the service be integrated with existing backend systems? | Hybrid systems need clear boundaries. |

Vendor platforms can be very useful, but they are not a substitute for understanding backend responsibilities. Even when a platform handles a feature, your team still needs to understand data ownership, validation, logs, support workflows, and operational risk.

## 8.5 Example Scenario: A Small Arcade-Style Game Backend

Let’s connect the concepts with a small engine-independent scenario.

Imagine a small arcade-style running game. The player logs in, plays short runs, collects coins after a run, claims a daily reward, checks a weekly leaderboard, and sometimes sees event banners.

The game does not have Real-time Multiplayer. It still needs game backend services.

### Feature Map

| Player-facing feature | Backend service | Important backend question |
|---|---|---|
| Start as guest | Account and authentication | How does the backend identify this player later? |
| Open profile | Profile and save data | What progress should be loaded? |
| Collect coins after a run | Economy | Which coin changes can be accepted, limited, or marked for review by the server? |
| Open inventory | Inventory | What items does this player own? |
| Claim daily reward | Rewards | Has this player already claimed the reward for the current reward period? |
| Submit score | Leaderboard | Is the score valid, and which season does it belong to? |
| View weekly ranking | Leaderboard | Can the top scores be returned quickly? |
| See event banner | Remote Config and events | Which event is active for this player? |
| Receive event reminder | Push notification | Should this player receive this message now? |

The point is not that every arcade game must include all of these features. The point is that these features are common enough that you should be able to recognize what the backend is responsible for.

### Example API Shapes

The following examples show what API shapes might appear in such a game. They are not required implementation tasks.

```http
POST /auth/guest
GET /players/me
GET /players/me/inventory
POST /players/me/rewards/daily
POST /players/me/scores
GET /leaderboards/weekly?limit=50
GET /config
GET /events/active
```

A possible score submission request might look like this:

```json
{
  "stageId": "run-forest-01",
  "score": 15200,
  "distance": 1840,
  "durationMs": 123000,
  "runId": "run-2026-06-01-001"
}
```

A `runId` should be issued or recorded by the server before the backend accepts duplicate-sensitive score submissions. Client-sent timing fields can help with plausibility checks, but they do not prove that the run was valid. The server still needs score, stage, timing, and rule checks.

The server may need to check:

- Is the player authenticated?
- Does this stage exist?
- Is this score within a possible range?
- Was this run or run ticket already submitted?
- Which leaderboard season is active?
- Should this score be accepted, rejected, or marked for review?

A possible daily reward request may be simpler:

```http
POST /players/me/rewards/daily
```

But the server still needs to check authentication, server-side reward period, event status, reward rule, duplicate claim history, `requestId` or idempotency key, and inventory update result.

In a real API, the `requestId` or idempotency key might appear in a header or request body. This example keeps the visible API shape simple.

### Server-Side Validation Questions

For each feature, ask what the server should decide.

| Feature | Server-side validation question |
|---|---|
| Guest login | Should a new account be created, or does the client already have a valid guest account? |
| Profile update | Does the nickname satisfy format, uniqueness, and abuse rules? |
| Inventory lookup | Is the requester allowed to view this player's inventory? |
| Daily reward | Has this player already claimed the reward for the current reward period? |
| Score submission | Is the score plausible, and has this run or run ticket already been submitted? |
| Weekly leaderboard | Which scores belong to the current season? |
| Event banner | Is the event active for this region and client version? |
| Push notification | Did the player allow this type of notification, and is the token still usable? |

The server should be especially careful when a request changes state. Reading a leaderboard is usually less risky than granting currency. Submitting a score is more sensitive than viewing an event banner.

### Operations and Support Questions

Backend services also need to support operations.

If a player contacts support and says, "I did not receive my daily reward," the team may need to check:

- Did the player send a reward claim request?
- Was the request authenticated?
- Was the reward already claimed?
- Which reward rule was active at that time?
- Was inventory updated successfully?
- Was a grant log or currency ledger record written?
- Did an operator later modify the reward or event?

This is why game backend services should not be designed only around happy-path player screens. They also need records that help developers, operators, and support staff understand what happened.

## 8.6 Learning Practice

This Learning Practice is for observation and study. It is not a production-ready implementation.

### Goal

Choose one common game backend feature and analyze it through data, validation, failure, and operations questions.

### Steps

1. Choose one feature from the list below.
2. Fill in the analysis table in your own notes.
3. Compare your notes with the daily reward example.
4. Write one sentence that explains why the backend is needed for this feature.

### Choose One Feature

Pick one feature from the list below:

- Daily reward
- Inventory lookup
- Score submission and leaderboard
- Remote Config event banner
- Push notification reminder

### Fill in the Analysis Table

Use the table below in your own notes.

| Question | Student notes |
|---|---|
| What problem does this feature solve? |  |
| What data does the server need? |  |
| What API shape might appear? |  |
| What should the server validate? |  |
| What can go wrong? |  |
| What logs or records would help operations/support? |  |
| Which later advanced-course topic would revisit this? |  |

### Example Answer: Daily Reward

| Question | Example answer |
|---|---|
| Problem | Grant a reward once per day. |
| Data | playerId, rewardId, server-side reward period, claimedAt, reward rule, inventory state. |
| API shape | `POST /players/me/rewards/daily` |
| Server validation | Authentication, already claimed, event active, reward rule, `requestId` or idempotency key, inventory update. |
| Failure case | Duplicate claim, client time manipulation, partial grant, missing log. |
| Operations/support | Reward claim log, currency ledger, `requestId`, eventId, operator audit log if changed. |
| Later advanced-course topic | Data modeling, reward records, reward validation, and LiveOps tooling. |

### What to Observe

After finishing the table, check whether your chosen feature is only a simple UI action or a backend flow involving data, validation, and operations.

You should notice that the client request is only the beginning. The backend must decide whether the action is allowed, update data safely, and leave enough records to investigate the result later.

## 8.7 Common Mistakes

### Mistake 1: Thinking Game Backend Only Means Real-time Multiplayer

Real-time Multiplayer is important, but many games need backend services before they need a Dedicated Game Server. Login, save data, inventory, rewards, leaderboards, events, and Remote Config are also game backend features.

### Mistake 2: Trusting the Client for Important Values

The client can display UI and request actions, but sensitive decisions should be checked by the server. Scores, rewards, currencies, inventory changes, ranking points, and important grants should not be blindly trusted.

### Mistake 3: Mixing Item Definitions with Player Ownership

An item definition describes what an item is. Player inventory describes who owns it and how many. Mixing these concepts makes inventory, economy, support tools, and balancing harder.

### Mistake 4: Treating Remote Config as the Final Authority for Rewards

Remote Config can help the client display events or adjust behavior. But if a request changes important data, the server should still validate the current rule, server time, eligibility, and duplicate claim state.

### Mistake 5: Ignoring Duplicate Requests

Network retries and repeated button taps happen. Reward grants, currency spends, and other sensitive state-changing actions should be designed so repeated requests do not accidentally create extra rewards or incorrect balances.

### Mistake 6: Thinking Build vs. Buy Has One Universal Answer

Using a platform is not automatically right or wrong. Building custom services is not automatically better either. The right decision depends on requirements, feature-specific control, data ownership, cost, operational needs, and future flexibility.

### Mistake 7: Forgetting Operations and Support

A feature that works once in the client is not automatically ready for operations. Operators and support staff may need logs, audit records, search tools, grant histories, and admin workflows protected by permissions and audit logs. Chapter 12 and Chapter 13 will revisit logs, observability, dashboards, and internal tools more deeply.

## 8.8 Chapter Summary

In this chapter, we studied common game backend services as a feature map.

The most important points are:

- Game backend services are not the same as Dedicated Game Servers.
- Many game features use request/response APIs: login, profile, inventory, rewards, leaderboards, events, and Remote Config.
- The client may request an action, but the server should decide important state changes.
- Account, authentication, profile, and save data help the backend identify players and remember progress.
- Inventory, economy, and rewards require careful distinction between static game data and user data.
- Leaderboards, achievements, and matchmaking connect gameplay goals to backend data and fairness rules.
- Remote Config and events support LiveOps, but sensitive decisions still need server-side validation.
- Push notifications need careful targeting, consent handling, token management, and send records.
- Build vs. buy is a platform strategy trade-off, not a universal answer.
- Operations and support records are part of backend service design.

Most services in this chapter can be understood through request/response APIs. In the next chapter, we will look at what changes when players must stay connected and exchange game state with low latency.

## 8.9 Quiz

### Question 1

Which pair best matches a game backend service with its responsibility?

A. Leaderboard → score storage and ranking query; matchmaking → grouping players for a match.  
B. Leaderboard → rendering character animations; matchmaking → storing sound settings.  
C. Leaderboard → push token cleanup; matchmaking → nickname profanity filtering.  
D. Leaderboard → local graphics quality; matchmaking → app icon selection.

**Answer: A**

**Explanation:**  
Game backend services support server-side responsibilities around the online game. A leaderboard stores and returns ranking data, while matchmaking groups players before a match or session begins. Real-time match simulation is usually closer to Dedicated Game Server work.

### Question 2

Which statement best separates account, authentication, profile, and save data?

A. Account identifies the player, authentication checks the player, profile describes how the player appears, and save data stores progress.  
B. Account stores only graphics settings, authentication stores only leaderboard scores, profile stores only push notifications, and save data stores only platform pricing.  
C. Account and authentication are the same as Remote Config, while profile and save data are the same as matchmaking.  
D. Account data should always be stored only on the client because it is safer there.

**Answer: A**

**Explanation:**  
Account, authentication, profile, and save data are related but separate responsibilities. Separating them helps the backend identify the player, check requests, present player information, and preserve progress.

### Question 3

Which statement about inventory, economy, and rewards is safest?

A. Item definitions describe shared item data, player inventory records ownership, and repeated reward claims should be checked by the server.  
B. Item definitions and player inventory are the same thing, so the client can freely edit both.  
C. Reward requests should always grant rewards again when the same request is retried.  
D. Currency balances are safe to store only in a temporary cache.

**Answer: A**

**Explanation:**  
Item definitions and player inventory are different responsibilities. Sensitive changes such as reward grants and currency updates should be validated by the server and protected against duplicate requests.

### Question 4

Which statement about Remote Config, events, and push notifications is most appropriate?

A. Remote Config can help adjust client-visible settings, but important data changes still need server-side validation. Push notifications also need consent, targeting, token management, and send records.  
B. Remote Config means the client can grant rewards without contacting the server.  
C. Push notifications are reliable enough to control real-time match state.  
D. Events do not need server-side time rules because the client clock is always trusted.

**Answer: A**

**Explanation:**  
Remote Config and events are useful for LiveOps, but sensitive actions such as rewards, currency changes, and event eligibility should still be checked by the server. Remote Config should not store secrets or confidential player data. Push notifications are communication tools, not real-time state synchronization.

### Question 5

Which statement best describes platform strategy and service responsibility?

A. A managed platform removes the need to understand accounts, data, validation, logs, and operations.  
B. A team should always build matchmaking, leaderboards, and push notifications from scratch.  
C. A team may use platforms for some services, but it still needs to understand feature responsibility, data ownership, validation, support records, and operational risk.  
D. Platform strategy matters only for games without online features.

**Answer: C**

**Explanation:**  
Build vs. buy is a trade-off. A platform can help with services such as authentication, leaderboards, matchmaking, or push notifications, but the team still needs to understand what each backend feature is responsible for and how data ownership, validation, logs, support records, and operations are handled.

## 8.10 Further Reading

You do not need to read all of these resources immediately. Use them as references when you want to see how the concepts in this chapter appear in actual platform documentation.

Platform features, pricing, API names, and support status can change. Use these links as references, not as fixed course requirements. When studying a platform seriously, always check the latest official documentation.

- [Microsoft Learn — PlayFab documentation](https://learn.microsoft.com/en-us/gaming/playfab/)  
  Use this when you want to see how a managed game backend platform organizes account, data, leaderboard, economy, multiplayer, and LiveOps features.

- [Unity Gaming Services documentation](https://docs.unity.com/)  
  Use this when you want to explore examples of authentication, cloud save, economy, leaderboards, Remote Config, and LiveOps services.

- [Nakama documentation](https://heroiclabs.com/docs/nakama/)  
  Use this when you want to compare a self-hostable game backend platform with managed backend service suites.

- [Firebase documentation](https://firebase.google.com/docs)  
  Use this when you want to understand app backend services such as authentication, Remote Config, cloud messaging, and data services.

- [Firebase Remote Config](https://firebase.google.com/docs/remote-config)  
  Use this when you want to see how Remote Config appears in actual documentation.

- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)  
  Use this when you want to explore push notification concepts, message targeting, and the role of a trusted app server.

- [Firebase Cloud Messaging — Manage registration tokens](https://firebase.google.com/docs/cloud-messaging/manage-tokens)  
  Use this when you want to understand why device tokens can become stale or expire and why the backend should update token records.

- [Unity Matchmaker documentation](https://docs.unity.com/en-us/matchmaker)  
  Use this as a conceptual reference for how a platform describes matchmaking, hosting-provider integration, rule-based matching, and rule relaxation. As of June 2026, Unity's Matchmaker documentation includes migration/deprecation guidance for Multiplay Hosting, so verify the current hosting-provider support status and migration guidance before relying on any specific server allocation flow.
