# 3. Introduction to Modern Backend

## 3.1 How to Read This Chapter

In the previous chapter, you prepared a basic learning workspace and learned that backend development is not
only about writing code. When learning backend development, you also inspect requests, responses, logs, data, service flows, and error messages.

In this chapter, we will use that mindset to build a map of a modern backend system.

This is a concept-first chapter. You are not expected to build a production-ready backend system here. You are
also not expected to install a framework, connect a database, deploy a server, or implement a real-time
multiplayer server. Instead, focus on understanding what each backend component is responsible for and how those
components work together in common game service flows.

The key idea is simple:

```text
A backend is a system of connected responsibilities, not just one server file.
```

You may see many terms in this chapter: API Server, database, cache, message queue, authentication, Admin
Dashboard, Dedicated Game Server, and more. Do not treat these as a memorization list. Treat them as a map.
Later chapters will revisit these topics in more detail.

As you read, keep asking three questions:

1. What responsibility does this component have?
2. Which game feature might use it?
3. Which later chapter will revisit this topic?

By the end of this chapter, the word “backend” should feel less vague. You should be able to see it as a set of connected responsibilities.

## 3.2 What You Will Learn

By the end of this chapter, you should be able to explain:

- Why a backend is needed when a game becomes an online service.
- Why a backend is not just one server file.
- The basic role of an API Server, database, cache, File/Object Storage, message queue, authentication, Logging and Monitoring, Admin Dashboard, and Dedicated Game Server.
- The difference between a Game Backend Service and a Dedicated Game Server.
- How login, profile loading, score submission, leaderboard display, and daily rewards can be mapped to backend components.
- Why some topics belong to later chapters or advanced courses.

This chapter prepares you for Chapter 4, where we will study the networking concepts that allow clients and
backend systems to communicate.

## 3.3 Why This Matters

A small offline prototype can often store everything on the player's device. The player opens the game, plays a
stage, gets a score, and closes the game. If the game is only used as a private experiment, local storage may be
enough.

The situation changes when the game becomes a service.

A service must support many players, many devices, shared rankings, server-side records, events, rewards,
purchases, customer support, and operations. Once those needs appear, the game client alone is not enough.

A backend helps the game service in four major ways: storage, validation, connection, and operations.

### Storage

A backend uses persistent server-side storage, such as a database or object storage, so service-critical game
data, meaning data that the live service depends on, can remain available across device changes, app deletion,
server restarts, and long-term service operations.

Common server-side game data includes:

| Data type | Examples |
|---|---|
| Account data | User ID, login provider, account creation time |
| Profile data | Nickname, avatar, level, experience points |
| Progress data | Cleared stages, quest progress, tutorial state |
| Inventory data | Items, equipment, cards, currency |
| Score data | High score, weekly score, ranking score |
| Reward data | Daily reward claim, event reward claim, compensation history |
| Operations data | Event participation, admin action records, support investigation records |

Some data can safely remain local, such as sound volume, graphics settings, and UI preferences. But account
data, items, currency, scores, purchases, and rewards are usually sensitive enough to be managed on the server.

### Validation

A backend checks whether sensitive client requests are valid.

The game client runs on the player's device. That means client-side values can be incorrect because of bugs,
network issues, outdated data, or intentional manipulation. For sensitive data, the server should not blindly
trust what the client sends.

For example, imagine a score submission request:

```text
stageId: stage_01
score: 999999999
playTime: 3 seconds

Player identity: checked from the authentication token
```

The backend should ask whether this result is possible. It may check whether the authenticated player exists,
whether the stage exists, whether the score is within a possible range, and whether the request was repeated too
quickly.

In a real backend, the server should not trust a `playerId` simply because it appears in the request body. The
backend usually identifies the player from an authenticated token or session, then compares that identity with
the requested action.

This does not mean every introductory backend needs a full anti-cheat system. It means the backend should be the
reference point for service-critical game rules and data.

### Connection

A backend connects the game client with many other systems.

A simple game feature may involve several systems behind the scenes. Login may use an authentication provider.
Score submission may write to a database and update or refresh a leaderboard cache. A purchase may require a
platform receipt check. An event may use Remote Config and an Admin Dashboard. A support investigation may read
logs and reward history.

A simplified view looks like this:

```text
[Game Client] ----> [API Server]
                       |
                       +----> [Authentication]
                       +----> [Database]
                       +----> [Cache]
                       +----> [Logging]
                       +----> [Message Queue]

[Admin Dashboard] --> [Admin API]
                         |
                         +----> [Authentication / Authorization]
                         +----> [Database]
                         +----> [Logs / Audit Records]
```

The player may see only one button, such as "Claim Reward." The backend may connect identity, validation, reward
rules, storage, logs, and operations tools behind that button.

### Operations

A live game continues after launch. Events change. Rewards are adjusted. Players report issues. Servers fail.
Requests slow down. Operators need tools to understand and manage the service.

This is why the backend also needs operational support:

- Logs to see what happened.
- Metrics to understand server health.
- Admin Dashboards to manage events and rewards safely.
- Audit logs to track who changed what.
- Support tools to investigate player issues.

A backend that only handles requests may work for a prototype. Operational support is what turns a simple
request handler into a foundation for a live service.

## 3.4 Backend Is a System, Not One Server File

When beginners hear the word "server," they often imagine one program or one machine. In a small project, that
image can be useful. One simple backend application can receive requests, process data, and return responses.

However, modern backend development is easier to understand when you think in responsibilities.

A backend service may need to answer questions like these:

- Where do client requests enter the system?
- Where is persistent player data stored?
- Which data should be read quickly?
- Which work can happen later in the background?
- How does the server know who sent a request?
- How can operators inspect or change service data safely?
- How do developers know when something is failing?
- Which parts require real-time communication?

Each question points to a component or responsibility.

A larger backend map may look like this:

```text
[Game Client]
      |
      v
[API Server]
      |
      +--> [Authentication]
      +--> [Database]
      +--> [Cache]
      +--> [File/Object Storage]
      +--> [Message Queue]
      +--> [Logging and Monitoring]

[Admin Dashboard]
      |
      v
[Admin API]
      |
      +--> [Authentication and Authorization]
      +--> [Database]
      +--> [Audit Log]
      +--> [Logging and Monitoring]

[Dedicated Game Server]
      |
      +--> [Real-time Match State]
      +--> [Combat or Movement Validation]
      +--> [Result Report to Game Backend Service]
```

This diagram is not a production architecture. It is a learning map. A small project may combine several of
these responsibilities in one application. A large service may split them into multiple systems.

The key point is not whether everything is one application or many services. What matters is whether you
understand the responsibility of each part.

### Starting Small Is Fine

A backend for learning does not need microservices, Kubernetes, a distributed cache, or a background job system on
the first day.

A small learning backend might begin with only this mental model:

```text
[Game Client] -> [API Server] -> [Simple Data Storage]
```

That is enough to understand the basic request flow.

As the service grows, new needs appear:

| Problem | Component that may help |
|---|---|
| Player data disappears when the server restarts. | Database |
| The same leaderboard is read very often. | Cache |
| Analytics processing slows down the player response. | Message Queue |
| Operators need to change event settings safely. | Admin Dashboard and Audit Log |
| Developers cannot see why requests are failing. | Logging and Monitoring |
| Players need to move together in a real-time match. | Dedicated Game Server |

This is a better learning path than copying a complex architecture too early. First understand the
responsibility. Then study the technology that solves that responsibility.

## 3.5 The Game Client and the Backend

The game client is the application running on the player's device. It may be built with a commercial engine, an open-source engine, a browser stack, a custom engine, or another technology.
The backend is the server-side system that the client communicates with.

A simple request and response flow looks like this:

```text
[Game Client]  --->  Request  --->  [Backend]
[Game Client]  <---  Response <---  [Backend]
```

The client and backend are not competing with each other. They cooperate by taking different responsibilities.

### What the Game Client Usually Handles

The client handles what is close to the player experience:

| Client responsibility | Examples |
|---|---|
| Input | Keyboard, mouse, touch, controller input |
| Rendering | Characters, backgrounds, UI, visual effects |
| Audio and animation | Sounds, hit effects, UI transitions |
| Immediate feedback | Button feedback, camera shake, local effects |
| Local settings | Graphics quality, sound volume, language setting |
| Presentation of server data | Showing profile, inventory, rewards, rankings |

If a player presses a movement key or taps a button, the client should respond quickly. Visual feedback should
not wait for every small server response.

### What the Backend Usually Handles

The backend usually handles responsibilities that protect service data, fairness, and operations:

| Backend responsibility | Examples |
|---|---|
| Account management | Identifying the player and loading the right account |
| Persistent storage | Saving profile, progress, inventory, scores, rewards |
| Validation | Checking score, reward, purchase, or inventory changes |
| Fairness | Preventing the client from being the final authority for sensitive values |
| Operations | Managing events, notices, rewards, and support records |
| Investigation | Leaving logs and records for developers and operators |

A useful principle is:

```text
The client should handle what needs to feel immediate.
The backend should be the reference point for service-critical data, fairness, and operations.
```

This connects to the idea of a source of truth. The source of truth is the place treated as the final reference
for a sensitive value.

For example, if the client displays 1,000 gold but the server database says the player has 800 gold, the
server-side value should usually be treated as the reference. Currency, items, scores, purchases, and reward
records are too sensitive to depend only on the client.

### Role Split Depends on the Game

Not every game needs the same backend structure.

| Game type | Typical backend need |
|---|---|
| Offline puzzle game | Little or no backend may be needed. |
| Online puzzle game | Account, save data, events, purchases, leaderboard. |
| Collection RPG | Account, inventory, economy, rewards, store, events. |
| Turn-based PvP | Match state, turns, result validation, ranking. |
| Real-time co-op action | A Game Backend Service plus a Dedicated Game Server for real-time match state. |
| FPS or battle royale | Usually needs Dedicated Game Servers for real-time match state and validation. |

