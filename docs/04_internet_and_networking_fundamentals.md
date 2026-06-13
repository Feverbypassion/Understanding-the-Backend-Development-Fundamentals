# 4. Internet and Networking Fundamentals

## 4.1 How to Read This Chapter

In the previous chapter, we looked at the backend as a map of connected responsibilities: API Server, Database, Cache, Authentication, Object Storage, Message Queue, Admin Tools, and sometimes a Dedicated Game Server. This chapter adds the network layer to that map.

When a game client logs in, submits a score, loads a leaderboard, downloads configuration, joins a match, or sends real-time movement data, a backend call involves several network steps. The client must find a server, reach the right server process or service, send data through a transport protocol, wait for a response or state update, and handle failures when the network is slow or unstable.

This chapter is a concept-first introduction. You are not expected to implement socket programming, optimize packets, design a custom network protocol, or build a real-time multiplayer server here. Focus on the vocabulary that helps you understand backend behavior.

A useful mental model is:

```text
Game client
  -> Uses a domain name or address
  -> DNS may resolve the domain to one or more IP addresses
  -> The client uses a target address, port, and protocol
  -> Data travels through TCP, UDP, or a protocol built on top of them
  -> A server program receives data through a networking interface provided by the operating system or framework
  -> The server processes the request or state update
  -> The client receives a response, event, or updated state
```

You are not trying to become a network engineer here. Instead, focus on the vocabulary that helps you explain what is happening when a backend feature succeeds, feels slow, times out, or fails.

As you read, keep three questions in mind:

1. How does the client find the server?
2. How does the client reach the right server process or service?
3. How can network quality affect the player experience?

By the end of the chapter, you should be ready to study HTTP in Chapter 5. HTTP is one of the most common protocols used by Web Backend APIs, but it sits on top of the lower-level networking ideas introduced here.

## 4.2 What You Will Learn

By the end of this chapter, you should be able to explain:

- Why backend systems depend on networking.
- The difference between a client and a server as communication roles.
- What IP addresses and ports identify.
- What `localhost`, `127.0.0.1`, and local development addresses mean.
- How domain names and DNS help clients find servers.
- The basic difference between TCP and UDP.
- Why TCP delivery does not mean client-sent data should be trusted.
- What a socket means at a beginner level.
- How latency, jitter, bandwidth, throughput, and packet loss affect backend and game behavior.
- Why timeouts, retries, and reconnection logic are common in networked systems.
- How to observe simple network signals using `nslookup`, `ping`, `traceroute` or `tracert`, and `curl`.

You should also be able to connect these ideas to common game backend situations:

| Game situation | Networking idea to notice |
|---|---|
| Login | The client must find the API Server and receive a response. |
| Leaderboard query | A request travels to a backend service and returns ranked data. |
| Daily reward claim | Retrying a failed request may be risky if the server already granted the reward. |
| Matchmaking | The client often talks to an API Server first, then receives connection information for a match server. |
| Chat | A persistent connection may be useful when messages need to arrive quickly. |
| Real-time combat | Latency, jitter, and packet loss strongly affect the player experience. |
| Patch or resource download | Bandwidth, CDN location, and regional network paths can matter. |

This chapter will not go deep into HTTP, WebSocket, QUIC, NAT traversal, lag compensation, or server reconciliation. Those topics belong to later chapters or advanced courses.

## 4.3 Why Networking Matters in Backend Development

A backend system is not useful if clients cannot reach it. Even a well-designed API Server, Database, Cache, or Admin Tool depends on network communication somewhere.

For example, a score submission flow may look simple from the player’s point of view:

```text
The player finishes a stage.
The score appears on the result screen.
The leaderboard updates.
```

From a backend point of view, several networked steps may be involved:

```text
Game Client
  -> Sends score submission request
  -> API Server receives the request
  -> API Server checks authentication and validation
  -> API Server stores the score in a database
  -> Leaderboard data is often read from a cache or database
  -> API Server returns a response
  -> Game Client shows the result
```

If the player says, “The leaderboard is not updating,” many different things could be happening:

- The client might not have an internet connection.
- DNS may not resolve the backend domain.
- The client may connect to the wrong server region.
- A firewall may block the connection.
- The server might be running, but the API path could be wrong.
- The request might arrive, but the database could be slow.
- The score may be rejected by validation logic.
- The response may time out before reaching the client.
- The leaderboard cache often updates later than the score record.

Networking knowledge helps you avoid guessing too quickly. It lets you separate connection problems, server problems, application logic problems, and data problems.

### Networking Connects Backend Components

The network is not only between the game client and the backend. Backend components may also communicate with each other.

```text
[Game Client] ---> [API Server] ---> [Database]
                       |
                       +----> [Cache]
                       |
                       +----> [Authentication Service]
                       |
                       +----> [Object Storage]
                       |
                       +----> [Message Queue]
```

In a small local project, these pieces may all run on one machine. In a live service, they may run across multiple machines, regions, or cloud services. Either way, backend developers need to understand that data moves across boundaries.

### Networking Affects Player Experience

Networking is not only a technical detail. It directly affects how a game feels.

A login request that takes three seconds may make the game feel broken. A leaderboard that loads slowly may make the UI feel unresponsive. A chat message that arrives late may confuse players. A real-time combat game with unstable latency may feel unfair even if the game rules are correct.

This is why backend developers should understand network quality words such as latency, jitter, bandwidth, and packet loss. These words are not just for infrastructure teams. They help you reason about player-facing symptoms.

## 4.4 How Clients and Servers Communicate Through the Internet

In networking, client and server are roles.

