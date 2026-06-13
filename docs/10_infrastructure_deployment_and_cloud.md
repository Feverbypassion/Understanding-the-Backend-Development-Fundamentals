# 10. Infrastructure, Deployment, and Cloud

## 10.1 How to Read This Chapter

In the previous chapter, we studied Real-time Communication and Dedicated Game Server concepts. We looked at connections, rooms, sessions, matches, and the idea of server authority.

That chapter showed why some multiplayer features need a different server model from normal HTTP APIs.

This chapter asks a new question:

```text
Where do backend systems actually run?
```

A backend that works on your own computer is useful for learning, but it is not automatically a service that real players can reach. To make a backend reachable, teams need more than application code. They also need infrastructure, deployment planning, domains, HTTPS, cloud hosting, configuration, logs, and recovery planning.

This chapter gives you a map of backend infrastructure. It is not a production cloud deployment guide. You are not expected to operate production cloud infrastructure after this chapter.

At this stage, focus on what each infrastructure concept does and where it fits:

- What problem does it solve?
- Where does it appear in the runtime environment or request flow?
- What should a beginner recognize before moving to a Cloud / Infrastructure advanced course?

Infrastructure is the bridge between a backend that works on your computer and a backend service that real players can reach safely.

## 10.2 What You Will Learn

By the end of this chapter, you should be able to explain:

- Why `localhost` is different from a public service address.
- How local, staging, and production environments differ.
- Why configuration and secrets should be separated from code.
- How Remote Config differs from server runtime configuration.
- What Docker images and containers are used for at a conceptual level.
- What a virtual machine is and how it differs from a container at a beginner level.
- How Docker Compose can represent multiple backend components such as an API Server and a database.
- What cloud hosting means at a beginner level.
- How DNS, HTTPS, CDN, Load Balancer, and API Gateway fit into a request flow or delivery path.
- Why API Server hosting and Dedicated Game Server hosting have different concerns.
- What a basic deployment flow looks like.
- What a beginner should check before and after a server release.

This chapter uses diagrams and examples rather than a full deployment tutorial. You will read and interpret infrastructure flows instead of building a complete cloud system.

## 10.3 Why Infrastructure Matters

Let’s start with a simple local address:

```text
http://localhost:3000/health
```

When you call this address from your own computer, `localhost` means your own computer. If your friend calls `localhost` from their computer, it means their computer, not yours. This is why a server working on `localhost` does not mean that real players can access it.

A public service address usually looks more like this:

```text
https://api.runner-game.example.com/leaderboard
```

For this address to work, several things must happen before the API Server can return a response.

```text
Game Client
  → DNS lookup
  → HTTPS connection to the resolved IP address or endpoint address
  → Load Balancer or API Gateway
  → API Server
  → Database
```

In this diagram, DNS lookup is a name-resolution step, not a backend server that handles the API request after the address has been resolved. HTTPS is also not a separate backend server; it is the secure connection used to protect the request and response.

Each part solves a different problem.

| Part | Main role |
|---|---|
| DNS | Helps the client find the network address for a domain name. |
| HTTPS | Encrypts communication and, when certificate validation succeeds, helps the client verify the server identity. |
| Load Balancer | Distributes traffic to one or more backend servers. |
| API Gateway | Routes API requests and may apply API-level rules such as rate limiting or request checks. |
| API Server | Receives requests, applies backend logic, and returns responses. |
| Database | Stores persistent data such as accounts, scores, inventory, and reward records. |

Deployment is also more than copying code to a machine. A backend must run in the right environment, use the right configuration, connect to the right database, expose the right network port, protect secrets, and leave enough logs for troubleshooting.

In a game backend, infrastructure problems become player experience problems.

| Infrastructure issue | Possible player-facing result |
|---|---|
| API Server is unreachable | Players cannot log in or load account data. |
| Database connection is wrong | Scores, inventory, or reward records may fail to load. |
| HTTPS certificate is invalid | Clients may reject the connection. |
| CDN path is broken | Images, banners, patches, or static files may not download. |
| Load Balancer routes to an unhealthy server | Some players may see repeated failures. |
| Logs are missing | The team cannot easily investigate what happened. |

