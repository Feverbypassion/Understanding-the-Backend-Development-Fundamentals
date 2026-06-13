# 5. Web, HTTP, and API

## 5.1 How to Read This Chapter

In Chapter 4, we studied how a client can reach a server through networks. We looked at ideas such as IP addresses, ports, DNS, TCP, UDP, latency, jitter, bandwidth, packet loss, and sockets.

This chapter asks the next question:

```text
Once the client can reach the server, what does the client send, and what does the server return?
```

For many Web Backend features, a common answer is HTTP. HTTP is a common request/response protocol that many clients use when they request data from an API Server or ask it to perform an operation.

This chapter is a concept-first introduction. You are not expected to implement a complete API Server in this chapter. Instead, focus on reading and understanding the structure of HTTP APIs:

- What method is used?
- What path is requested?
- Are there query parameters?
- What headers provide extra information?
- What JSON body is sent?
- What status code comes back?
- What response body does the client receive?
- What does the server need to validate?

We will use game backend examples such as score submission, leaderboard lookup, player profile lookup, Remote Config, and daily reward claims. Remote Config means server-managed game settings that can be changed without rebuilding the client. These examples are API contract examples, not required implementation tasks.

At the end of the chapter, you should be able to read a small API contract and explain what the client and server have agreed to exchange.

---

## 5.2 What You Will Learn

By the end of this chapter, you should be able to explain:

- Why HTTP APIs are useful for many game backend features.
- How an HTTP request is made from a method, path, optional query parameters, headers, and optional body.
- How an HTTP response is made from a status code, headers, and optional body.
- What common methods such as `GET`, `POST`, `PUT`, `PATCH`, and `DELETE` usually mean.
- What common status codes such as `200`, `201`, `400`, `401`, `403`, `404`, `409`, and `500` tell the client.
- Why JSON is commonly used as a shared request and response data format.
- What an API contract is and why it helps client and server developers work together.
- How REST-style API paths organize API operations around resources.
- Why authenticated APIs should not blindly trust player identity values sent in the request body, path, or query parameters.
- Why query parameters are part of the API contract and should also be validated.
- Why CORS, HTTPS, OpenAPI, Swagger, and API observation tools are useful concepts to recognize.
- Why the server must validate important values sent by the client.

Focus on the vocabulary needed to read API examples and discuss backend communication clearly. You do not need to memorize every detail of HTTP in this chapter.

---

## 5.3 Why HTTP APIs Matter in Game Backend Development

When people first hear “game server,” they may immediately think of real-time multiplayer, sockets, fast movement synchronization, or Dedicated Game Servers. Those topics are important, but many game backend features are not real-time features.

A large number of service features follow a simpler pattern:

```text
The client asks for something.
The server checks the request.
The server returns a result.
```

That pattern fits HTTP APIs well.

| Game Feature | API Contract Example | Why HTTP Fits |
|---|---|---|
| Health check | `GET /health` | The client or monitoring tool only needs to know whether the service is reachable. |
| Player creation | `POST /players` | The client asks the server to create a player record. |
| Player profile lookup | `GET /players/{playerId}` | The client requests profile data for one player. Private data still requires authorization. |
| Score submission | `POST /scores` | The client sends result data, and the server validates it. |
| Leaderboard lookup | `GET /leaderboard` | The client receives ranked score data. |
| Remote Config lookup | `GET /config` | The client receives current server-managed game settings. |
| Daily reward claim | `POST /rewards/daily` | The server checks whether the reward can be claimed before granting it. |

These examples have clear request/response boundaries. The client does not need to stay connected every frame. It can send one request, receive one response, and update the UI.

For APIs that include player IDs, the exact authorization rule depends on the feature. A public profile API may intentionally expose limited public data, while private player data should be protected by authentication and authorization.

HTTP is not the best answer for every game communication problem. If a game needs to synchronize player positions many times per second, handle fast combat decisions, or maintain a shared match state, real-time communication may be needed. We will revisit those ideas in Chapter 9.

For now, remember this distinction:

```text
HTTP APIs are good for request/response service features.
Real-time communication is better for continuous, low-latency state exchange.
```

They are complementary. A real game service may use both. The Web Backend may handle accounts, inventory, scores, rewards, and leaderboards, while a Dedicated Game Server handles real-time match state.

---

## 5.4 Core Concepts: Requests, Responses, and API Contracts

HTTP communication is easier to understand when you divide it into a few basic parts.

```text
Client
  -> HTTP Request
      method + path + optional query parameters + headers + optional body
  -> API Server

API Server
  -> HTTP Response
      status code + headers + optional body
  -> Client
```

The client might be a game client, browser, mobile app, desktop app, test tool, admin dashboard, or another backend service. The API Server receives the request and returns a response.

### Web, Web Server, and API Server

The Internet is the larger network that connects computers. The Web is one major system built on top of the Internet. HTTP is one of the most important protocols used by the Web.

A Web Server often serves web pages, images, JavaScript files, and other static or dynamic web content. An API Server focuses on receiving structured requests and returning structured data. In many real systems, one server application may do both. For learning, it is easier to separate the roles.

