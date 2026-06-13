# 6. Understanding Your First Backend API

## 6.1 How to Read This Chapter

This chapter is a concept-first guide to what happens inside an API Server when it receives a
request.

You are not expected to install a framework or write a complete server file in this chapter. This
chapter keeps the scope small by focusing on the concept flow behind familiar API examples such as
score submission and leaderboard lookup.

In Chapter 5, you studied HTTP requests, responses, methods, paths, headers, bodies, JSON, status
codes, and API contracts. This chapter uses those ideas from the point of view of an API Server.

Read this chapter as a map of responsibilities. When you see an example such as `POST /scores`, do
not ask, "Which framework syntax should I type?" Ask, "What does the server need to understand,
check, and return?"

A later Web Backend course can show how to implement these ideas in a real framework. In this
chapter, focus on reading the request flow and explaining what each server-side responsibility
means.

## 6.2 What You Will Learn

By the end of this chapter, you should be able to explain the following ideas:

- What an API Server does when a request arrives.
- How an endpoint path, API operation, route, and handler are different.
- How an API Server reads headers, path parameters, query parameters, and request bodies.
- Why the server should validate request data before trusting it.
- How success and error responses use status codes and response bodies, often JSON.
- Why a health check API operation is useful.
- How route, handler, service, and repository responsibilities can be separated conceptually.
- How tools such as `curl` and Postman help you observe request and response structure.

The goal is not to memorize every term, but to understand the flow well enough to describe what
happens when a client sends a request to a backend API.

## 6.3 Why This Matters

A game client often makes backend requests that look simple on the surface.

For example, after a player finishes a stage, the client may send a score to the server. From the
player's point of view, this may feel like one action: the result screen appears, and the score is
submitted.

From the backend point of view, the API Server has several responsibilities.

It must receive the request, match it to the correct processing rule, read the data, check whether
the request makes sense, decide whether the operation is allowed, prepare a result, and return a
response that the client can understand.

If the server blindly trusts every client value, problems can appear quickly. A manipulated score
may enter the leaderboard. A duplicated request may submit the same run twice. A missing field may
cause confusing errors. A client may send a request without authentication. A server may return a
vague error that the client cannot handle.

This is why API Server flow matters. A backend API is not just a URL path such as `/scores`. It is a
controlled flow of receiving, checking, processing, and responding.

In beginner backend learning, understanding this flow is more important than learning framework
syntax too early.

## 6.4 A Small Game Backend API Scenario

Imagine a small arcade-style game.

A player plays a stage. When the stage ends, the game client sends the score to the backend. The
backend keeps track of players, receives scores, and returns leaderboard data.

We will use the following API operations as reading examples.

```http
GET  /health
POST /players
GET  /players/me
POST /scores
GET  /leaderboard
```

These API operations are examples, not implementation targets. You are not expected to implement
them in this chapter.

| API Operation | Main Purpose |
|---|---|
| `GET /health` | Check a simple health signal from the API Server. |
| `POST /players` | Create a player record. |
| `GET /players/me` | Read the authenticated player's own profile information. |
| `POST /scores` | Create a score submission record for a completed stage run. |
| `GET /leaderboard` | Read ranked scores. |

The same API operation can be described in several layers. For example:

```text
API operation: POST /scores
Endpoint path: /scores
Route: server-side matching rule for POST + /scores
Handler: request-processing unit for score submission
Validation: checks format, identity, score value, and game rules
Response: status code + JSON response body in these examples
```

Here, `/scores` by itself is an endpoint path. `POST /scores` is an API operation because it
combines an HTTP method and a path.

The server does not look only at the endpoint path. It usually considers the method, path, headers,
request body, authentication context, and service rules together.

## 6.5 Reading a Small API Specification

Before following the full request-handling flow, let’s learn how to read the small API specification
used in this chapter. This short section prepares the terms that will appear again later.

### Path Parameters and Query Parameters

A path parameter is a value placed inside the path.

```http
GET /players/player_001
```

In an API contract, the same shape may be written like this:

```http
GET /players/{playerId}
```

Here, `{playerId}` means that a real player ID should be placed at that part of the path. Use this shape only when the API is meant to look up a specific player resource, such as a limited public profile or an authorized admin/support view. For a player's own private profile, an endpoint such as `GET /players/me` is usually safer and clearer.

A query parameter is a value placed after `?` in the URL.

```http
GET /leaderboard?season=weekly&limit=10
```