For beginners, the goal is not to memorize every infrastructure product. The goal is to understand that a live backend needs the runtime environment that supports the code.

## 10.4 Local, Staging, and Production Environments

Backend teams usually separate environments. An environment is a place where the backend runs with a specific purpose, configuration, data source, and risk level.

The three common environment names are local, staging, and production.

| Environment | Purpose | Typical data | Risk level |
|---|---|---|---|
| Local | Individual learning and development | Fake or temporary test data | Low |
| Staging | Rehearsal before production release | Test data similar to production | Medium |
| Production | Real service used by real players | Real player data | High |

A local environment is where a developer experiments. It usually runs on the developer’s own computer. You can restart it often, delete test data, change configuration, and make mistakes safely.

A staging environment is a rehearsal space. A team may use it to check whether the next server version works before sending real traffic to it. Staging should be similar enough to production to catch problems, but it should not reuse production credentials or accidentally expose real player data.

A production environment is the real service. Production data may include player accounts, progress, inventory, scores, purchase records, reward claim history, and support records. A small mistake in production can affect many players.

The same backend code may run in all three environments, but with different configuration.

```text
Same code + local configuration
  → Local development server

Same code + staging configuration
  → Staging verification server

Same code + production configuration
  → Production service
```

This separation helps the team test safely before affecting real players.

A beginner-friendly rule is:

```text
Treat local as a learning space, staging as a rehearsal space, and production as a live service environment.
```

## 10.5 Configuration, Secrets, and Remote Config Boundaries

Configuration means external values that the backend needs when it runs. Examples include the environment name, server port, database address, log level, and public CDN base URL.

A small example might look like this:

```env
APP_ENV=local
API_PORT=3000
DATABASE_URL=replace-with-your-database-url
LOG_LEVEL=debug
PUBLIC_CDN_URL=https://cdn.runner-game.example.com
SESSION_TOKEN_SECRET=replace-with-your-secret
```

The key idea is that configuration should not be hard-coded inside the application logic. The same code should be able to run in different environments with different configuration values.

### Configuration and secrets are not the same

Some configuration values are safe to share. Other values are secrets.

| Value | Secret? | Reason |
|---|---:|---|
| `APP_ENV` | No | It names the current environment. |
| `API_PORT` | No | It identifies the port the server listens on. |
| `PUBLIC_CDN_URL` | Usually no | It is meant to be visible to clients if it points to public resources. |
| `DATABASE_URL` | Often | If it includes a username, password, token, or private host address, protect it as a secret. |
| `DB_PASSWORD` | Yes | It can allow database access. |
| `SESSION_TOKEN_SECRET` | Yes | It may be used to sign or verify session tokens. |
| `PAYMENT_API_KEY` | Yes | It can affect payment verification or external service access. |

A `.env` file may contain real local values, so it should not be committed to a source repository. This includes private repositories unless your team has an explicit secure secret-management process. A `.env.example` file shows which keys are needed, but it should contain placeholders, not real secrets.

Environment variables help separate secrets from code, but they are not a complete secret-management strategy by themselves. In production, teams often use platform secret mechanisms or secret managers.

```env
APP_ENV=local
API_PORT=3000
DATABASE_URL=replace-with-your-database-url
SESSION_TOKEN_SECRET=replace-with-your-secret
```

A useful rule is:

```text
Share configuration names. Protect real secret values.
```

### Secrets do not belong in the game client

The game client runs on a player’s device. That means it can be inspected, copied, modified, or attacked. Secrets such as admin keys, payment verification keys, database passwords, and token signing secrets should not be placed inside the client.

If a secret has already been exposed, deleting it from a file is not enough. The team should assume the exposed value is no longer safe and replace it. This replacement process is often called secret rotation.

### Remote Config is different

Remote Config is a game service feature that lets the server deliver selected game settings that are safe for clients to see. It may be used for feature flags, event settings, balance values, banner visibility, or temporary service behavior.

However, Remote Config is not the same as server runtime configuration.

