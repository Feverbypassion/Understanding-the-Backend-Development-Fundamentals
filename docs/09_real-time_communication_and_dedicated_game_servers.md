# 9. Real-time Communication and Dedicated Game Servers

## 9.1 How to Read This Chapter

In the previous chapters, we studied backend service features such as accounts,
profiles, inventory, leaderboards, rewards, economy, matchmaking, Remote Config,
and events. Many of those features fit a request/response style: the client asks
for something, and the backend returns a result.

This chapter looks at a different kind of backend problem:

```text
Several players are connected at the same time.
Their state changes quickly.
The server may need to send updates before a client asks again.
```

That is the starting point for **Real-time Communication** and **Dedicated Game
Servers**.

This chapter is an introductory concept chapter. We will not implement a working
Real-time Multiplayer server in this guide. Instead, we will learn the vocabulary
and mental model needed for a later Real-time Multiplayer Backend course.

At this stage, focus on three questions:

- Does this game feature work well with request/response APIs?
- Does this game feature need a persistent connection or frequent updates?
- Does this game feature need the server to judge important game state?

Some examples in this chapter use chat, rooms, lobbies, player movement, and
combat. These examples are used to explain concepts. They are not implementation
requirements.

## 9.2 What You Will Learn

By the end of this chapter, you should be able to explain:

- Why some game features fit HTTP APIs while others need Real-time Communication.
- How HTTP, WebSocket, TCP, UDP, and game networking layers differ at an introductory level.
- Why HTTP and WebSocket are not at the same conceptual layer as TCP and UDP.
- What rooms, sessions, matches, and matchmaking mean in multiplayer systems.
- Why matchmaking and server allocation are related but different.
- What relay servers, Listen Server / Host Client models, and Dedicated Game Servers do.
- Why a Dedicated Game Server is not the same thing as an Authoritative Server.
- Why server authority matters for fairness and reducing cheating risk.
- What tick, snapshot, state synchronization, latency, jitter, and packet loss mean.
- Why operating real-time servers can be harder than operating typical request/response API servers.

You are not expected to design a complete multiplayer architecture after this
chapter. The goal is to recognize the main vocabulary and avoid common beginner
confusions.

## 9.3 Why Real-time Communication Matters

Let’s start with features that usually work well with HTTP APIs.

A player logs in. The client sends a login request. The backend checks the
account and returns a result. A player opens the leaderboard. The client sends a
request. The backend reads scores and returns rankings. A player claims a daily
reward. The client sends a request. The backend checks whether the reward was
already claimed and returns the result.

These features can often follow this shape:

```text
Client sends request
→ Server processes request
→ Server returns response
```

This is a good fit for many game backend service features.

Real-time gameplay often feels different. Imagine a co-op action game where
three players move inside the same dungeon. If Player A moves, attacks, or picks
up an item, Player B and Player C may need to know quickly. The server may need
to send updates even when those clients did not just send a new request.

```text
Player A moves
→ Server receives the movement or input
→ Server updates shared state
→ Server sends updated state to Player B and Player C
```

This is why Real-time Communication matters. Some features are not just about
asking the server for a result. They are about keeping several connected clients
aware of changing shared state.

### Request/Response Features and Real-time Features

The difference becomes clearer when we compare examples.

| Game feature | Communication or delivery need | Server responsibility |
|---|---|---|
| Login | HTTP API | Authenticate the player and return a result. |
| Profile query | HTTP API | Read player data from persistent backend storage. |
| Daily reward claim | HTTP API | Check claim rules and update reward records safely. |
| Leaderboard query | HTTP API | Return rankings from stored or cached score data. |
| Lobby chat | WebSocket-style persistent connection | Deliver messages to players in the same room. |
| Party ready state | WebSocket-style connection | Share ready-state changes. |
| Player position updates | Real-time transport / game networking layer | Keep shared state reasonably aligned. |
| Combat hit decision | Real-time input/state exchange | Authoritative Server judges hits and damage. |
| Match result save | Server-to-server API | Store final results and rewards safely. |

The table separates two related questions. The communication column asks how
updates move between client and server. The responsibility column asks what the
server should check, store, or decide.

The table does not mean every game must make the same choice. A slow turn-based
game, a casual co-op game, and a fast competitive action game may make different
trade-offs. The important habit is to look at the feature first.

Ask:

```text
How often does the state change?
Who needs to know about the change?
Can the client ask only when needed?
Does the server need to notify first?
Would trusting the client damage fairness?
```

Real-time technology should solve a real problem. It should not be chosen just
because it sounds more advanced.

### Real-time Does Not Mean Everything Must Be Real-time

A common beginner mistake is to think that once a game has multiplayer, every
backend feature should use Real-time Communication. This is not true.

Even in a game with Real-time Multiplayer features, many features can still use regular HTTP
APIs:

- Account login.
- Store product lookup.
- Inventory query outside a match.
- Notice list.
- Event information.
- Match result save, often through a trusted server-to-server API.
- Customer support records.

Real-time Communication is useful when connected clients need quick updates
about changing shared state. It is not a replacement for all backend APIs.

## 9.4 HTTP, WebSocket, TCP, and UDP

Students often meet four names when they begin studying multiplayer backend
systems:

```text
HTTP
WebSocket
TCP
UDP
```

These names are related, but they do not all describe the same kind of concept.

HTTP and WebSocket are application-level protocols or communication styles. They
shape how clients and servers exchange messages. TCP and UDP describe
transport-level delivery behavior.

In many common setups, HTTP and WebSocket use TCP underneath. However, modern
protocols such as HTTP/3 use QUIC over UDP, so the point is not to memorize one
fixed protocol stack. The important idea is to avoid mixing application-level
choices with transport-level behavior.

A simple mental model is:

```text
Application-level style:
  HTTP, WebSocket

Transport-level behavior:
  TCP, UDP
```

This is not a full networking model. It is a beginner-friendly distinction that
helps you avoid mixing ideas that answer different questions.

### HTTP

HTTP is the familiar request/response style used by many Web Backend features.
The client sends a request, and the server sends a response.

