# 2. Backend Mindset and Development Environment

Backend learning is not only writing code. It is also reading requests, responses, logs, data, files, and error
messages.

In this chapter, we will prepare a backend learning mindset and a simple workspace for later backend learning.

This chapter does not ask you to choose a framework or create a working backend server. Instead, it introduces a small
set of tools and habits.

Those tools and concepts include the terminal, a code editor, local folders, Git, GitHub, runtimes, package managers,
API testing tools, environment variables, and learning notes.

---

## 2.1 How to Read This Chapter

Treat this chapter as preparation. The goal is not to finish a long setup checklist.

Instead, focus on what each tool does and how it supports backend learning.

You are not expected to master every tool in one day.

These tools will appear again in later chapters, so you do not need to master all of them now.

At this stage, focus on the role of each tool.

A useful mindset for this chapter is:

```text
Prepare a simple workspace.
Understand what each tool helps you observe.
Record what you learn.
Do not turn setup into a large project.
```

This chapter is also a bridge between Chapter 1 and Chapter 3.

Chapter 1 introduced the purpose of this guide and the broad areas of backend learning. Chapter 2 prepares your
learning routine and workspace.

Chapter 3 will introduce the larger map of modern backend systems.

---

## 2.2 What You Will Learn

By the end of this chapter, you should be able to explain:

- Why backend learning requires observation, not only coding.
- Why backend developers read requests, responses, logs, data, files, and errors.
- What a local development environment is.
- How a development environment differs from a production environment.
- Why terminal commands are useful for backend work.
- Why you should open a project folder in a code editor, not only one file.
- The difference between Git and GitHub.
- The difference between a runtime and a package manager.
- Why API testing tools are useful before a real game client is connected.
- Why `.env` and `.env.example` files have different purposes.
- How learning notes help you turn confusion and errors into reusable knowledge.

You will also prepare a simple learning workspace that you can reuse while reading later chapters.

---

## 2.3 Why This Matters

Backend work often happens behind the scenes. In game client development, you can usually see a character move, a
button animate, or an effect play.

In backend development, the result may be less visible. A request may reach the server, a response may return, a log
may appear, or data may change in a database.

Because backend behavior is often invisible, you need a habit of checking evidence.

For example, imagine a player submits a score after finishing a level.

```text
Player finishes a level
→ Game client sends a score submission request
→ Backend receives the request
→ Backend checks the player and score data
→ Backend stores or rejects the score
→ Backend sends a response
→ Client shows the result to the player
```

From the player's point of view, this may look like one button press.

From a backend perspective, several things may succeed or fail. The request might not arrive. The score format might
be wrong. The server might reject the score. A later leaderboard query might show different data.

A backend learner therefore needs to ask questions like these:

- What request was sent?
- What response came back?
- What did the server log?
- What file or configuration was used?
- What data changed?
- What error message appeared?
- What did I learn from this result?

The tools in this chapter help you answer those questions.

The terminal helps you run commands and inspect files. A code editor helps you see the whole project folder.

Git records changes. API testing tools help you send and inspect requests. Learning notes help you remember what happened.

---

## 2.4 Core Concepts

This section introduces the basic ideas behind the tools and habits you will use throughout the guide. The goal is
conceptual understanding.

You do not need to install every possible tool or memorize every command.

We will start with backend learning habits, then move to the workspace tools that support them. You can read this
section in small pieces.

You will see each tool again in later chapters.

### 2.4.1 Backend Learning Is an Observation Loop

A beginner may think backend development means writing server code. Writing code matters, but backend learning
includes more than writing code.

A simple backend learning loop looks like this:

```text
Write or read a small example
→ Run or inspect it
→ Trace a request
→ If there is no server yet, describe the expected request in words
→ Check the response
→ Read the logs or output
→ Find the problem
→ Record what changed
```

You will repeat this loop many times. Even in concept-first chapters, you will still use the same habit: observe a
flow, identify each part, and write down what you understand.

A helpful rule is:

```text
Do not only ask, "What code should I write?"
Also ask, "What evidence tells me what happened?"
```

That evidence may be a terminal message, an HTTP status code, a JSON response, a log line, a file path, or a note from
your previous study session.

### 2.4.2 Backend Developers Read Invisible Flows

A backend feature often looks simple from the outside. For example, a player taps a daily reward button and receives a
reward.

The hidden backend flow may look like this:

```text
Client sends a daily reward request
→ Server checks which player sent the request
→ Server checks whether the player already claimed today's reward
→ Server checks the reward rule
→ Server records the reward grant
→ Server sends the result response
```

The player sees a reward popup. The backend developer sees a flow of checks, data, and decisions.

This way of thinking is especially important in game services. Scores, rewards, items, currency, and rankings affect
fairness. The server should not blindly trust important values just because the client sent them.

This does not mean every value from the client is dangerous. It means values that affect fairness, economy, rewards,
ranking, or player progression need server-side checks.

At this stage, you do not need to design a full anti-cheat system. For now, keep this basic mindset: scores, rewards,
currencies, items, and rankings should be checked carefully, and the backend often acts as the source of truth for
those values.

### 2.4.3 Local Development Environment

A local development environment is the place where you study and experiment on your own computer.

In early backend learning, your local machine may be used to:

- Store learning files.
- Run simple commands.
- Open a project folder in an editor.
- Inspect sample configuration files.
- Try Git commands.
- Later, send test requests to a local server.

A local environment is different from a production environment.

| Environment | Meaning | Beginner-friendly example |
|---|---|---|
| Local development environment | Your own computer, used for learning and experiments. | A folder where you keep notes, examples, and small test files. |
| Production environment | A real service environment used by real users. | A live game server that stores real player data. |

In this chapter, you are preparing a local learning workspace. You are not preparing a real service environment for
players.

You may also see the terms `localhost` and `127.0.0.1` later. They usually point back to your own computer. For now,
it is enough to remember this:

```text
localhost usually means "this computer."
```

You may also see `127.0.0.1` for IPv4 loopback or `::1` for IPv6 loopback. We will study these networking details
later in the guide.

### 2.4.4 Terminal and Project Folders

The terminal is a text-based way to give commands to your computer. Backend developers use the terminal often because
many backend tools are command-line tools.

The command examples in this chapter use a Unix-like shell, such as Linux, macOS Terminal, Git Bash, or WSL. If you
use PowerShell, some commands may look different.

Focus on the idea: check your current folder, create files, inspect files, and read command output.

In this chapter, you only need a few basic command ideas.

| Command | Purpose |
|---|---|
| `pwd` | Show your current folder. |
| `ls` | List files and folders. |
| `cd` | Move to another folder. |
| `mkdir` | Create a folder. |
| `touch` | Create an empty file. |
| `cat` | Print a file's contents. |
| `clear` | Clear the terminal screen. |

The most important habit is checking where you are before running commands.

```bash
pwd
ls
```

Many beginner problems happen because a command is correct, but it was run in the wrong folder.

A project folder is the folder that keeps the files for one learning project or example. In this chapter, we will use
a simple folder like this:

```text
backend-learning-workspace/
  README.md
  .gitignore
  .env.example
  notes/
    chapter02.md
```

This is only a learning workspace. It is not a full backend project.

### 2.4.5 Code Editor and Workspace

A code editor is where you read and write project files. A beginner may open only one file, such as `README.md`. In
backend learning, it is usually better to open the whole folder.

```text
Less useful:
Open only README.md

More useful:
Open the whole backend-learning-workspace/ folder
```

Opening the whole folder helps you see how files relate to one another. You can see the README, notes, configuration
examples, Git state, and terminal in one place.

A good editor workspace helps you:

- Read multiple files without losing context.
- Write Markdown notes.
- Open an integrated terminal.
- See changed files when using Git.
- Preview Markdown documents.
- Keep project files organized.