| Category | Example | Who uses it? | Can it contain secrets? |
|---|---|---|---:|
| Server runtime configuration | `DATABASE_URL`, `LOG_LEVEL`, `SESSION_TOKEN_SECRET` | Backend runtime | It may include secrets, so protect it. |
| Remote Config | Event banner, item price display, feature flag | Game client or service feature | No. Anything delivered to clients should be treated as visible. |

Remote Config may be useful for LiveOps, but it must not become a way to expose server secrets to players.

Remote Config values delivered to the client should be treated as visible to, and potentially spoofed by, a modified client. If a value affects rewards, prices, ranking, inventory, or the game economy, the backend should still enforce the final rule on the server side.

## 10.6 Docker, Containers, VMs, and Cloud Hosting Concepts

A backend application needs a runtime environment. It needs a language runtime, libraries, configuration, network access, and sometimes system tools. If each developer or server prepares these manually in a different way, the application may behave differently across machines.

Containers help package an application and its runtime environment in a more consistent way.

At a beginner level, think of Docker with three ideas:

| Term | Beginner meaning |
|---|---|
| Dockerfile | A recipe for creating an image. |
| Image | A packaged version of the application and its environment. |
| Container | A running instance created from an image. |

A simple flow looks like this:

```text
Dockerfile
  → Docker image
  → Running container
```

An image is not the running process. It is the package used to create one or more running containers. A container is the runtime unit that actually runs from the image.

### Ports and containers

When a backend runs inside a container, it still needs a port so requests can reach it.

```text
Host machine port 8080
  → Container port 3000
  → API Server process
```

This mapping means a request to the host machine on one port can be forwarded to a process inside the container.

In many containerized web server setups, the server process must listen on the container network interface, often written as `0.0.0.0`, not only on `127.0.0.1`. You do not need to configure this in this chapter, but it explains why port mapping alone may not always be enough.

You do not need to memorize Docker commands in this chapter. The important idea is that a container helps teams run the same application package in a more predictable way.

### Docker Compose as a component map

Many backend systems need more than one component. For example, an API Server may need a database.

Docker Compose can describe multiple services together. In this chapter, we use it only as a conceptual map, not as a setup to run. The following snippet is illustrative only. Do not treat it as a file to copy and run. It is not a complete Compose tutorial, and it omits real database initialization, secure credential setup, health checks, and persistent storage.

```yaml
# Illustrative only.
# The API image name below is fictional.
# A real database service would also need database initialization,
# secure credential setup, health checks, and persistent storage.
services:
  api:
    image: example/runner-game-api:demo
    environment:
      APP_ENV: local
      DATABASE_URL: postgresql://runner_user:replace-with-password@db:5432/runner_game
    ports:
      - "8080:3000"

  db:
    image: postgres:16
```

In this example, `api` and `db` are separate services. The API Server uses `db` as the database service name inside the Compose network. It should not use `localhost` to mean the database container, because inside the API container, `localhost` means the API container itself. The PostgreSQL version in this snippet is illustrative; real projects should choose a supported version intentionally.

Again, the goal here is reading the structure:

```text
API container
  → connects to the DB service name
  → reads from and writes to the database service
```

You are not expected to run this setup in this chapter.

### Virtual machines and containers

A virtual machine, or VM, is a software-defined server that runs on cloud or data center hardware. You can think of it as a rented computer where you install and run server software.

A container is usually smaller and more application-focused than a VM. In many real systems, containers may still run on VMs or other managed compute platforms behind the scenes.

### Cloud hosting concepts

Cloud hosting means using infrastructure provided by a cloud platform instead of running everything on your own physical machines.

Cloud services are often described with categories such as Infrastructure-as-a-Service (IaaS), Platform-as-a-Service (PaaS), managed containers, serverless, Software-as-a-Service (SaaS), and Backend-as-a-Service (BaaS). These names can feel abstract, so focus on responsibility.

| Model | Beginner view | Example responsibility split |
|---|---|---|
| IaaS | You rent virtual machines and manage much of the server environment. | More control, more operations responsibility. |
| PaaS | You deploy an application and the platform manages more of the runtime. | Less server management, platform-specific limits. |
| Managed containers | You run containers on a platform that manages container scheduling or hosting. | A bridge between Docker concepts and cloud operations. |
| Serverless | You run functions or services without managing long-running servers directly. | Useful for certain event-driven or small backend tasks. |
| SaaS | You use a complete software service. | You configure the service rather than build it. |
| BaaS | You use backend features provided by a platform. | Useful for authentication, storage, functions, or game service features. |