```text
Client ---- request ----> Server
Client <--- response ---- Server
```

HTTP is a good fit when the client can ask for data or request an action at a
specific time.

Examples:

```http
POST /auth/login
GET /players/me
GET /leaderboard?season=weekly
POST /rewards/daily
POST /internal/matches/{matchId}/result
```

Some HTTP APIs are called by the game client. Others are internal server-to-server
APIs. For example, a match result save endpoint is often called by a trusted game
server or internal service, not freely by a game client.

HTTP is simple to reason about because each request has a clear beginning and a
clear response. It also fits well with status codes, headers, JSON bodies, API
documentation, authentication, authorization, logging, caching, and many backend
operation tools.

However, HTTP can feel awkward when the server needs to notify the client first.
If a lobby ready state changes, the client could repeatedly ask the server:

```text
Did anything change?
Did anything change?
Did anything change?
```

This repeated checking is called polling. Polling can be acceptable for some
slow-changing features, but it can be wasteful or delayed when updates should
arrive quickly.

### WebSocket

WebSocket creates a persistent, bidirectional communication path between the
client and the server.

```text
Client <======== persistent connection ========> Server
```

Bidirectional means both sides can send messages. Persistent means the
connection stays open instead of ending after one response.

WebSocket is often easier to understand through chat:

```text
Player A sends a chat message to the server.
The server sends that message to other players in the same room.
```

The other players did not need to ask, “Is there a new message?” The server
can send the message to them through the existing connection.

WebSocket can fit examples such as:

- Lobby chat.
- Party ready state.
- Room state changes.
- Spectator notifications.
- Turn notifications in a slower multiplayer game.
- Lightweight collaborative state updates.

WebSocket is not automatically a complete multiplayer game server. If you use
WebSocket, you still need to think about authentication, connection lifetime,
rooms, message validation, reconnection, rate limits, backpressure, logs, and
server authority. Backpressure means what happens when messages are produced
faster than a connection or client can handle them. In browser environments, the
classic WebSocket API also requires care because messages can arrive faster than
application code can process them.

WebSocket is also not a durable message queue. While the connection is open,
messages can travel over the connection, but if the connection drops, the
application still needs a plan for reconnection, resynchronization, replaying
important missed messages, or requesting a fresh state snapshot.

For important messages, the application may also need message IDs,
acknowledgements, or sequence numbers so it can detect what was already processed
after a reconnect.

### TCP

TCP is a transport protocol that provides a reliable, ordered byte stream while
the connection is working. In beginner terms, TCP tries to deliver data in order.
If delivery cannot continue, the connection fails rather than treating missing
data as normal.

TCP does not automatically preserve application-level message boundaries. If an
application sends structured messages over TCP, the application protocol still
needs a way to frame or separate those messages.

This can be useful when every message matters and order matters.

Examples where reliable, ordered delivery is useful underneath an application
protocol include:

- Chat messages.
- Turn-based commands.
- Important lobby state changes.
- HTTP API requests for purchases, rewards, or account changes.

However, reliable ordered delivery can also be a disadvantage for some real-time
state updates. If a stale movement update is delayed, newer updates may be held
behind it. In a fast action game, stale position data may be less useful than the
latest position.

This is why some real-time games use or consider UDP-like communication for
frequent state updates.

### UDP

UDP sends datagrams without built-in guarantees for delivery, ordering, or
retries. In beginner terms, UDP gives the application more control, but it also
makes the application responsible for handling loss, order, and reliability when
those things matter.

UDP can fit situations where the latest state is more important than stale state.

Examples:

- Frequent movement updates.
- Frequent input samples, when the system has a strategy for loss and ordering.
- Aim direction updates.
- Temporary state that changes many times per second.

Suppose a client sends player position updates many times per second. If one stale
position message is lost, waiting for it may not be useful because newer
position messages are already available. In that case, the system may prefer to
continue with the latest available state.

UDP does not automatically make a game fast. It does not remove physical
distance to the selected server region, network congestion, routing delay,
jitter, or packet loss.
It mainly changes how the application handles delivery guarantees.

For important data over UDP-like communication, games may add their own sequence
numbers, acknowledgements, retransmission rules, or use a networking layer that
provides selected reliability.

This does not mean every gameplay input is disposable. Important commands still
need sequencing, validation, acknowledgement, or another reliability strategy.
For example, a repeated movement direction sample may be handled differently
from a one-time "use ultimate skill" command.

### Do Not Confuse UDP with Dedicated Game Servers

UDP is a communication method. A Dedicated Game Server is a server execution
structure.

These questions are different:

```text
Communication question:
How are messages sent between client and server?

Execution structure question:
Where does the match state run and who manages it?
```

A game can discuss UDP-like communication and Dedicated Game Servers together,
especially for fast Real-time Multiplayer gameplay. But UDP is not a Dedicated
Game Server. A Dedicated Game Server is not a protocol.

This distinction will become important again when we discuss authority models.

### Other Real-time Web Technologies

You may also hear about Long Polling, Server-Sent Events, WebRTC DataChannel,
and WebTransport.

At this stage, treat them as additional options, not as topics you need to
master in this chapter.

- Long Polling sends repeated requests, but each request may wait until an update
  is available or a timeout occurs.
- Server-Sent Events can be useful when the server mainly needs to send one-way
  updates to the client.
- WebRTC DataChannel is often discussed for browser-based peer-to-peer data
  exchange, sometimes alongside WebRTC audio/video systems.
- As of June 2026, MDN lists WebTransport as a Baseline 2026 web API. It uses
  HTTP/3 and can support reliable streams and UDP-like datagrams. It is still an
  advanced option for this guide, so older devices, browser implementation
  differences, secure context requirements, HTTP/3 server support, fallback
  behavior, and deployment environment should be checked carefully before
  considering it for a real service.

For this introductory guide, WebSocket is enough for understanding the idea of a
persistent bidirectional connection. TCP and UDP are enough for understanding
the basic transport trade-off.

### Quick Comparison