A client is the side that starts communication. A server is the side that waits for requests or connections and responds. In game development, the game client is usually the app running on the player’s device. The server is the backend program, API service, chat service, or match server that the client contacts.

A simple request/response flow looks like this:

```text
[Client] ---- request ----> [Server]
[Client] <--- response ---- [Server]
```

This pattern works well for many Web Backend features:

- Login request.
- Profile lookup.
- Inventory lookup.
- Score submission.
- Leaderboard query.
- Daily reward claim.
- Remote Config fetch.

Real-time features may use a different pattern. Instead of one request followed by one response, the client and server may keep a connection open and exchange many messages.

```text
[Client] <---- repeated messages ----> [Real-time Server]
```

Chat, lobby ready state, room state updates, and real-time combat can use this kind of pattern.

### The Internet as a Network of Networks

The Internet is not one single cable or one single server. It is a large system of connected networks. When your game client sends data to a backend, that data may travel through your local network, your internet provider, regional network paths, data center networks, and cloud infrastructure.

At a beginner level, it is enough to understand this idea:

```text
Data usually travels through several network steps before it reaches the target server.
```

Because of this, two players may have different experiences even when they connect to the same game service. One player may be close to the server region. Another may be far away. One may be on stable home fiber. Another may be on an unstable mobile connection.

### Data Moves as Packets

Network data is usually split into smaller units called packets. A packet contains part of the data plus information that helps it travel to the destination.

In this chapter, focus on the idea rather than packet structure details. Network communication is not magic: data is broken into pieces, moved across networks, and reassembled or interpreted by software at the destination.

This helps explain why network quality matters. Some packets may arrive quickly. Some may arrive later. Some may be lost. Some may need to be sent again, depending on the protocol.

### A Basic Client-to-Server Connection Flow

Here is a simplified flow for a game client connecting to an API Server:

```text
1. The client has a server name such as api.example-game.com.
2. DNS translates that name into an IP address.
3. For a TCP-based API flow, the client uses a target address and port.
4. A transport protocol such as TCP carries the data.
5. A higher-level protocol such as HTTP defines the request and response format.
6. The server program receives the request.
7. The server processes it and returns a response.
```

Not every feature follows this exact shape. Real-time communication may keep a connection open. UDP-style communication may send frequent small updates. CDNs may serve files from edge locations. But the basic idea still helps: the client must find a destination and send data through a network path.

### The Network Does Not Decide Whether Data Is True

A network delivers data. It does not decide whether the data should be trusted.

For example, a client may send this message:

```text
playerId=player-001
score=999999999
stageId=stage-01
```

Even if the data arrived successfully, the server still needs to validate it. Networking can answer, “Did data arrive?” It cannot answer, “Is this score fair?”

This distinction matters throughout backend development. Transport success is not the same as service correctness.

## 4.5 IP Addresses, Ports, and Localhost

To reach a server, a client needs a destination. Two important parts of that destination are the IP address and the port.

### IP Address

An IP address identifies a host, server, or network endpoint that can be reached through IP networking.

You will commonly see two forms:

| Type | Example | Beginner meaning |
|---|---|---|
| IPv4 | `203.0.113.10` | A common dotted-number address format. |
| IPv6 | `2001:db8::10` | A newer, longer address format with much larger address space. |

The example addresses in this table are documentation examples. They are useful for explanation, but they are not meant to represent real game servers you can connect to.

For a beginner, the key idea is:

```text
An IP address helps the network find a machine or network endpoint.
```

In real systems, how traffic reaches that address can be affected by NAT, load balancers, proxies, cloud networking, and CDNs. Those details become useful later. For this chapter, remember that the IP address is part of how traffic reaches a destination.

### Public and Private Addresses

Some addresses are reachable from the public Internet. Others are private addresses used inside local networks or internal cloud networks.

Common private IPv4 ranges include addresses that start with:

```text
10.x.x.x
172.16.x.x to 172.31.x.x
192.168.x.x
```

Be careful: not every address that starts with `172` is private. In this beginner list, the private range is `172.16.x.x` through `172.31.x.x`.

You may see `192.168.0.5` on a home network, but that does not mean players on the public Internet can connect to that address. It may only make sense inside your local network.

This is why “it works on my machine” does not always mean “players can reach it.” Local network reachability and public service reachability are different problems.

### Port

A port identifies a specific network service or server process on a machine.

One computer can run many server programs at the same time. Ports help separate them.

```text
One machine
  -> Port 22: SSH service
  -> Port 80: HTTP service
  -> Port 443: HTTPS service
  -> Port 3000: local development API server
  -> Port 5432: PostgreSQL database
  -> Port 6379: Redis cache
```

The exact port list is not important here. The important idea is:

```text
An IP address helps find the machine or endpoint.
A port helps find the program or service on that endpoint.
```

A connection target is often described as an address and port together:

```text
203.0.113.10:443
localhost:3000
127.0.0.1:8080
```

A port number is interpreted together with a transport protocol. For example, TCP port 7777 and UDP port 7777 are separate communication targets even though the number is the same. When debugging a connection, check the address, port, and protocol together.

### Localhost and 127.0.0.1

`localhost` is a special name that points back to your own computer. `127.0.0.1` is the common IPv4 loopback address. You may also see `::1` for IPv6 loopback.

```text
localhost
127.0.0.1
::1
```

All of these are ways to refer to the local machine.

If you run a development API Server on your own computer, you might test it with:

```text
http://localhost:3000
http://127.0.0.1:3000
```

This means:

```text
Connect to a server program running on my own computer, using port 3000.
```

This is useful for learning and local development. It does not mean other players can connect to your local server from the Internet.

### Common Port Problems

Port-related problems are common in backend learning.