Serverless does not mean that no servers exist. It means the platform hides much of the server management from the application team.

This chapter does not compare cloud vendors or teach certification details. The important question is:

```text
Which responsibilities do we manage ourselves, and which responsibilities does the platform manage for us?
```

## 10.7 Request Flow and Delivery Path: DNS, HTTPS, CDN, Load Balancer, and API Gateway

Now let’s separate the roles in the public service request flow we saw earlier. In many real deployments, several infrastructure concepts support the request before it reaches backend application logic.

A simplified API request flow can look like this:

```text
Game Client
  → DNS lookup for api.runner-game.example.com
  → HTTPS connection to the resolved IP address or endpoint address
  → Load Balancer or API Gateway
  → API Server
  → Database
```

In this diagram, DNS lookup is a name-resolution step, not a backend server that handles the API request after the address has been resolved. HTTPS is also not a separate backend server; it is the secure connection used to protect the request and response.

### DNS

DNS helps the client translate a domain name into an address it can connect to. A game client may use a domain such as `api.runner-game.example.com`, but the network still needs an IP address or endpoint address.

DNS lookup is part of finding where to connect. After the address is resolved, the actual HTTP request continues toward the server infrastructure.

DNS results may be cached by clients, operating systems, routers, or DNS resolvers, so a DNS change may not become visible everywhere at the same time.

### HTTPS and TLS

HTTPS is HTTP over a secure TLS connection. It helps protect communication from being read or modified in transit and, when certificate validation succeeds, helps the client verify that it is communicating with the intended server.

For a backend API that handles accounts, scores, rewards, inventory, or purchase-related flows, plain HTTP is not appropriate for real service traffic. HTTPS should be treated as a basic requirement for public APIs.

In real deployments, TLS may be handled at the Load Balancer, API Gateway, or server depending on the architecture. At this stage, focus on the beginner idea: the public connection should be protected.

### Load Balancer

A Load Balancer sits in front of one or more backend servers and distributes traffic.

```text
Game Client
  → Load Balancer
      → API Server A
      → API Server B
      → API Server C
```

When health checks are configured, a Load Balancer may also check whether a server is healthy. If one API Server is unhealthy, the Load Balancer can stop sending traffic to it.

### API Gateway

An API Gateway is a front-facing component that can route requests and apply API-level rules. Depending on the system, it may handle routing, authentication checks, rate limiting, request transformation, or logging.

At the beginner level, it is enough to know that an API Gateway and a Load Balancer may both appear before the API Server, but they are not the same concept. A Load Balancer focuses on distributing traffic. An API Gateway often focuses on API-level rules such as routing, rate limiting, and request checks.

Even when an API Gateway performs some authentication or rate limiting, the API Server still needs to validate important requests and enforce service rules. A gateway can reduce risk, but it does not replace backend security logic.

### CDN

A CDN, or Content Delivery Network, helps deliver static content from locations closer to users.

Static content that may fit a CDN includes:

- Banner images
- Item icons
- Patch files
- Public asset manifests, such as version lists for downloadable assets
- Downloadable assets

A public CDN path is usually not the right place for session tokens, player-specific private data, private inventory data, or admin-only files. Some systems use private CDN access controls or signed URLs, but that is a separate access-control topic.

A static resource request may look like this:

```text
Game Client
  → CDN edge
  → cached banner image or patch file

If the CDN edge does not have the file yet:
CDN edge
  → Object Storage or Origin Server
```

An API request usually looks different:

```text
Game Client
  → Load Balancer or API Gateway
  → API Server
  → Database
```

A CDN is usually a delivery and caching layer, not the final source of truth for private player data.

The difference matters because not every request should go through the same path. Static files and player-specific backend data have different risks and performance needs.

## 10.8 API Server Hosting vs Dedicated Game Server Hosting

Chapter 9 introduced Dedicated Game Servers and Authoritative Servers. In this chapter, we connect that idea to infrastructure.