| Name | Beginner meaning | Main caution |
|---|---|---|
| HTTP | Request/response application protocol | Not ideal for frequent server-pushed updates. |
| WebSocket | Persistent bidirectional connection | Still needs validation, rooms, lifecycle, and operations. |
| TCP | Reliable ordered transport behavior | Delayed stale data can block newer data. |
| UDP | Datagrams without built-in reliability | The application decides how to handle loss and order. |

### Choosing a Communication Style

Use these questions before choosing a technology name:

```text
Is request/response enough?
Does the server need to notify clients first?
Do messages happen frequently?
Does every message need to arrive?
Does message order matter?
Is the latest state more important than stale state?
Would client-side results need server judgment?
```

A good backend decision starts with the feature requirement, not with the most
advanced-sounding protocol.

## 9.5 Rooms, Sessions, Matches, and Matchmaking

Real-time Multiplayer discussions often use four terms:

```text
Room
Session
Match
Matchmaking
```

Different teams and tools may define these words slightly differently. In a real
team or project, you should always check your team’s documentation. In this
guide, we will use beginner-friendly meanings.

| Term | Meaning in this chapter |
|---|---|
| Room | A logical space where players share messages or state. |
| Session | A connected or authenticated period, or a gameplay participation unit. |
| Match | One gameplay round or unit whose result may be decided and saved. |
| Matchmaking | The process of grouping players into a suitable match. |

### Room

A room is a logical space where players are grouped together.

The simplest example is a chat room:

```text
room-101
  - Player A
  - Player B
  - Player C
```

When Player A sends a message, the server sends it to Player B and Player C in
the same room.

The same idea can apply to:

- Lobby rooms.
- Party rooms.
- Co-op dungeon rooms.
- Spectator rooms.
- Temporary waiting rooms before a match starts.

A room does not always mean one physical server. A room can be a data structure
inside a WebSocket server, a logical match space inside a Dedicated Game Server,
or a group tracked by a multiplayer framework.

At this stage, remember:

```text
A room is a logical group used to decide who shares messages or state.
```

### Session

Session can mean different things depending on context.

In Web Backend, a session may mean login-related state. For example, after a
player logs in, the backend may remember that this player is authenticated, or it
may verify a token that represents that authenticated state.

In Real-time Communication, a session may mean a period during which a client
stays connected. For example, a player connects to a lobby server, stays
connected, and later disconnects.

In gameplay, a session may refer to a participation unit. For example, a player
joins a match session and leaves when the match ends.

Because the word has multiple meanings, always ask:

```text
Does this session mean login state, connection state, or gameplay state?
```

### Match

A match is one gameplay unit where a result may be decided.

Examples:

- One PvP round.
- One co-op dungeon run.
- One racing round.
- One battle royale session.
- One turn-based board game instance.

A match often has a lifecycle:

```text
Created
→ Waiting for players
→ Starting
→ Running
→ Ending
→ Result saved
```

A match can contain rooms or use room-like concepts. For example, a lobby room
may exist before the match starts, and then the actual match begins on a game
server.

### Matchmaking

Matchmaking is the process of grouping players into a suitable match.

It may consider:

- Game mode.
- Region.
- Skill rating.
- Party size.
- Waiting time.
- Device or platform constraints.
- Player preferences.

A simple matchmaking flow looks like this:

```text
Player requests matchmaking
→ Matchmaking system places player in a queue
→ System finds suitable players
→ System creates a match group
→ Players receive information about where to connect next
```

Matchmaking is not only a technical problem. It is also a game design problem.
A system that creates fair matches may make players wait longer. A system that
creates fast matches may create less balanced games. Real services must balance
fairness, waiting time, region, and population size.

### Matchmaking Is Not Server Allocation

Matchmaking and server allocation are related, but they are not the same.

Matchmaking answers:

```text
Which players should play together?
```

Server allocation answers:

```text
Which server process or machine will run this match?
```

A simplified flow might be:

```text
1. Matchmaking groups Player A, Player B, Player C, and Player D.
2. The backend asks for an available game server.
3. The server allocation system chooses or starts a Dedicated Game Server.
4. Players receive connection information.
5. Players connect to the assigned server.
```

In real systems, this connection information may also include a short-lived
connection ticket or session token so the game server can verify that the player
is allowed to join that match.

Such a ticket should be scoped to a specific player and match, and it should
expire quickly. It is not the same thing as a long-term login token. For stronger
protection, the ticket can also be single-use or invalidated after the player
successfully joins the assigned match.

For small systems, these responsibilities may be handled by one service. For
larger systems, matchmaking and server allocation often become separate concerns.

## 9.6 Relay Servers, Dedicated Game Servers, and Authority Models

Real-time Multiplayer systems can be organized in different topologies. A
topology describes how clients and servers are connected and where state is
processed.

Common terms include:

```text
Client-Server
Peer-to-Peer
Listen Server / Host Client
Relay Server
Dedicated Game Server
Authoritative Server
```

Some terms in this section describe connection topology. Other terms describe
decision authority. We will separate them first, even though real systems often
combine them.

### Client-Server

In a client-server structure, clients connect to a server, and the server helps
coordinate communication or state.

```text
Player A Client ----\
Player B Client ----- [Server]
Player C Client ----/
```

Many backend systems use some form of client-server structure. The server may be
an API server, a WebSocket server, a relay server, a lobby server, or a Dedicated
Game Server depending on the feature.

The main idea is that clients do not need to connect directly to every other
client. The server becomes a shared point of coordination.

### Peer-to-Peer

In peer-to-peer communication, clients communicate more directly with each other.

```text
Player A Client <----> Player B Client
Player A Client <----> Player C Client
Player B Client <----> Player C Client
```

Peer-to-peer systems can reduce server cost in some cases, but they introduce
many challenges:

- NAT traversal and connectivity problems.
- Host advantage or unstable host quality in peer-hosted variants.
- Cheating risk if clients control important state.
- Difficulty observing and operating matches.
- Difficulty protecting IP addresses and privacy.