| Symptom | Possible meaning |
|---|---|
| “Address already in use” | Another program is already using that port. |
| Connection refused | Nothing may be listening on that port, the service may be bound to a different interface, or the host/network may be actively rejecting the connection. |
| Timeout | The client could not get a response in time. |
| Works on localhost but not from another device | The server may only listen locally, or the network/firewall may block access. |
| Works with one port but not another | The service may be configured on a different port. |

When debugging, separate these questions:

1. What address is the client using?
2. What port is the client using?
3. Which transport protocol is expected: TCP, UDP, or something built on top of them?
4. Is a server program actually listening there?
5. Can the client’s network path reach that address, port, and protocol?
6. Is the application returning a valid response after the connection arrives?

## 4.6 Domain Names and DNS

Humans are not good at remembering IP addresses. Domain names solve this problem by giving servers human-readable names.

For example, a game backend might use names like:

```text
api.example-game.com
match.example-game.com
cdn.example-game.com
admin.example-game.com
```

A domain name is not the same as an IP address. The domain name must be translated into an address that the network can use. DNS, or Domain Name System, helps with that translation.

### What DNS Does

DNS is often described as a phonebook for the Internet. That analogy is not perfect, but it is useful for beginners.

A simplified DNS lookup looks like this:

```text
Client asks: Which address or addresses can the client use for api.example-game.com?
DNS answers: Here is one or more addresses the client can use.
Client uses that answer to reach the service.
```

The client does not usually ask one giant central server. DNS works as a distributed system with resolvers, caches, authoritative name servers, and records. The distributed details can wait; focus on the role:

```text
DNS helps translate human-readable names into IP addresses or other DNS records, such as aliases.
```

After DNS resolution, load balancers, CDNs, and network routing may affect which server or path the client actually uses.

### Common DNS Record Types

You may see these DNS record names when reading documentation or using network tools:

| Record type | Beginner meaning |
|---|---|
| A | Maps a domain name to an IPv4 address. |
| AAAA | Maps a domain name to an IPv6 address. |
| CNAME | Points one domain name to another name; the final address is still found through records such as A or AAAA. |
| TXT | Stores text data used for verification and service configuration. |

For this chapter, do not worry about full DNS operations. It is enough to understand why a domain name can lead the client to a server address.

For the beginner model here, DNS helps the client resolve a name to one or more usable addresses. It usually does not tell the client which application port to use. The port often comes from the URL scheme, client configuration, or service configuration. For example, `https://` usually implies port `443`, and `http://` usually implies port `80`, unless the URL or configuration explicitly says otherwise. Some advanced service discovery records exist, but they are outside the scope of this chapter.

### DNS Cache and TTL

DNS answers are often cached. A cache stores an answer for a period of time so the system does not need to ask again immediately.

TTL means time to live. It tells DNS systems how long a record may be cached.

This matters because DNS changes are not always visible everywhere at the same moment. If a backend domain was recently changed, some clients or networks may still use an older cached answer for a while.

In game operations, this can create confusing symptoms:

```text
Some players reach the new server.
Some players still reach an old address.
Some regions seem to update earlier than others.
```

DNS is one reason backend teams avoid making risky last-minute domain changes without planning.

### Domain Names, Regions, and CDNs

A single domain name does not always point every player to the same physical location. Large services may use load balancers, regional routing, or CDNs.

A CDN, or Content Delivery Network, helps serve files such as patches, images, and static resources from locations closer to users. This can improve download performance and reduce load on origin servers.

For Chapter 4, keep the CDN idea simple:

```text
A CDN helps deliver files from network locations that may be closer to players.
```

We will return to CDN, load balancing, deployment, and cloud infrastructure in Chapter 10.

### What DNS Can and Cannot Prove

If DNS resolution succeeds, the client may be able to find an address. But DNS success does not prove the whole backend is healthy.

| Observation | What it may show | What it does not prove |
|---|---|---|
| Domain resolves to an IP address | DNS returned an address. | The API Server is healthy. |
| DNS returns different addresses in different regions | Regional routing or CDN behavior may exist. | One result is automatically wrong. |
| DNS lookup fails | There may be DNS, network, resolver, or domain configuration issues. | The application code is necessarily broken. |

When debugging, DNS is only one layer of the problem.

## 4.7 TCP, UDP, and Transport Choices

After the client has an address and port, data still needs a way to travel between programs. TCP and UDP are two important transport protocols.

At this stage, focus on the difference in behavior and why different game features may choose different communication styles.

### TCP

TCP is often used when reliable, ordered delivery is important.

At a beginner level, TCP gives you these helpful properties:

- It is connection-oriented: the endpoints establish a TCP connection before exchanging application data.
- It tries to deliver data reliably.
- It keeps data in order.
- It retransmits lost data.
- It provides a stream of bytes to the application.

This makes TCP a good fit for many Web Backend features:

- Login.
- Account creation.
- Profile lookup.
- Inventory query.
- Store purchase request.
- Daily reward claim.
- Leaderboard query.

If the server sends profile data, the client usually needs the correct complete data, not only the newest fragment. Reliable delivery is valuable here.

However, reliability can add delay. If one piece of data is lost, TCP may wait to recover it before later data can be delivered in order. This is usually acceptable for API requests, but it can be a problem for fast real-time updates where freshness matters more than perfect delivery of every old update.

### UDP

UDP is often used when applications want more direct control over message delivery and freshness.

At a beginner level, UDP has these characteristics:

- It sends datagrams instead of a reliable ordered stream.
- It does not guarantee delivery.
- It does not guarantee order.
- It does not automatically retransmit lost data.
- Applications can decide which reliability rules they need.