An API Server and a Dedicated Game Server may both run on cloud infrastructure, but their hosting concerns are different.

| Category | API Server hosting | Dedicated Game Server hosting |
|---|---|---|
| Main work | Request/response service features | Real-time match or session state |
| Typical examples | Login, inventory, rewards, leaderboard | Co-op dungeon, PvP arena, match simulation |
| Traffic pattern | Many separate requests | Persistent or frequent communication |
| Scaling question | How many API instances are needed? | How many match servers are needed, in which regions? |
| Lifecycle | Usually long-running service instances | Often created, allocated, drained, and released per match or session |
| Key concerns | Availability, database access, API latency, deployment safety | Player latency, region, allocation, match state, result reporting |

For an API Server, deployment often focuses on safe release, health checks, database connectivity, and compatibility with game client versions.

For a Dedicated Game Server, hosting may also involve:

- Allocating a game server when a match is created.
- Choosing a region close to players.
- Preventing players from being placed into unhealthy servers.
- Avoiding interruption of active matches during updates.
- Saving match results safely after the session ends.
- Releasing or recycling the server after the match.

A simplified real-time match flow might look like this:

```text
Players request matchmaking
  → Matchmaking API groups players
  → Game server is allocated
  → Players connect to the Dedicated Game Server
  → Match runs
  → Match result is reported to the backend service
  → Rewards, ranking, or records are saved
  → Game server is released
```

When a Dedicated Game Server reports a match result, the backend service should also think about duplicate reports. In real systems, result-saving APIs often need an idempotency idea so that retrying the same match result does not grant rewards twice.

Tools such as Agones or Amazon GameLift Servers are examples of advanced game server hosting or orchestration topics, not tools students need to use in this chapter. For example, Agones is closely connected to Kubernetes-based game server orchestration, while Amazon GameLift Servers is a managed Dedicated Game Server hosting service. This chapter introduces the vocabulary only. Actual game server allocation, orchestration, draining, region strategy, and production operations belong to later Real-time Multiplayer or Cloud / Infrastructure advanced courses.

## 10.9 Deployment Flow and Beginner Checklist

Deployment is the process of releasing a backend version into an environment where it can receive traffic.

A simplified deployment flow looks like this:

```text
Code Change
  → Build
  → Prepare Configuration and Secrets
  → Deploy
  → Verify
  → Monitor
  → Roll Back or Roll Forward if needed
```

Deployment does not end when the code is uploaded. The team should check whether the server is actually usable.

### Liveness and readiness

A liveness check asks:

```text
Is the process alive?
```

A readiness check asks:

```text
Can this server safely receive real traffic right now?
```

A server may be alive but not ready. For example, the process may be running, but the database connection may be broken. In that case, sending real traffic to the server could still fail.

### Smoke test

A smoke test is a quick check after deployment. It does not prove that every feature is perfect. It checks whether the most important flows still work.

For a small game backend, a smoke test might include safe checks that avoid unnecessary changes to live player data:

- Health check
- Login or player lookup
- Score submission validation check that does not affect live rankings
- Leaderboard query
- Daily reward eligibility check, or reward verification that does not grant real rewards
- One static asset download from CDN

### Rollback and roll forward

Rollback means returning to a previous version. Roll forward means deploying a new fixed version.

Rollback is not always simple. If a database migration, client version change, or data format change has already happened, returning to the old server version may create a new problem. That is why deployment planning should include compatibility and recovery planning.

### Beginner deployment checklist

Before deployment, ask:

- Does the server build successfully?
- Are configuration values prepared for the target environment?
- Are secrets protected and absent from code, images, logs, source repositories, and public documents?
- Can the server connect to required dependencies such as the database?
- Are health or readiness checks prepared?
- Is the API response format compatible with current clients?
- Is there a basic recovery plan if the deployment fails?
- If the deployment changes data format or database structure, is there a safe roll-forward or recovery idea?
- If important data could be affected, has the team considered whether a backup or restore path is needed?

After deployment, ask:

- Is the health check normal?
- Is the readiness check normal?
- Can a core API request succeed?
- Are repeated errors appearing in logs?
- Are database connection errors appearing?
- Are CDN resources loading correctly?
- If Dedicated Game Servers are used, are active matches protected from interruption?