For beginner backend learning, it is enough to understand that peer-to-peer is a
possible topology, but it is not a simple solution to all multiplayer problems.

### Listen Server / Host Client

In a Listen Server / Host Client model, one player's game client also performs
the server role for the match.

```text
Host Player Client + Server Role
      /          |          \
Player B      Player C      Player D
```

This can be useful for small games or casual sessions because one player’s
machine hosts the match. However, it has risks:

- The match may end if the host leaves.
- The host may have latency advantages.
- The host machine may not be reliable.
- The host may be easier to manipulate.
- Other players depend on the host’s network quality.

This model is important to know, but this guide focuses more on
server-side backend concepts.

### Relay Server

A relay server forwards messages between clients.

```text
Player A Client ----> [Relay Server] ----> Player B Client
```

A relay server may help players communicate when direct peer-to-peer connections
are difficult. It can also hide client network addresses from each other and make
some connectivity problems easier.

However, a relay server does not automatically judge the game. It may simply
forward messages.

For example, if Player A sends:

```text
I hit Player B for 9999 damage.
```

A pure relay server might simply forward that message. It may not decide whether
the hit was valid.

Not judging game state does not mean a relay server should ignore all safety
checks. A relay may still authenticate connections, limit message rate, check
message size, and record logs. The key point is that it does not make the final
game-rule decision.

This is why relay and authority are different ideas.

### Dedicated Game Server

A Dedicated Game Server is a server process that is dedicated to running a game
match or session. It is not a player’s client. It runs separately on server
infrastructure.

Depending on the game design, one Dedicated Game Server process may run one
match, several small rooms, a zone, or another gameplay unit. The important idea
is not the exact number of matches per process, but that gameplay state runs in a
separate server-side execution unit rather than inside a player’s client.

Here, "Dedicated" means dedicated to server-side gameplay execution. It does
not necessarily mean one physical machine or one match per process.

```text
Player A Client  <---->  Dedicated Game Server  <---->  Player B Client
Player C Client  <---->  Dedicated Game Server  <---->  Player D Client
```

A Dedicated Game Server may track:

- Player connections.
- Match lifecycle.
- World state.
- Player positions.
- NPC or monster state.
- Projectiles or temporary objects.
- Match timer.
- Victory conditions.
- Match result.

A Dedicated Game Server is an execution structure. It answers the question:

```text
Where does the match run?
```

It does not automatically answer every authority question. A Dedicated Game
Server can be designed with strong authority, weak authority, or poor validation.
The important point is that the Dedicated Game Server is separate from the
player clients.

### Authoritative Server

An Authoritative Server is a server that acts as the final judge for important
game state.

It answers the question:

```text
Who is the source of truth for important game state?
```

In a client-trusted model, the client might say:

```text
My attack hit.
The damage is 9999.
I gained 5000 gold.
```

If the server trusts this blindly, the game can become unfair. A manipulated
client or abnormal request could damage combat, ranking, inventory, or economy
systems.

In an authoritative model, the client usually sends input, intent, or observed
information, and the server decides the final result.

```text
Client sends:
  I pressed attack with skill-03 at this time.

Server checks:
  Player position
  Target position
  Skill range
  Cooldown
  Timing
  Defense
  Game rules

Server decides:
  Hit or miss
  Damage
  State change
```

The authoritative model is especially important when fairness matters.

Sometimes teams also say "server-authoritative model." This phrase emphasizes
the design rule: the server is the authority for important decisions, even if the
exact server structure differs by game.

Server authority is not a complete anti-cheat system. It reduces how much the
backend must trust client-side results, but it does not remove every cheating or
security problem by itself.

### Dedicated Game Server vs Authoritative Server

These two terms are often confused.

| Concept | Main question | Example |
|---|---|---|
| Dedicated Game Server | Where does the match run? | A separate server-side execution unit runs gameplay state. |
| Authoritative Server | Who decides the final state? | The server decides hit results and damage. |

They are related, but they are not identical.

A Dedicated Game Server often becomes the Authoritative Server for a match, but
the words describe different ideas. Dedicated describes execution structure.
Authoritative describes decision authority.

A useful beginner rule is:

```text
Dedicated Game Server = where the game session runs.
Authoritative Server = who has final decision authority.
```

Once a server has responsibility for match state, the next question is how
clients remain reasonably synchronized with that state over an imperfect network.

## 9.7 State Synchronization and Network Conditions

Real-time Multiplayer is not only about sending messages quickly. It is also
about keeping clients reasonably aligned with the same shared state.

Important vocabulary includes:

```text
Tick
Snapshot
State synchronization
Latency
Jitter
Packet loss
```

This chapter introduces these terms only at a high level. Actual implementation
belongs to a later Real-time Multiplayer Backend course.

### Tick

A tick is a repeated update step on a server or simulation.

A game server may update match state many times per second:

```text
Tick 1: read inputs and update positions
Tick 2: read inputs and update positions
Tick 3: read inputs and update positions
...
```

The tick rate describes how often this update happens. For example, a server may
run at 10, 20, 30, or 60 ticks per second depending on the game design and
performance requirements.

Higher tick rates can make the simulation more responsive, but they also create
more CPU, network, and operations pressure. A higher number is not automatically
better. The right choice depends on the game.

The simulation tick rate and the network send rate do not always have to be the
same. A server may update its simulation at one rate and send snapshots or state
updates at another rate.

In this guide, you only need to understand that tick is the repeated rhythm of
server-side state updates.

### Snapshot

A snapshot is a representation of game state at a moment in time.

For example, a snapshot may contain:

```text
matchId: match-7001
time: 125.50 seconds
players:
  Player A position: (10, 4, 2)
  Player B position: (12, 4, 3)
monster-01 health: 430
match phase: running
```

The server may send snapshots or state updates to clients so they can display
the current match. Some systems send full snapshots. Others send only changed
values. Advanced systems may use interpolation, prediction, reconciliation, and
lag compensation. Those are later topics.

At this stage, remember:

```text
A snapshot is a view of shared game state at a specific moment.
```

### State Synchronization

State synchronization means keeping clients and the server reasonably aligned
about what is happening.