The table is not a fixed rule. Game design matters. But it shows why backend design starts from the needs of the
game.

When you examine a feature, ask:

- Does this value affect fairness or the game economy?
- Does this data need to survive across devices?
- Does this action affect other players?
- Should support staff be able to investigate it later?
- Does the feature need a quick request/response, or continuous real-time state exchange?

Those questions help you decide whether the feature belongs mainly on the client, the Game Backend Service, or a
Dedicated Game Server.

## 3.6 Main Components of a Modern Backend

Now let’s look at the main components that commonly appear in a modern backend system. We will keep the
explanations beginner-friendly. You do not need to implement these components in this chapter.

Use this short table as a navigation map before reading the detailed sections.

| Component | Main responsibility |
|---|---|
| API Server | Receives requests and coordinates backend work. |
| Database | Stores persistent service data. |
| Cache | Speeds up repeated reads. |
| File/Object Storage | Stores larger file-like data. |
| Message Queue | Queues background work for later processing. |
| Authentication | Identifies who sent a request. |
| Logging and Monitoring | Records events and shows system health. |
| Admin Dashboard | Helps operators manage and investigate the service. |
| Dedicated Game Server | Runs real-time match or session state. |

### API Server

The API Server is usually the entry point for client requests.

When the player logs in, opens the inventory, submits a score, claims a daily reward, or checks a leaderboard,
the game client sends a request. The API Server receives that request, checks what needs to happen, runs backend
logic, reads or writes data, and returns a response.

Example API-style actions include:

```http
POST /auth/guest
GET  /players/me
GET  /inventory
POST /scores
GET  /leaderboard
POST /rewards/daily
GET  /events/current
```

In this example, `GET /players/me` means the backend identifies the player from the authenticated token or
session. Player-facing APIs should not let a client freely choose another player's ID. Admin APIs may use
explicit player IDs, but they require stricter authorization, validation, and audit logging.

At this stage, you do not need to know all HTTP rules. After Chapter 4 introduces the networking vocabulary,
Chapter 5 will explain HTTP and API contracts in more detail. For now, remember that the API Server is the main
entry point for request/response service features.

Common API Server responsibilities include:

- Receive client requests.
- Check request format.
- Check identity or token information.
- Apply Service Logic, such as reward or score rules.
- Read from or write to data storage.
- Return success, failure, or result data.
- Write logs for later investigation.

**Service Logic** means the backend rules that decide what should happen after a request is received. In many backend materials, you may also see a similar idea called **business logic**.

For example, Service Logic can decide whether a daily reward can be claimed, whether a score should be accepted, or whether an inventory change is allowed.

Service Logic is not always a separate server or component. In a small backend, Service Logic may live inside the API Server. In a larger system, it may be organized into separate modules or services.

The API Server is not the entire backend. It is the entry point and coordinator for many backend
responsibilities. Player-facing APIs and admin APIs may use the same general request/response style, but admin APIs
require stricter authorization, validation, and audit logging because they can affect live service data.

### Database

A database stores persistent data. Persistent data is data that should survive server restarts and remain
available later.

Game backend databases commonly store:

- Accounts.
- Player profiles.
- Inventory and currency.
- Progress and quest state.
- Scores and leaderboard records.
- Purchase and reward histories.
- Event participation records.
- Support investigation records.

A database is not only a place to save information. It also helps the backend find information again. For
example, the backend may need to find all items owned by one player, the top scores in a season, or the reward
history for a support ticket.

We will study database concepts in Chapter 7. In this chapter, remember this rule:

```text
A database stores persistent service data that must not disappear when the server restarts.
```

### Cache

A cache is temporary storage used to read frequently used data quickly.

If the database is the archive, the cache is the small set of frequently used papers on the desk. The archive is
more permanent, but the desk is faster for repeated access.

Common cache examples in game backends include:

| Cached data | Why it may help |
|---|---|
| Top leaderboard entries | Many players may read them often. |
| Current event settings | The same event information may be requested frequently. |
| Remote Config data | Many clients may request it at startup. |
| Session lookup data | The backend may need to check it often, but expiration and security rules are important. |

If authentication or session-related data is cached, expiration and invalidation rules matter. Security details
will be discussed in Chapter 11.

A cache is useful, but it has a major limitation: it is usually not the final source of truth. Cached data may
expire, disappear, or become slightly delayed compared with the database.

For example, using a cache for the top 100 leaderboard can be reasonable because it can be rebuilt from score
records. Using only a cache to store the final amount of paid currency would be dangerous because that value
must be reliable and persistent.

### File/Object Storage

File/Object Storage stores larger file-like data.

A database is good for structured records such as player ID, level, score, item ID, and reward claim status. But
larger files often belong somewhere else.

Depending on the design, larger file-like data may include:

- Profile images.
- Replay files.
- Archived log files.
- Remote Config JSON files or downloadable configuration snapshots.
- Patch data or downloadable assets.
- Raw analytics files.

In object storage, an object means a file-like unit of stored data, not a Unity GameObject or an in-game object.
A replay file, an image, or a JSON file can be stored as an object.

For example, the database may store replay metadata while File/Object Storage stores the actual replay file:

```text
Database record:
- replayId: replay_9001
- playerId: player_1001
- matchId: match_7001
- storagePath: replays/2026/05/replay_9001.dat

Object storage:
- replays/2026/05/replay_9001.dat
```

We will revisit storage and infrastructure concepts in later chapters.

### Message Queue

A message queue is a waiting line for backend work that can be processed later.

Some backend work must finish quickly before the player receives a response. For example, when a player claims a
daily reward, the backend should quickly check whether the reward can be granted and return the result.

Other work can often happen later. Examples include analytics processing, push notifications, large reward
distribution, log processing, and season settlement.

A message queue helps separate immediate work from background work:

```text
[Game Client]
   |
   | Submit Score
   v
[API Server] ----> [Database: Save Score]
   |
   +-----------> [Message Queue: Analytics Event]
                         |
                         v
                 [Worker: Process Later]
```

The key idea is asynchronous processing. The API Server can finish the player-facing response while other work
waits in a queue and is processed by workers later.

A queue helps organize background work, but it does not remove the need for careful design. Workers may fail or
retry work, so real systems often need safe retry and duplicate-handling rules.

Do not assume that queued work is always processed exactly one time. Real systems often need rules for retries
and duplicate work. Also remember that a player-facing request may succeed even if some later background work
fails and must be retried.

We will study queue and asynchronous processing as architecture concepts in Chapter 14.

### Authentication

Authentication checks who sent a request.

When a player logs in, the backend needs to know which account the player belongs to. After login, the client
often receives a token. Later, the client includes that token in requests so the backend can identify the
player.

Common login methods include:

| Login method | Description |
|---|---|
| Guest login | A quick account without an external provider, often device-linked until it is linked or upgraded. |
| Social login | Sign in with Google, Apple, Facebook, or another provider. |
| Platform login | Sign in with Steam, PlayStation, Xbox, Nintendo, or another platform. |
| Email login | Sign in with email, password, or a one-time code. |
| Custom token | A token issued by the game service or a backend platform. |

Authentication and authorization are related but different:

```text
Authentication: Who is this user?
Authorization: Is this user allowed to do this action?
```

For example, a player may be authenticated and allowed to view their own inventory. That same player should not
be authorized to change event rewards in an Admin Dashboard.

Security, authentication, authorization, and validation will be covered more deeply in Chapter 11.

### Logging and Monitoring

Logging and Monitoring help developers and operators understand what is happening in a running backend.

Logs are records of events. They may show that a player submitted a score, a reward claim failed, or an API
returned an error.

Example log lines:

```text
2026-06-01 10:05:12 INFO  requestId=req_abc123 POST /scores playerId=player_1001 score=15200 status=200
2026-06-01 10:07:31 WARN  requestId=req_def456 GET /leaderboard latency=820ms status=200
2026-06-01 10:09:44 ERROR requestId=req_ghi789 POST /rewards/daily playerId=player_2040 error=AlreadyClaimed
```

Many real systems also include a request ID so one request can be traced across logs.

Logs are useful, but they must be written carefully. Do not log passwords, authentication tokens, payment
details, or sensitive personal information. Even when logging internal player IDs, teams should follow their
privacy and data-retention rules.

Monitoring shows the health of the system through numbers, alerts, and dashboards.

Common monitoring data includes:

- Request count.
- Error rate.
- Response time / latency.
- Login failure rate.
- Reward grant failure count.
- Concurrent users.

Without logs and monitoring, running a backend is like operating in the dark. We will study logs, metrics,
traces, alerts, and dashboards in Chapter 12.

### Admin Dashboard

An Admin Dashboard is an internal tool used by operators, support staff, and developers to manage the service.

Players use the game client. Operators use internal tools. These tools may allow the team to inspect player
records, manage events, update notices, grant compensation rewards, or investigate support issues.

Common Admin Dashboard features include:

| Feature | Purpose |
|---|---|
| Player lookup | Inspect account, profile, inventory, and progress records. |
| Event management | Set event time, rules, and rewards. |
| Notice management | Update maintenance or event notices. |
| Reward grants | Grant compensation or recovery rewards to selected users safely. |
| Remote Config | Change selected settings without an app update. |
| Permission management | Limit who can perform privileged actions. |
| Audit logs | Track who changed what and when. |

Admin tools are powerful and risky. Directly editing a live database is dangerous because it can bypass validation
and permissions, and mistakes may be hard to trace or reverse.

A proper Admin Dashboard should use permissions, validation, and audit logs.

Player-facing APIs and admin APIs may use the same general request/response style, but admin APIs require
stricter authorization, validation, and audit logging because they can affect live service data.