In this example, `season=weekly` can mean that the client wants the weekly leaderboard, and
`limit=10` can mean that the client wants only ten results.

Path parameters usually identify a specific resource. Query parameters usually filter, sort, limit,
or adjust the result.

The server should validate both. For example, an API Server may reject an unknown `season` value or
limit an overly large `limit` value.

### A Small API Specification

When reading an API, do not look only at the path. Also ask what data is required, what response is
expected, and what errors may happen.

The Common Error Examples column does not list every possible error. It shows representative examples
that are useful for beginner-level API reading. Detailed status-code names appear later in this
chapter.

| Method | Endpoint Path | Purpose | Request Body | Success | Common Error Examples |
|---|---|---|---|---|---|
| `GET` | `/health` | Check server status | None | `200 OK` | `503` |
| `POST` | `/players` | Create a player | JSON with `displayName` | `201 Created` | `400`, `409` |
| `GET` | `/players/me` | Read the authenticated player's own profile | None | `200 OK` | `401`, `404` |
| `POST` | `/scores` | Create a score submission record | JSON with `stageId`, `runId`, and `score` | `201 Created` | `400`, `401`, `403`, `409`, `413`, `415` |
| `GET` | `/leaderboard` | Read leaderboard | None | `200 OK` | `400` |

The exact response shapes may differ by team. In this chapter, `POST /scores` is treated as an API
operation that creates a new score submission record, so the success status is `201 Created`.

You can think of `/scores` as the collection of score submission records in this simplified API
contract.

Different API contracts may define score processing in other ways, but this chapter uses one
contract consistently. For beginners, the key lesson is that both success and failure should be
designed as part of the API contract.

In a real game service, player creation may also include account-related setup, but this chapter
keeps the example small by using only `displayName` in the request body.

The player profile and leaderboard examples are also simplified. `GET /players/me` assumes authenticated
self-profile access, so a real API should include authentication checks. If an API returns limited public
profile or ranking data, the common error examples may be small. If it returns private player data,
admin/support data, or protected leaderboard details, authentication and authorization errors such as
`401 Unauthorized` or `403 Forbidden` may also need to be considered.

## 6.6 Core Flow of an API Server

When a client sends an API request, the API Server usually follows a flow like this:

```text
Client request
→ API Server receives the request
→ Route matches method and path
→ Handler reads request data
→ Server validates format, identity, and rules
→ Server does the necessary server-side work
→ Server prepares a response
→ Client receives a status code and, in these examples, a JSON body
```

Let us walk through this slowly with `POST /scores`.

### Step 1: The Client Sends a Request

The game client prepares an HTTP request.

The examples below use a simplified HTTP-style format so that you can focus on the request
structure.

```http
POST /scores
Content-Type: application/json
Authorization: Bearer example-token
```

```json
{
  "stageId": "stage_01",
  "runId": "run_20260601_0001",
  "score": 15200
}
```

The request says, "I want to submit a score for this stage run. Here is the score data. Here is a
token the server can validate to identify the player."

`example-token` is only a placeholder. Do not paste real access tokens into public notes,
screenshots, or shared documents.

### Step 2: The API Server Receives the Request

The API Server receives the request over the network.

At this moment, the server has not yet decided that the request is trustworthy. At this point, the
request is just data sent by a client.

A beginner mistake is to imagine that receiving a request means accepting it. Receiving is only the
first step. Checking comes next.

### Step 3: The Route Matches the Method and Path

The API Server compares the method and path against its routing rules.

```text
POST + /scores      → score submission handler
GET  + /scores      → not defined in this example; some APIs might return 405 Method Not Allowed
GET  + /leaderboard → leaderboard query handler
GET  + /players/me  → authenticated player profile handler
```

A route is the server-side rule that connects a method and path pattern to a handler. In a real API,
an unsupported method for a known path may return `405 Method Not Allowed`, but this chapter keeps
the example simple.

We will keep the routing example simple here. A short optional note about formal `405` behavior
appears later with the status-code notes.

### Step 4: The Handler Reads the Request Data

After the request is matched, the handler reads the data needed for the operation.

For `POST /scores`, the handler may need to read:

- The `Authorization` header.
- The `Content-Type` header.
- The JSON body.
- The `stageId` field.
- The `runId` field.
- The `score` field.

The handler should not assume that all of these values are present or valid.

### Step 5: The Server Validates the Request

Validation means checking the request before trusting it.