This can be useful for some real-time game data. For example, if a player’s character position is updated many times per second, receiving an old position late may be less useful than receiving the newest position quickly.

This does not mean UDP is “bad” or “unreliable” in a careless way. It means UDP gives fewer guarantees by default, and the application or game networking layer must decide what to do about missing, late, or out-of-order messages.

UDP does not automatically make a game low-latency. Server region, routing path, congestion, packet loss, server tick processing, and client-side correction still affect the final player experience.

### TCP and UDP Comparison

| Topic | TCP | UDP |
|---|---|---|
| Delivery guarantee | Tries to deliver reliably | No delivery guarantee by default |
| Ordering | Preserves order | No ordering guarantee by default |
| Retransmission | Built in | Not built in |
| Common beginner examples | Login, inventory, store, leaderboard | Real-time state updates, some voice/video/game traffic |
| Main strength | Correctness and reliability are easier for many request/response features | Freshness and application-level control can be better for real-time features |
| Main caution | Recovery from loss may add delay | Application must handle loss, order, and validation where needed |

### HTTP, WebSocket, and Modern Protocols

Many Web Backend APIs use HTTP. HTTP/1.1 and HTTP/2 are commonly used over TCP. HTTP/3 uses QUIC over UDP. HTTP version details can wait until a later chapter or advanced reading.

Do not treat HTTP/3 as ordinary “unreliable UDP traffic.” HTTP/3 uses QUIC over UDP. QUIC adds connection management, security, stream handling, flow control, and reliable in-order delivery within streams. It is not the same as sending ordinary UDP game packets.

WebSocket is commonly used for persistent bidirectional communication, such as chat or live room state. It is not the same as UDP, and we will study it more carefully in Chapter 9.

For now, keep this simple idea:

```text
HTTP is a higher-level protocol for requests and responses.
TCP and UDP are lower-level transport choices that higher-level protocols may use.
```

We will study HTTP request and response structure in Chapter 5. We will introduce WebSocket and real-time communication concepts later in Chapter 9.

### Choosing Transport by Feature

One game can use multiple communication styles.

| Game feature | Common communication direction | Why |
|---|---|---|
| Login | HTTPS API request/response | The client needs a clear success or failure result. |
| Store purchase | HTTPS API request/response | Purchase and reward results must be handled carefully. |
| Leaderboard query | HTTPS API plus cache | The client asks for ranked data and receives a response. |
| Daily reward claim | HTTPS API with careful validation | The server must avoid duplicate or invalid grants. |
| Matchmaking request | HTTPS request/response plus later connection info | The backend may assign a match or server address. |
| Chat | Persistent connection may be useful | Messages should arrive without polling repeatedly. |
| Lobby ready state | Persistent or repeated updates may be useful | Players need to see changes quickly. |
| Real-time character position update | UDP-like or real-time protocol may be useful | Fresh recent state may matter more than old lost state. |
| Real-time combat input | Real-time protocol with server validation | Low latency and server authority are important. |
| Game result save | HTTPS Backend API | Results and rewards must be stored correctly. |

This table is not a strict rule for every game. Genre, platform, scale, anti-cheat needs, and infrastructure choices all matter. The key lesson is that transport choice depends on the feature’s needs.

In real services, login, purchases, rewards, and account-related APIs should normally use HTTPS. This chapter focuses on networking vocabulary; Chapter 11 will discuss backend security in more detail.

### TCP Delivery Does Not Mean Trust

TCP can help data arrive reliably, but it does not make the data true.

If the client sends an impossible score over TCP, the score may arrive perfectly. The server still needs validation.

```text
Reliable delivery answers: Did the message arrive in order?
Backend validation asks: Is the message allowed and believable?
```

Do not confuse transport reliability with game fairness, security, or correctness.

## 4.8 Sockets and Network Quality

This section first explains sockets, then explains words used to describe network quality. Together, these ideas help you understand how programs use the network and how network conditions affect the player experience.

### Socket

A socket is a communication endpoint that programs use for network data.

When a server program waits for network traffic, it usually does so through operating system networking features. A socket gives the program a way to send and receive data through the network.

At a beginner level, think of a socket like this:

```text
A socket is a communication endpoint that a program uses to send or receive network data.
```

A server program may listen on a port. A client program may connect to that server in a TCP-based flow, or send messages to a target address and port in a UDP-based flow. After communication begins, programs use networking interfaces to exchange data.

This chapter stops at the concept level. Socket programming belongs to a later implementation-focused course. Here, the purpose is to understand what people mean when they say, “The server receives data through a socket,” or “The client opens a socket connection.”

### Latency

Latency is delay. In many backend situations, we care about how long it takes for a request to travel to the server and for a response to come back.

A common measurement is round-trip time:

```text
Client sends data
  -> data reaches server
  -> server or target responds
  -> response reaches client
```

For a login request, high latency may make the loading screen feel slow. For a leaderboard query, it may make the UI feel unresponsive. For real-time combat, high latency may make input feel delayed.

### Jitter

Jitter is variation in latency.

A stable 50 ms delay may be easier to handle than a delay that jumps between 30 ms, 80 ms, and 250 ms. Unstable delay can make real-time games feel inconsistent.

```text
Stable latency:
50 ms, 52 ms, 49 ms, 51 ms

High jitter:
40 ms, 170 ms, 55 ms, 230 ms
```

Jitter matters especially for voice, live room state, and real-time gameplay. In text chat, unstable timing is usually less gameplay-critical, but it can still make the experience feel unreliable.

### Bandwidth and Throughput

Bandwidth is the capacity of a network path to carry data. Throughput is the actual amount of data successfully transferred over time.