Visual Studio Code is a common beginner-friendly option, but it is not required. The important idea is the workspace,
not one specific editor.

### 2.4.6 Git and GitHub Basics

Git and GitHub are related, but they are not the same thing.

| Tool | Basic role |
|---|---|
| Git | Records file changes on your computer. |
| GitHub | Hosts Git repositories online. |

Git helps you track what changed. GitHub can store a copy of a Git repository online when you want to back it up or
share it.

A basic Git observation flow is:

```text
Edit files
→ Run git status
→ Select files with git add
→ Record a local commit with git commit
```

At this stage, you only need the basic distinction:

```text
Git records changes.
GitHub hosts repositories online.
```

You do not need to learn branching strategies, pull requests, rebasing, merge conflicts, GitHub Actions, or CI/CD in
this chapter.

If Git asks you to configure `user.name` or `user.email` the first time you try a commit, do not worry. This is a
normal first-time Git setup issue. Record the message in your notes and review the Git setup reference in Further
Reading.

If GitHub still feels unfamiliar, focus on local Git and learning notes first. Creating an online repository can wait
until you are confident that your files do not contain secrets.

### 2.4.7 Runtime and Package Manager

Backend code usually needs a runtime. A runtime is the environment that can execute code for a specific language or
platform.

Examples:

| Language or platform | Runtime | Package manager |
|---|---|---|
| JavaScript | Node.js | npm |
| Python | Python | pip |
| C# | .NET | NuGet packages through the dotnet CLI |

A package manager helps install and manage reusable libraries. For example, later in a Web Backend course, a package
manager might help install an HTTP server library or a database library.

This chapter does not ask you to install every runtime or choose a backend framework. The goal is simply to understand
the relationship:

```text
Runtime: helps code run.
Package manager: helps manage libraries.
```

If you already have a runtime installed, you can check its version. If not, that is fine. You can record "not
installed" in your notes and revisit it later.

Example version checks:

```bash
node --version
npm --version
python --version
python3 --version
pip --version
pip3 --version
dotnet --version
```

Do not treat `command not found` as a failure. It is information about your current environment.

### 2.4.8 API Testing Tools

An API testing tool helps you send a request and inspect the response. This is useful because backend APIs can be
tested without waiting for a complete game client.

Common API testing tools include:

| Tool | Why it can help |
|---|---|
| `curl` | Sends requests from the terminal. |
| Postman | Provides a graphical interface for saving and repeating requests. |
| Browser DevTools | Helps you observe browser network requests; it is less convenient for manually building API requests. |
| REST Client or Thunder Client | Lets you test requests inside an editor. |

You will study HTTP requests and API contracts in a later chapter. In this chapter, only remember the purpose of the
tools:

```text
API testing tools help you observe request and response behavior.
```

You can check whether `curl` is available with:

```bash
curl --version
```

If it is not available, write that down and revisit it later. The point is not to fix every setup issue immediately.
The point is to know what the tool is for.

### 2.4.9 Environment Variables and Configuration Files

Backend systems often need configuration values. Examples include port numbers, environment names, database addresses,
API keys, or secret tokens.

Configuration should not always be written directly into code. A value may be different on your computer, a test
server, and a real service environment.

Many projects use environment variables for configuration. You may also see `.env` files.

A `.env` file is a common convention, not magic. It stores configuration values in a simple key-value format. The
values are only used when a runtime, framework, or helper library loads them.

In beginner projects, you may also see two related files: `.env` and `.env.example`.

| File | Purpose |
|---|---|
| `.env` | Can contain real local values or secrets. Usually not committed to Git. |
| `.env.example` | Shows required variable names and safe example values. Safe to share if it contains no real secrets. |

A simple `.env.example` might look like this:

```text
PORT=3000
APP_ENV=development
```

A `.gitignore` file should usually include `.env`:

```gitignore
.env
```

This prevents a new untracked `.env` file from being added to Git. If `.env` was already committed, adding it to
`.gitignore` is not enough. You must stop tracking it in future commits, often with a command such as:

```bash
git rm --cached .env
```

This removes `.env` from Git tracking but keeps the local file on your computer. It does not erase old commits that
already contained the file.

If the committed `.env` contained a real password, token, or API key, treat the secret as exposed. Revoke or rotate
it, which means disabling the old value and creating a new safe one.

Cleaning old Git history is an advanced topic, so use the official GitHub sensitive data reference in Further Reading
if this happens.

At this stage, remember the simple rule:

```text
Use .env.example to share required variable names and safe example values.
Keep real secret values out of Git.
```

### 2.4.10 Learning Notes and Error Messages

Learning notes are not extra work. They are part of backend learning.

Backend errors can feel confusing at first. A command may fail. A file may not be found. A Git command may show an
unexpected state. An API request may return an error later in the guide.

When this happens, do not clear the evidence immediately. Record it.

A simple learning note can use this shape:

```text
What I tried:
What happened:
What I checked:
What I learned:
What I want to revisit:
```

For example:

```text
What I tried:
I ran a command to check a file.

What happened:
The terminal said the file did not exist.

What I checked:
I ran pwd and ls to check my current folder.

What I learned:
The command was correct, but I was in the wrong folder.
```

Over time, these notes become your personal troubleshooting guide.

---

## 2.5 Example Scenario: Preparing a Learning Workspace for a Score Submission Feature

Imagine that you will later study a score submission feature. You are not implementing the feature in this chapter.
You are only preparing the workspace and questions you would use to study it.

The future feature might look like this:

```text
A player finishes a stage.
The game client sends a score to the backend.
The backend checks the request.
The backend stores or rejects the score.
The client receives a result response.
```

Before implementation, a backend learner can write down what the server might need to check:

```text
Feature to study later:
Score submission

Questions for the backend flow:
- Which player is this score associated with?
- Does the backend know which player sent the request?
- Is the score format valid?
- Is the score within a reasonable range for the stage?
- Could this be a duplicate submission?
- What response should be returned to the client?
- What should be recorded for later troubleshooting?
```

These questions are more important than a large folder structure. They help you see the invisible backend flow before
you write server code.

A workspace gives you one place to keep these questions consistently. Instead of keeping them in your head, you can
store them in the README, configuration examples, and chapter notes.

A simple workspace can then hold your notes and configuration examples:

```text
backend-learning-workspace/
  README.md
  .gitignore
  .env.example
  notes/
    chapter02.md
```

The files have simple roles.

| File or folder | Role in this learning workspace |
|---|---|
| `README.md` | Explains what this workspace is for. |
| `.gitignore` | Tells Git which files should not be tracked. |
| `.env.example` | Shows required variable names and safe example values without real secrets. |
| `notes/chapter02.md` | Records what you learned, checked, or found confusing. |

The score submission feature itself will be studied later. For now, this workspace helps you organize your questions without turning the chapter into a server-building lesson.

---

## 2.6 Learning Practice: Prepare a Simple Backend Learning Workspace

This Learning Practice is for observation and study. It is not a production-ready implementation.

### Goal

Create a small local folder for backend learning and write short notes explaining what each file is for. The goal is
to observe the workflow of backend learning, not to create a working backend server.

### Steps

1. Choose a place for your learning files.

   Example:

   ```text
   ~/dev/backend-learning-workspace
   ```

2. Create the folder structure.

   ```bash
   mkdir -p ~/dev/backend-learning-workspace/notes
   cd ~/dev/backend-learning-workspace
   touch README.md .gitignore .env.example notes/chapter02.md
   ```

   If `touch` does not work in your shell, create the files from your code editor instead.

   The goal is to create the files, not to use one specific command.

3. Check the current folder and files.

   ```bash
   pwd
   ls -la
   ls -la notes
   ```

4. Optional: open the folder in your code editor.

   Open the whole `backend-learning-workspace/` folder, not only `README.md`.

   Then check whether `README.md`, `.gitignore`, `.env.example`, and `notes/` appear together in the editor.