For score submission, the server may ask:

- Is the request body valid JSON?
- Does the request include the required fields?
- Is `score` a number?
- Is `score` greater than or equal to zero?
- Is the score possible for this stage?
- Is `stageId` a known stage?
- Is the player authenticated?
- Has this `runId` already been submitted?

These checks protect the backend from accidental mistakes, client bugs, duplicated requests, and
manipulated values.

### Step 6: The Server Does Server-Side Work

If the request passes validation, the server can do the necessary server-side work.

For score submission, the server may conceptually:

- Associate the request with a player.
- Accept the score as a valid submission.
- Create the score submission record.
- Record the submission so leaderboard data can be updated now or later, depending on the API design.
- Prepare a result for the client.

This chapter does not implement database storage. For now, simply notice that score data eventually
needs somewhere to live. Chapter 7 will ask where this data should be stored so it does not
disappear.

### Step 7: The Server Returns a Response

The server returns an HTTP status code and, in these examples, a JSON body.

The HTTP status code tells the client the overall result of the request. The JSON body can include
additional details about the created score submission.

In this chapter, `POST /scores` creates a new score submission record, so a successful response uses
`201 Created`.

```http
201 Created
Content-Type: application/json
```

```json
{
  "success": true,
  "runId": "run_20260601_0001",
  "score": 15200,
  "submissionStatus": "created"
}
```

In this example, `score` represents the value accepted by the server for this submission.

**Optional note:** In a more resource-oriented REST-style API, a `201 Created` response often
includes a `Location` header that points to the newly created resource. This chapter does not define
a separate score-submission lookup API, so the main example does not show a generated resource URI.
In this chapter, `runId` identifies the stage run, not necessarily the database record itself.
A real API contract may also include a separate server-side identifier for the created score
submission record.

Some real systems may create the score submission record immediately and update leaderboard data
later, especially if ranking is processed asynchronously. In that design, the client can call
`GET /leaderboard` later to see the updated ranking data.

An error response might look like this:

```http
400 Bad Request
Content-Type: application/json
```

```json
{
  "error": {
    "code": "INVALID_SCORE",
    "message": "score must be a number greater than or equal to 0."
  },
  "requestId": "req_20260601_0001"
}
```

The client should be able to read the response and decide what to show next.

## 6.7 Endpoint, API Operation, Route, and Handler

Beginners often mix up endpoint, API operation, route, and handler. These words are related, but
they are not identical.

### Endpoint Path

An endpoint path is the URL path part that identifies where the request is going.

Examples:

```text
/health
/players/{playerId}
/scores
/leaderboard
```

The endpoint path does not include the HTTP method by itself.

Different teams sometimes use the word "endpoint" more broadly. In this chapter, we use "endpoint
path" to mean the path part only, and "API operation" to mean method plus path.

### API Operation

An API operation combines a method and a path.

Examples:

```text
GET /health
POST /scores
GET /leaderboard
```

`GET /scores` and `POST /scores` are different API operations, even though the endpoint path is the
same.

The method matters because it tells the server what kind of action the client is requesting.

### Route

A route is the server-side matching rule.

Conceptually, the server may have routing rules like this:

```text
GET  /health             → health handler
POST /players            → player creation handler
GET  /players/me          → authenticated player profile handler
POST /scores             → score submission handler
GET  /leaderboard        → leaderboard query handler
```

This is not framework code. It is a conceptual map of how the server chooses which handler should
receive the request.

### Handler

A handler is the part of the server responsible for handling the matched request.

A score submission handler may:

- Read the request headers and request body.
- Ask authentication logic who the player is.
- Validate the score data.
- Ask service logic to create the score submission record.
- Prepare the success or error response.

You can think of a handler as a request-processing unit. In real code, the exact name may differ by
framework or team. Some teams say controller, action, or request handler.

### Why the Distinction Helps

The distinction helps you talk about backend flow clearly.

For example, this sentence is precise:

```text
POST /scores
→ matched by a route
→ handled by the score submission handler
→ validated before the server returns a response
```

This is clearer than saying only:

```text
The /scores API handles scores.
```

Clear vocabulary makes debugging, documentation, and team communication easier.

## 6.8 Reading Request Data

An API Server can read data from several parts of a request.

The most common parts are:

- Method
- Path
- Path parameters
- Query parameters
- Headers
- Body

Each part has a different role.

### Method and Path

The method and path decide the API operation.

