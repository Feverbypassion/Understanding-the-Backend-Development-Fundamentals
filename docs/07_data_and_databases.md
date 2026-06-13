# 7. Data and Databases

In Chapter 6, we studied the conceptual flow of a small backend API server. Now, let’s ask a new question: if a
backend handles player and score data, where should that data be stored so it does not disappear when the
server restarts?

That question is the starting point of this chapter.

A backend is not only a place that receives requests and returns responses. It also needs to remember
important information: player accounts, profiles, inventory, rewards, scores, purchase records, event
participation, and support history. Data is one of the main reasons a backend exists.

In this chapter, we will study how backend data is stored, organized, queried, and protected. We will use
simple relational database concepts and SQL examples, but the goal is not to master SQL. The goal is to
understand the role of databases in a game backend.

---

## 7.1 How to Read This Chapter

This chapter is a concept-first introduction to backend data and databases.

You are not expected to connect an API Server to an actual database in this chapter. You are also not expected
to design a production database schema, write migration files, use an ORM, tune query performance, or operate
Redis or MongoDB.

At this stage, focus on these questions:

- Why does backend data need persistent storage?
- What kinds of data appear in a game backend?
- How does a relational database organize data into tables, rows, and columns?
- What do basic SQL statements mean when you read them?
- Why do transactions, indexes, and caches matter?
- Why is cache not the source of truth for important game data?
- When might NoSQL options, including key-value stores, appear in backend discussions?

The examples in this chapter use simple game backend scenarios such as score submission, per-player best-score
leaderboard lookup, inventory lookup, currency balance lookup, and daily reward claiming.

The SQL snippets are examples to read and interpret. Read them slowly and ask what data is being stored,
updated, or queried.

This chapter keeps the scope small by focusing on the idea, not the implementation. Actual database
integration, migrations, ORM usage, connection pooling, and performance tuning belong to a later Web Backend
course.

---

## 7.2 What You Will Learn

By the end of this chapter, you should be able to explain:

- Why a backend needs persistent data storage.
- Why server memory alone is not enough for important player data.
- The difference between Game Master Data, User Data, Operational Data, Log Data, Temporary Data, and
  Cached Result / Auxiliary Data.
- The meaning of table, row, column, primary key, foreign key, and constraint.
- How to read simple SQL examples for `INSERT`, `SELECT`, `UPDATE`, `DELETE`, and `JOIN`.
- Why player identity, score history, maintained per-player best-score state, item definitions, item ownership,
  currency balances, and reward claims are separated into different records.
- The difference between current state, structured history, ordinary logs, and auxiliary cached data.
- Why transactions help protect multi-step changes such as reward grants.
- Why indexes can help some queries but are not free.
- Why cache can make reads faster but should not become the final source of truth for important records.
- Why NoSQL options, including key-value stores, can fit some problems but are not automatic replacements for
  relational databases.

The most important message is simple:

> Important backend data needs a reliable place to live.

---

## 7.3 Why Data Matters in a Backend

Let’s start with a simple analogy.

> A database is the durable memory of the backend.

In this analogy, “memory” does not mean RAM. It means a reliable place where important records can survive
beyond one request, one server process, or one restart.

An API Server can receive a request, check it, and decide what response to return. But if the result only
stays in server memory, it can disappear when the server restarts.

Imagine a small score submission flow:

```text
[Game Client]
   | POST /scores
   v
[API Server]
   | store score only in server memory
   v
[Memory]
```

This may work for a temporary demonstration. But it is dangerous for real player data. If the API Server
restarts, the memory is cleared. The scores disappear.

For a game service, disappearing data is not a minor problem. It can affect player trust, fairness, customer
support, and live operations.

| Data | Problem if it disappears |
|---|---|
| Player account | The same player may not be recognized again. |
| Player profile | Nickname, level, or progress may be lost. |
| Score records | The leaderboard may reset or become incorrect. |
| Inventory items | Earned or purchased items may disappear. |
| Currency records | Balance checks, spending history, and grant investigation become difficult. |
| Purchase history | Customer support and re-grant checks become difficult. |
| Reward history | Duplicate rewards or missing rewards may occur. |
| Event participation | Operators may not know who joined or received rewards. |

A database helps the backend store data persistently. Persistent data is data that should remain available
beyond a single request or a single server process.

A more realistic conceptual flow looks like this:

```text
[Game Client]
   | Request
   v
[API Server]
   | Read or write persistent data
   v
[Database]
   |
   v
[API Server]
   | Response
   v
[Game Client]
```

The game client usually does not connect directly to the database. The client talks to the API Server, and the
API Server talks to the database.

This separation matters for several reasons:

- Database credentials should not be exposed to the game client.
- The API Server can authenticate the player before reading or writing data.
- The API Server can check authorization, validation rules, and service logic.
- The database can stay behind a protected backend boundary.

If a game client could directly modify inventory, currency, scores, rewards, or purchase records, the service
would be difficult to protect.

### Backend memory and database storage

It is useful to distinguish server memory from database storage.

| Storage place | Good for | Main risk |
|---|---|---|
| Server memory | Temporary request work and short-lived state | Disappears when the process restarts |
| Database | Persistent player and service records | Requires careful schema and query design |
| Cache | Frequently read or short-lived data | May expire, disappear, or become outdated |

A backend can use all three. The important part is choosing the right place for each kind of data.

For example, calculating the result of one request can happen in memory. Storing the player’s inventory should
happen in a database. Serving a frequently viewed leaderboard may use cache, but the original score records
should still be stored in a reliable database.

### Original records, maintained state, and derived data

Another useful distinction is original records, maintained current state, and derived or auxiliary data.

Original records describe what happened or what the service directly trusts. Maintained current state is a stored
summary kept up to date for a feature. Derived or auxiliary data is calculated, summarized, copied, or
reorganized from reliable database records.

| Example | Reliable database records | Maintained or auxiliary data |
|---|---|---|
| Per-player best-score leaderboard | Score history in `scores` | Maintained best-score state; cached top 100 result |
| Daily reward | Reward claim record and inventory or currency update | Recently displayed reward result |
| Inventory | Owned item records | Cached inventory response |
| Currency | Current balance and ledger-like change history | Cached currency balance response |
| Event dashboard | Event settings and participation records | Summary chart shown to operators |

If derived data disappears, the backend should usually be able to rebuild it from reliable database records.
If original history or other trusted records disappear, the service may lose the truth of what happened.

A maintained current-state table, such as `player_stage_best_scores`, can sit between original history and
cache. In this chapter, `player_stage_best_scores` is the table version of maintained best-score state. In
simpler terms, it stores the current best score that the backend has chosen for each player and stage. It may
be derived from score submission history, but the backend may still treat it as the current ranking state if
the service is designed that way.

The important point is to know which data is original history, which data is maintained current state, and
which data is only an auxiliary cached copy.

Source of truth means the reliable record or set of records that the backend trusts as the final reference. A
database often stores the records that become the backend's source of truth, but the source of truth may be a
set of reliable records rather than one single table. We will return to this idea in Section 7.10.

---

## 7.4 Types of Game Backend Data

Game backends store many kinds of data. Not all data has the same purpose, lifetime, or risk level.

At the beginner level, it is useful to group backend data into several categories.

### Game Master Data

Game Master Data describes game rules and definitions. It is usually created by developers, designers, or
operators rather than by individual players.

Examples:

- Item definitions
- Stage definitions
- Character definitions
- Reward tables
- Product definitions
- Currency definitions
- Event configuration
- Remote Config values

An item definition might say:

| item_id | name | item_type | max_stack |
|---|---|---|---:|
| potion_small | Small Potion | consumable | 99 |
| material_iron | Iron Material | material | 999 |
| sword_iron | Iron Sword | weapon | 1 |

This table does not say which player owns the item. It only defines what the item is.

Currency may also have definitions, such as which currency types exist in the game. For example:

| currency_type | display_name | max_balance |
|---|---|---:|
| coin_gold | Gold Coin | 999999 |
| gem_premium | Premium Gem | 99999 |