This checklist is not a full production operations guide. It is a beginner-friendly map of the questions to ask.

## 10.10 Example Scenario: A Small Online Running Game

Let’s connect the ideas in this chapter to a small online running game.

The game has these features:

- Players log in.
- Players submit scores after a run.
- Players view a weekly leaderboard.
- The lobby shows a rotating event banner.
- The game downloads item icons and small patch files.
- Operators may update event settings.
- A future co-op race mode may use Dedicated Game Servers.

A beginner infrastructure map might look like this:

```text
Game Client
  |
  | HTTPS API request to api.runner-game.example.com
  | DNS resolves the domain to a reachable endpoint
  v
Load Balancer or API Gateway
  |
  v
API Server instances or containers
  |
  +--> Database: players, scores, leaderboard records, event settings
  |
  +--> Logs and Metrics

Static Resources:
Game Client → CDN → banners, icons, patch files

Future Real-time Mode:
Game Client → Matchmaking API → connection information for an allocated Dedicated Game Server
```

Now let’s connect features to infrastructure.

| Feature | Likely path | Why |
|---|---|---|
| Login | Client → API Server → Database | The backend must identify the player and load account data. |
| Score submission | Client → API Server → Database | The backend should validate and store the score. |
| Leaderboard query | Client → API Server → Database or Cache | The leaderboard may need fast reads and server-side rules. |
| Event banner image | Client → CDN | A public static image is a good CDN candidate. |
| Item icon download | Client → CDN | Static resources can be delivered close to players. |
| Event setting update | Internal Admin Tool → Admin API → Database | An Admin API is used by internal tools, not normal players. Operator actions need permission and audit logs. |
| Co-op race match | Client → Matchmaking API → allocated Dedicated Game Server connection | Real-time sessions have different lifecycle and latency concerns. |

This example shows why infrastructure is not a single component. It is a set of paths, components, and responsibilities. API data, static resources, admin actions, and real-time matches do not all behave the same way.

## 10.11 Learning Practice

This Learning Practice is for observation and study. It is not a production-ready deployment plan.

### Goal

Read a simple deployment diagram and identify the role of each infrastructure component.

### Diagram

```text
Before the API request:
Game Client
  → DNS lookup for api.runner-game.example.com
  → resolved IP address or endpoint address

Actual API request:
Game Client
  → secure HTTPS connection to the resolved IP address or endpoint address
  → Load Balancer or API Gateway
  → API Server
  → Database

Static Resource Request:
Game Client → CDN → Banner Image / Patch File

Real-time Match:
Game Client → Matchmaking API → connection information for an allocated Dedicated Game Server
```

### Steps

1. Identify which step resolves the domain name before the API request.
2. Identify which connection protects communication between the client and the public backend endpoint.
3. Identify which part distributes or routes incoming API traffic.
4. Identify which part receives API requests and applies backend logic.
5. Identify which part stores player-specific persistent data.
6. Identify which request is better suited for a CDN.
7. Identify why a real-time match uses allocated Dedicated Game Server connection information instead of the normal API request path.
8. Write two or three sentences explaining why this diagram is different from running `localhost`.

### What to Observe

- `localhost` is not a public production address.
- DNS lookup, HTTPS, Load Balancer or API Gateway, API Server, and database solve different problems.
- CDN is useful for static resources, not for private player data or secrets. If a system uses private CDN access or signed URLs, that is an advanced access-control topic rather than the basic public-CDN idea in this chapter.
- API Server hosting and Dedicated Game Server hosting have different lifecycle concerns.
- Infrastructure concepts naturally lead to security questions.

### Short Note Example

```text
The domain name must be resolved before the client can connect to the backend endpoint.
After resolution, the actual API request uses HTTPS to reach the infrastructure in front of the API Server.
Static assets can use a CDN, but player-specific data should go through the API Server.
```

## 10.12 Common Mistakes

### Mistake 1: Thinking `localhost` is a public server address

`localhost` points to the computer making the request. It is useful for local development, but it is not the same as a public domain that real players can reach.

### Mistake 2: Treating staging like production or production like staging