```http
POST /scores
```

This says that the client is asking the server to create a score submission record.

### Path Parameters

Path parameters identify a specific resource.

```http
GET /players/player_001
```

This example is only for understanding path parameters. For a private "my profile" API, this guide uses `GET /players/me`.

Here, the server reads `player_001` as the `playerId` path parameter.

A player lookup handler may use that value to find the player record, but the server must still check whether the caller is allowed to read that record. For a private "my profile" flow, `GET /players/me` avoids letting the client choose an arbitrary player ID. In this chapter, focus on the idea rather than the database code.

### Query Parameters

Query parameters adjust the query or result.

```http
GET /leaderboard?season=weekly&limit=10
```

The server may read:

```text
season = weekly
limit = 10
```

The server should still validate these values. For example, `limit=1000000` may be rejected or
reduced because returning too many rows can overload the service.

### Headers

Headers provide metadata about the request.

Common examples include:

| Header | Possible Meaning |
|---|---|
| `Content-Type: application/json` | The client says the body should be treated as JSON. |
| `Authorization: Bearer ...` | The request includes a bearer token that the server can validate. |
| `Accept: application/json` | The client wants a JSON response. |
| `User-Agent: ...` | The client tool or application sending the request. |

Headers are not only technical decoration. They can affect how the server reads and handles the
request.

### Body

The request body carries data for operations that need input beyond the path.

For score submission:

```json
{
  "stageId": "stage_01",
  "runId": "run_20260601_0001",
  "score": 15200
}
```

The server should check that the body is valid JSON and that the fields match the API contract.

### Authentication Context

Some request data is not only inside the visible JSON body. If the request includes a valid token,
the server may use that token to identify the player.

For example, the request body may not include `playerId` directly. The server may determine the
player from the validated token.

This is usually safer than trusting a `playerId` field sent directly by the client.

## 6.9 Validation and Error Responses

Validation is one of the most important responsibilities of an API Server.

Validation means checking request data before trusting it or using it to change important backend
state.

A useful beginner rule is:

```text
The client can ask. The server must check.
```

This does not mean every client is malicious. It means a backend must be designed to handle
mistakes, bugs, duplicates, and manipulated requests safely.

### Levels of Validation

Validation can happen at several levels.

| Validation Level | Example Question |
|---|---|
| JSON format | Is the body valid JSON? |
| Content type | Does the request say the body is JSON, such as `Content-Type: application/json`? |
| Size limit | Is the body small enough for this API to process safely? |
| Required fields | Are `stageId`, `runId`, and `score` present? |
| Type | Is `score` a number? |
| Range | Is `score` greater than or equal to 0? |
| Known value | Is `stageId` a real stage? |
| Authentication | Is the request connected to a real player? |
| Authorization | Is this player allowed to perform this action? |
| Game rule | Is this score possible for the stage? |
| Duplicate check | Has this `runId` already been submitted? |

For this introductory chapter, you do not need to design a complete anti-cheat system. But you
should clearly understand why the server should not blindly accept client-sent values.

A server can only validate rules and evidence it actually has, such as stage ID, authenticated
player, issued `runId`, score range, and server-side records.

### Why `runId` Helps with Repeated Requests

A `runId` can represent one play attempt or one stage run.

For example:

```json
{
  "stageId": "stage_01",
  "runId": "run_20260601_0001",
  "score": 15200
}
```

If the client accidentally sends the same request twice because of a network retry, the server can
notice that `runId` was already submitted.

However, the server should not blindly trust a `runId` just because it appears in the JSON body. In
a safer design, the server may issue the `runId` when the stage run begins, connect it to the
authenticated player and stage, and later check whether the submitted `runId` was actually issued
and has not already been used.

Different APIs handle repeated requests differently. Some return the previous successful result,
possibly with a status code defined by the API contract. Others return an error such as `409 Conflict`.
The important idea is that the server recognizes the repeated operation instead of processing it
blindly again.

A duplicate request may return an error such as:

```http
409 Conflict
Content-Type: application/json
```

```json
{
  "error": {
    "code": "DUPLICATE_RUN",
    "message": "This run has already been submitted."
  },
  "requestId": "req_20260601_0002"
}
```

A `runId` does not solve every problem related to repeated requests or anti-cheat by itself. It
helps only when the server connects it to verified server-side state and uses it to recognize
repeated requests safely.