This currency definition table describes what currency types exist. It does not describe a player's actual
balance. In this chapter, we will not put `coin_gold` as a row inside `game_items`. We will handle player
currency balances through `player_currencies` and currency changes through `currency_ledger`.

Game Master Data often changes when the game is updated or when operators configure events. Some Game Master
Data may be stored in a relational database, some in JSON-like files, and some in a Remote Config system.

### User Data

User Data belongs to a specific player or account.

Examples:

- Account ID
- Profile nickname
- Player level
- Experience points
- Inventory items
- Currency balance
- Cleared stages
- Score submission history
- Current best score for a leaderboard
- Reward claim history
- Purchase grant history

If a player owns three small potions, that is User Data. The definition of “Small Potion” is Game Master Data,
but the fact that `player-001` owns three of them is User Data.

This distinction is very important.

```text
Game Master Data: What is a Small Potion?
User Data: How many Small Potions does this player own?

Game Master Data: What is `coin_gold` as a currency type?
User Data: How much `coin_gold` does this player currently have?
```

### Operational Data

Operational Data supports live service management.

Examples:

- Event schedule
- Maintenance notice
- Admin action history
- Reward re-grant record
- Customer support investigation note
- Feature flag state
- Remote Config change history

Operational Data matters because games are services. Operators may need to change events, inspect player
issues, adjust notices, review suspicious scores, or check reward grants.

Operational Data should be handled carefully because operator actions can affect live data. Many operations
features also need permissions and audit logs.

### Log Data

Log Data records what happened in the system.

Examples:

```text
2026-06-01T10:05:21Z INFO  POST /scores playerId=player-001 stageId=stage-01 score=15200
2026-06-01T10:05:25Z WARN  POST /rewards/daily playerId=player-001 result=AlreadyClaimed
2026-06-01T10:05:30Z ERROR GET /inventory playerId=player-404 error=PlayerNotFound
```

Logs are useful for debugging, operations, and incident investigation. They are not the same as normal player
records. A player’s current inventory should not be reconstructed only from ordinary application logs unless a
special event-sourcing design is intentionally used.

Some important service facts should be stored as structured history, not only as ordinary text logs. Currency
changes, item grants, purchase grants, reward claims, and admin actions are common examples.

At this stage, treat logs as records that help people understand what happened. We will return to structured
history when we compare current state and history in Section 7.8.

### Temporary Data

Temporary Data is needed only for a short time.

Examples:

- Login session state
- One-time verification code
- Short-lived matchmaking state
- Temporary rate-limit counter
- Temporary request idempotency key
- Short TTL cooldown flag

TTL means Time To Live. It describes how long a piece of temporary data should stay before it expires.

Temporary Data can often live in a cache or key-value store, but only if the system is designed for that
behavior. Temporary does not mean unimportant. A one-time code or idempotency key may be short-lived, but it
can still protect the service from errors or abuse.

### Cached Result / Auxiliary Data

Cached or auxiliary data is stored to make reads faster or reduce repeated work.

Examples:

- Top 100 per-player best-score leaderboard for a stage
- Cached inventory response
- Cached current event settings
- Cached Remote Config response
- Cached item definition lookup
- Cached currency balance response

A cached result is usually not an original record. It is an auxiliary copy or computed result.

For example, suppose the database stores score submission history and maintained best-score state. The cache may
store only the current top 100 per-player best-score leaderboard for fast display.

```text
Score submission history           --> Database
Maintained best-score state        --> Maintained best-score table
Cached top 100 per-player response --> Cache
```

Later, Section 7.7 will note that real services may use a different design, such as calculating this state
from history or using a materialized view.

If the cached per-player best-score top 100 disappears, the backend can rebuild it from reliable database
records, such as `player_stage_best_scores`, or from `scores` if the service recalculates best scores from
history. If the score submission history disappears, the backend may not know the true ranking history anymore.

### A simple classification table

| Data example | Likely category | Why |
|---|---|---|
| Item definition for `sword_iron` | Game Master Data | Defines what the item is |
| Currency definition for `coin_gold` | Game Master Data | Defines what the currency type means |
| `player-001` owns `potion_small` x3 | User Data | Belongs to a specific player |
| `player-001` has `coin_gold = 1200` | User Data | Describes a specific player's current currency state |
| Weekend event schedule | Operational Data | Used to operate a live event |
| API error line | Log Data | Records what happened |
| One-time login code | Temporary Data | Expires after short use |
| Cached per-player best-score leaderboard | Cached Result / Auxiliary Data | Speeds up repeated reads |

These categories are not rigid boundaries. Some data can be discussed from more than one angle. For example,
event settings can be discussed as Game Master Data when they define game rules, and as Operational Data when
operators change schedules, banners, or live event states. The purpose of this classification is to help you ask
better storage questions.

For any backend data, ask:

- Who owns this data?
- How long should this data survive?
- Is this an original record, maintained state, or derived copy?
- Would losing this data damage player trust or operations?
- Does the data need to be queried often?
- Does the data need an audit trail?

---

## 7.5 Relational Database Basics

A relational database stores data in tables. Tables are made of rows and columns.

A simple table looks like this:

| player_id | display_name | level | created_at |
|---|---|---:|---|
| player-001 | Lina | 12 | 2026-06-01 10:00:00 |
| player-002 | Omar | 7 | 2026-06-01 10:03:00 |
| player-003 | Mina | 20 | 2026-06-01 10:10:00 |

In this example:

- The table stores player records.
- Each row represents one player.
- Each column represents one field of the player record.
- `player_id` identifies a specific player.

### Table, row, and column

| Term | Meaning | Game backend example |
|---|---|---|
| Table | A collection of similar records | `players`, `scores`, `game_items` |
| Row | One record inside a table | One player, one score, one item definition |
| Column | One field inside a table | `player_id`, `score`, `created_at` |

A table should usually represent one kind of thing. If one table tries to store unrelated things, it becomes
hard to understand and query.

### Primary key

A primary key identifies one row in a table.

In a `players` table, `player_id` can be the primary key.

| player_id | display_name | level |
|---|---|---:|
| player-001 | Lina | 12 |
| player-002 | Omar | 7 |

The primary key helps the database and the backend refer to one specific player.

A useful rule:

> A primary key answers, “Which exact row is this?”

### Foreign key

A foreign key refers to a row in another table.

For example, a `scores` table may include `player_id` so that each score can be connected to the player who
earned it.

| score_id | player_id | stage_id | score |
|---|---|---|---:|
| score-1001 | player-001 | stage-01 | 15200 |
| score-1002 | player-002 | stage-01 | 9800 |
| score-1003 | player-001 | stage-02 | 18100 |

Here, `scores.player_id` refers to `players.player_id`.

A useful rule:

> A foreign key answers, “Which row in another table is this related to?”

### Constraints

A constraint is a rule that the database can enforce.

Examples:

| Constraint type | Meaning | Game backend example |
|---|---|---|
| Primary key | Row identity must be unique | Each player has one `player_id` |
| Foreign key | Referenced row should exist | A score should belong to an existing player |
| Unique constraint | A value or combination should not duplicate | One player should own one row per stackable item |
| Not null | A column must have a value | `player_id` should not be empty |
| Check constraint | A value must satisfy a condition | `quantity` or normal currency `balance` should not be negative |

Constraints do not replace good backend validation, but they are an important safety layer. The API Server
should validate requests before writing data, and the database can also reject data that violates important
rules.

In the example model later in this chapter, key relationships may look like this:

| Table | Primary key example | Relationship example |
|---|---|---|
| `players` | `player_id` | One player can have many score rows |
| `scores` | `score_id` | `scores.player_id` refers to `players.player_id` |
| `player_stage_best_scores` | All-time: `(player_id, stage_id)` | `best_score_id` may refer to `scores.score_id` |
| `game_items` | `item_id` | Defines what an item is |
| `currency_definitions` | `currency_type` | Defines what a currency type is |
| `player_items` | Separate ID or `(player_id, item_id)` in a stackable model | Refers to `game_items.item_id` |
| `player_currencies` | `(player_id, currency_type)` | Links a player to one currency definition and balance |
| `currency_ledger` | `ledger_id` | Records currency changes for a player and currency type |
| `reward_claims` | `claim_id` | Links a claim to a player and reward day |