5. Write a short `README.md`.

   ```markdown
   # Backend Learning Workspace

   This folder is for studying backend development fundamentals.
   It stores notes, configuration examples, and small observations.
   It is not a working backend service.
   ```

6. Add `.env` to `.gitignore`.

   ```gitignore
   .env
   ```

7. Write example non-secret values in `.env.example`.

   ```text
   PORT=3000
   APP_ENV=development
   ```

8. Write a short note in `notes/chapter02.md`.

   ```text
   What I learned:
   What I checked:
   What confused me:
   What I want to revisit:
   ```

9. Optional: if Git is already installed, observe local Git state.

   ```bash
   git init
   git status
   ```

10. Optional: if you already understand local Git commits, make one local commit.

    ```bash
    git add README.md .gitignore .env.example notes/chapter02.md
    git commit -m "docs: prepare backend learning workspace"
    ```

    If Git asks you to set `user.name` or `user.email`, record the message in your notes.
    Then review GitHub Docs — Set up Git in Further Reading.

    This is a normal first-time Git setup issue.

GitHub is optional in this chapter. If you already use GitHub, you may create a private repository later.

If GitHub is new to you, focus first on local folders, notes, and safe file habits.

### What to Observe

After the steps, check these points:

- The current folder matters when running commands.
- A project folder is different from a single file.
- Opening the whole folder in an editor helps you see related files together.
- `.env.example` can show required variable names and safe example values without exposing real secrets.
- `.env` should not be tracked by Git. If it was already committed, `.gitignore` alone is not enough.
- `git status` shows file state, not whether the files are correct.
- Learning notes help you remember what happened.
- No backend server has been created yet, and that is intentional.

### Short Note

Write two or three sentences answering these questions:

```text
Which tool felt most unfamiliar?
What did I check with the terminal?
What should I remember about .env and .env.example?
```

---

## 2.7 Common Mistakes

Beginners often make setup problems larger than they need to be. When something goes wrong, start with simple checks.

| Mistake | Better habit |
|---|---|
| Opening only one file in the editor. | Open the whole learning folder. |
| Running commands in the wrong folder. | Run `pwd` and `ls` before trying again. |
| Thinking Git and GitHub are the same. | Remember that Git records changes and GitHub hosts repositories online. |
| Installing many runtimes without knowing why. | Learn the role of runtime and package manager first. |
| Treating `command not found` as a personal failure. | Record it as information about your current environment. |
| Committing `.env`. | Add `.env` to `.gitignore`, use `.env.example` for safe examples, and rotate exposed secrets. |
| Ignoring error messages. | Copy the message into learning notes and identify what it is saying. |
| Expecting to create a working backend server in this chapter. | Focus on workspace, tools, and observation habits. |

If you feel stuck, use this short checklist:

```text
1. Where am I? Run pwd.
2. What files are here? Run ls.
3. Did I save the file?
4. Did I type the file name correctly?
5. What exactly does the error message say?
6. What should I write in my learning notes?
```

---

## 2.8 Chapter Summary

In this chapter, you prepared the mindset and workspace for backend learning.

The main idea is that backend learning is not only writing code. It also means using evidence to understand invisible
flows: requests, responses, logs, data, files, command output, and error messages.

You learned that a local development environment is a safe place on your own computer for study and experimentation.

You also learned that production is different because real users and real data are involved.

You reviewed the roles of terminal commands, project folders, code editors, Git, GitHub, runtimes, package managers,
API testing tools, environment variables, `.env.example`, `.gitignore`, and learning notes.

You also prepared a simple learning workspace. That workspace is intentionally small. It is not a complete backend
project.

It gives you a place to record what you observe. Later chapters will introduce backend systems, networks, HTTP APIs,
data, security, operations, and architecture.

With this basic learning routine and simple workspace, you are ready to look at the larger backend system map.

In Chapter 3, we will study the main components of a modern backend system and how they support game services.