This is related to idempotency: the idea of handling repeated requests safely. You do not need to
master that term now. In this chapter, focus on the simpler idea: when a feature requires it, the
server should recognize repeated operations instead of processing them blindly again.

### Common Status Codes in This Chapter

Treat this table as a reading reference, not as a memorization list.

| Status Code | Meaning in These Examples |
|---|---|
| `200 OK` | The request succeeded and the server returned data. |
| `201 Created` | The request succeeded and a new record was created. |
| `400 Bad Request` | The request format or input data is invalid. |
| `401 Unauthorized` | Authentication is missing or invalid. |
| `403 Forbidden` | The user is known but not allowed to do this action. |
| `404 Not Found` | The requested resource does not exist. |
| `409 Conflict` | The request conflicts with existing state, such as a duplicate run. |
| `413 Content Too Large` | The request body is larger than this API is willing or able to process. |
| `415 Unsupported Media Type` | The request body format or `Content-Type` is not supported for this API operation. |
| `500 Internal Server Error` | The server failed unexpectedly. |
| `503 Service Unavailable` | The server is temporarily unavailable or not ready. |

Do not try to memorize every status code now. Focus on the idea that the status code should match
the kind of result.

The name `401 Unauthorized` can be confusing. In HTTP, it usually means the client has not
authenticated successfully yet. `403 Forbidden` is used when the server knows the user but refuses
the action.

### Optional HTTP Semantics Notes

The following details are useful when you later read official HTTP documentation. You do not need to
memorize them now.

- In formal HTTP semantics, a `405 Method Not Allowed` response includes an `Allow` header that lists the methods supported by that resource.
- In formal HTTP authentication semantics, a `401 Unauthorized` response includes a
  `WWW-Authenticate` header. That header describes how the client can authenticate. Many beginner API
  examples omit this detail so the focus stays on the meaning of authentication failure.
- Some APIs use `422 Unprocessable Content` when the JSON syntax is valid, but the data still violates
  a service rule. For example, a score may be a number but still be impossible for the stage. This
  chapter mainly uses `400 Bad Request` to keep the beginner examples simple.

### Designing Error Responses

A good error response should help the client and the developer understand what happened.

A simple shape can be:

```json
{
  "error": {
    "code": "MISSING_FIELD",
    "message": "stageId is required."
  },
  "requestId": "req_20260601_0003"
}
```

The `code` is useful for programs. The `message` is useful for humans, but it should still be safe
to expose to the client.

The `requestId` can help developers and operators connect a client-side error report to server logs
later.

Detailed internal causes should be kept in server logs, not in public error responses. Do not put
secrets, passwords, private tokens, or sensitive internal details inside error responses.

## 6.10 Health Checks and Operational APIs

So far, we have focused on player-facing API operations such as score submission and leaderboard
lookup. Not every API operation is directly used by players. Some APIs exist to help developers and
operations tools understand whether the API Server is responding correctly.

A health check is a small API operation used to check whether the server is alive or ready.

The simplest example is:

```http
GET /health
```

A simple response might be:

```http
200 OK
Content-Type: application/json
```

```json
{
  "status": "ok"
}
```

This response looks small, but it is useful. Developers, automated tools, deployment systems, and
monitoring systems can use a health check to observe whether the API Server is responding.

A health check response should usually stay simple. It should not expose sensitive internal details
to public clients.

### Liveness and Readiness

In real systems, teams may separate two ideas:

| Check Type | Beginner Meaning |
|---|---|
| Liveness | Is the server process alive? |
| Readiness | Is the server ready to handle real requests? |

A server may be alive but not ready. For example, the server process may be running, but it may
still be waiting for a database connection or configuration load.

At this stage, you only need the concept. You do not need to implement deployment health checks in
this chapter.

Some teams use one simple `/health` API. Other teams separate checks into paths such as `/live` and
`/ready`. The exact path is a team design choice.

### Health Check Is Not a Feature for Players

`GET /health` is different from a gameplay feature such as `POST /scores`.

A player does not usually press a "health check" button in the game. Health checks are more
connected to development, deployment, monitoring, and operations.

This is the first small example of an operational API. Later chapters will study logging,
monitoring, dashboards, and operations in more detail.

## 6.11 Separating Server Responsibilities

We already used the terms route and handler earlier. Now let’s add two more responsibility names
that often appear in backend discussions: service and repository.

In real backend design, teams often separate responsibilities further.

At a conceptual level, the flow may look like this:

```text
Route
→ Handler
→ Service
→ Repository
→ Data store
```

This chapter does not implement these layers. The goal is to understand why the names exist.

### Route

The route matches the method and path.

```text
POST /scores → score submission handler
```

The route answers:

```text
Which handler should receive this request?
```

### Handler

The handler manages the request and response boundary.

It may read headers, path parameters, query parameters, and request body data. It may call service
logic. It prepares the final response.

The handler answers:

```text
What request came in, and what response should go out?
```

### Service

The service contains feature or business logic.

For score submission, service logic may ask:

- Is the score acceptable?
- Should this run be recorded?
- Should leaderboard-related data be updated now or later?

The service answers:

```text
What should this feature do according to service rules?
```

### Repository

The repository is a conceptual boundary for reading and writing data.

A score repository might later know how to store score records or query leaderboard rows. In this
chapter, we do not write database code. The repository idea simply prepares you for Chapter 7.

The repository answers:

```text
How does this feature access stored data?
```

At this stage, treat repository as a vocabulary preview, not as a coding pattern you must implement
now.

The main question is not how to write a repository class yet. The main question is: once the API
Server accepts or reads data, where should that data live?

### Why Separation Helps

Separation helps keep responsibilities clear.

If every detail is mixed together, it becomes hard to understand the request flow. A handler that
directly contains routing decisions, validation, service rules, database access, and response
formatting can become confusing.

At the beginner level, do not worry about designing perfect layers. Just remember that backend code
often separates request handling, feature rules, and data access so that each part has a clearer
role.

## 6.12 Observing API Requests Without a Game Client

You do not always need a game client to observe API request and response structure.

Tools such as `curl`, Postman, and browser developer tools can help you inspect how HTTP APIs work.

In this chapter, treat these tools as observation tools, not as a requirement to run a local server.

### The `curl` Tool

`curl` is a command-line tool that can send HTTP requests.

With the right options, a `curl` command can help you inspect the method, URL, headers, request body,
response headers, and response body. It is useful because it can make HTTP structure visible in the
terminal.

At this stage, it is enough to understand that `curl` can act as a simple API client for testing
and observation.

### Postman

Postman is a graphical tool for sending and saving API requests.

It can be easier for beginners who want to choose a method, type a URL, add headers, write JSON, and
view the response in a visual interface.

Again, this chapter is not a Postman tutorial. The important idea is that API testing tools help you
examine a backend request without waiting for a full game client.

### Browser Developer Tools

Browser developer tools can show network requests made by a web page.

This is useful for observing HTTP traffic, response status codes, response headers, and timing
information.

For game backend learning, browser developer tools are not always the main API testing tool, but
they help you understand that clients and servers communicate through observable requests and
responses.

### What to Observe

When using any API observation tool, ask:

- What method is being used?
- What path is being requested?
- Are there query parameters?
- Which headers are present?
- Is there a request body?
- What status code came back?
- What response body came back?
- If an error occurred, does the response explain the problem clearly?

This observation habit will be useful in every later backend topic.

## 6.13 Learning Practice

This Learning Practice is for observation and study. It is not a production-ready implementation.

### Goal

Trace a score submission request and identify the conceptual responsibilities of the API Server.

You will not write server code. You will read one request and explain how the server should think
about it.

### Example Request

We will reuse the same score submission shape so that you can focus on tracing responsibilities
instead of learning a new example.

The examples below use a simplified HTTP-style format so that you can focus on the request
structure.

```http
POST /scores
Content-Type: application/json
Authorization: Bearer example-token
```

```json
{
  "stageId": "stage_01",
  "runId": "run_20260601_0001",
  "score": 15200
}
```

The token text is a placeholder, not a real access token.

### Possible Success Response

In this chapter's contract, `POST /scores` creates a new score submission record, so a successful
response uses `201 Created`.

```http
201 Created
Content-Type: application/json
```

```json
{
  "success": true,
  "runId": "run_20260601_0001",
  "score": 15200,
  "submissionStatus": "created"
}
```

In this practice, `score` represents the value accepted by the server for this submission.

**Optional note:** A more resource-oriented REST-style API may include a `Location` header with `201 Created`.
This practice omits it because no score-submission lookup API is defined in this chapter.

In this chapter, `runId` identifies the stage run, not necessarily the database record itself.
A real API contract may also include a separate server-side identifier for the created score
submission record in the response body.