Seasonal leaderboard models may add a ranking period to the best-score key. Reward claim duplicate protection
may use player, reward type, and service-defined reward day.

The exact keys can differ by project. Some schemas use `(player_id, item_id)` as the primary key for a simple
stackable inventory table. Other schemas use a separate `player_item_id` and add `UNIQUE (player_id, item_id)`
to prevent duplicate stack rows. The important idea is that keys give rows identity and connect related records.

### Why tables are separated

Beginners sometimes wonder why we need multiple tables. Why not put everything into one huge table?

For example, why not store item names directly inside each player inventory row?

```text
player_id | item_id | item_name    | item_type  | quantity
player-001| potion  | Small Potion | consumable | 3
player-002| potion  | Small Potion | consumable | 5
player-003| potion  | Small Potion | consumable | 1
```

This repeats the item definition many times. If the item name changes, many rows may need updates. It also
mixes “what the item is” with “who owns it.”

A cleaner beginner model separates item definitions from player ownership:

```text
game_items
- item_id
- name
- item_type
- max_stack

player_items
- player_id
- item_id
- quantity
```

This separation helps the backend express different meanings clearly.

```text
game_items:   What items exist in the game?
player_items: Which player owns which item, and how many?
```

Currency is another example of responsibility separation. A currency definition says that a currency type
exists. A player currency row says how much of that currency one player currently has. A ledger-like row
explains why the amount changed.

```text
currency definition: What currency types exist?
player_currencies:  How much of each currency does this player currently have?
currency_ledger:    Why did the currency amount change?
```

This is the core idea behind relational modeling: separate data by responsibility, then connect related rows
through keys.

---

## 7.6 Reading Simple SQL Examples

SQL is a language used to work with relational databases. SQL can create tables, insert data, read data,
update data, delete data, join tables, and much more.

This chapter does not try to teach all of SQL. We will only read a few small examples.

When you see an SQL example, ask:

- Which table is being used?
- Is the query creating, reading, updating, or deleting data?
- Which columns are involved?
- Which rows are affected?
- Is the query using a relationship between tables?

### INSERT: storing a new row

`INSERT` adds a new row to a table.

```sql
INSERT INTO players (player_id, display_name, level)
VALUES ('player-001', 'Lina', 1);
```

Read this as:

```text
Add one new player row.
The player_id is player-001.
The display_name is Lina.
The starting level is 1.
```

A score submission might add a score record:

```sql
INSERT INTO scores (score_id, player_id, stage_id, score, submitted_at)
VALUES ('score-1001', 'player-001', 'stage-01', 15200, '2026-06-01 10:15:00');
```

Read this as:

```text
Store one score record for player-001 on stage-01.
Record when the score was submitted.
```

In a real authenticated API, the backend should usually identify the player from the authenticated request
context, not blindly trust a `player_id` value sent by the client. Here, `player-001` is shown only to make the
SQL example easy to read.

### SELECT: reading rows

`SELECT` reads data from a table.

```sql
SELECT player_id, display_name, level
FROM players
WHERE player_id = 'player-001';
```

Read this as:

```text
Find the player row whose player_id is player-001.
Return the player_id, display_name, and level columns.
```

A per-player best-score leaderboard query may look like this:

```sql
SELECT player_id, stage_id, best_score, best_submitted_at
FROM player_stage_best_scores
WHERE stage_id = 'stage-01'
ORDER BY best_score DESC, best_submitted_at ASC, player_id ASC
LIMIT 10;
```

Read this as:

```text
Find each player's best-score row for stage-01.
Sort players from highest best score to lowest best score.
If two players have the same best score, use best_submitted_at and player_id as tie-breakers.
Return the top 10 players for this stage.
```

This example assumes the backend has a maintained best-score table that already represents one best score
per player and stage. If you rank raw score submission rows directly, the same player may appear multiple
times. A per-player best-score leaderboard needs an explicit rule for choosing each player's best score.

The tie-breaker rule is a game design choice. This example uses earlier `best_submitted_at` first. Another game
might choose a different rule, such as faster clear time, later submission time, or a separate ranking priority.

### UPDATE: changing existing rows

`UPDATE` changes existing rows.

```sql
UPDATE players
SET level = 2
WHERE player_id = 'player-001';
```

Read this as:

```text
Find player-001 and change the level to 2.
```

The `WHERE` part is very important. Without a careful condition, an update could affect too many rows.

### DELETE: removing rows

`DELETE` removes rows. As with `UPDATE`, the `WHERE` condition is very important. Without a careful condition,
a `DELETE` statement can remove more rows than intended.

```sql
DELETE FROM scores
WHERE score_id = 'score-1001';
```

Read this as:

```text
Remove the score row whose score_id is score-1001.
```

In real services, important records are not always physically deleted immediately. Sometimes a system uses a
soft delete, which means marking data as deleted without removing the row right away.

For example, assume the `players` table has a nullable `deleted_at` column.

```sql
UPDATE players
SET deleted_at = '2026-06-01 12:00:00'
WHERE player_id = 'player-001';
```

Read this as:

```text
Mark player-001 as deleted at a specific time.
The row still exists, but normal queries may ignore it.
```

Soft delete is not always required. It is a design choice. It is useful when audit, recovery, or historical
investigation matters. It is not a complete privacy or compliance solution by itself.

### JOIN: reading related data from multiple tables

`JOIN` combines related rows from multiple tables for a query result.

Suppose `player_stage_best_scores` stores the best score per player and stage, but the player nickname is stored
in the `players` table.

```text
player_stage_best_scores table:
player_id  | stage_id | best_score | best_submitted_at
player-001 | stage-01 | 16000      | 2026-06-01 10:25:00

players table:
player_id  | display_name
player-001 | Lina
```

To show a per-player best-score leaderboard with display names, the backend may need data from both tables.

```sql
SELECT p.display_name, b.stage_id, b.best_score, b.best_submitted_at
FROM player_stage_best_scores AS b
JOIN players AS p ON b.player_id = p.player_id
WHERE b.stage_id = 'stage-01'
ORDER BY b.best_score DESC, b.best_submitted_at ASC, b.player_id ASC
LIMIT 10;
```

Read this as:

```text
Read each player's best score row for the stage.
Connect each best score row to the matching player row.
Return the player's display name, the stage ID, and the best score.
Sort by best score from high to low.
Use submitted time and player ID as tie-breakers when best scores are the same.
Return the top 10 players.
```

JOIN does not permanently merge the two tables. It only combines related rows for the result of this query.

### CRUD

CRUD is a common shorthand for four basic data operations.

| CRUD letter | Meaning | SQL example | Game backend example |
|---|---|---|---|
| C | Create | `INSERT` | Store a new score |
| R | Read | `SELECT` | Load player profile |
| U | Update | `UPDATE` | Change item quantity or currency balance |
| D | Delete | `DELETE` | Remove or soft-delete a record |

Many backend features can be understood as combinations of CRUD operations plus validation and service rules.

For example, claiming a daily reward might involve:

```text
Read: Check whether the player already claimed the service-defined reward day.
Read: Find the reward definition.
Update: Add currency or item quantity.
Create: Store a reward claim record.
Respond: Return the reward result to the client.
```

This is why databases appear so often in backend development.

---

## 7.7 Example Scenario: Scores and Per-Player Best-Score Leaderboards

Now let’s connect the database concepts to a small score and leaderboard scenario.

Imagine a simple arcade-style game with these features:

- A player has a profile.
- A player can submit a stage score.
- The game can show a leaderboard based on each player's best score for a stage.

A beginner-friendly relational model for this part may include these tables:

```text
players
scores
player_stage_best_scores
```

This is not a complete production schema. It is a study model that helps us understand responsibilities.

In this chapter, read `player_stage_best_scores` as a simplified maintained best-score table. In simpler terms,
it stores the current best score that the backend has selected for each player and stage. Conceptually, this
table is the stored form of maintained best-score state.