| Term | Beginner-Friendly Meaning |
|---|---|
| Web | A system of resources accessed over the Internet, commonly through HTTP. |
| Web Server | A server that can return web pages, files, or other web resources. |
| API Server | A server that exposes operations clients can call through API requests. |
| Resource | An entity or concept the API works with, such as players, scores, rewards, or config. |
| Endpoint | A specific API address and operation, such as `GET /leaderboard`. |
| API Contract | A documented agreement about request shape, response shape, and possible results. |

In this guide, `endpoint` often means the method and path together when we need to identify the operation precisely. For example, `GET /leaderboard` and `POST /scores` are different API operations even though both are HTTP requests.

An API contract is not server code. It is a description of what both sides should expect.

For example:

```text
POST /scores
```

can mean:

```text
The client submits score data.
The server validates the authorization token and identifies the player from it.
The server validates the submitted score.
The server returns either success or an error response.
```

### HTTP Request

An HTTP request is what the client sends to the server.

A request usually includes:

- **Method**: what kind of action the client is requesting.
- **Path**: which API resource or operation the client is requesting.
- **Query parameters**: optional lookup options written after `?` in the request target.
- **Headers**: extra information about the request.
- **Body**: optional data sent with the request.

The examples in this chapter use an HTTP/1.1-style text format because it is easy to read. Newer HTTP versions may represent messages differently internally, but the beginner-level concepts of method, path, headers, body, and status code still apply.

Example request:

```http
POST /scores HTTP/1.1
Host: api.example-game.test
Content-Type: application/json
Authorization: Bearer <token>

{
  "stageId": "stage-01",
  "runId": "run-2026-06-01-0001",
  "score": 15200,
  "clearTimeSeconds": 84.5
}
```

Read this request as:

```text
The client is sending score data to the /scores endpoint.
The request body is JSON.
The client sends an authorization token. If the token is valid, the server can identify the player from it.
The client does not choose an arbitrary playerId in the request body.
```

In an authenticated API, the server usually identifies the player after validating the authorization token. The client should not be allowed to submit a score for any player ID it chooses.

A player ID in a path, query parameter, or body can identify which resource the client is asking about, but it does not prove who the client is. For private player data or sensitive actions, the server must still check authentication and authorization.

### HTTP Response

An HTTP response is what the server sends back to the client.

A response usually includes:

- **Status code**: whether the request succeeded, failed because of the client request, or failed because of a server problem.
- **Headers**: extra information about the response.
- **Body**: optional data returned to the client.

Example response:

```http
HTTP/1.1 201 Created
Content-Type: application/json
Location: /scores/score-9001

{
  "scoreId": "score-9001",
  "playerId": "player-001",
  "scoreRecordCreated": true,
  "rankPreview": 42
}
```

Read this response as:

```text
The server stored the score submission and created a score record.
The Location header points to the newly created score resource if the API exposes score records as addressable resources.
The response body is JSON.
The playerId in the response is the server-identified player, not a value the client was allowed to choose freely.
The client can use the returned data to update the result screen.
```

Some APIs return a `Location` header when they create a new resource. This is useful, but the exact response shape depends on the API contract.

### Methods and Paths

The method and path together describe the API operation.

```http
GET /leaderboard
POST /scores
GET /players/player-001
POST /rewards/daily
```

Common HTTP methods:

| Method | Common Beginner Meaning | Game Backend Example |
|---|---|---|
| `GET` | Read data. | `GET /leaderboard` retrieves ranking data. |
| `POST` | Create data or ask the server to perform an action. | `POST /scores` submits a score. |
| `PUT` | Replace a resource with a new complete version. | `PUT /players/{playerId}/profile` could replace a full profile. |
| `PATCH` | Partially update a resource. | `PATCH /players/{playerId}/nickname` could update only a nickname. |
| `DELETE` | Remove a resource or request removal. | `DELETE /sessions/{sessionId}` could end a stored session record. |

These meanings are common conventions; the actual behavior still depends on the API contract. The server decides what each endpoint actually does. Good API design makes the meaning clear and predictable.

### Query Parameters

Query parameters are especially common in read APIs that need lookup options. They are written after `?` in the request target.

```http
GET /leaderboard?season=weekly&limit=10
```

Read this as:

```text
The client is asking for leaderboard data.
season=weekly tells the server which leaderboard period to use.
limit=10 tells the server how many entries to return.
```

Query parameters are part of the API contract. They should be documented just like request body fields. They often appear in search, filtering, sorting, pagination, and leaderboard lookups.

The server should also validate query parameters. For example, `limit` should have a reasonable maximum value, and `season` should match an allowed season name.

A `GET` request is used to retrieve data, so you should not rely on a request body for `GET`. Put lookup options in the path or query parameters instead.

### Headers and Body

Headers provide metadata about the request or response. The body contains the main data when data needs to be sent.

Common request headers:

| Header | What It Usually Means |
|---|---|
| `Content-Type: application/json` | The request body is JSON. |
| `Accept: application/json` | The client prefers a JSON response. |
| `Authorization: Bearer <token>` | The client sends a token. If the token is valid, the server can identify the user. |
| `User-Agent` | The client tool or application describes itself. It is useful for diagnostics, but it should not be trusted as authentication. |

HTTP requests are usually handled as separate messages. The server should not assume that one request automatically proves who sent the next request. This is why authenticated API requests usually include a token, cookie, or other session credential.

A `POST`, `PUT`, or `PATCH` request often has a body because the client sends data to the server. For a `GET` request, use the path and query parameters for lookup information.

The body is where JSON often appears:

```json
{
  "stageId": "stage-01",
  "runId": "run-2026-06-01-0001",
  "score": 15200,
  "clearTimeSeconds": 84.5
}
```

### JSON

JSON is a shared data format that helps the client and server agree on what data is being sent.

JSON is popular because it is human-readable, compact enough for many API use cases, and supported by many languages and tools.

A JSON object uses key/value pairs:

```json
{
  "playerId": "player-001",
  "nickname": "NovaFox",
  "level": 12,
  "premium": false
}
```

In an API contract, it is not enough to say “send JSON.” The contract should explain which fields exist, which fields are required, and what type each field should have.

Example request body fields for an authenticated score submission API:

| Field | Type | Required? | Meaning |
|---|---:|---:|---|
| `stageId` | string | Yes | The stage where the score was earned. |
| `runId` | string | Yes | A server-issued or server-recorded identifier for one play attempt. It helps detect duplicate submissions, but it is not proof by itself that the score is valid. |
| `score` | number | Yes | The submitted score value. |
| `clearTimeSeconds` | number | Yes | How long the run took. The server can use this as one clue when checking whether the score is plausible. |

In this example, `runId` is best read as a server-issued or server-recorded identifier for one play attempt. The client sends it back with the score submission so the server can connect the result to a known run and detect duplicates. It is useful context, but it does not prove by itself that the score is valid.

The server should not blindly trust JSON values just because they are well formatted. A score can be valid JSON but still be suspicious or impossible under the game rules.

If an API contract includes `playerId` in a request body, path, or query parameter, the server must check whether the requested operation is allowed for the player identity from the validated authorization token. Otherwise, a client could try to access or submit data for another player.

### Status Codes

A status code tells the client the result category of the request.

| Code | Name | Beginner-Friendly Meaning | Game Backend Example |
|---:|---|---|---|
| `200` | OK | The request succeeded. | A leaderboard query returned data. |
| `201` | Created | Something was created successfully. | A score submission created a score record. |
| `400` | Bad Request | The request format or required data is wrong. | The request body is missing `score`. |
| `401` | Unauthorized | The client is not authenticated. | The token is missing or invalid. |
| `403` | Forbidden | The client is authenticated but not allowed to do this. | A normal player tries to call an admin-only endpoint. |
| `404` | Not Found | The requested resource does not exist. | The requested player ID cannot be found. |
| `409` | Conflict | The request conflicts with current server state. | The same `runId` was already submitted or was submitted again with conflicting data. |
| `500` | Internal Server Error | An unexpected server-side problem occurred. | The server failed unexpectedly while processing the request. |

A common beginner mistake is returning `200 OK` for everything. If the request failed because the client sent invalid data, a `400`-level status code is usually clearer. If the client is authenticated but not allowed to perform the action, `403 Forbidden` is clearer. If the server had an unexpected problem, a `500`-level status code is more appropriate.

The name `401 Unauthorized` can be confusing. In common API practice, `401` usually means the client is not authenticated or the authentication credential is invalid. `403` usually means the client is authenticated but still not allowed to perform the action. Some `401` responses also include authentication-related response headers. We will not go deep into that here; for now, remember the beginner distinction between not authenticated and authenticated but not allowed.

For unexpected server errors, the response should stay generic. Detailed error information should be recorded in server logs, not exposed directly to the client.

---

## 5.5 Example Scenario: Score Submission API Contract

Let’s look at a small arcade-style game scenario.

A player finishes a stage run. The game client wants to submit the score to the backend so the server can validate it and possibly include it in a leaderboard.

From the player's point of view, this looks simple:

```text
The result screen appears.
The player sees the score.
The leaderboard may update.
```

At the API level, the flow needs a clear contract.

### API Operation

```text
POST /scores
```

Purpose:

```text
Submit a score after a stage run or play attempt.
```

This operation is a contract example. It describes how the request and response could look. It is not a requirement to implement this endpoint in this chapter.

### Request

Required headers:

```http
Content-Type: application/json
Authorization: Bearer <token>
```

In this example, the server identifies the player after validating the authorization token. The request body does not include `playerId` because the server should not let the client choose which player receives the score. A bearer token can act like a credential, so it should be protected in transit with HTTPS. Avoid writing full tokens into application logs, access logs, screenshots, or shared debugging notes; redact them when they must be referenced.

Example request body:

```json
{
  "stageId": "stage-01",
  "runId": "run-2026-06-01-0001",
  "score": 15200,
  "clearTimeSeconds": 84.5
}
```

Request body fields:

| Field | Type | Required? | Meaning |
|---|---:|---:|---|
| `stageId` | string | Yes | The stage that was cleared. |
| `runId` | string | Yes | A server-issued or server-recorded identifier for one play attempt. It helps detect duplicate submissions, but it is not proof by itself that the score is valid. |
| `score` | number | Yes | The score reported by the client. |
| `clearTimeSeconds` | number | Yes | How long the run took. |

In this example, `runId` represents one stage run or play attempt. This contract assumes that the server has already issued or recorded the run before the score submission happens. How that earlier run-start flow works is outside the scope of this chapter. The client later sends the same `runId` with the score submission. This helps the server check whether the run exists, belongs to the authenticated player, matches the submitted stage, and has not already been submitted.

The `runId` helps with duplicate detection and basic validation context, but it is not proof by itself that the gameplay was legitimate. Score plausibility, stage rules, timing, account state, and other server-side checks may still matter.

If a different API design includes `playerId` in the request body, path, or query parameter, the server must compare the requested operation with the authenticated player identity from the validated token. If the authenticated player is not allowed to perform that operation or access that player resource, the request should be rejected or treated as forbidden.

### Success Response

A successful score submission might return:

```http
HTTP/1.1 201 Created
Content-Type: application/json
Location: /scores/score-9001
```

```json
{
  "scoreId": "score-9001",
  "playerId": "player-001",
  "scoreRecordCreated": true,
  "rankPreview": 42
}
```

This tells the client that the score record was created. The `Location` header points to the newly created score resource if the API exposes score records as addressable resources. The `playerId` is shown as a server-derived value in this example. The `rankPreview` field is only an example. A real API may return different fields depending on the game design.

### Error Responses

Possible error responses:

| Status | Situation | Example Reason |
|---:|---|---|
| `400 Bad Request` | The request body is invalid. | `score` is missing, is not a number, or the body contains a field that is not allowed by this strict contract, such as `playerId` in this example. |
| `401 Unauthorized` | Authentication failed. | The token is missing or invalid. |
| `403 Forbidden` | The authenticated player is not allowed to perform this action. | The request tries to access or modify a player resource that the authenticated player is not allowed to use. |
| `404 Not Found` | A referenced resource does not exist. | `stageId` does not match a known stage, or the submitted `runId` is not known for this authenticated player and stage. |
| `409 Conflict` | The request conflicts with current server state. | The same `runId` was already submitted, or the same `runId` appears again with changed score data. Identical retries may be handled separately according to the API contract. |
| `500 Internal Server Error` | An unexpected server problem occurred. | The server failed while processing the request. |

For a sensitive run identifier, the exact error response may depend on the API contract and security policy. The important point is that the server should not accept a run ID that is not connected to the authenticated player and stage.

A duplicate `runId` with changed score or time values should usually be treated as a conflict or suspicious duplicate. An identical retry is different: it repeats the same `runId` with the same important values because the client did not receive the first response. Some APIs handle that case by safely returning the previous stored result with the status code and response body defined by the API contract. The contract should define this behavior clearly.

This is related to idempotency, but it is not exactly the same as a generic client-generated idempotency key. A separate `Idempotency-Key` header or `idempotencyKey` field can be used when the main goal is only to make HTTP retries safe.