In a real-time match, each client sees the game through its own network
connection. Updates take time to travel. Some messages may arrive late. Some may
be lost. The client may need to render smoothly even when the latest server
state has not arrived yet.

A simple state synchronization flow might look like this:

```text
Client sends input
→ Server updates authoritative state
→ Server sends updated state or snapshot
→ Client displays the result
```

The diagram is simple, but making this work reliably in a fast game is difficult.

For this introductory guide, focus on the idea that Real-time Multiplayer
systems must manage shared state over imperfect networks.

### Latency

Latency is delay. In multiplayer games, it often means the time it takes for a
message to travel between the client and the server and for the result to return
or become visible.

In practice, players often see "ping," which usually represents round-trip time:
the time for a message to go to the server and for a response to come back.
One-way delay is related, but it is not always directly visible.

High latency can make actions feel slow. For example, a player presses a skill
button, but the result appears late.

Strictly speaking, network latency is mainly affected by:

- Physical distance to the server region.
- Routing path.
- Network congestion.
- Wi-Fi or mobile network quality.

Server load and client performance can add processing delay. This affects the
player's end-to-end response time and perceived responsiveness.

Using a different protocol does not remove physical distance. Choosing the right
server region and operating servers reliably also matters.

### Jitter

Jitter means variation in latency.

If every message takes about 60 ms, the connection may feel stable. If one
message takes 40 ms, the next takes 200 ms, and the next takes 80 ms, movement
and actions may feel uneven.

Jitter can be harder to handle than steady delay because the system cannot
predict timing as easily.

### Packet Loss

Packet loss means some network messages do not arrive.

Loss can happen for many reasons, including congestion, unstable Wi-Fi, mobile
network conditions, or routing problems.

A reliable transport or application-level reliability layer may resend missing
data. But for frequent real-time updates, resending every stale message may not
always be useful. For example, if a stale position update is already outdated,
the latest position may matter more.

With reliable transports, packet loss may be hidden from the application as
retransmission delay rather than appearing as a missing application message. With
UDP-like communication, the application or networking layer often needs to decide
what loss means for each message type.

This is one reason UDP-like approaches are considered in some real-time games.
But remember: if a message is important, the application still needs a strategy
for reliability. That strategy may include sequence numbers, acknowledgements,
selective retransmission, or a networking layer that provides reliability only
for the messages that need it.

## 9.8 Operations and Scaling Concerns

Real-time servers create operations problems that are different from typical
request/response API servers.

An API request usually starts, runs, and ends quickly:

```text
Request arrives
→ Server handles it
→ Response returns
→ Request is finished
```

A real-time connection can stay open:

```text
Client connects
→ Client joins a room or match
→ Messages continue
→ State changes over time
→ Client disconnects or match ends
```

This difference affects monitoring, deployment, scaling, failure recovery, and
cost.

### Active Connections

Real-time servers often need to track active connections.

Important questions include:

- How many clients are connected now?
- Which room or match is each client in?
- Which server owns this connection?
- How many messages are being sent per second?
- Are some clients sending too many messages?
- Are connections disconnecting abnormally?

A server that handles many persistent connections must manage memory, sockets,
heartbeats, timeouts, and backpressure carefully. Backpressure is the pressure
created when messages are generated faster than a connection, server, or client
can process them.

In UDP-like systems, "connection" may mean a logical player session or endpoint
state rather than a TCP-style connection. The operational question is still the
same: which players are active, where are they, and how healthy is their network
state?

### Active Rooms and Matches

For room-based or match-based systems, operators need to know what is active.

Examples:

- Number of active lobby rooms.
- Number of active matches.
- Players per match.
- Average match duration.
- Failed match starts.
- Abnormally long matches.
- Empty rooms that were not cleaned up.

Unlike a simple API request, a match has a lifecycle. If a match server crashes
mid-game, players may be disconnected and the final result may become unclear.

### Server Allocation

When a game uses Dedicated Game Servers, the system must find or start a server
for a match.

A simplified allocation flow:

```text
Matchmaking creates a match group
→ Backend asks for a game server
→ Allocation system selects or starts a server
→ Backend sends connection information to players
→ Players connect to the game server
```

In real systems, this connection information may also include a short-lived
connection ticket or session token so the game server can verify that the player
is allowed to join that match.

Such a ticket should be scoped to a specific player and match, and it should
expire quickly. It is not the same thing as a long-term login token. For stronger
protection, the ticket can also be single-use or invalidated after the player
successfully joins the assigned match.

Allocation can fail. Servers may be full, slow to start, crashed, or unavailable
in the right region. A good system must decide whether to retry allocation, ask
players to wait, or return a clear failure message.

At this stage, you only need to understand that server allocation is an
operational problem of deciding where matches run.

### Reconnection, Heartbeat, and Timeout

Real-time connections can break.

A player may close the app. A phone may switch networks. Wi-Fi may drop. A
server may restart. A client may stop responding without closing cleanly.

Systems often use concepts such as:

- Heartbeat: a small signal that checks whether the connection is still alive.
- Timeout: a limit after which an inactive connection is treated as disconnected.
- Reconnection: a process that lets a player return after a temporary network problem.

These details are very important in production, but this guide only introduces
their purpose.

Reconnection policy depends on the game. Some games let a player return to the
same match, some replace the player with an AI or bot, and some treat the player
as disconnected after a short timeout.

### Draining and Deployment

Stateless or mostly stateless API servers are often easier to roll forward
because their requests are short-lived. They still need graceful shutdown for
in-flight requests, but they usually do not hold a full match state for several
minutes.

Real-time game servers are harder because they may be running active matches.

If a server has active matches, shutting it down immediately can disconnect
players. Operators may need a draining process:

```text
Stop assigning new matches to this server.
Let existing matches finish.
Save final results.
Then stop the server safely.
```

This is one reason Real-time Multiplayer operations require special planning.

### Result Saving and Idempotency

After a match ends, the game server may need to save the match result to the
backend service.