A real service may use a different design. It may calculate best scores from score history, maintain a separate
table, use a materialized view, or use another structure. Those choices belong to later database and backend
design study.

When this chapter later shows an index on `player_stage_best_scores`, read it as an index on a maintained
best-score table. If the best-score result is only an ordinary view, index design would apply to the underlying
tables or to a materialized structure instead.

### players

The `players` table stores player identity and profile-like information.

| player_id | display_name | level | created_at |
|---|---|---:|---|
| player-001 | Lina | 12 | 2026-06-01 10:00:00 |
| player-002 | Omar | 7 | 2026-06-01 10:03:00 |
| player-003 | Mina | 20 | 2026-06-01 10:10:00 |

Possible meaning:

- `player_id` identifies the player.
- `display_name` is the name shown in the game.
- `level` is the current player level.
- `created_at` records when the player row was created.

### scores

The `scores` table stores score submission history.

In this simplified example, `scores` stores score submissions that the backend records. A real service may
store only accepted scores, or it may store suspicious submissions with a review status for later
investigation. The important point is that the backend should not treat unchecked client values as final
ranking truth.

The table below omits review-related columns to keep the example small. A real service that stores suspicious
submissions may add fields such as `review_status`, `is_valid`, or `reviewed_at`.

| score_id | player_id | stage_id | score | submitted_at |
|---|---|---|---:|---|
| score-1001 | player-001 | stage-01 | 15200 | 2026-06-01 10:15:00 |
| score-1002 | player-002 | stage-01 | 9800 | 2026-06-01 10:17:00 |
| score-1003 | player-001 | stage-01 | 15800 | 2026-06-01 10:25:00 |
| score-1004 | player-003 | stage-01 | 15800 | 2026-06-01 10:28:00 |

This table can support suspicious score review, player progress analysis, and leaderboard updates. The
`player_id` column connects each score to a player.

Notice that `player-001` has two score submissions for `stage-01`. If a leaderboard should show only one row
per player, the backend needs a rule for choosing which score counts. In this chapter, we use each player's
best score for the stage.

This example uses only `stage_id` to keep the model easy to read. A real weekly or seasonal leaderboard may
also need a `season_id`, `leaderboard_id`, or date range so the backend knows which ranking period is being
queried.

### player_stage_best_scores

The `player_stage_best_scores` table stores one current best score per player and stage.

| player_id | stage_id | best_score | best_score_id | best_submitted_at | updated_at |
|---|---|---:|---|---|---|
| player-001 | stage-01 | 15800 | score-1003 | 2026-06-01 10:25:00 | 2026-06-01 10:25:00 |
| player-002 | stage-01 | 9800 | score-1002 | 2026-06-01 10:17:00 | 2026-06-01 10:17:00 |
| player-003 | stage-01 | 15800 | score-1004 | 2026-06-01 10:28:00 | 2026-06-01 10:28:00 |

This table supports a leaderboard based on each player's best score. In this simple model, there should be
only one best-score row for the same player and stage. A table constraint fragment might look like this:

```text
UNIQUE (player_id, stage_id)
```

Read this as:

```text
For the same player and the same stage, store one current best-score row.
```

This simple key works for an all-time stage leaderboard. If the game has weekly or seasonal leaderboards, the
key would usually need to include the ranking period too.

```text
player_id + stage_id + season_id
```

or:

```text
player_id + leaderboard_id + ranking_period
```

`best_score_id` can point back to the original row in `scores`. In a relational schema, this could be
modeled as a foreign key to `scores.score_id`. This helps the backend or operators trace which score submission
produced the current best score.

If a score is later marked invalid after review, the maintained best-score state may also need to be
recalculated or corrected. Any cached leaderboard result based on the old state may also need to be invalidated
or rebuilt. This is another reason to keep the original score history and to treat cache as auxiliary data.

When a new score is accepted, the backend may compare it with the player's current best score for that stage.
If the new score wins according to the leaderboard rule, the maintained best-score row is updated. If it does
not win, the score can still remain in `scores` as submission history.

For the same player, the “best” row should follow a clear rule, such as highest score first, then earlier
submission time if the score is tied.

The original score submission history can still stay in `scores`. The best-score table is a beginner-friendly
way to show that a per-player best-score leaderboard is different from a raw list of score submissions.

You can read the relationship like this:

```text
scores:
What score submissions happened?

player_stage_best_scores:
What is each player's current best score for this stage?

cached_leaderboard_result:
What ranking result can we serve quickly right now?
```

In this beginner model, `scores` is original history, `player_stage_best_scores` is maintained current state,
and a cached leaderboard result is auxiliary read data.

### Reading a per-player best-score leaderboard

A query can read the maintained best-score state and sort it for display.

```sql
SELECT player_id, stage_id, best_score, best_submitted_at
FROM player_stage_best_scores
WHERE stage_id = 'stage-01'
ORDER BY best_score DESC, best_submitted_at ASC, player_id ASC
LIMIT 10;
```

Read this as:

```text
Find each player's current best-score row for stage-01.
Sort players from highest best score to lowest best score.
If two players have the same best score, use best_submitted_at and player_id as tie-breakers.
Return the top 10 players for this stage.
```

The tie-breaker rule is a game design choice. This example uses earlier `best_submitted_at` first. Another
game might choose a different rule, such as faster clear time, later submission time, or a separate ranking
priority.

---

## 7.8 Example Scenario: Inventory, Currencies, and Rewards

Now let’s read a related model for inventory, currencies, and daily rewards.

Imagine the same arcade-style game has these features:

- The game has item definitions.
- A player can own stackable items.
- The game has currency definitions.
- A player has currency balances.
- Currency changes need structured history.
- A player can claim a daily reward.

A beginner-friendly relational model for this part may include these tables:

```text
game_items
player_items
currency_definitions
player_currencies
currency_ledger
reward_claims
```

The `players` table from Section 7.7 is still important because these records belong to specific players. To
keep this section focused, we will not repeat the `players` table again.

### game_items

The `game_items` table stores item definitions.

| item_id | name | item_type | max_stack |
|---|---|---|---:|
| potion_small | Small Potion | consumable | 99 |
| material_iron | Iron Material | material | 999 |
| sword_iron | Iron Sword | weapon | 1 |

This table answers:

```text
What items exist in the game?
```

It does not answer:

```text
Which player owns which item?
How much `coin_gold` does this player have?
```

Currency is intentionally not listed in this `game_items` table. In this chapter, item definitions and
currency state are separated.

### player_items

The `player_items` table stores player ownership of stackable items.

| player_id | item_id | quantity | updated_at |
|---|---|---:|---|
| player-001 | potion_small | 3 | 2026-06-01 10:30:00 |
| player-001 | material_iron | 12 | 2026-06-01 10:31:00 |
| player-002 | potion_small | 5 | 2026-06-01 10:32:00 |

This table answers:

```text
Which item does this player own, and how many?
```

A table constraint fragment might look like this:

```text
UNIQUE (player_id, item_id)
```

Read this as:

```text
For the same player and the same stackable item, there should be only one ownership row.
```

Some schemas use `(player_id, item_id)` as the primary key for a simple stackable inventory table. Other
schemas use a separate `player_item_id` and add `UNIQUE (player_id, item_id)` to prevent duplicate stack rows.

When the backend grants more of a stackable item, it should usually increase the quantity of the existing row
instead of creating a second duplicate row. Some databases support an upsert-style operation for this, but the
implementation details belong to a later Web Backend course.

This simple model works well for stackable items such as potions or materials. Currency is handled separately
in this chapter through `player_currencies` and `currency_ledger`.

However, not every item should be modeled this way. If a player can own multiple copies of the same equipment
item, each copy may need its own row identity, such as `player_item_id` or `item_instance_id`.

```text
Stackable item model:
player_id + item_id -> quantity

Equipment instance model:
player_item_id -> player_id + item_id + enhancement_level + options
```

So `UNIQUE (player_id, item_id)` is useful for a simple stackable inventory model, but it is not a universal
rule for every game inventory.

### currency_definitions