Example request validation error response:

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json
```

```json
{
  "error": "InvalidRequest",
  "message": "The score field is required and must be a number."
}
```

Example unexpected server error response:

```http
HTTP/1.1 500 Internal Server Error
Content-Type: application/json
```

```json
{
  "error": "ServerError",
  "message": "An unexpected server error occurred."
}
```

The `500` response should stay generic. Detailed information such as stack traces, database error messages, secret values, or internal file paths should be recorded in server logs, not sent directly to the client.

### What the Server Should Validate

The server should validate important values before accepting the score.

Validation questions may include:

- Is the request authenticated?
- After the authorization token is validated, which player is identified by it?
- Does the request include all required fields?
- Is `score` a number?
- Is `clearTimeSeconds` a number?
- Is `clearTimeSeconds` positive and plausible?
- Does `stageId` refer to a real stage?
- Does this `runId` exist as a server-issued or server-recorded run for this authenticated player?
- Does the `runId` match the submitted `stageId`?
- If the `runId` is unknown or mismatched, which contract-defined error response should be returned?
- Has this `runId` already been submitted? If so, are the important values identical to a previous stored submission or conflicting?
- How does the API contract handle identical retries?
- Is the submitted score possible under the game rules?
- Are query parameters, if present, within allowed values and reasonable limits?
- If a player identity value appears in the path, query parameters, or request body, is the authenticated player allowed to access or modify that player resource?

The server may not be able to prove every detail from one request, but it should not accept sensitive values blindly. Scores, rewards, currencies, items, and ranking data affect fairness and operations.

---

## 5.6 REST-Style API Design at a Beginner Level

REST is a design style for APIs. At the beginner level, the most useful idea is this:

```text
Organize API paths around resources.
```

A resource is an entity or concept the API works with. In a game backend, resources may include players, scores, leaderboards, rewards, inventory items, events, or config.

REST-style paths often use nouns:

```http
GET /players/player-001
POST /scores
GET /leaderboard?season=weekly&limit=10
GET /config
POST /rewards/daily
```

A path should help developers understand which resource the API operation is about.

| Less Clear | More REST-Style | Why It Is Clearer |
|---|---|---|
| `GET /getLeaderboard` | `GET /leaderboard` | The method already says this is a read operation. |
| `POST /submitScore` | `POST /scores` | The resource is `scores`; `POST` shows that data is being submitted. |
| `GET /getPlayer?id=player-001` | `GET /players/player-001` | The path identifies the player resource. Private data still requires authorization. |
| `POST /claimDailyReward` | `POST /rewards/daily` | The path points to the daily reward resource. |

This does not mean every real API must be strictly RESTful. Some services use action-based or RPC-style APIs, especially when operations do not fit resource naming cleanly.

For this guide, use REST-style thinking as a beginner-friendly resource-oriented naming habit:

- Use paths that describe resources.
- Use methods to show the general kind of operation.
- Use query parameters for filtering, sorting, pagination, or lookup options, and document how those values are validated.
- Keep names consistent.
- Avoid paths that hide the resource being changed.
- Document request and response examples clearly.

Clear documented behavior matters more than forcing every endpoint into a strict REST label. If the client and server teams can read the contract and understand the expected behavior, the API is easier to use, test, and operate.

---

## 5.7 Browser Rules, HTTPS, and API Documentation

HTTP APIs often appear together with other terms: CORS, HTTPS, OpenAPI, and Swagger. You do not need to master all of them now, but you should know where each one fits.

### CORS

CORS stands for Cross-Origin Resource Sharing. It is a browser security mechanism related to whether browser-based code is allowed to read responses from another origin.

An origin is made from the scheme, host, and port.

```text
https://example.com
https://api.example.com
http://localhost:3000
```

These can be different origins. If browser-based code from one origin calls an API from another origin, the server must return the right CORS headers, and the browser enforces the result. This is why the same API call may work in curl or Postman but fail in a browser.

Important beginner notes:

- CORS is enforced by browsers.
- CORS is not a general access-control system for all HTTP clients.
- Some cross-origin requests use a preflight `OPTIONS` request before the actual request.
- Cross-origin browser requests that include headers such as `Authorization` often require a preflight `OPTIONS` request before the actual request.
- A CORS error does not always mean the server never received the request. Some requests are stopped during preflight, while some requests may reach the server but have their responses hidden from browser-based code.
- CORS is not the same as authentication.
- CORS is not encryption.
- CORS does not replace server-side validation.

### HTTPS

HTTPS is HTTP protected with TLS. It helps protect data in transit.

HTTPS helps with:

- Reducing the chance that someone reads sensitive data in transit.
- Reducing the chance that someone tampers with data in transit.
- Helping the client know it is talking to the intended server.

Because a bearer token can act like a credential, it should be protected in transit with HTTPS. Avoid writing full tokens into application logs, access logs, screenshots, or shared debugging notes; redact them when they must be referenced.

HTTPS does not solve every security problem. The server still needs authentication, authorization, validation, rate limiting, logging, and safe secret management. HTTPS protects the communication channel, not the correctness of game rules.

### API Documentation, OpenAPI, and Swagger

API documentation helps developers, testers, operators, and tools understand how to call an API correctly.

Good API documentation usually includes:

- Method and path.
- Query parameters, if they exist.
- Purpose of the endpoint.
- Required headers.
- Request body shape.
- Response body shape.
- Success status code.
- Possible error status codes.
- Example requests and responses.
- Validation rules or important cautions.

OpenAPI is a specification for describing HTTP APIs in a structured, machine-readable form. Swagger is a set of tools commonly used with OpenAPI, such as interactive API documentation.

At this stage, you only need the big idea:

```text
OpenAPI describes the API contract in a structured, machine-readable form.
Swagger tools can help developers read and interact with that contract.
```

You are not expected to write a full OpenAPI specification in this chapter.

---

## 5.8 Tools for Observing API Behavior

Several tools help you inspect HTTP requests and responses.

| Tool | Useful For | Beginner Note |
|---|---|---|
| Browser DevTools Network panel | Observing browser requests and responses. | Useful when checking headers, status codes, query parameters, response bodies, and CORS errors. |
| curl | Sending simple HTTP requests from the terminal. | Useful for seeing request/response behavior without a full client UI. |
| Postman | Saving and repeating API requests in a visual tool. | Useful for exploring APIs, but it has many features you do not need immediately. |

In this chapter, use these tools mainly to observe request and response behavior. You are not required to run a local API Server here.

For example, when you later inspect an API call, you can ask:

```text
Which method was used?
Which path was requested?
Were there query parameters?
Which status code came back?
Was the body JSON?
Did the browser block the response because of CORS?
```

Focus on becoming comfortable with request/response details, not on mastering every feature of each tool.

---

## 5.9 Learning Practice

This Learning Practice is for reading and understanding API contracts. You are not expected to implement these endpoints in this chapter.

### Goal

Read a simple API contract and identify the important parts of the HTTP request and response.

### Contract to Read

```text
API Operation: POST /scores
Purpose: Submit a score after a stage run or play attempt.
Required Headers:
- Content-Type: application/json
- Authorization: Bearer <token>
Success Status: 201 Created
Optional Success Header: Location: /scores/{scoreId}
```

The optional `Location` header is useful when the API exposes created score records as addressable resources.

Request body:

```json
{
  "stageId": "stage-01",
  "runId": "run-2026-06-01-0001",
  "score": 15200,
  "clearTimeSeconds": 84.5
}
```

Request body fields:

| Field | Type | Required? | What to Check |
|---|---:|---:|---|
| `stageId` | string | Yes | The stage exists. |
| `runId` | string | Yes | The server-issued or server-recorded run exists, belongs to the authenticated player and stage, and was not already submitted with conflicting data. |
| `score` | number | Yes | The score is plausible for the stage. |
| `clearTimeSeconds` | number | Yes | The value is positive and plausible. |

In this contract, the server identifies the player after validating the authorization token. The `runId` represents one stage run or play attempt that the server issued or recorded before score submission. How that earlier run-start flow works is outside the scope of this chapter. The `runId` helps the server detect duplicate submissions, but it does not prove by itself that the gameplay result is valid. If a contract includes `playerId` in the request body, path, or query parameter, the server must check that the authenticated player is allowed to access or modify that player resource.

Success response body:

```json
{
  "scoreId": "score-9001",
  "playerId": "player-001",
  "scoreRecordCreated": true,
  "rankPreview": 42
}
```

Possible error statuses:

```text
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
500 Internal Server Error
```

### Steps

1. Identify the HTTP method.
2. Identify the API path.
3. List the required request headers.
4. List the required request body fields.
5. Identify how the server knows which player sent the request after validating the token.
6. Identify what `runId` represents in this contract.
7. Identify the success status code.
8. Identify at least three possible error statuses.
9. Mark which fields the server should validate.
10. Explain why the server should not blindly trust the submitted `score` value.
11. Explain what should happen if a request body, path, or query parameter includes a `playerId` that the authenticated player is not allowed to use.

### Compare These Requests

Request A:

```json
{
  "stageId": "stage-01",
  "runId": "run-2026-06-01-0001",
  "score": 15200,
  "clearTimeSeconds": 84.5
}
```

Request B:

```json
{
  "stageId": "stage-01",
  "runId": "run-2026-06-01-0002",
  "score": "very high",
  "clearTimeSeconds": -3
}
```

Request C:

```json
{
  "stageId": "stage-01",
  "runId": "run-2026-06-01-0001",
  "score": 15300,
  "clearTimeSeconds": 82.0
}
```

Request D:

```json
{
  "playerId": "another-player",
  "stageId": "stage-01",
  "runId": "run-2026-06-01-0003",
  "score": 16000,
  "clearTimeSeconds": 81.0
}
```

Request B is JSON, but it contains values the server should reject or investigate. The `score` value is not a number, and the clear time is negative. Valid JSON does not automatically mean valid game data.

Request C may look valid by type, but it reuses the same `runId` as Request A while changing the score and clear time. If Request A was already stored, Request C should usually be treated as a conflict or suspicious duplicate according to the API contract.

An identical retry is different: it repeats the same `runId` with the same important values because the client did not receive the first response. Some APIs handle that case by safely returning the previous stored result with the status code and response body defined by the API contract. The contract should make this behavior clear.

Request D includes a `playerId` even though this contract identifies the player from the validated token. The server should not accept `another-player` just because it appears in JSON. For this strict `POST /scores` contract, `playerId` is not an allowed request body field, so `400 Bad Request` can be a clear response. If another API intentionally includes a player ID in the path, query, or body, but the authenticated player is not allowed to access that player resource, `403 Forbidden` may be clearer. Some APIs may ignore unknown fields, but that behavior should be defined explicitly in the contract and should not allow the client to choose another player identity.

### What to Observe

You should notice:

- An API contract is not server code.
- Method and path describe what the client is asking for.
- Query parameters, when present, are part of the contract and should be validated when they affect server behavior.
- Headers provide extra context such as body format and authentication.
- JSON body fields need names, types, and required/optional rules.
- Status codes help the client understand success and failure.
- A validated authentication credential can identify the player, but important client-sent values still need validation.
- A server-issued or server-recorded `runId` can help detect duplicate submissions, but it does not prove by itself that the score is valid.
- A request body, path, or query parameter can contain a player ID, but it does not prove who the client is.
- The server should not expose detailed internal error information to the client.

### Short Note

Write two or three sentences answering this question:

```text
Why is it useful to write or read an API contract before studying how an API Server handles requests internally?
```

---

## 5.10 Common Mistakes

1. **Thinking HTTP Is Only for Websites**  
   HTTP is used by websites, but it is also used by mobile apps, game clients, admin dashboards, backend services, and testing tools. Many game backend features use HTTP APIs because request/response communication fits them well.

2. **Using `GET` for Every Operation**  
   `GET` is commonly used for reading data. It should not be used as the default for operations that create data, submit results, or change server state. For score submission, `POST /scores` is clearer than `GET /submitScore`.

3. **Relying on a Request Body in `GET`**  
   A `GET` request is for retrieving data. If the client needs lookup options, use the path or query parameters, such as `GET /leaderboard?season=weekly&limit=10`.

4. **Returning `200 OK` for Every Result**  
   If the request is missing required data, returning `200 OK` can confuse the client. A clear error status such as `400 Bad Request` helps the client understand that the request should be fixed.

5. **Ignoring Headers**  
   Headers such as `Content-Type` and `Authorization` are part of the contract. If `Content-Type: application/json` is missing, the server may not know how to interpret the request body. If authorization data is missing or invalid, the server may not know who sent the request. A descriptive header such as `User-Agent` can help with diagnostics, but it should not be trusted as authentication.

6. **Trusting `playerId` from the Body, Path, or Query**  
   In an authenticated API, the server should usually identify the player after validating the authorization token. If the request body, path, or query parameters include a `playerId`, the server must check whether the authenticated player is allowed to use it before accepting sensitive data such as scores or rewards. For strict contracts, rejecting unexpected identity fields is often clearer than silently ignoring them.

7. **Treating `runId` as Proof of a Valid Score**  
   A server-issued or server-recorded `runId` can help the server connect a submission to a known play attempt and detect duplicates. It does not prove by itself that the score is possible or fair. The server still needs validation based on game rules and server-side records.

8. **Treating Valid JSON as Valid Game Data**  
   A request can be valid JSON and still be invalid game data. For example, `score: 999999999` may be a valid number but impossible under the game rules. The server still needs validation.

9. **Confusing CORS with HTTPS**  
   CORS controls whether browser-based code can read cross-origin responses. HTTPS protects HTTP communication in transit. They solve different problems and do not replace each other. A CORS error also does not always prove that the server never received the request.

10. **Thinking HTTPS Replaces Server-Side Validation**  
    HTTPS protects the communication channel. It does not prove that a score is possible, that a reward can be claimed, or that a user has permission to perform an action. Validation and authorization still matter.

11. **Exposing Internal Error Details to the Client**  
    An error response should help the client understand the result without revealing sensitive internal details. Stack traces, database error messages, file paths, and secret values should stay in protected server logs, not in public API responses.

12. **Letting API Documentation Drift Away from Actual Server Behavior**  
    If the documentation says the request body uses `score`, but the server actually expects `points`, client developers, testers, and operators can all become confused. API documentation should stay in sync with actual server behavior.

13. **Treating an API Contract as a Complete Backend Design**  
    An API contract explains the request and response boundary. It does not fully explain storage, authentication, authorization, caching, logging, retries, or operations. Those topics appear in later chapters.

---

## 5.11 Chapter Summary

In this chapter, we looked at Web, HTTP, and API concepts from a game backend perspective.

The key ideas are:

- HTTP APIs are useful for many request/response game backend features.
- A request usually includes a method, path, optional query parameters, headers, and optional body.
- A response usually includes a status code, headers, and optional body.
- JSON is a shared data format that helps the client and server agree on what data is being sent.
- An API contract documents what the client sends and what the server returns.
- Authenticated APIs should usually identify the player after validating the token, not from an arbitrary `playerId` value in the body, path, or query parameters.
- A `runId` in this chapter means a server-issued or server-recorded play attempt ID that helps with duplicate detection, not a standalone proof that the score is valid.
- REST-style API design organizes paths around resources such as players, scores, rewards, and leaderboards.
- Status codes help clients distinguish success, client request problems, authentication problems, permission problems, missing resources, conflicts, and server errors.
- CORS and HTTPS are related to API communication, but they solve different problems.
- API documentation tools such as OpenAPI and Swagger help teams describe and review API contracts.
- The server should not blindly trust important values sent by the client.
- Unexpected server error responses should avoid exposing internal details.

In Chapter 6, we will use these API examples to understand how an API Server receives requests, chooses the appropriate processing logic, validates data, and returns responses. We will focus on the server-side concept flow rather than building a complete server implementation.

---

## 5.12 Quiz

### Question 1

Which game feature best fits a simple HTTP request/response API?

A. Synchronizing player positions thirty times per second during a match.  
B. Submitting a completed stage score to the server.  
C. Running a low-latency physics simulation shared by all players.  
D. Predicting client movement before the server responds.

**Answer: B**

**Explanation:**  
Score submission usually follows a clear request/response pattern. The client sends result data, and the server validates it and returns a result.

### Question 2

Which HTTP method is the most natural beginner-level choice for looking up leaderboard data?

A. `GET`  
B. `POST`  
C. `PATCH`  
D. `DELETE`

**Answer: A**

**Explanation:**  
`GET` is commonly used for reading data. A leaderboard lookup such as `GET /leaderboard?season=weekly&limit=10` is a natural request/response read operation.

### Question 3

A `POST /scores` request is missing the required `score` field. Which status code is usually the clearest response?

A. `200 OK`  
B. `201 Created`  
C. `400 Bad Request`  
D. `500 Internal Server Error`

**Answer: C**

**Explanation:**  
A missing required field means the client sent an invalid request. `400 Bad Request` communicates that the request should be corrected.

### Question 4

What does `Content-Type: application/json` usually tell the server?

A. The request body is JSON.  
B. The request is automatically authenticated.  
C. The request can ignore validation.  
D. The response must always be `200 OK`.

**Answer: A**

**Explanation:**  
`Content-Type: application/json` tells the server that the request body is JSON. It does not authenticate the user or replace validation.

### Question 5

Which statement best distinguishes CORS and HTTPS?

A. CORS encrypts network traffic, while HTTPS controls leaderboard ranking.  
B. CORS and HTTPS are the same concept.  
C. CORS is about browser cross-origin access rules, while HTTPS protects HTTP communication in transit.  
D. HTTPS means the server no longer needs authentication or validation.

**Answer: C**

**Explanation:**  
CORS controls whether browser-based code can read cross-origin responses. HTTPS protects HTTP communication with TLS. They solve different problems.

### Question 6

Why is an API contract useful?

A. It replaces all server-side validation.  
B. It documents what the client sends, what the server returns, and which success or error results are possible.  
C. It guarantees that the database schema is perfect.  
D. It removes the need for status codes.

**Answer: B**

**Explanation:**  
An API contract helps both sides understand the request shape, response shape, headers, status codes, and validation expectations. It does not replace server logic or data design.

### Question 7

In an authenticated `POST /scores` API, what should the server do if the request includes a `playerId` that is not allowed by the API contract or that the authenticated player is not allowed to use?

A. Accept the request because the JSON is valid.  
B. Ignore authentication and trust the body.  
C. Reject the request as invalid or forbidden, depending on the contract.  
D. Convert the request to `GET`.

**Answer: C**

**Explanation:**  
The server should not allow a client to submit sensitive data for another player. If `playerId` is not allowed by a strict request body contract, `400 Bad Request` may be clear. If the player ID is part of the contract but the authenticated player is not allowed to use that player resource, `403 Forbidden` may be clearer. Authentication identifies who sent the request after the credential is validated, and important client-sent values still need validation.

### Question 8

A browser shows a CORS error after a cross-origin API call. Which statement is the safest beginner-level interpretation?

A. HTTPS is disabled automatically.  
B. The request body was definitely invalid JSON.  
C. The browser blocked browser-based code from reading the response, or the request may have been stopped during preflight.  
D. The API contract no longer needs authentication.

**Answer: C**

**Explanation:**  
CORS is enforced by browsers. Some requests are stopped during preflight, while some requests may reach the server but have their responses hidden from browser-based code.

---

## 5.13 Further Reading

You do not need to read all of these resources immediately. Use them as references when you want to review a specific part of HTTP and API communication.

### HTTP and API Basics

- [MDN — An overview of HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview)  
  Use this when you want to review the basic structure of HTTP request/response communication.

- [MDN — HTTP request methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods)  
  Use this when you want to check the meaning of methods such as `GET`, `POST`, `PUT`, `PATCH`, and `DELETE`.

- [MDN — HTTP response status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status)  
  Use this when you want to review what common status codes mean.

- [MDN — HTTP messages](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Messages)  
  Use this when you want to understand the structure of HTTP requests and responses in more detail.

### JSON

- [MDN — Working with JSON](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/JSON)  
  Use this when you want to review JSON as a data format.

### Browser, Security, and Documentation

- [MDN — Cross-Origin Resource Sharing](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)  
  Use this when browser-based API calls fail because of cross-origin access rules.

- [MDN — HTTPS](https://developer.mozilla.org/en-US/docs/Glossary/HTTPS)  
  Use this when you want to review what HTTPS means at a beginner level.

- [OpenAPI — Learn OpenAPI](https://learn.openapis.org/)  
  Use this later when you want to understand formal API contract documentation.

- [Swagger Documentation](https://swagger.io/docs/)  
  Use this as a reference for tools commonly used around OpenAPI.

### API Observation Tools

- [Chrome DevTools — Network panel](https://developer.chrome.com/docs/devtools/network/overview)  
  Use this when you want to observe requests and responses made by a browser.

- [curl — Tutorial](https://curl.se/docs/tutorial.html)  
  Use this when you want to learn how to send HTTP requests from the terminal.

- [Postman Docs — Send API requests](https://learning.postman.com/docs/use/send-requests/requests/)  
  Use this when you want a visual tool for sending and saving API requests.