Example audit log:

```text
2026-06-01 11:00:00 admin_01 changed weekend_event_reward from 100 gold to 200 gold
2026-06-01 11:05:10 admin_02 granted item_rare_ticket x3 to player_1001
2026-06-01 11:10:44 admin_03 disabled summer_event_banner
```

We will study tools, dashboards, permissions, audit logs, and LiveOps concepts in Chapter 13.

### Dedicated Game Server

A Dedicated Game Server handles real-time match or session state.

This is different from a general Game Backend Service. A Game Backend Service usually handles accounts,
inventory, rewards, leaderboards, events, and operations. A Dedicated Game Server handles fast-changing
real-time state such as movement, combat, match timing, and player actions inside a session.

Here, "dedicated" does not always mean one physical machine for one match. It means a server process or instance
whose main responsibility is running a real-time game session.

A simple real-time co-op example may look like this:

```text
[Player A Client] <----> [Dedicated Game Server] <----> [Player B Client]
[Player C Client] <----> [Dedicated Game Server]
```

The Dedicated Game Server may track:

- Which players are in the match.
- Where each player is.
- Which monsters exist.
- Which attacks happened.
- Whether a hit is valid.
- When the match starts or ends.
- The final result that should be reported to the Game Backend Service.

Not every game needs a Dedicated Game Server. Many online puzzle games, collection games, and asynchronous games
can use API-based backend services without a real-time match server. Real-time multiplayer games need a deeper
design discussion, which belongs to Chapter 9 and later advanced courses.

### Quick Recap

At this point, do not worry about memorizing every component. The most important pattern is this: the API Server
receives requests, persistent storage keeps long-term data, caching improves repeated reads, message queues handle
background work, authentication identifies users, logs and monitoring help operations, and Dedicated Game Servers
handle real-time sessions when needed.

## 3.7 Game Backend Service vs Dedicated Game Server

The phrase "game server" can mean different things. To avoid confusion, this guide separates two ideas:

- Game Backend Service.
- Dedicated Game Server.

A Game Backend Service supports the overall game service. It handles account data, saves, inventory,
leaderboards, rewards, events, store systems, operations tools, and logs.

A Dedicated Game Server runs a real-time game session or match. It handles real-time state exchange, movement
synchronization, combat validation, match rules, and result decisions.

| Category | Game Backend Service | Dedicated Game Server |
|---|---|---|
| Main role | Service data and operations | Real-time match or session state |
| Common features | Login, inventory, rewards, leaderboard, store, events | Movement, combat, match state, real-time validation |
| Communication style | Usually request/response APIs | Continuous or frequent state exchange |
| Time sensitivity | Should feel responsive, but exact timing depends on the feature | Often milliseconds or short tick intervals |
| Long-term service data | Owns or manages persistent player and service records | Usually keeps temporary match state and reports final results or match records to the backend service |
| Main concern | Data correctness, validation, operations, security | Latency, synchronization, fairness, server authority |

In this context, **server authority** means that the server is treated as the final reference for important match decisions, such as movement, hits, damage, or match results. Server authority is a responsibility model, not a guarantee that every authoritative system must be a separate physical server. Chapter 9 will revisit this idea more carefully.

### Example: Online Puzzle Game

An online puzzle game may need:

- Account login.
- Cloud save.
- Inventory.
- Daily rewards.
- Store purchases.
- Events.
- Leaderboards.
- Admin tools.

These can often be handled by a Game Backend Service through API requests.

### Example: Real-time Co-op Action Game

A real-time co-op action game may need all of the above, plus:

- Real-time player movement.
- Shared monster state.
- Skill timing.
- Hit validation.
- Match state.
- Result reporting.

This often requires a Dedicated Game Server in addition to the Game Backend Service.

The two systems can work together:

```text
1. Service request and match assignment

[Game Client] ---> [Game Backend Service]
                       |
                       +--> Login, inventory, rewards, events
                       +--> Persistent data and operations
                       +--> Match assignment / session token

2. Real-time match connection

[Game Client] ---> [Dedicated Game Server]
                       |
                       +--> Checks session token
                       +--> Runs real-time match state
```

In many real systems, the Game Backend Service also helps assign the player to a match server and provides
connection information or a session token. The Dedicated Game Server should still check that the connecting
player is allowed to join the match.

After the real-time match ends, the Dedicated Game Server may report the result to the Game Backend Service. The
Game Backend Service may trust the Dedicated Game Server as the match authority, but it should still verify metadata
such as the report source, session ID, player list, and duplicate result status before applying rewards or updating
records.

If result reports can be retried, the backend service should also avoid applying the same match result or reward
more than once.

## 3.8 Example Scenario

Now that we have a component map, let’s apply it to three common game flows. These examples are not implementation
tasks. They are reading examples that help you understand how backend components work together.

### Login, Profile Load, and Lobby

Imagine a player opens a game and enters the lobby.

From the player’s point of view, the flow is simple:

```text
Open game -> Login -> Enter lobby
```

From the backend point of view, several responsibilities may appear:

```text
1. The game client sends a login request.
2. The API Server receives the request.
3. Authentication checks who the player is.
4. The backend verifies the login information and may issue a session token for later requests.
5. The client uses the token to request the player profile.
6. The API Server reads profile data from the database.
7. If this is a new player, a default profile may be created.
8. Current event or Remote Config data may be loaded.
9. Logs record the login and profile request result.
10. The client shows the lobby screen with the received data.
```

For example, a guest login may receive a token from the game backend. A social login may involve verifying a
provider token first, then issuing a game service session token.

A simplified component map:

```text
[Game Client]
   |
   | Login / profile request
   v
[API Server]
   |
   +--> [Authentication]
   |
   +--> [Database: Player Profile]
   |
   +--> [Event / Remote Config Source]
   |
   +--> [Logs]
```

Notice that the API Server receives requests, but it is not the only responsibility. Authentication identifies
the player. The database stores profile data. Logs help the team investigate errors. The event or Remote Config
source might be a database, cache, file/object storage, or separate configuration service, depending on the system
design.

### Score Submission and Leaderboard Display

Imagine a player finishes a stage and sees the leaderboard.

From the player’s point of view:

```text
Clear stage -> Submit score -> View leaderboard
```

From the backend point of view:

```text
1. The player completes a stage.
2. The game client sends a score submission request.
3. The API Server checks the token and request format.
4. Authentication identifies the player from the token or session.
5. The backend checks the score using the validation rules available for this game.
6. If the score is accepted, it is stored in the database.
7. The leaderboard cache may be updated, invalidated, or refreshed depending on the design.
8. An analytics event may be placed into a message queue.
9. Logs record the score submission result.
10. The client requests the leaderboard.
11. The API Server reads leaderboard data from the cache or database.
12. The client displays the leaderboard screen.
```

The strength of score validation depends on the game design. A simple backend may check ranges, stage IDs, play
time, and request frequency. A competitive real-time game may need stronger server authority or anti-cheat systems. Later chapters and advanced
courses will revisit those topics.

In some systems, the displayed leaderboard may be slightly delayed compared with the newest score record. That
delay may be acceptable for a weekly leaderboard, but it would not be acceptable for every kind of game state.

A simplified component map:

```text
[Game Client]
   |
   | POST /scores
   v
[API Server] ---> [Authentication]
   |
   +--> [Service Logic: Score Validation]
   |
   +--> [Database: Score Records]
   |
   +--> [Cache: Leaderboard]
   |
   +--> [Message Queue: Analytics Event]
   |
   +--> [Logs and Monitoring]
```

This example shows why the backend is a system. A single feature can use API Server, authentication, Service
Logic, database, cache, message queue, and logging together.

### Daily Reward Claim

Daily rewards are a useful example because they look simple but require careful backend responsibilities.

From the player’s point of view:

```text
Open game -> Press daily reward button -> Receive reward
```

From the backend point of view:

```text
1. The client sends a daily reward claim request.
2. The API Server receives the request.
3. Authentication identifies the player.
4. The backend checks the database to see whether today’s reward was already claimed.
5. Service Logic applies the server-side reset rule and reward rule to decide whether the claim is allowed.
6. If the claim is allowed, the backend saves the inventory change and claim record safely so the reward is not granted twice.
7. Logs record the result.
8. Admin tools may later inspect the claim record if a support issue appears.
```

For daily rewards, the backend should decide what “today” means, usually based on server-side time or a clearly
defined server-side reset time. The client’s local clock should not be the final reference.

In a real system, the check and save steps must be handled safely so repeated requests or network retries do not
grant the same reward twice. Later, when you study databases and transactions, you will see why “check whether
claimed” and “save the claim result” often need to be treated as one safe operation.

A simple responsibility table:

| Step | Backend component or responsibility | What it does |
|---|---|---|
| Player sends claim request | API Server | Receives the request. |
| Server identifies player | Authentication | Checks who sent the request. |
| Server checks claim history | Database | Finds whether the reward was already claimed. |
| Server applies reward rules | Service Logic | Decides whether the reward can be granted. |
| Server records the result | Database | Saves inventory and reward claim changes as one safe operation. |
| Team investigates later | Logs / Admin Dashboard | Helps operators understand what happened. |

This is why “just give the item” is not enough. A live service needs records, validation, safe retry handling,
and investigation paths.

## 3.9 Learning Practice

This Learning Practice is for observation and study. It is not a production-ready implementation.

### Map a Game Feature to Backend Responsibilities

The goal of this practice is to observe how one game feature uses several backend components and
responsibilities together. You do not need to write code.

### Scenario

A player opens the game and presses the daily reward button. The backend must check who the player is, decide
what “today” means using the service’s server-side reset rule, confirm whether the reward was already claimed,
grant the reward if allowed, save the result safely, and leave a record that operators can inspect later.