The `currency_definitions` table stores currency types.

| currency_type | display_name | max_balance |
|---|---|---:|
| coin_gold | Gold Coin | 999999 |
| gem_premium | Premium Gem | 99999 |

This table answers:

```text
What currency types exist in the game?
```

It does not answer:

```text
How much currency does this player have?
Why did the currency amount change?
```

This separation keeps currency definitions, current player balances, and structured currency history from
being mixed into one responsibility.

```text
currency_definitions:
What currency types exist?

player_currencies:
How much of each currency does this player currently have?

currency_ledger:
Why did the currency amount change?
```

### player_currencies

The `player_currencies` table stores current currency balances.

| player_id | currency_type | balance | updated_at |
|---|---|---:|---|
| player-001 | coin_gold | 1200 | 2026-06-01 10:45:00 |
| player-001 | gem_premium | 25 | 2026-06-01 10:40:00 |
| player-002 | coin_gold | 300 | 2026-06-01 10:41:00 |

This table answers:

```text
How much of this currency does this player currently have?
```

A simple current-balance table may use one row per player and currency type. A table constraint fragment might
look like this:

```text
UNIQUE (player_id, currency_type)
```

The current balance is useful for normal gameplay, but it does not explain why the balance changed.

Many games also need a rule that prevents normal currency balances from becoming negative. This rule may be
checked by backend validation, database constraints, or both. Some special systems may allow negative values,
but that should be an intentional design decision.

### currency_ledger

The `currency_ledger` table stores structured currency change history.

| ledger_id | player_id | currency_type | change_amount | reason | created_at |
|---|---|---|---:|---|---|
| ledger-9001 | player-001 | coin_gold | 100 | daily_reward | 2026-06-01 10:40:00 |
| ledger-9002 | player-001 | coin_gold | -50 | item_purchase | 2026-06-01 10:45:00 |

These ledger rows show recent changes, not the player's complete lifetime currency history. For example, if
`player-001` had 1,150 `coin_gold` before these two rows, then `+100` and `-50` lead to the current balance of
1,200 at `2026-06-01 10:45:00`.

This table answers:

```text
Why did this currency amount change?
```

In a real service, `reason` is often a controlled reason code such as `daily_reward`, `item_purchase`, or
`admin_adjustment`, not an arbitrary sentence. This makes support, analytics, and auditing easier.

This is only a ledger-like beginner model. Real economy or purchase records may include more fields, such as
`balance_after`, `reference_id`, `request_id`, `operator_id`, or purchase-related identifiers. A field such as
`balance_after` can make investigation easier because it records the balance immediately after the change. This
chapter does not require that full model, but it is useful to know why real economy history often contains more
than just the change amount.

The current balance helps normal gameplay. The ledger helps support, auditing, purchase investigation, and
recovery when something goes wrong.

Because a ledger-like table explains why a value changed, it is usually treated as history. In many systems,
new correction rows are added instead of casually editing old ledger rows. The exact policy depends on the
service, but the key idea is that history should remain trustworthy.

### reward_claims

The `reward_claims` table stores reward claim history.

| claim_id | player_id | reward_type | reward_day | created_at |
|---|---|---|---|---|
| claim-5001 | player-001 | daily | 2026-06-01 | 2026-06-01 10:40:00 |

This table can help the backend answer:

```text
Has this player already claimed the daily reward for this service-defined reward day?
```

That question is important because a daily reward should usually be granted once per day.

For a simple daily reward, the backend may also protect this table with a uniqueness rule such as:

```text
one row per player + reward type + service-defined reward day
```

We will revisit this idea as a unique constraint in Section 7.9.

In a real game service, `reward_day` should mean the service-defined reward day, not simply the player
device's local date. For example, the game may define the daily reset time using UTC or a specific service
time zone.

`reward_day` is a business meaning used in this chapter. It does not simply mean the player's local calendar
date. It means the reward day according to the backend's daily reward rule.

This simplified table is mainly for reading a daily reward example. Other reward systems may need more columns,
such as `reward_id`, `event_id`, `season_id`, or `source_id`, depending on what kind of reward is being
claimed.

### Current state and history

A common beginner confusion is the difference between current state and history.

Current state describes what is true right now.

Examples:

- Current player level
- Current best score for a stage
- Current inventory quantity
- Current currency amount
- Current event setting

History records what happened over time.

Examples:

- Score submission history
- Reward claim history
- Purchase grant history
- Admin action history
- Currency change history

Both are useful. Current state is efficient for normal gameplay. History is important for investigation,
operations, auditing, and rebuilding trust when something goes wrong.

For example:

```text
Current state:
player_items can tell us what the player currently owns.
player_currencies can tell us the player's current `coin_gold` balance.
player_stage_best_scores can tell us the player's current best score for a stage.

Structured history:
scores tells us which score submissions happened.
reward_claims tells us what rewards were claimed and when.
currency_ledger tells us why a currency balance changed.
```

Application logs help developers investigate behavior, but important economy, reward, and purchase records
should usually be stored as structured backend records, not only as text log lines.

### Reading the model as a feature flow

Let’s read a daily reward flow using these tables.

```text
1. The client sends a daily reward claim request.
2. The API Server identifies the player from the authenticated request context.
3. The backend determines the service-defined reward day.
4. The backend checks, reserves, or creates a protected claim record for this player and reward day.
5. If duplicate protection says this reward was already claimed, the backend does not grant it again.
6. If the claim is valid, the backend reads the reward definition from Game Master Data.
   In this simplified model, the reward definition table is not shown.
7. It updates player_items, player_currencies, or other reward-related current state.
8. If the reward changes currency, it writes currency_ledger history in the same protected flow.
9. It writes any other structured history if needed, such as inventory change history.
10. It returns the result to the client.
```

The exact order can differ by implementation. The key idea is that duplicate protection, reward definition
lookup, current-state updates, and structured history writes must be handled as one safe flow. You should not
read the numbered list as the only possible implementation order.

The reward definition may come from a reward table, event configuration, or Remote Config. The exact table
design is not the main point here. What matters is that one player-facing feature can involve several pieces of
data with different roles.

For a currency reward, the current balance update and the `currency_ledger` row should usually be protected
together.

Because this flow can change several important records, the backend must protect the steps carefully. In the
next section, we will use transactions, constraints, and duplicate protection to understand that safety problem.

---

## 7.9 Transactions, Indexes, and Data Safety

Databases are not only for storing rows. They also help protect data and make some reads faster.

In this section, we will study three important ideas:

- Transactions
- Duplicate prevention and safe requests
- Indexes

### Transactions

A transaction groups several database changes so they succeed together or fail together.

This matters when one feature changes multiple pieces of data.

Imagine a daily reward grant:

```text
Step 1: Add 100 `coin_gold` to the player's currency.
Step 2: Record that the daily reward was claimed.
```

What happens if Step 1 succeeds but Step 2 fails?

The player receives `coin_gold`, but the system does not record the claim. The player might be able to claim
again.

What happens if Step 2 succeeds but Step 1 fails?

The system records the claim, but the player does not receive the reward.

Both are bad.

A transaction helps protect this kind of flow:

```text
Begin transaction
  Confirm this reward claim is allowed
  Create the reward claim record with duplicate protection
  Add the reward only if the claim is valid
  Write ledger-like history if the reward changes currency
Commit transaction
```

If something fails, the transaction can roll back:

```text
Begin transaction
  Confirm this reward claim is allowed
  Create the reward claim record with duplicate protection
  Add the reward to player_currencies
  Writing ledger-like history fails
Rollback transaction
```

The exact order can differ by implementation. The important idea is that the reward update and the claim record
must be protected together, and the database should reject duplicate claim records.

If duplicate protection rejects the claim record, the backend should not grant the reward again. Depending on
the API design, it may return an “already claimed” response or an idempotent success response that describes
the already-applied result.

Read “rollback” as:

```text
Cancel the changes made inside the transaction.
```

The beginner-level idea is:

> Use a transaction when several important data changes should succeed or fail as one unit.

Transactions are especially important for rewards, purchases, currency changes, item upgrades, and inventory
updates.