A useful analogy is a road:

```text
Bandwidth: how many lanes the road has.
Throughput: how many cars actually pass through.
Latency: how long one car takes to travel from start to destination.
```

High bandwidth does not automatically mean low latency. A network may download large files quickly but still have delay that feels bad for real-time input.

Bandwidth is especially important for patch downloads, resource downloads, images, videos, logs, and large data transfers. Latency and jitter are especially important for interactive features.

### Packet Loss

Packet loss means some network packets do not reach their destination.

TCP may retransmit lost data, which can preserve correctness but add delay. UDP does not retransmit by default, so the application or game networking layer must decide how to handle missing data.

Packet loss can cause symptoms such as:

- Requests timing out.
- Chat or WebSocket messages being delayed, followed by timeout or reconnection if the connection becomes unhealthy.
- Real-time movement appearing jumpy.
- Voice chat cutting out.
- Reconnection attempts.

### Timeout, Retry, and Reconnection

A timeout happens when the client or server waits too long and gives up.

A retry means trying the operation again. A reconnection means creating a new connection after the previous one was lost or became unusable.

These concepts are useful, but they must be used carefully.

For read-only requests, such as fetching a leaderboard, retrying is often safer. Even for read-only requests, retries should usually have limits and delay between attempts so they do not create unnecessary load.

For state-changing requests, such as claiming a daily reward or purchasing an item, retrying blindly can create duplicate actions if the first request actually succeeded but the response was lost.

For example:

```text
1. Client sends daily reward claim.
2. Server grants the reward.
3. Response is lost or times out.
4. Client retries the same request.
5. Server must know whether this is a duplicate request.
```

This is why backend systems often need request IDs, idempotency design, reward claim records, and careful validation. Here, idempotency means making repeated requests safe when the same operation was already processed.

Those designs are later topics, but the important idea is already useful: network failure can affect backend logic.

### Network Quality Summary

| Term | Beginner meaning | Game backend example |
|---|---|---|
| Latency | Delay | Login feels slow. |
| Jitter | Variation in delay | Real-time movement feels inconsistent. |
| Bandwidth | Capacity | Patch downloads need enough capacity. |
| Throughput | Actual transfer rate | A resource download transfers slower than expected. |
| Packet loss | Some packets do not arrive successfully and may need recovery or application-level handling | Voice, WebSocket/chat connections, or real-time state may stutter, timeout, or reconnect. |
| Timeout | Waiting too long ends the attempt | A request fails after no response. |
| Retry | Trying again | A leaderboard request is sent again after a timeout. |
| Reconnection | Creating a new connection | A chat client reconnects after disconnecting. |

## 4.9 Example Scenario: Login, Leaderboard, and Real-time Combat

Now let’s connect the concepts to game backend scenarios.

### Scenario 1: Login

A login flow may use a request/response pattern.

```text
1. The player opens the game.
2. The client contacts a domain such as api.example-game.com.
3. DNS returns an address.
4. The client reaches the API Server using an address, port, and protocol.
5. The client sends a login request.
6. The server checks authentication information.
7. The server returns a token or an error.
8. The client continues to the lobby or shows a failure message.
```

Network questions:

- Can the domain be resolved through DNS?
- Can the client reach the server address and port?
- Does the request arrive at the API Server?
- Is the response slow because of network delay or server processing?
- Are failures limited to one region or one network provider?

Backend questions:

- Is the login request valid?
- Is authentication working?
- Does the database contain the account or profile data?
- Are logs recording failures clearly?

A login failure is not automatically a DNS problem, TCP problem, API problem, or database problem. You need to separate the layers.

### Scenario 2: Score Submission and Leaderboard Query

A score and leaderboard flow may look like this:

```text
1. The player finishes a stage.
2. The client sends a score submission request.
3. The API Server receives the request.
4. The server checks authentication.
5. The server validates whether the score is reasonable.
6. The score is stored in a database.
7. A leaderboard cache may update.
8. The client requests the leaderboard.
9. The server returns ranked data.
10. The client displays the leaderboard.
```

Networking concepts:

- The client uses a domain or address to reach the API Server.
- The API Server listens on a port.
- Reliable request/response communication is useful.
- Timeouts may happen if the network or server is slow.
- Retrying score submission must be handled carefully.

Backend concepts:

- The server should not blindly trust the score.
- The database is the source of truth for stored score records.
- A cache may be used to serve leaderboard data faster.
- Logs help investigate suspicious or failed submissions.

### Scenario 3: Matchmaking and Real-time Combat

A real-time multiplayer game may use both backend APIs and a Dedicated Game Server.

```text
1. The client logs in through the API Server.
2. The client sends a matchmaking request.
3. The backend finds a match or creates a session.
4. The backend gives the client connection information for a match server.
5. The client uses the provided address, port, and protocol to communicate with the Dedicated Game Server.
6. During the match, clients send inputs or state updates frequently.
7. The Dedicated Game Server validates important actions and updates match state.
8. After the match, the result is sent back to the game backend service.
9. The backend stores the result and grants rewards if appropriate.
```

Networking concepts:

- Matchmaking and result storage may use request/response APIs.
- The match server may require persistent or frequent communication.
- Latency and jitter affect movement, hit timing, and perceived fairness.
- Packet loss can make state updates appear jumpy or delayed.
- Server region selection can affect player experience.

Backend concepts:

- The Dedicated Game Server is not the same as the account or inventory backend.
- The game backend service may store persistent results after the match.
- Server authority matters when game results affect ranking, rewards, or fairness.

This chapter does not teach real-time multiplayer implementation. It only shows why networking vocabulary is necessary before studying Real-time Communication in more depth.