---

## 2.9 Quiz

### Question 1

Which statement best describes backend learning at this stage?

A. Backend learning means writing all server code before reading any logs.  
B. Backend learning includes observing requests, responses, logs, data, files, and errors.  
C. Backend learning starts by deploying a service for real players.  
D. Backend learning is only about choosing a programming language.

**Answer: B**

**Explanation:**
Backend learning is not only coding. It also requires observing evidence such as responses, logs, file state, and
error messages.

### Question 2

Which statement best describes a local development environment?

A. A real service environment used by real players.  
B. A cloud-only environment that cannot run on your computer.  
C. A place on your own computer where you can study and experiment safely.  
D. A tool that automatically writes backend code.

**Answer: C**

**Explanation:**
A local development environment is usually on your own computer. It is useful for learning, testing, and making
mistakes safely before thinking about real service environments.

### Question 3

Which statement best explains the difference between Git and GitHub?

A. Git records file changes, while GitHub hosts Git repositories online.  
B. GitHub records file changes locally, while Git is only a website.  
C. Git and GitHub are exactly the same thing.  
D. Git is only used for API testing.

**Answer: A**

**Explanation:**
Git is a version control tool that records changes. GitHub is an online service that can host Git repositories.

### Question 4

Why should `.env` usually not be committed to Git?

A. It is always an image file.  
B. It may contain real local values or secrets.  
C. It is the same as a README file.  
D. It prevents all terminal commands from running.

**Answer: B**

**Explanation:**
A `.env` file may contain real configuration values, API keys, tokens, or passwords. Use `.env.example` to share
required variable names or safe placeholder values, not real secret values.

### Question 5

What is the main purpose of an API testing tool such as `curl` or Postman?

A. To render game graphics.  
B. To send requests and inspect responses.  
C. To guarantee that every API is secure.  
D. To store production player data automatically.

**Answer: B**

**Explanation:**
API testing tools help learners and developers observe request and response behavior, even before a complete game
client is connected.

### Question 6

Which habit is most useful when a beginner sees an error message?

A. Delete all files immediately and start over.  
B. Ignore the message because errors are not useful.  
C. Copy the message, check the current folder, and write what was learned.  
D. Assume the computer is broken.

**Answer: C**

**Explanation:**
Error messages are learning material. Recording what happened, what you checked, and what you learned helps you solve
similar problems later.

---

## 2.10 Further Reading

You do not need to read all of these resources immediately. Use them when a tool in this chapter feels unfamiliar or
when later chapters refer to requests, files, commands, or repositories.

- [GitHub Docs — Set up Git](https://docs.github.com/en/get-started/git-basics/set-up-git)  
  Use this when you want to review the basic Git setup process.

- [GitHub Docs — About repositories](https://docs.github.com/en/repositories/creating-and-managing-repositories/about-repositories)  
  Use this when you want to understand what a repository is.

- [GitHub Docs — Ignoring files](https://docs.github.com/en/get-started/git-basics/ignoring-files)  
  Use this when you want to understand `.gitignore` and ignored files.

- [GitHub Docs — Removing sensitive data from a repository](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)  
  Use this if a secret value was accidentally committed or uploaded.

- [Visual Studio Code — User Interface](https://code.visualstudio.com/docs/getstarted/userinterface)  
  Use this when you want to understand the main VS Code interface. For this chapter, focus on opening a folder and using the Explorer view.

- [Visual Studio Code — Integrated Terminal](https://code.visualstudio.com/docs/terminal/basics)  
  Use this when you want to use a terminal inside your editor.

- [Ubuntu Desktop Documentation — The Linux command line for beginners](https://documentation.ubuntu.com/desktop/en/latest/tutorial/the-linux-command-line-for-beginners/)  
  Use this when terminal commands still feel unfamiliar.

- [Everything curl — Command line HTTP](https://everything.curl.dev/http/index.html)  
  Use this later when you begin observing HTTP requests from the terminal.