### Transactions do not solve every duplicate request problem

A transaction is important, but it is not the only safety mechanism.

Network problems can cause the client to retry the same request. A player may press a button twice. A request
may be sent again because the first response was lost.

For example:

```text
POST /rewards/daily
POST /rewards/daily
```

The backend should avoid granting the same daily reward twice.

Helpful safety ideas include:

- Identifying the player from the authenticated request context.
- Using the backend's service-defined reward day, not the client device date.
- Checking existing reward claim records.
- Using a unique constraint for values that should not duplicate.
- Treating the database constraint as the final safety guard when two requests arrive almost at the same time.
- Using idempotency keys for some repeated requests.
- Designing API behavior so safe retries do not create duplicate results.

Idempotency means that repeating the same request should not create an additional unintended effect. This
chapter only introduces the idea. Full idempotency design belongs to a later Web Backend course.

### Unique constraints

A unique constraint prevents duplicate values or duplicate combinations.

For example, if a player can claim only one daily reward per day, a database could protect this rule with a
uniqueness idea like:

```text
One row per player_id + reward_type + reward_day
```

Here, `reward_day` should mean the backend's service-defined reward day, not a date blindly trusted from the
client device.

A table constraint fragment might look like this:

```text
UNIQUE (player_id, reward_type, reward_day)
```

Read this as:

```text
The same player cannot have two daily reward claim rows for the same date.
```

The API Server should still validate the request before writing. The database constraint is a safety layer
that helps protect the final data.

This matters because “check first, then insert” can still be risky if two requests are processed at nearly the
same time. A unique constraint helps the database reject the second duplicate row even if the application
logic was reached twice.

### Indexes

An index helps the database find rows faster for some query patterns.

A simple analogy is an index at the back of a book. Without an index, you may need to scan many pages. With an
index, you can find the relevant pages more quickly.

Suppose the backend frequently runs this per-player best-score leaderboard query:

```sql
SELECT player_id, best_score, best_submitted_at
FROM player_stage_best_scores
WHERE stage_id = 'stage-01'
ORDER BY best_score DESC, best_submitted_at ASC, player_id ASC
LIMIT 10;
```

The query filters by `stage_id` and sorts by `best_score`. It also uses `best_submitted_at` and `player_id` as
tie-breakers so the result stays stable when two players have the same best score.

Here, `player_stage_best_scores` is treated as a maintained best-score table. If it is only an ordinary view,
index design would apply to the underlying tables or to a materialized structure instead.

An index candidate may include those columns:

```sql
CREATE INDEX idx_best_scores_stage_score_time
ON player_stage_best_scores (stage_id, best_score DESC, best_submitted_at ASC, player_id ASC);
```

In this chapter, you do not need to learn how to design indexes perfectly. Just read the intent:

```text
This index is meant to help queries that find best-score rows for a stage, sort them by score, and use stable
tie-breakers.
```

The tie-breaker rule is a game design choice. A real weekly or seasonal leaderboard may also need a `season_id`,
`leaderboard_id`, or date range. If the query filters by a ranking period, the index candidate would usually
need to reflect that query shape too.

For example, a seasonal leaderboard might use columns such as:

```text
stage_id, season_id, best_score, best_submitted_at, player_id
```

Index design depends on the database, the table size, the exact query pattern, and the column order used by
that query. This example is only a beginner-friendly reading example.

### Indexes are not free

Indexes can help reads, but they have costs.

When data changes, the database may also need to update related indexes. Too many indexes can slow down writes
and increase storage usage.

A useful beginner rule is:

> Add indexes for important query patterns, not for every column automatically.

Good index questions include:

- Which queries are used often?
- Which queries become slow as data grows?
- Which columns are used for filtering, sorting, or joining?
- Does the feature read much more often than it writes?

For example, a stage leaderboard may justify an index. A rarely used admin-only query may not need an index
immediately.

### Data safety is layered

Safe backend data handling usually uses several layers together.

| Layer | Example role |
|---|---|
| API validation | Check request format and basic rules before writing |
| Authentication | Check which player sent the request |
| Authorization | Check whether the requester is allowed to perform the action |
| Transaction | Make related changes succeed or fail together |
| Constraint | Reject impossible or duplicate database state |
| Log | Record important events for later investigation |
| Audit log | Record sensitive operator actions |

A database is powerful, but it does not replace backend design. The API Server, database, cache, logs, and
operations tools all work together to protect the service.

---

## 7.10 Cache, NoSQL, and Source of Truth

Relational databases are very common in backend systems, but they are not the only storage concept you will
encounter.

In game backend discussions, you will also hear terms such as cache, Redis, NoSQL, document database,
key-value store, and source of truth.

This section gives you a beginner-friendly map.

### Cache

A cache stores data temporarily so it can be read quickly.

Examples of cache-friendly data:

- Top 100 per-player best-score leaderboard result
- Current event settings
- Frequently read item definitions
- Short-lived session data
- Recently calculated dashboard summary

A cache can reduce repeated database queries.

```text
[Game Client]
   | GET /leaderboard
   v
[API Server]
   |
   +--> [Cache: Top 100 Per-Player Best-Score Leaderboard Result]
   |
   +--> [Reliable DB Records: Score History + Maintained Best-Score State]
```

A cache is useful when the same result is requested often. For example, many players may open the per-player
best-score leaderboard. Reading from cache can be faster than recalculating from score history or repeatedly
reading and sorting maintained best-score state.

### Cache is not the source of truth

A cache can expire, disappear, or become outdated.

That is why cache should usually be rebuildable from reliable database records.

For example:

```text
Safe idea:
- Store score submission history in the database.
- Store maintained best-score state in the database if the service uses a maintained best-score table.
- Store the current top 100 per-player best-score leaderboard in cache for faster reads.
- Rebuild the cached leaderboard from reliable database records if needed.
- Invalidate or refresh the cached leaderboard when maintained best-score state changes after review.
```

Dangerous idea:

```text
- Store the only copy of purchase records in cache.
- Store the only copy of inventory ownership in cache.
- Store the only copy of currency history in cache.
- Store the only copy of reward claim history in cache.
```

Important records such as purchases, inventory, rewards, and currency should have a reliable source of truth.

A source of truth is the place the system treats as the final reference for important data.

In practice, the source of truth may be a set of reliable database records rather than one single table. For
example, currency truth may involve both the current balance and ledger-like history. Leaderboard truth may
involve original score history and maintained best-score state, depending on the service design.

For many game backend features, reliable database records form the source of truth.

### Cache invalidation and TTL

Two common cache ideas are invalidation and TTL.

Invalidation means removing or refreshing cached data when it may no longer be correct.

TTL means Time To Live. It tells the cache how long data can stay before it expires.

For example:

```text
Cache key: leaderboard:stage-01:season-2026-06:per-player-best
TTL: 60 seconds
Meaning: This cached per-player best-score leaderboard result for one stage and ranking period may be reused
for up to 60 seconds.
```

A short delay may be acceptable for some leaderboard views. It may not be acceptable for purchase records or
inventory changes.

The key question is:

```text
Can this feature safely tolerate stale or rebuilt data?
```

If yes, cache may help. If no, use reliable database records and strong consistency rules.

### NoSQL

NoSQL is a broad term for databases that are not centered on the traditional relational table model.

NoSQL does not mean “never use SQL.” It also does not mean “better than relational databases.” It means there
are other storage models that solve different kinds of problems.

Common NoSQL categories include:

| Type | Basic idea | Possible game backend use |
|---|---|---|
| Document database | Store JSON-like documents | Event settings, content drafts, optional profile preferences |
| Key-value store | Store data by key | Session state, cache, short-lived flags |
| Column-family store | Store large-scale distributed records | Very large event or telemetry workloads |
| Graph database | Store relationships as nodes and edges | Social graph or relationship-heavy data |

This chapter focuses only on document databases and key-value stores at a beginner level.

### Document database

A document database stores data in document-like structures, often similar to JSON.

For example, an event configuration might look like this:

```json
{
  "eventId": "weekend-double-exp",
  "startsAt": "2026-06-06T00:00:00Z",
  "endsAt": "2026-06-08T00:00:00Z",
  "rules": {
    "expMultiplier": 2,
    "targetStages": ["stage-01", "stage-02"]
  }
}
```

This kind of nested structure can feel natural in a document database. However, a separate document database
is not the only possible choice. Some relational databases also support JSON-like columns, which may be useful
for certain configuration data.

Important player profile data can still fit well in a relational database when relationships, constraints,
support queries, and audit needs are important.

Flexibility is not automatically better. The right choice depends on query patterns, transaction needs,
operational workflow, team experience, and how the data will be reviewed or changed.

### Key-value store

A key-value store stores values using a simple key-to-value pattern:

```text
key -> value
```

Examples:

```text
session:token-abc123 -> player-001
rate-limit:player-001:POST-scores -> 5
leaderboard:stage-01:season-2026-06:per-player-best -> cached top 100 per-player best-score result
```

Key-value stores are often used for cache-like and short-lived data. Redis is a common example you may see in
backend discussions.

Some key-value stores also provide useful data structures. For example, Redis has a Sorted Set structure that
can be used for ranking-like data. Even then, for beginner thinking, it is safer to remember:

```text
A fast ranking structure can help serve leaderboard results.
Score history and important maintained best-score records still need a reliable source of truth.
```

Some cache or key-value systems can be configured to persist data, but persistence settings alone do not decide
whether that system should be the source of truth for important business records.

### Choosing storage by the problem

Do not start with the question “SQL or NoSQL?”

Start with better questions:

- Is this data original history, maintained current state, or a derived copy?
- Does it need relationships between records?
- Does it need transactions?
- Does it need flexible nested structure?
- Does it need to be read extremely often?
- Can it expire?
- Can it be rebuilt?
- Does it require audit history?
- How will operators search, review, or correct it?

For many core game backend records, a relational database is a strong starting point because relationships,
constraints, transactions, and query structure are important.

For cache, sessions, short-lived flags, and fast repeated reads, a key-value store may appear.

For flexible documents or some configuration structures, a document database may appear.

The important skill is not memorizing product names. The important skill is matching data characteristics to
storage responsibilities.

---

## 7.11 Learning Practice

This Learning Practice is for observation and study. It is not a production-ready implementation.

### Learning Practice: Read a Simple Game Backend Data Model

In this practice, you will read a small data model and identify what each structure stores, which data is
original history, which data is maintained current state, which data is auxiliary, and how several records relate
to one another.

You do not need to run a database. You only need to read and interpret the examples.

### Goal

The goal is to practice reading backend data structures as a map of responsibilities.

By the end of this practice, you should be able to say:

```text
This table stores player identity.
This table stores score history.
This table stores each player's maintained best score for a stage.
This table stores item definitions.
This table stores player-owned item state.
This table stores currency definitions.
This table stores current currency balances.
This table stores structured currency history.
This cached result is auxiliary, not the source of truth.
```

### Data structures to read

Read the following data structure descriptions. Most of them are database tables. The final one represents a
cached result structure. `cached_leaderboard_result` is shown as a simple shape for reading. It does not mean
that this cache must be a relational database table.

```text
players
- player_id
- display_name
- level
- created_at

scores
- score_id
- player_id
- stage_id
- score
- submitted_at

player_stage_best_scores
- player_id
- stage_id
- best_score
- best_score_id
- best_submitted_at
- updated_at

game_items
- item_id
- name
- item_type
- max_stack

currency_definitions
- currency_type
- display_name
- max_balance

player_items
- player_id
- item_id
- quantity
- updated_at

player_currencies
- player_id
- currency_type
- balance
- updated_at

currency_ledger
- ledger_id
- player_id
- currency_type
- change_amount
- reason
- created_at

reward_claims
- claim_id
- player_id
- reward_type
- reward_day
- created_at

cached_leaderboard_result
- cache_key
- result_json
- expires_at
```

### Core Steps

1. Identify the table for player identity.
2. Identify the table for score submission history.
3. Identify the table for maintained best-score state.
4. Identify the field that connects maintained best-score state back to original score history.
5. Identify the tables for item definition and item ownership.
6. Identify the tables for currency definition, current balance, and structured history.
7. Identify the structure that is auxiliary cache.
8. Read the SQL query below and explain what result it returns.

```sql
SELECT p.display_name, b.stage_id, b.best_score, b.best_submitted_at
FROM player_stage_best_scores AS b
JOIN players AS p ON b.player_id = p.player_id
WHERE b.stage_id = 'stage-01'
ORDER BY b.best_score DESC, b.best_submitted_at ASC, b.player_id ASC
LIMIT 10;
```

### Optional Observations

- Which table helps prevent duplicate daily reward claims?
- Which field connects best-score state back to score history?
- Which data should not live only in cache?
- Which data would help customer support investigate a currency issue?
- Which key would need to change if this leaderboard became weekly or seasonal?

### What to Observe

Notice these points:

- `players` and `scores` are separate because player identity and score history have different roles.
- `scores` keeps score submission history, while `player_stage_best_scores` represents maintained current
  best-score state.
- `best_score_id` can connect maintained best-score state back to the original score submission.
- `game_items` and `player_items` are separate because item definitions and player ownership are different
  kinds of data.
- `currency_definitions` and `player_currencies` are separate because currency type definitions and player
  balances have different roles.
- `player_currencies` stores current currency state, while `currency_ledger` stores why the value changed.
- `reward_claims` is history-like data that helps the backend know what already happened.
- The leaderboard query reads from best-score records and player records together.
- Tie-breakers such as `best_submitted_at` and `player_id` can make leaderboard ordering stable.
- `cached_leaderboard_result` can help serve repeated reads, but it should be rebuildable from reliable database
  records such as `player_stage_best_scores` or `scores`.

### Short note

Write two or three sentences for yourself using this pattern:

```text
The original score history is stored in ...
The maintained best-score state is useful because ...
The cached leaderboard result is useful because ...
The cached result should not be the only copy because ...
```

This note is not something to submit. It is a way to check whether you can explain the difference between
original history, maintained current state, and cached data.

### Possible interpretation

Your interpretation may use different words, but it should include ideas like these:

- `players`, `scores`, and `player_stage_best_scores` separate identity, score history, and maintained best-score
  state.
- `best_score_id` connects maintained best-score state back to original score history.
- `game_items`, `player_items`, `currency_definitions`, `player_currencies`, and `currency_ledger` separate
  definitions, current state, and structured history.
- `reward_claims` helps prevent duplicate daily rewards.
- `cached_leaderboard_result` is auxiliary and should be rebuildable from reliable database records.
- The SQL query returns the top 10 players for `stage-01` based on each player's best score.

## 7.12 Common Mistakes

Beginners often make similar mistakes when first learning databases. Let’s review them before the chapter
summary.

### Mistake 1: Thinking server memory is enough

Server memory is useful for temporary work, but important data should not live only in memory.

If player inventory, scores, currency history, or reward records disappear after a server restart, the service
has a serious data problem.

### Mistake 2: Letting the client directly control important data

The game client should not directly decide final inventory, currency, reward, purchase, score, or leaderboard
state.

The client can send a request, but the API Server should validate it and write important results to trusted
backend storage. Database credentials should also stay on the backend side, not inside the game client.

### Mistake 3: Mixing item definitions, currency definitions, and player-owned state

Item definitions, currency definitions, and player-owned state answer different questions.

```text
game_items: What is this item?
currency_definitions: What currency types exist?
player_items: Which player owns this item, and how many?
player_currencies: How much currency does this player currently have?
```

Mixing these responsibilities too casually can make future updates and operations harder.

### Mistake 4: Confusing original history, maintained state, and cache

Cache is useful for speed, but it is not a safe replacement for reliable database records. For leaderboards,
score history, maintained best-score state, and cached top results have different responsibilities.

```text
scores: original score submission history
player_stage_best_scores: maintained current best-score state
cached_leaderboard_result: auxiliary cached response
```

If losing cached data would destroy the only truth of the service, the design is risky.