Some real systems may create the score submission record immediately and update leaderboard data
later, especially if ranking is processed asynchronously. In that design, the client can call
`GET /leaderboard` later to see the updated ranking data.

### Possible Error Response

```http
400 Bad Request
Content-Type: application/json
```

```json
{
  "error": {
    "code": "INVALID_SCORE",
    "message": "score must be a number greater than or equal to 0."
  },
  "requestId": "req_20260601_0001"
}
```

### Steps

1. Identify the HTTP method.
2. Identify the endpoint path.
3. Write the API operation as method plus path.
4. Identify the headers used in the example.
5. Identify the request body fields.
6. Describe what the route does conceptually.
7. Describe what the handler should read.
8. List at least five validation checks the server should perform.
9. Identify the success status code used in this chapter's API contract.
10. Identify the beginner-level error status code used here for invalid score data.
11. Write one sentence about what data may need to be stored later.

### Suggested Review

| Item | Example Answer |
|---|---|
| Method | `POST` |
| Endpoint path | `/scores` |
| API operation | `POST /scores` |
| Headers | `Content-Type`, `Authorization` |
| Body fields | `stageId`, `runId`, `score` |
| Route role | Match `POST /scores` to the score submission handler. |
| Handler role | Read headers and the request body, then prepare a success or error response. |
| Validation examples | JSON format, content type, size limit, required fields, score type, score range, authentication, known stage, duplicate `runId`. |
| Success status | `201 Created`, because this API creates a new score submission record. |
| Invalid-score status in this example | `400 Bad Request`. |

### What to Observe

You should notice that `POST /scores` is more than a URL.

It includes a method, endpoint path, headers, request body, validation rules, server-side decisions,
and response design.

You should also notice that the chapter stops before database implementation. The API Server may
conceptually accept a score, but Chapter 7 will ask where score and player data should be stored so
it survives beyond a single request or server restart.

### Short Note

After completing the steps, write two or three sentences in your own notes.

You can use this shape:

```text
In this request, the client asks the API Server to create a score submission record.
The server should match POST /scores to the score submission handler.
It should read the JSON body, validate the score, record the submission,
and return either a success response or an error response.
The score submission record probably needs persistent storage, which connects this chapter to
databases.
```

## 6.14 Common Mistakes

### Mistake 1: Thinking an Endpoint Path Is the Whole API

`/scores` is only the endpoint path. `POST /scores` is the API operation.

The method changes the meaning. `GET /scores` and `POST /scores` are not the same operation.

### Mistake 2: Thinking a Route and a Handler Are the Same Thing

A route is the matching rule. A handler is the request-processing unit.

The route decides where the request goes. The handler reads the request and prepares the response.

### Mistake 3: Trusting Client-Sent Values Blindly

The client may send wrong values by mistake, because of a bug, or because someone manipulated the
request.

The server should validate important values such as scores, rewards, currencies, and
ownership-related data.

### Mistake 4: Treating Error Responses as an Afterthought

Error responses are part of API design.

A clear error response helps the client handle the problem and helps developers debug issues.

### Mistake 5: Using `500 Internal Server Error` for Every Failure

Not every failure is a server crash.

Missing fields, invalid JSON, unauthenticated requests, duplicate submissions, and unknown players
should usually have more specific status codes.

### Mistake 6: Assuming This Chapter Builds a Server

This chapter explains conceptual API Server flow. It does not teach framework setup or full server
implementation.

A later Web Backend course can implement the same ideas in actual code.

### Mistake 7: Forgetting the Connection to Data Storage

When the server accepts player data or score data, that data usually needs to be stored somewhere.

This chapter explains the request-handling flow. Chapter 7 explains why backend data needs databases
and other storage concepts.

## 6.15 Chapter Summary

In this chapter, we studied what happens conceptually when an API Server receives and handles a
request.

The key flow is:

```text
Client request
→ API Server receives it
→ Route matches method and path
→ Handler reads request data
→ Server validates the input
→ Server performs server-side work
→ Server returns a status code and usually a JSON response body
```

You learned that an endpoint path, API operation, route, and handler are related but different
concepts.

You also learned that an API Server reads data from the method, path, path parameters, query
parameters, headers, and request body.

It should validate request data before trusting it, especially for game-related values such as
scores, rewards, currencies, and player identity.

You also saw a small operational API example through health checks and learned how responsibilities
can be separated across routes, handlers, services, repositories, and data stores.

The most important idea is this:

```text
An API Server does not simply receive data.
It receives, matches, reads, validates, processes, and responds.
```

In this chapter, we studied the conceptual flow of a small API Server. In the next chapter, we will
ask where backend data should be stored so it can survive beyond a single request or server restart.

## 6.16 Quiz

### Question 1

Which statement best describes the role of an API Server in this chapter?

A. It only renders graphics for the game client.  
B. It receives requests, matches them to processing logic, validates data, and returns responses.  
C. It replaces all game client code.  
D. It only stores image files.

**Answer: B**

**Explanation:**  
An API Server receives client requests, chooses the correct server-side processing flow, validates
input, and returns a response. It does not render game graphics or replace the whole client.

### Question 2

In the API operation `POST /scores`, which part is the endpoint path?

A. `POST`  
B. `/scores`  
C. `score`  
D. `201 Created`

**Answer: B**

**Explanation:**  
The endpoint path is `/scores`. The full API operation combines the method and path: `POST /scores`.

### Question 3

What does a route do conceptually?

A. It stores score data permanently.  
B. It renders the leaderboard UI.  
C. It matches a method and path to the correct handler.  
D. It encrypts every database row.

**Answer: C**

**Explanation:**  
A route is the server-side matching rule. It connects an operation such as `POST /scores` to the
handler that should process that request.

### Question 4

Why should the server validate the `score` value sent by the client?

A. Because client-sent values may be wrong, duplicated, or manipulated.  
B. Because JSON cannot contain numbers.  
C. Because status codes are only used for successful requests.  
D. Because the client is always more trustworthy than the server.

**Answer: A**

**Explanation:**  
The client runs close to the player and may send incorrect values due to bugs, retries, or
manipulation. The server should validate important game values before accepting them.

### Question 5

Which status code is a reasonable choice when a required field is missing from the request body?

A. `200 OK`  
B. `201 Created`  
C. `400 Bad Request`  
D. `503 Service Unavailable`

**Answer: C**

**Explanation:**  
A missing required field is usually a client request problem, so `400 Bad Request` is a reasonable
beginner-level status code.

### Question 6

What is the purpose of `GET /health`?

A. To submit a player's score.  
B. To provide a simple health signal from the API Server.  
C. To create a player profile.  
D. To permanently store leaderboard data.

**Answer: B**

**Explanation:**  
A health check API operation helps developers, tools, and monitoring systems check whether the API
Server is responding. In more detailed systems, health checks may also distinguish liveness from
readiness.

### Question 7

Which statement best describes the difference between a handler and a service?

A. A handler focuses on request and response flow, while a service focuses on feature or business rules.  
B. A service is the URL path, while a handler is the HTTP method.  
C. A handler is only used for databases, while a service is only used for images.  
D. They are always exactly the same thing in every backend system.

**Answer: A**

**Explanation:**  
Conceptually, a handler manages the request-response boundary, while a service contains
feature-specific rules such as score submission logic.

### Question 8

Why does this chapter connect naturally to Chapter 7?

A. Because Chapter 7 explains how to render game animations.  
B. Because request-handling examples use data such as players and scores, and that data needs storage.  
C. Because HTTP status codes are no longer used after this chapter.  
D. Because routes only work in databases.

**Answer: B**

**Explanation:**  
This chapter explains how an API Server conceptually handles requests involving player and score
data. Chapter 7 asks where that data should be stored so it survives beyond one request or server
restart.

## 6.17 Further Reading

You do not need to read all of these resources immediately. Use them as references when you want to
review a topic from this chapter.

- [MDN — Overview of HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview)  
  Use this when you want to review the basic request-response structure of HTTP.

- [MDN — HTTP request methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods)  
  Use this when you want to compare common methods such as `GET`, `POST`, `PUT`, `PATCH`, and
  `DELETE`.

- [MDN — HTTP response status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status)  
  Use this when you want to review what common status codes mean.

- [MDN — Working with JSON](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/JSON)  
  Use this to review JSON structure and common beginner mistakes.

- [OpenAPI Initiative — Learn OpenAPI](https://learn.openapis.org/)  
  Use this when you want to understand how teams document API contracts.

- [Everything curl — Command line HTTP](https://ec.haxx.se/http/)  
  Use this later as a reference when you become more comfortable with command-line API observation.

- [Postman Docs — Send API requests](https://learning.postman.com/docs/use/send-requests/requests/)  
  Use this later when you want to inspect API requests through a graphical tool.