Staging is for rehearsal. Production is where real players and real data exist. Production should not be used as a casual test space.

### Mistake 3: Putting secrets in code or in the game client

Secrets such as database passwords, token signing keys, payment keys, and admin keys should be protected. They should not be committed to a source repository, written into logs, included in container images, or embedded in a client build.

### Mistake 4: Confusing Docker image and container

An image is the package. A container is the running instance created from that package.

### Mistake 5: Using `localhost` inside a container without thinking

Inside a container, `localhost` usually means the container itself. If an API container needs to connect to a database container, it often needs the database service name or network address, not `localhost`.

### Mistake 6: Sending private player data through CDN

A CDN is useful for static content such as images and patch files. A public CDN path is not a safe place for session tokens, private inventory data, production database backups, or admin-only files. Some systems use private CDN access controls or signed URLs, but that is an advanced access-control topic beyond this chapter.

### Mistake 7: Assuming deployment ends when code is uploaded

Deployment also requires configuration, secret management, dependency checks, verification, monitoring, and a recovery plan.

### Mistake 8: Treating API Server hosting and Dedicated Game Server hosting as the same problem

API Servers usually handle request/response flows. Dedicated Game Servers may handle active match state, region selection, player latency, allocation, result reporting, and match lifecycle.

## 10.13 Chapter Summary

In this chapter, we studied the infrastructure map around backend systems.

A local server running on `localhost` is useful for learning, but it is not the same as a production service. A production backend usually needs a public address, DNS, HTTPS, routing or load balancing, runtime configuration, protected secrets, backend servers, databases, logs, and recovery planning.

We also distinguished local, staging, and production environments. The same code may run in each environment, but the configuration, data, permissions, and risk level are different.

Docker helps package applications into images and run them as containers. Docker Compose can describe multiple services such as an API Server and a database, but this chapter used it only as a conceptual map.

Cloud hosting is about deciding how responsibilities are divided between your team and the platform. Some models give the team more control and more operations responsibility. Others let the platform manage more of the runtime.

DNS, HTTPS, CDN, Load Balancer, and API Gateway each solve different problems in the request flow or delivery path. CDN is useful for static resources, while player-specific API data usually belongs behind backend logic.

API Server hosting and Dedicated Game Server hosting also have different concerns. API Servers usually focus on service requests and safe deployment. Dedicated Game Servers must also consider match lifecycle, latency, region, allocation, active sessions, and result reporting.

Infrastructure helps a backend become reachable. Security helps that reachable backend remain safe. In the next chapter, we will study the basic security mindset needed when backend APIs are exposed to real clients and users.

## 10.14 Quiz

### Question 1

Which statement best describes `localhost`?

A. A public server address that all players can access.  
B. The computer that is sending the request itself.  
C. A CDN address for static files.  
D. A cloud database name.

**Answer: B**

**Explanation:**  
`localhost` points to the machine making the request. On your computer, it means your computer. On another player’s computer, it means that player’s computer.

### Question 2

Which environment should be treated most carefully because it contains real player data?

A. Local  
B. Staging  
C. Production  
D. Temporary test folder

**Answer: C**

**Explanation:**  
Production is the real service environment. It may contain real accounts, scores, inventory, purchase records, and reward history.

### Question 3

Which statement best separates a Docker image, a container, and a virtual machine?

A. A Docker image is a running process, a container is a DNS record, and a virtual machine is an HTTPS certificate.  
B. A Docker image is a packaged template, a container is a running instance created from an image, and a virtual machine is a software-defined server.  
C. A Docker image is only used for databases, a container is only used for CDN files, and a virtual machine is only used for game clients.  
D. They are three names for the same thing.

**Answer: B**

**Explanation:**  
A Docker image packages the application and its environment. A container runs from an image. A virtual machine is a software-defined server that may run containers or other server software.

### Question 4

Which value should usually be treated as a secret?

A. `APP_ENV`  
B. `API_PORT`  
C. `SESSION_TOKEN_SECRET`  
D. `PUBLIC_CDN_URL`

**Answer: C**

**Explanation:**  
A session token secret may be used to sign or verify tokens. If it is exposed, attackers may be able to abuse authentication-related flows.