### Mistake 5: Adding indexes without understanding queries

Indexes should support important query patterns. They should not be added to every column automatically.

Before thinking about an index, ask what query needs help.

### Mistake 6: Thinking NoSQL is always more modern or better

NoSQL is not automatically better than SQL. It is an option for different storage models.

Relational databases are often a strong fit for important records that need relationships, constraints,
transactions, and careful queries.

### Mistake 7: Forgetting structured history

Current state is useful, but some changes also need structured history. Reward claims, currency changes,
purchase grants, item grants, and admin actions may need records that explain what happened and why.

Without that history, customer support, recovery, auditing, and incident investigation become much harder.
For economy and reward systems, missing structured history can also damage player trust. This is why game
backend services should be discussed together with data, validation, and failure cases.

### Mistake 8: Assuming one inventory model fits every item

A `UNIQUE (player_id, item_id)` model can work well for stackable items such as potions or materials. It may
not work for equipment instances where a player can own multiple copies of the same item with different
enhancement levels, options, or durability.

### Mistake 9: Confusing score history with a per-player best-score leaderboard

The `scores` table can store many submissions from the same player. A per-player best-score leaderboard needs a
rule or maintained best-score state that chooses one best score per player for the ranking period.

### Mistake 10: Trusting the client device date for daily rewards

A daily reward should usually use the backend's service-defined reward day. If the backend blindly trusts the
client device date, players may receive rewards incorrectly because of time zone differences, device settings,
or manipulated requests. This connects to the security idea that important service decisions should not blindly
trust client-side values.

---

## 7.13 Chapter Summary

In this chapter, we studied why backend data needs persistent storage and how databases help.

The key idea is:

> A database is the durable memory of the backend.

Server memory can disappear when a process restarts, so important data such as accounts, scores, inventory,
purchases, rewards, currency, and event history should be stored in a more reliable place.

We also studied common game backend data categories:

- Game Master Data defines game rules and content.
- User Data belongs to specific players.
- Operational Data supports live service management.
- Log Data records what happened.
- Temporary Data is short-lived.
- Cached Result / Auxiliary Data speeds up repeated reads but should be rebuildable.

Relational databases organize data into tables, rows, and columns. Primary keys identify rows. Foreign keys
connect related rows. Constraints help protect important rules.

We read simple SQL examples for `INSERT`, `SELECT`, `UPDATE`, `DELETE`, and `JOIN`. The goal was not to
memorize SQL syntax, but to understand what each example does.

We looked at a small game backend model using `players`, `scores`, `player_stage_best_scores`, `game_items`,
`player_items`, `currency_definitions`, `player_currencies`, `currency_ledger`, and `reward_claims`. This model
helped us separate player identity, score history, maintained per-player best-score state, item definitions,
player ownership, currency definitions, current currency state, structured economy history, and reward claim
history.

We also introduced transactions, indexes, cache, NoSQL, and source of truth:

- A transaction helps several important changes succeed or fail together.
- A unique constraint can help prevent duplicate records and act as a final guard against near-simultaneous
  duplicate requests.
- An index can help important query patterns but is not free.
- A cache can speed up reads but should not be the only copy of important data.
- NoSQL options, such as document databases and key-value stores, can fit some storage problems but are not
  automatic replacements for relational databases.
- For many important game records, reliable database records form the source of truth.

In the next chapter, we will use these data concepts to understand common game backend services such as
accounts, profiles, save data, inventory, leaderboards, rewards, economy, Remote Config, events, and push
notifications.

---

## 7.14 Quiz

### Question 1

Why does a backend usually need a database for important player data?

A. Because important data should survive beyond one request or server restart.
B. Because the game client should directly edit database rows.
C. Because server memory is always safer than persistent storage.
D. Because SQL replaces all API validation.

**Answer: A**

**Explanation:**
Important player data such as accounts, inventory, currency, scores, purchases, and rewards should not
disappear when the API Server restarts. A database provides persistent storage for records the service needs later.

### Question 2

Which statement best describes the difference between Game Master Data and User Data?

A. Game Master Data describes game definitions, while User Data belongs to specific players.
B. Game Master Data is always stored in cache, while User Data is always stored in logs.
C. Game Master Data is deleted after every request, while User Data never changes.
D. Game Master Data can only exist in a document database, while User Data can only exist in SQL.

**Answer: A**

**Explanation:**
Game Master Data defines content or rules, such as item definitions or reward tables. User Data belongs to a
specific player, such as owned items, level, score history, current currency balance, or reward claim history.

### Question 3

Why might a leaderboard model separate `scores` from `player_stage_best_scores`?

A. `scores` stores history, while `player_stage_best_scores` stores one current best score per player and stage.
B. `scores` can only store cache values, while `player_stage_best_scores` can only store item definitions.
C. Both tables must always store exactly the same rows forever.
D. Separating them allows the client to decide final ranking results without backend validation.

**Answer: A**

**Explanation:**
A score history table can contain many submissions from the same player. A per-player best-score leaderboard
needs a rule or maintained best-score state that chooses one best score per player for a stage or ranking
period.

### Question 4

Which combination best protects a daily reward claim from becoming half-finished or duplicated?

A. Server memory only and no validation.
B. A transaction for related changes plus duplicate protection such as a unique constraint.
C. A cache-only reward record.
D. Trusting the client device date and player-provided currency balance.

**Answer: B**

**Explanation:**
A transaction helps related changes succeed or fail together. Duplicate protection, such as a unique constraint
on `player_id`, `reward_type`, and the service-defined reward day, helps prevent the same daily reward from
being granted twice.

### Question 5

Which statement best connects indexes, cache, and source of truth?

A. Indexes and cache replace the need for reliable database records.  
B. Adding indexes to every column is always the safest database design.  
C. Indexes help selected queries, cache helps repeated reads, and important records remain in reliable storage.  
D. Cache removes the need for transactions, constraints, or audit history.

**Answer: C**

**Explanation:**
Indexes can help selected queries, but they are not free. Cache can make repeated reads faster, but important
records such as purchases, reward claims, currency history, original score history, and maintained best-score
state need reliable storage. NoSQL options can fit some problems, but they do not automatically replace
relational databases.

---

## 7.15 Further Reading

You do not need to read all of these resources immediately. Use them as references when you want to review a
topic from this chapter in more depth.

The SQL references below use PostgreSQL because it provides clear official documentation. The concepts in this
chapter are not limited to PostgreSQL.

### Core references

- [PostgreSQL — Tutorial](https://www.postgresql.org/docs/current/tutorial.html)
  Use this when you want a beginner-friendly introduction to relational databases and SQL.

- [PostgreSQL — SQL Tutorial](https://www.postgresql.org/docs/current/tutorial-sql.html)
  Use this when you want to review basic SQL statements such as `SELECT`, `INSERT`, `UPDATE`, and `DELETE`.

- [PostgreSQL — Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
  Use this when you want to understand primary keys, foreign keys, unique constraints, and check constraints.

### Optional references

- [PostgreSQL — Transactions](https://www.postgresql.org/docs/current/tutorial-transactions.html)
  Use this when you want to understand why several data changes sometimes need to succeed or fail together.

- [PostgreSQL — Indexes](https://www.postgresql.org/docs/current/indexes.html)
  Use this when you want to understand how indexes can help some queries run faster.

- [PostgreSQL — Views](https://www.postgresql.org/docs/current/tutorial-views.html)
  Use this when you want to understand how a query result can be presented like a table.

- [PostgreSQL — Materialized Views](https://www.postgresql.org/docs/current/rules-materializedviews.html)
  Use this when you want to understand stored query results after reading the maintained best-score example.

- [Redis Documentation](https://redis.io/docs/latest/)
  Use this when you want to see a common key-value store that is often used for cache-like data.

- [Redis — Sorted Sets](https://redis.io/docs/latest/develop/data-types/sorted-sets/)
  Use this when you want to see why Redis is sometimes mentioned in leaderboard discussions.

- [MongoDB Manual](https://www.mongodb.com/docs/manual/)
  Use this when you want to look at document database concepts after understanding relational database basics.