### Same Game, Multiple Communication Styles

A single live game can use several communication styles at the same time.

| Feature | Possible style | Main concern |
|---|---|---|
| Login | HTTPS API | Correct authentication result. |
| Profile lookup | HTTPS API | Correct player data. |
| Leaderboard query | HTTPS API plus cache | Fast reads and consistent ranking logic. |
| Daily reward claim | HTTPS API with careful validation | Avoid duplicate or invalid grants. |
| Remote Config fetch | HTTPS API or CDN-served file | Deliver current configuration safely. |
| Chat | Persistent connection | Messages arrive without constant polling. |
| Lobby ready state | Persistent updates | Players see ready changes quickly. |
| Real-time combat input | Real-time protocol | Low latency and server validation. |
| Patch download | CDN / HTTP(S) file download | Bandwidth and regional delivery. |
| Game result save | HTTPS Backend API | Store final result and rewards safely. |

The important lesson is not “always use one protocol.” The lesson is to choose a communication style based on the feature’s needs.

## 4.10 Learning Practice

This Learning Practice is for observation and study. It is not a production-ready network diagnostic process.

### Goal

Observe a few basic network signals and connect them to game backend thinking. Run these commands, or read example outputs if you cannot run them in your environment.

Use `example.com` as the main target because it is an IANA-maintained example domain for documentation. Results may differ by operating system, region, DNS resolver, firewall, network provider, and server configuration.

### Commands to Try

| Goal | Windows | macOS / Linux | What to notice |
|---|---|---|---|
| DNS lookup | `nslookup example.com` | `nslookup example.com` | Which DNS server answered and which addresses were returned. |
| Basic IP-level response-time clue | `ping -n 4 example.com` | `ping -c 4 example.com` | Whether response times are mostly stable or vary noticeably, and whether the output reports packet loss. |
| Path clues | `tracert example.com` | `traceroute example.com` or `tracepath example.com` | Hops, response times per hop, and possible `* * *` lines. |
| HTTP preview | `curl -I https://example.com` | `curl -I https://example.com` | HTTP status line, headers, and response metadata. |

The first two rows are the main practice. The last two rows are optional, but they prepare you for Chapter 5 and later infrastructure topics.

### How to Interpret the Results Carefully

For `nslookup`, look for output parts such as:

```text
Server:  DNS server your computer asked
Name:    Domain name you queried
Address: Returned address or addresses for that domain
```

In some outputs, `Address` may appear more than once. One address may belong to the DNS server you asked, while another address may be the answer for the queried domain name. In this practice, focus on the address shown for the queried `Name`.

For `ping`, look for:

```text
time=...
packet loss or Lost
minimum / average / maximum response times
```

Use careful language when interpreting `ping`:

```text
ping provides a basic IP-level response-time clue for ping-style ICMP traffic.
ping does not confirm that HTTP APIs, game traffic, server code, databases, or caches are healthy.
Some servers or networks block or deprioritize ICMP traffic. No ping response does not automatically mean the HTTP API or game server is down.
```

For `traceroute` or `tracert`, remember:

```text
A * * * line does not always mean the network is broken.
Some routers simply do not respond to traceroute-style probes.
Different operating systems and traceroute tools may use different probe methods, so compare the pattern rather than expecting identical output everywhere.
A high number at one intermediate hop is also not final proof that the problem is at that hop. Look for patterns and compare with other signals.
Use the result as a clue, not a final judgment.
```

For `curl -I`, remember:

```text
curl -I usually sends an HTTP HEAD request, which asks for response headers without downloading the response body.
It can preview HTTP response metadata such as status and headers.
Some servers may handle HEAD requests differently from normal GET requests.
It does not automatically explain every backend layer behind that response.
```

### Short Note Template

Choose one scenario:

- Login.
- Leaderboard query.
- Daily reward claim.
- Matchmaking request.
- Real-time combat connection.

Then write three to five sentences using this template:

```text
Scenario:

What DNS would help with:

How address, port, and protocol matter:

What ping might roughly suggest:

What ping cannot prove:

One backend layer that may still fail even if the network appears reachable:
```

Example:

```text
Scenario: Leaderboard query

DNS would help the client find the API Server domain.
The address, port, and protocol would help the client communicate with the correct service endpoint.
ping might suggest whether the target responds to ping-style ICMP traffic and whether response time is stable.
ping cannot prove that the leaderboard API, database, or cache is working.
Even if the network appears reachable, the server may reject the request or the database query may fail.
```

### What to Observe

After the practice, you should be able to say:

- `nslookup` helps observe domain-to-address resolution, but DNS success does not confirm application health.
- `ping` gives a limited IP-level response-time signal for ping-style ICMP traffic, but it does not guarantee HTTP or game traffic behavior.
- `traceroute` or `tracert` can show clues about the network path, but missing hops, tool differences, or one high intermediate number do not automatically identify the root cause.
- `curl -I` can preview HTTP response headers and metadata, which prepares you for Chapter 5.
- The same command can show different results depending on region, network, resolver, firewall, and server configuration.
- A symptom such as “login does not work” may involve DNS, IP, port, protocol, server state, application logic, database, client configuration, or network quality.

## 4.11 Common Mistakes

Networking problems are easy to misread because several layers are involved. Use this section as a checklist when a connection-related symptom appears.

### Mistake 1: Thinking an IP Address and a Port Are the Same Thing

An IP address helps identify a destination. A port helps identify a service on that destination.

### Mistake 2: Forgetting the Transport Protocol

TCP port `7777` and UDP port `7777` are different communication targets. Check address, port, and protocol together.

### Mistake 3: Thinking a Domain Name Is the Server Itself