### Question 5

Which request is usually a good fit for a CDN?

A. Downloading a public item icon image.  
B. Reading a player’s private inventory.  
C. Sending an admin API key.  
D. Updating a production database password.

**Answer: A**

**Explanation:**  
CDNs are useful for public static resources such as images and patch files. Private player data and secrets should not be delivered through a public CDN path.

### Question 6

Which statement best separates DNS and HTTPS?

A. DNS encrypts requests, while HTTPS stores player data.  
B. DNS helps find the address for a domain, while HTTPS protects communication over the connection.  
C. DNS and HTTPS are both database engines.  
D. HTTPS is only used for CDN images and never for APIs.

**Answer: B**

**Explanation:**  
DNS helps the client resolve a domain name. HTTPS protects communication and, when certificate validation succeeds, helps verify the server identity through TLS.

### Question 7

Which concern is more specific to Dedicated Game Server hosting than normal API Server hosting?

A. Choosing the JSON format for a leaderboard response.  
B. Choosing a cache strategy for public leaderboard reads.  
C. Allocating a server for a match and avoiding interruption of active match sessions.  
D. Choosing the HTTP status code for a login failure.

**Answer: C**

**Explanation:**  
Dedicated Game Servers often manage real-time sessions or matches. Hosting them involves allocation, region, latency, active match lifecycle, avoiding interruption of active sessions, and result reporting.

### Question 8

Why does infrastructure naturally lead into backend security?

A. Once a backend is reachable from outside, it can receive incorrect, manipulated, or malicious requests.  
B. Infrastructure removes the need for authentication.  
C. Cloud hosting automatically makes all APIs safe.  
D. A Load Balancer replaces input validation.

**Answer: A**

**Explanation:**  
When a backend becomes reachable, it must handle real clients and unsafe requests. That is why HTTPS, authentication, authorization, validation, rate limiting, and secret management become important.

## 10.15 Further Reading

You do not need to read all of these resources immediately. Use them as references when a topic from this chapter becomes important in your later study.

### Start Here

- [Docker — Docker overview](https://docs.docker.com/get-started/docker-overview/)  
  Use this when you want to review the basic idea of Docker, images, and containers.

- [Docker — Docker Compose documentation](https://docs.docker.com/compose/)  
  Use this when you want to understand how multiple containerized services can be described together.

- [Docker — Networking in Compose](https://docs.docker.com/compose/how-tos/networking/)  
  Use this when you want to understand why Compose services can reach each other by service name.

- [The Twelve-Factor App — Config](https://12factor.net/config)  
  Use this when you want to understand why configuration should be separated from code.

- [Cloudflare — What is DNS?](https://www.cloudflare.com/learning/dns/what-is-dns/)  
  Use this when you want to review the basic idea of domain name resolution.

- [MDN — HTTPS](https://developer.mozilla.org/en-US/docs/Glossary/HTTPS)  
  Use this when you want to review the meaning of HTTPS.

### Optional Deep Dive

- [Cloudflare — What is a CDN?](https://www.cloudflare.com/learning/cdn/what-is-a-cdn/)  
  Use this when you want to understand why static files are often delivered through a CDN.

- [Cloudflare — What is Load Balancing?](https://www.cloudflare.com/learning/performance/what-is-load-balancing/)  
  Use this when you want to understand how traffic can be distributed across servers.

- [MDN — Transport Layer Security](https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides/TLS)  
  Use this when you want to understand the security idea behind HTTPS in more detail.

### Game Server Hosting Preview

- [Agones Documentation](https://agones.dev/site/docs/)  
  Use this only as a preview of advanced Dedicated Game Server orchestration concepts.

- [AWS — What is Amazon GameLift Servers?](https://docs.aws.amazon.com/gameliftservers/latest/developerguide/gamelift-intro.html)  
  Use this only as a preview of managed Dedicated Game Server hosting concepts.

Vendor service names, features, and documentation paths may change over time. Treat these links as starting points, not as fixed product requirements for this guide.

Actual cloud deployment, CI/CD, Kubernetes, production secret management, autoscaling, cost optimization, incident response, and game server orchestration are topics for later advanced courses, not expectations for this chapter.