```text
Dedicated Game Server
→ sends match result
→ backend API validates and stores the result
→ Rewards or rankings update
```

This result-saving flow must be designed carefully. If the server retries after a
network failure, the backend should avoid granting the same reward twice. This is
where idempotency becomes important.

Idempotency means repeating the same operation safely without creating duplicate
effects. For example, submitting the same match result twice should not grant
the same reward twice.

A common design is to include a unique `matchResultId` or idempotency key. If the
backend has already processed that key, it returns the previously stored result
or ignores the duplicate request instead of granting the same reward again.

The backend should also authenticate the game server or internal service that
submits the result. A `matchResultId` or idempotency key should be scoped to the
match and generated or accepted only through a trusted server-side flow, not
freely chosen by a game client.

The backend should also check the match lifecycle. For example, it should verify
that the match was allocated, that the reporting game server is the expected
server, and that the match result has not already been finalized.

Even when the backend ignores a duplicate request, it may still log the duplicate
attempt for debugging and investigation.

Result saving may trigger several backend changes, such as match history, reward
grants, leaderboard updates, and economy logs. Real systems need a plan for
partial failure. Depending on the architecture, this may involve a database
transaction, an outbox or queue, or a compensation process. At this stage, you
only need to remember the principle: important result-related changes should not
be left only partially applied without a recovery plan.

You do not need to master those patterns here. Treat them as names you may see
again when studying data consistency, operations, and backend architecture.

The exact mechanism can vary, but the backend should make the recovery path
explicit instead of assuming that every downstream update will always succeed.

### Observability for Real-time Servers

Real-time systems need logs and metrics, but the useful metrics can differ from
typical request/response API servers.

Examples:

| Metric or signal | Why it matters |
|---|---|
| Active connections | Shows current connected player load. |
| Active rooms or matches | Shows how many sessions are running. |
| Message rate | Shows communication volume. |
| Tick duration / simulation step time | Shows whether game simulation is running within budget. |
| Tick budget miss count | Shows how often simulation work takes longer than the expected tick budget. |
| Packet loss / network quality | Helps detect network quality problems when this information is available. |
| Disconnect rate | Shows possible connection problems. |
| Reconnection success rate | Shows whether players can return after drops. |
| Allocation failure count | Shows whether game servers are available. |
| Result-saving failure count | Shows whether match results are being stored reliably. |
| CPU and memory usage | Shows whether servers are under pressure. |
| Bandwidth usage | Shows network cost and capacity needs. |
| Crash count | Shows stability problems. |

Some transports expose packet loss or network quality directly. Others require
indirect signals such as delayed messages, reconnection attempts, or disconnect
patterns.

A real-time server that seems fine during a small local test may behave very
differently under many players, many rooms, and unstable networks.

## 9.9 Example Scenario

Let’s connect the concepts with one example.

Imagine a small online arena game. Players can log in, enter a lobby, find a
match, play a short real-time round, and then receive rewards.

The backend flow might look like this:

```text
1. Player logs in.
2. Player queries profile and inventory.
3. Player enters a lobby.
4. Player requests matchmaking.
5. Matchmaking groups players.
6. Server allocation assigns a game server and may issue a short-lived join ticket.
7. Players connect to the game server.
8. Players send inputs during the match.
9. The game server updates match state and sends snapshots.
10. The game server decides the final result.
11. The result is saved to the backend API.
12. Rewards and leaderboard records are updated.
```

Different parts of this flow may use different backend styles.

| Step | Likely communication or responsibility | Reason |
|---|---|---|
| Login | HTTP API | Request/response is enough. |
| Profile and inventory query | HTTP API | Accurate persistent data is needed. |
| Lobby updates | WebSocket-style connection | Players should see ready-state changes. |
| Matchmaking request | HTTP API to start | Status may later be reported through a persistent connection. |
| Server allocation | Internal backend service | The system chooses where the match runs. |
| Real-time gameplay | Real-time game server structure | Often uses a Dedicated Game Server. |
| Combat result decision | Authoritative Server model | The server should judge important results. |
| Match result save | Server-to-server API | The final result should be stored reliably. |
| Reward grant | Backend service | Persistent inventory and economy data should be updated safely. |

Notice that one game does not use only one communication style. A real service
may combine HTTP APIs, persistent connections, server-to-server APIs, and
Dedicated Game Servers.

A beginner-friendly rule is:

```text
Use HTTP APIs for server-side request/response features.
Use persistent connections when the server must push updates quickly.
Use Dedicated Game Servers when gameplay state needs a separate server-side execution unit.
Use an Authoritative Server model when the server must decide important game state.
```

## 9.10 Learning Practice

This Learning Practice is for observation and study. It is not a production-ready
implementation.

### Goal

Classify game feature scenarios by the kind of backend communication or server
responsibility they may need. The point is not to memorize one fixed answer for
every feature. The point is to practice separating communication style,
backend coordination, execution structure, and authority.

### Steps

1. Read each scenario in the table.
2. Choose a **Primary fit** from the categories below.
3. Add an **Additional note** if another responsibility is also involved.
4. Write one short reason for your choice.

Use the categories below. They are not all the same kind of concept.

Communication or delivery style:

- HTTP API
- WebSocket-style persistent connection
- UDP-like real-time transport / game networking layer

Backend coordination:

- Matchmaking / backend coordination

Server execution structure:

- Dedicated Game Server

Decision authority:

- Authoritative Server

Persistence flow:

- Server-to-server result-saving flow

In many multiplayer frameworks or game networking libraries, you may not choose
UDP directly. The framework may provide a real-time game networking layer that
hides transport details. In this chapter, classify that as a UDP-like or
low-latency real-time transport choice when latest-state updates are the main
concern.

This does not mean every game networking layer uses UDP internally. The point is
that the layer is optimized for real-time state exchange, and the framework may
hide the exact transport choice from the game developer.

### Scenario Table