### Steps

1. Read the scenario slowly.
2. Copy the table below into your notes.
3. Fill in the missing backend component, responsibility, or explanation.
4. Draw a simple box-and-arrow diagram in plain text.
5. Write two or three sentences about what you observed.

### Table to Complete

| Step | Backend component or responsibility | What it does |
|---|---|---|
| Player sends reward request | API Server | Receives the request. |
| Server checks player identity | ______ | Identifies the player from the token or session. |
| Server decides what “today” means | Service Logic / Server-side Reset Rule | ______ |
| Server checks whether reward was already claimed | Database | ______ |
| Server decides whether the reward can be granted | ______ | Applies the reward rule. |
| Server saves the reward result safely | Database | Stores the inventory change and claim record as one safe operation. |
| Server writes a log record | Logs | ______ |
| Operator checks a player issue later | Admin Dashboard | Helps inspect the reward history. |

### One Possible Completed Version

Your wording does not need to match this exactly. Use this table to compare your responsibility map after you
try the practice. Different systems may organize the same responsibility in slightly different ways.

| Step | Backend component or responsibility | What it does |
|---|---|---|
| Player sends reward request | API Server | Receives the request. |
| Server checks player identity | Authentication | Identifies the player from the token or session. |
| Server decides what “today” means | Service Logic / Server-side Reset Rule | Uses the server-side reset rule instead of trusting the client clock. |
| Server checks whether reward was already claimed | Database | Finds the claim record. |
| Server decides whether the reward can be granted | Service Logic | Applies the reward rule. |
| Server saves the reward result safely | Database | Stores the inventory change and claim record as one safe operation, without granting the reward twice. |
| Server writes a log record | Logs | Records what happened for later investigation. |
| Operator checks a player issue later | Admin Dashboard | Helps inspect the reward history. |

### Example Diagram

```text
Main request flow:

[Game Client]
   |
   | Daily reward request
   v
[API Server]
   |
   +--> [Authentication]
   |
   +--> [Service Logic: Server-side Reset / Reward Rule]
   |
   +--> [Database: Save claim record and inventory update as one safe operation]
   |
   +--> [Logs]

Later investigation path:

[Admin Dashboard]
   |
   +--> [Database: Reward Claim Record]
   |
   +--> [Logs]
```

### What to Observe

- One simple player action can involve several backend components and responsibilities.
- The API Server receives the request, but it is not the whole backend.
- Authentication answers “who is this player?”
- The database stores records that must remain available after restarts.
- Server-side time or a server-side reset rule matters for daily rewards.
- Logs and Admin Dashboard investigation paths matter because live services need support and operations.
- This practice is about mapping responsibilities, not designing a complete architecture.

### Short Note

Write two or three sentences like this:

> The daily reward feature is not only a button in the client. The backend needs to identify the player, check the server-side reset rule, check the claim record, save the reward result safely, and leave logs for later investigation. This shows that one game feature can use API Server, authentication, Service Logic, database, and logs during the request flow. An Admin Dashboard may later help operators inspect what happened.

## 3.10 Common Mistakes

### Mistake 1: Thinking the Backend Is Only One Server File

A backend can start as one application, but it is better to think in responsibilities. Even a small backend may
include request handling, validation, storage, logging, and operational needs.

### Mistake 2: Thinking Every Online Game Needs a Dedicated Game Server

Many online games can use API-based backend services for login, save data, inventory, events, and leaderboards.
A Dedicated Game Server is mainly needed when the game requires real-time shared state, such as movement,
combat, or match simulation.

### Mistake 3: Thinking a Database Is Enough

A database is essential for persistent data, but it does not solve everything. You may also need authentication,
validation, cache, logs, admin tools, and background processing.

### Mistake 4: Treating Cache as the Final Source of Truth

A cache is useful for speed, but it is usually temporary. Final service records such as currency, purchase
grants, and inventory changes should not depend only on cache.

### Mistake 5: Trusting Client Values Blindly

The client is close to the player and may send incorrect values. The backend should validate sensitive requests,
especially scores, rewards, purchases, inventory, and competitive results.

### Mistake 6: Forgetting Operations Tools Until Too Late

Live games need support workflows and operational tools. If there are no logs, admin tools, or audit records, it
becomes hard to investigate player issues or service problems. Even if the first tool is simple, the backend should
leave enough records for safe operations.

### Mistake 7: Starting With Microservices Before Understanding Responsibilities

Microservices are not the first goal. Start by understanding what each part is responsible for. Architecture
patterns become useful later when you understand the problems they solve.

## 3.11 Chapter Summary

In this chapter, we built a big-picture map of a modern backend system.

The most important idea is that a backend is a system of connected responsibilities, not just one server file. A
small backend can start simply, but even simple game features often involve several responsibilities: receiving
requests, identifying players, validating data, storing records, reading frequently used data quickly,
processing background work, leaving safe logs, and supporting operations.

You learned the basic roles of:

- API Server.
- Database.
- Cache.
- File/Object Storage.
- Message Queue.
- Authentication.
- Logging and Monitoring.
- Admin Dashboard.
- Dedicated Game Server.

You also learned that a Game Backend Service and a Dedicated Game Server solve different problems. A Game
Backend Service handles service data and operations such as login, inventory, rewards, leaderboards, events, and
support tools. A Dedicated Game Server handles real-time match or session state such as movement, combat,
synchronization, and match rules.

The example scenarios showed how login, profile loading, score submission, leaderboard display, and daily reward
claims can be mapped to backend components.

Now that we have seen the backend as a component map, the next question is how clients and servers actually
connect. In Chapter 4, we will study the networking concepts that allow backend systems to communicate.

## 3.12 Quiz

### Question 1

Which statement best describes a modern backend?

A. It is only one server file that stores all game logic.  
B. It is a system of connected responsibilities that support game service features.  
C. It is the part of the game client that renders UI.  
D. It is only used for real-time combat games.

**Answer: B**

**Explanation:**  
A modern backend is better understood as a system of connected responsibilities that support a game service,
such as API handling, data storage, validation, authentication, logging, operations, and sometimes real-time
server support.

### Question 2

Which component usually receives client API requests first?

A. API Server  
B. File/Object Storage  
C. Admin Dashboard  
D. Dedicated Game Server

**Answer: A**

**Explanation:**  
The API Server is usually the entry point for request/response features such as login, inventory lookup, score
submission, and leaderboard queries.

### Question 3

Which component is usually responsible for storing persistent data that must survive server restarts?

A. Cache  
B. Database  
C. Message Queue  
D. Monitoring Dashboard

**Answer: B**

**Explanation:**  
A database stores persistent data such as accounts, profiles, inventory, scores, reward records, and purchase
histories.

### Question 4

Why should a cache usually not be treated as the final source of truth?

A. Because it can only store image files.  
B. Because it is usually temporary and may expire or be rebuilt.  
C. Because it replaces all database records.  
D. Because it is only used by game clients.

**Answer: B**

**Explanation:**  
A cache is useful for fast reads, but cached data can expire, disappear, or become delayed. Final service
records should usually be stored in a persistent database.

### Question 5

Which task is a good candidate for a message queue?

A. Rendering a player character on the client.  
B. Processing analytics events after a score submission.  
C. Deciding which button the player tapped in the UI.  
D. Keeping the final premium currency balance only in temporary memory.

**Answer: B**

**Explanation:**  
Analytics processing can often happen later in the background. A message queue helps organize work that does not
need to finish before the player receives a response.

### Question 6

Which statement best explains the difference between authentication and authorization?

A. Authentication asks who the user is; authorization asks what the user is allowed to do.  
B. Authentication stores leaderboard records; authorization stores image files.  
C. Authentication is only for Admin Dashboards; authorization is only for game clients.  
D. Authentication and authorization are exactly the same thing.

**Answer: A**

**Explanation:**  
Authentication identifies the user. Authorization checks whether that user has permission to perform a specific
action.

### Question 7

Which feature most likely needs a Dedicated Game Server?

A. A local graphics settings menu.  
B. A weekly leaderboard query.  
C. Real-time co-op combat with shared monster state.  
D. A notice screen that loads current event text.

**Answer: C**

**Explanation:**  
Real-time co-op combat often requires shared match state, movement, combat timing, and validation. These are typical
reasons to use a Dedicated Game Server.

### Question 8

Why are Admin Dashboards and audit logs important in live game operations?

A. They replace all player-facing UI.  
B. They let operators manage and investigate service data safely while recording privileged actions.  
C. They are only used to improve rendering performance.  
D. They remove the need for authentication.

**Answer: B**

**Explanation:**  
Admin Dashboards help operators manage events, rewards, notices, and support investigations. Audit logs record
who performed an important operator action, what changed, and when, which is important for safety and accountability.

## 3.13 Further Reading

You do not need to read all of these resources immediately. Use them as references when the topic appears again
in later chapters.

- [MDN — Server-side website programming](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side)  
  Use this when you want a broader introduction to server-side programming. For this chapter, focus on the big-picture parts; you do not need to follow the framework tutorials.

- [MDN — HTTP overview](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview)  
  Use this to prepare for Chapter 5, where HTTP request and response concepts become central to the guide.

- [PostgreSQL Documentation — What is PostgreSQL?](https://www.postgresql.org/docs/current/intro-whatis.html)  
  Use this only as a light preview of database systems. Chapter 7 will explain database concepts in more detail.

- [Redis Documentation — Data types](https://redis.io/docs/latest/develop/data-types/)  
  Use this as a light preview of Redis as a data structure server that is often used for cache-like patterns. You do not need to install Redis for this chapter.

- [MDN — The WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)  
  Use this only as a browser-focused preview of two-way communication between a client and a server. Do not treat WebSocket as the only real-time networking option. Chapter 9 will explain Real-time Communication in a game backend context.