A domain name is a name. DNS may resolve it to one or more addresses or aliases. Those results may point to systems such as load balancers, CDNs, or regional endpoints.

Better wording:

```text
The client uses a domain name, DNS helps resolve it to one or more usable addresses,
and the client uses an address, port, and protocol to communicate.
```

### Mistake 4: Thinking DNS Chooses the Application Port

In most beginner-level cases, DNS resolves a name to one or more usable addresses or records. The port usually comes from the URL scheme, client configuration, or service configuration.

### Mistake 5: Thinking DNS Success Means the API Is Healthy

DNS success means the name returned an answer. It does not prove that the API Server, database, cache, authentication service, or application logic is healthy.

### Mistake 6: Thinking TCP Means Client Data Is Safe to Trust

TCP can help deliver data reliably and in order. It does not prove the data is valid, fair, or allowed.

### Mistake 7: Thinking UDP Is Always Wrong Because It Can Lose Packets

UDP gives fewer guarantees by default, which can be useful when fresh state matters more than old updates.

### Mistake 8: Thinking UDP Automatically Means Low Latency

UDP is only one part of the design. Region, routing, congestion, packet loss, server tick processing, and client correction still matter.

### Mistake 9: Treating HTTP/3 as Ordinary Unreliable UDP Traffic

HTTP/3 uses QUIC over UDP. QUIC adds connection management, security, stream handling, flow control, and reliable in-order delivery within streams.

### Mistake 10: Thinking WebSocket and UDP Are the Same Because Both Can Be Used for Real-time Features

WebSocket is a persistent bidirectional communication style usually used over TCP/TLS. UDP is a transport protocol with fewer delivery guarantees by default. We will compare them more carefully in Chapter 9.

The right question is not “Is TCP good?” or “Is UDP bad?” The better question is:

```text
What does this feature need: reliability, ordering, freshness, low latency,
application-level control, security, or server validation?
```

### Mistake 11: Treating `ping` as Final Proof

`ping` gives a limited IP-level response-time clue. It does not confirm API health or game traffic behavior, and some servers or networks block ping-style ICMP traffic.

### Mistake 12: Thinking High Bandwidth Means Low Latency

Bandwidth is capacity. Latency is delay. A network can download large files quickly but still feel slow for real-time input.

### Mistake 13: Ignoring Jitter

Unstable delay can feel worse than a slightly higher but stable delay, especially for voice, live room state, and real-time gameplay.

### Mistake 14: Assuming Packet Loss Has the Same Effect for Every Protocol

TCP may retransmit and add delay. UDP does not retransmit by default, so the application or game networking layer must decide what to do.

For patch downloads, bandwidth and throughput matter a lot. For real-time combat, latency, jitter, and packet loss are often more noticeable.

### Mistake 15: Thinking `localhost` Is Public

`localhost` and `127.0.0.1` point to your own computer. They are useful for local development, not for public player access.

### Mistake 16: Retrying Every Failed Request Blindly

Read-only requests are often safer to retry, but retries should still have limits and delay between attempts. State-changing requests, such as reward claims or purchases, need duplicate protection.

### Mistake 17: Assuming a Network Problem Has Only One Cause

Separate network reachability, server process health, application logic, data storage, authentication, and client configuration.

When players report connection problems, separate the layers:

```text
domain
DNS
IP address
port
protocol
firewall
server process
application logic
database
cache
authentication
client configuration
network quality
server region
```

This habit helps you debug more carefully instead of guessing from one signal.

## 4.12 Chapter Summary

In this chapter, we studied the networking foundations that students learning backend development need before studying HTTP APIs and Real-time Communication.

A game client reaches a backend through several network steps. It uses a domain name or address, DNS may resolve the name to one or more usable addresses, the client uses an address, port, and protocol to communicate, and data travels through transport protocols such as TCP or UDP. Server programs receive and send data through networking interfaces such as sockets.

You learned that DNS helps clients resolve names to one or more usable addresses, but it usually does not choose the application port in the beginner model used here. For example, `https://` usually implies port `443`, while `http://` usually implies port `80`, unless the URL or configuration says otherwise. You also learned that a port number should be understood together with a transport protocol, because TCP port 7777 and UDP port 7777 are separate communication targets.

TCP and UDP are different tools with different trade-offs. TCP is useful for reliable ordered communication, which fits many request/response backend features. UDP gives fewer guarantees by default, which can be useful for real-time systems where freshness and low latency matter. HTTP/3 uses QUIC over UDP, but QUIC adds security, flow control, stream behavior, and reliable in-order delivery within streams above UDP. Neither TCP, UDP, nor QUIC removes the need for server-side validation.

You also learned network quality vocabulary. Latency is delay. Jitter is variation in delay. Bandwidth is capacity. Throughput is actual transfer rate. Packet loss means some packets did not arrive successfully and may need recovery or application-level handling. Timeouts, retries, and reconnection behavior affect how clients and servers handle unstable conditions.

Finally, you observed or reviewed tools such as `nslookup`, `ping`, `traceroute` or `tracert`, and `curl`. These tools provide clues. They do not prove the entire backend is healthy by themselves.

Now that you understand how a client finds a server and communicates with it through an address, port, and protocol, we can study one of the most common ways clients and backend servers exchange data: HTTP. In the next chapter, we will learn how HTTP requests, responses, methods, status codes, headers, bodies, and JSON form API contracts.

## 4.13 Quiz

### Question 1

Which statement best describes the relationship among an IP address, a port, and a transport protocol?

A. An IP address identifies a program, and a port identifies a domain name.

B. An IP address helps identify a network destination, while a port and transport protocol help identify how to reach a specific service on that destination.