| Scenario | Primary fit | Additional note | Short reason |
|---|---|---|---|
| Player logs in. | Fill in. | Fill in. | Fill in. |
| Player claims a daily reward. | Fill in. | Fill in. | Fill in. |
| Player opens the weekly leaderboard. | Fill in. | Fill in. | Fill in. |
| Player enters a lobby and changes ready state. | Fill in. | Fill in. | Fill in. |
| Player sends a lobby chat message. | Fill in. | Fill in. | Fill in. |
| Matchmaking finds four players for a match. | Fill in. | Fill in. | Fill in. |
| Players exchange position updates many times per second. | Fill in. | Fill in. | Fill in. |
| The game must decide whether an attack hit. | Fill in. | Fill in. | Fill in. |
| A match ends and the result must be stored. | Fill in. | Fill in. | Fill in. |
| A spectator watches match state updates. | Fill in. | Fill in. | Fill in. |

### Questions to Ask

For each scenario, ask:

```text
Is request/response enough?
Does the server need to notify clients first?
Does this happen frequently?
Does the latest state matter more than stale state?
Does fairness require the server to judge the result?
Does the result need to be saved to persistent backend data?
Is this about grouping players, running a match, or deciding important state?
```

### Example Answers

These are examples, not the only possible answers. The examples below cover
several rows, not every row.

- **Player logs in.**  
  Primary fit: HTTP API.  
  Additional note: Authentication.  
  Reason: Login usually has a clear request and response.

- **Player claims a daily reward.**  
  Primary fit: HTTP API.  
  Additional note: Backend validation.  
  Reason: The backend checks claim status and returns a result.

- **Player enters a lobby and changes ready state.**  
  Primary fit: WebSocket-style persistent connection.  
  Additional note: Room state.  
  Reason: Other players should see the state change quickly.

- **Matchmaking finds four players for a match.**  
  Primary fit: Matchmaking / backend coordination.  
  Additional note: Server allocation may follow.  
  Reason: Matchmaking decides who plays together, not necessarily where the
  match runs.

- **Players exchange position updates many times per second.**  
  Primary fit: UDP-like real-time transport / game networking layer.  
  Additional note: A Dedicated Game Server may run the match.  
  Reason: Frequent latest-state updates may not need every stale message.

- **The game must decide whether an attack hit.**  
  Primary fit: Authoritative Server.  
  Additional note: May run on a Dedicated Game Server.  
  Reason: The server should judge fairness-sensitive outcomes.

- **A match ends and the result must be stored.**  
  Primary fit: Server-to-server result-saving flow.  
  Additional note: Use an idempotency key.  
  Reason: Persistent rewards and rankings should be saved reliably.

- **A spectator watches match state updates.**  
  Primary fit: WebSocket-style persistent connection for lightweight spectator
  updates.  
  Additional note: A game networking layer may be used for high-frequency live
  match views. The spectator should not influence match decisions.  
  Reason: The server pushes changing match state, but the spectator does not
  decide results.

### What to Observe

After completing the table, review your answers and look for patterns:

- HTTP APIs fit features that can be requested when needed.
- WebSocket-style persistent connections fit server-pushed updates such as chat
  and lobby state.
- UDP-like real-time transport or a game networking layer may fit frequent
  latest-state updates.
- Matchmaking / backend coordination describes how players are grouped before a
  match runs.
- Dedicated Game Server describes where match state is executed.
- Authoritative Server describes who decides important game state.
- Match result saving often returns to the backend service after gameplay ends.
- A single feature may involve more than one category, but those categories answer
  different questions.

### Short Note

Write two or three sentences about one scenario that felt ambiguous. Explain
which question helped you decide: communication style, backend coordination,
execution structure, or authority.

## 9.11 Common Mistakes

### Mistake 1: Thinking WebSocket Replaces All HTTP APIs

WebSocket is useful when the server needs to push updates through a persistent
connection. It does not replace every backend API.

Login, inventory lookup, leaderboard query, daily rewards, notices, and match
result saving can often remain HTTP APIs or trusted server-to-server APIs.

### Mistake 2: Thinking UDP Means Dedicated Game Server

UDP is a transport method. A Dedicated Game Server is a server execution
structure.

These ideas are often discussed together in fast multiplayer games, but they
answer different questions.

### Mistake 3: Thinking Dedicated Game Server and Authoritative Server Mean the Same Thing

A Dedicated Game Server describes where the match runs. An Authoritative Server
describes who has final decision authority.

A Dedicated Game Server is often designed to be authoritative, but the terms are
not identical.

### Mistake 4: Trusting Client Results Because the Game Feels Small

Even a small game can have important values such as scores, rewards, rankings,
currency, and win/loss records. If the client sends final results and the server
trusts them blindly, fairness and operations can break.

The server does not need to simulate every tiny detail in every genre, but it
should validate important outcomes.

### Mistake 5: Ignoring Operations Until Later

Real-time servers need operations thinking from the beginning. Connections,
rooms, matches, allocation, reconnection, draining, result saves, and crashes all
create operational concerns.

A local demo that works with two clients does not prove that the system is ready
for a live service.

### Mistake 6: Choosing Technology Before Understanding the Feature

A good decision starts with the feature:

```text
What data changes?
Who needs to know?
How fast does it need to arrive?
Does every message matter?
Who should decide the final result?
```

After answering those questions, the technology choice becomes clearer.

## 9.12 Chapter Summary

In this chapter, we studied the vocabulary and mental model behind Real-time
Communication and Dedicated Game Servers.

HTTP APIs are useful for request/response features such as login, profile query,
leaderboards, daily rewards, and result saving through trusted server-to-server
flows. WebSocket-style persistent connections are useful when the server needs to
push updates to connected clients, such as chat messages or lobby state changes,
but WebSocket is not a durable message queue by itself. Important messages may
need IDs, acknowledgements, or sequence numbers so reconnects can be handled
safely.

TCP and UDP describe lower-level delivery behavior. TCP provides a reliable,
ordered byte stream while the connection is working, but application protocols
still need to define message framing when they send structured messages over TCP.
UDP does not provide built-in delivery, ordering, or retry guarantees, so it may
fit frequent latest-state updates only when the application or networking layer
has a plan for handling loss and reliability.

We also separated several multiplayer terms. A room is a logical space where
players share messages or state. A session may refer to login, connection, or
gameplay participation depending on context. A match is one gameplay unit whose
result may be decided and saved. Matchmaking groups players, while server
allocation chooses or starts the server that will run the match.

A relay server forwards messages, but it does not automatically judge game
state. A Dedicated Game Server is a separate server-side execution unit that may
run a match, several small rooms, a zone, or another gameplay unit. An
Authoritative Server is the final decision maker for important game state. These
concepts often work together, but they are not the same.

Finally, we looked at operations concerns. Real-time servers must manage active
connections, rooms, matches, allocation, reconnection, draining, metrics, crash
handling, reliable result saving, logical connection tracking, and recovery from
partial failures. This is why Real-time Multiplayer Backend is a deeper area than
simply opening a socket connection.

In the next chapter, we will ask where these servers actually run, how players
connect to them, and what infrastructure is needed to operate them reliably.
That topic is Infrastructure, Deployment, and Cloud.

## 9.13 Quiz

### Question 1

Which feature is usually the best fit for an HTTP API?

A. Login request  
B. Player position synchronization 30 times per second  
C. Real-time bullet hit judgment  
D. Continuous movement state broadcasting

**Answer: A**

**Explanation:**  
Login usually follows a request/response pattern. The client sends login data,
and the backend checks the account and returns an authentication result.

### Question 2

When is WebSocket-style communication more natural than repeated HTTP polling?

A. When the client downloads a static file once  
B. When the server must quickly notify connected players about room state changes  
C. When a player claims a daily reward once per day  
D. When the client reads a public notice list only on startup

**Answer: B**

**Explanation:**  
WebSocket is useful when the server needs to send updates through an existing
persistent connection, such as chat messages or lobby ready-state changes.

### Question 3

Which statement best describes UDP?

A. UDP guarantees that all messages arrive in order.  
B. UDP is the same thing as a Dedicated Game Server.  
C. UDP sends datagrams without built-in delivery, ordering, or retry guarantees.  
D. UDP removes all network latency.

**Answer: C**

**Explanation:**  
UDP does not provide built-in delivery, ordering, or retry guarantees. The
application must decide how to handle loss, ordering, and reliability when those
things matter.

### Question 4

Which description of a room is most appropriate in this chapter?

A. A room is always one physical server machine.  
B. A room is a logical space where players share messages or state.  
C. A room is another name for an HTTP status code.  
D. A room is only a database table.

**Answer: B**

**Explanation:**  
A room is a logical grouping. It may be used for chat, lobbies, parties, co-op
sessions, or other shared state areas.

### Question 5

What is the main difference between matchmaking and server allocation?

A. Matchmaking groups players. Server allocation chooses or starts the server for the match.  
B. Matchmaking stores inventory, while server allocation stores player passwords.  
C. Matchmaking is only for HTTP APIs, while server allocation is only for databases.  
D. They are exactly the same concept.

**Answer: A**

**Explanation:**  
Matchmaking answers which players should play together. Server allocation
answers where the match will run.

### Question 6

Which statement best explains the difference between a Dedicated Game Server and
an Authoritative Server?

A. Dedicated describes where the match runs. Authoritative describes who decides
important game state.  
B. A Dedicated Game Server is another name for UDP. An Authoritative Server is another name for HTTP.  
C. Dedicated servers are only for chat. Authoritative servers are only for login.  
D. They are unrelated to multiplayer backend design.

**Answer: A**

**Explanation:**  
Dedicated describes execution structure. Authoritative describes decision
authority. A Dedicated Game Server is often authoritative, but the terms are not
identical.

### Question 7

Why can real-time game server operations be more difficult than typical request/response API operations?

A. Real-time servers never need monitoring.  
B. Real-time servers may keep long-lived connections and active room or match state.  
C. Real-time servers cannot have logs.  
D. Real-time servers only return static HTML pages.

**Answer: B**

**Explanation:**  
Real-time servers often manage persistent connections, rooms, matches,
reconnection, allocation, draining, and result saving. These concerns make
operations more complex than a simple request/response flow.

### Question 8

Which statement best describes a pure relay server?

A. It always decides final combat results.  
B. It forwards messages between clients but may not judge game state.  
C. It is the same thing as a database.  
D. It replaces all backend APIs.

**Answer: B**

**Explanation:**  
A relay server can help clients exchange messages, but forwarding messages is not
the same as being the final authority for game state.

## 9.14 Further Reading

You do not need to read all of these resources immediately. Use them as
references when these topics reappear in advanced study.

Some platform or orchestration documentation includes advanced implementation
details, setup guides, SDKs, and platform-specific examples. You do not need to
follow those tutorials for this guide. Use these links mainly to recognize
concepts such as persistent connections, one-way server updates, transport
behavior, allocation, hosting, and Dedicated Game Server operations.

- [MDN — WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)  
  Use this to review persistent, bidirectional communication in web applications.

- [MDN — Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)  
  Use this as a comparison point for one-way server-to-client updates.

- [MDN — WebTransport API](https://developer.mozilla.org/en-US/docs/Web/API/WebTransport_API)  
  Treat this as an optional advanced reference for HTTP/3-based transport,
  reliable streams, and UDP-like datagrams. As of June 2026, MDN lists
  WebTransport as a Baseline 2026 web API. Before considering it for a real
  service, check older devices, browser implementation differences, secure
  context requirements, HTTP/3 server support, fallback behavior, and deployment
  environment.

- [Cloudflare — What is UDP?](https://www.cloudflare.com/learning/ddos/glossary/user-datagram-protocol-udp/)  
  Use this to review why UDP does not provide the same delivery guarantees as TCP.

- [Agones Documentation](https://agones.dev/site/docs/)  
  Use this as an optional advanced reference for Dedicated Game Server
  orchestration concepts.

- [Amazon GameLift Servers Developer Guide](https://docs.aws.amazon.com/gameliftservers/latest/developerguide/)  
  Use this as an optional advanced reference for game server hosting and
  placement concepts.