C. An IP address is only used for local development, and a port is only used on the public Internet.

D. An IP address, a port, and a transport protocol are three names for the same thing.

**Answer: B**

**Explanation:**
An IP address helps the network reach a destination. A port helps select a service on that destination, and the transport protocol also matters. TCP port 7777 and UDP port 7777 are different communication targets.

### Question 2

What is the main role of DNS in the beginner networking model used in this chapter?

A. It helps resolve a domain name to one or more addresses, or to DNS records that help the client find a usable address.

B. It validates whether a submitted game score is fair.

C. It stores player inventory data permanently.

D. It guarantees that the API Server and database are healthy.

**Answer: A**

**Explanation:**
DNS helps resolve human-readable domain names to addresses or records that help find usable addresses. In the beginner model used in this chapter, DNS usually does not choose the application port, and DNS success does not confirm that the application, database, or game logic is healthy.

### Question 3

Which feature is usually a better beginner example for TCP-style reliable request/response communication?

A. Login request.

B. High-frequency real-time position update.

C. Old character position update that is no longer useful.

D. Unverified movement packet that should bypass server validation.

**Answer: A**

**Explanation:**
Login needs a clear success or failure result and usually benefits from reliable request/response communication. Real-time position updates may care more about freshness and low latency.

### Question 4

Which statement best explains latency and bandwidth?

A. Latency and bandwidth mean exactly the same thing.

B. High bandwidth always guarantees low latency.

C. Latency is delay, while bandwidth is capacity.

D. Bandwidth only matters for DNS lookups.

**Answer: C**

**Explanation:**
Latency is the delay experienced by communication. Bandwidth is the capacity of a network path to carry data. A network can have high bandwidth but still have latency that affects real-time gameplay.

### Question 5

What is the safest interpretation of a successful `ping` result?

A. The backend application, database, cache, and authentication are all healthy.

B. The target responded to ping-style ICMP traffic and provided a basic IP-level round-trip time clue.

C. The game server will never have packet loss.

D. The leaderboard API must be returning correct data.

**Answer: B**

**Explanation:**
`ping` can provide a basic IP-level round-trip time clue for ping-style ICMP traffic, but it does not prove that HTTP APIs, game traffic, server code, databases, or caches are working correctly.

### Question 6

Why can retrying a daily reward claim be risky?

A. DNS cannot resolve domain names more than once.

B. UDP always duplicates every packet.

C. The first request may have succeeded on the server even if the response was lost.

D. Retrying is only allowed for image downloads.

**Answer: C**

**Explanation:**
A state-changing request may succeed on the server while the client fails to receive the response. If the client retries blindly, the backend must prevent duplicate reward grants.

### Question 7

Which statement about HTTP/3 and QUIC is the safest beginner interpretation?

A. HTTP/3 is the same as sending ordinary unreliable UDP game packets.

B. HTTP/3 uses QUIC over UDP, but QUIC adds connection management, security, stream handling, flow control, and reliable in-order delivery within streams.

C. HTTP/3 means backend APIs no longer need validation.

D. HTTP/3 can only be used for real-time combat input.

**Answer: B**

**Explanation:**
HTTP/3 uses QUIC over UDP, but QUIC adds connection management, security, stream handling, flow control, and reliable in-order delivery within streams. It should not be treated as ordinary unreliable UDP traffic, and it does not remove the need for backend validation.

### Question 8

Which statement best describes a socket at a beginner level?

A. A physical cable that connects the player’s device to the database.

B. A communication endpoint that programs use to send or receive network data.

C. A DNS record that stores text verification data.

D. A guarantee that all client data is trustworthy.

**Answer: B**

**Explanation:**
A socket is a network communication interface used by programs. It does not validate game rules or guarantee that client-sent data is safe to trust.

## 4.14 Further Reading

You do not need to read all of these resources immediately. Use them as references when the topic appears in the chapter or when a command feels unclear.

- [Cloudflare — How does the Internet work?](https://www.cloudflare.com/learning/network-layer/how-does-the-internet-work/)
  Use this to review the big picture of how networks connect clients and servers.

- [Cloudflare — What is DNS?](https://www.cloudflare.com/learning/dns/what-is-dns/)
  Use this when you want to review how domain names are resolved to IP addresses and related DNS records.

- [Cloudflare — What is TCP/IP?](https://www.cloudflare.com/learning/ddos/glossary/tcp-ip/)
  Use this to connect IP addresses and transport concepts at a beginner level.

- [Cloudflare — What is latency?](https://www.cloudflare.com/learning/performance/what-is-latency/)
  Use this to review latency and network performance vocabulary.

- [Microsoft Learn — ping](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/ping)
  Use this if you are on Windows and want to review the `ping` command.

- [Microsoft Learn — nslookup](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/nslookup)
  Use this if you are on Windows and want to review the `nslookup` command.

- [Microsoft Learn — tracert](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/tracert)
  Use this if you are on Windows and want to review the `tracert` command.

- [curl — Tutorial](https://curl.se/docs/tutorial.html)
  Use this only as a basic reference before Chapter 5. You do not need to master `curl` in this chapter.

- [MDN — HTTP overview](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview)
  Use this to prepare for the next chapter on HTTP requests, responses, and APIs.

- [MDN — HTTP/3](https://developer.mozilla.org/en-US/docs/Glossary/HTTP_3)
  Use this only if you are curious about the short HTTP/3 and QUIC note in this chapter. You do not need to master HTTP versions here.

Advanced networking standards, packet optimization articles, and real-time multiplayer architecture articles can be useful later, but they are not required for this chapter. Save them for a later Real-time Multiplayer Backend course.
