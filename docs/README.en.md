# Claude Coder

[中文](../README.md) | **English** | [Documentation](https://lk19940215.github.io/claude-coder/#/quick-start)

> **One-liner requirement → Complete project. AI codes for hours. You type one command.**

**Like it? Give us a ⭐!** Your star keeps this project alive.

```bash
claude-coder run "Build a Todo app with React + Express, including user auth"
```

```
✓ Project scanned
✓ Decomposed into 8 tasks
▸ Session 1/8: Scaffold project .......... done
▸ Session 2/8: User registration/login ... done
▸ Session 3/8: Todo CRUD ................ done
  ...
✓ All tasks completed, 8 commits pushed
```

You give a requirement. Claude Coder decomposes tasks, writes code, runs tests, commits to Git, **loops until delivery**. Stuck? Auto-rollback and retry. JSON corrupted? AI self-repairs. Just wait for the notification.

---

## Sound Familiar?

### "I can't design UI — my pages look terrible"

You're a backend dev or solo developer with no designer. Every time you build a frontend, you're copy-pasting templates and it still looks off.

**Claude Coder's answer:**

```bash
claude-coder design "Admin dashboard: user management, analytics, settings"
```

AI generates professional `.pen` UI mockups with complete color schemes, typography, and component specs. Then during coding, AI **automatically references the design files to reproduce the UI** — no more "design says one thing, code does another".

### "AI-generated code looks nothing like the design"

You've used AI coding tools. The code runs, but the UI is a disaster. Colors, spacing, layout — all hallucinated.

**Claude Coder's answer:**

Design files are indexed via `design_map.json`. During coding, AI auto-reads the corresponding `.pen` files, extracts colors, spacing, component structure, and **faithfully reproduces design intent**.

### "AI coding tools always crash halfway through"

Other AI coding tools write a few files then hang, error out, or overwrite previous work. Every time, you have to manually intervene.

**Claude Coder's answer:**

Multi-session orchestration + activity monitoring + Git rollback & retry + JSON self-repair. **Agent codes for hours unattended**. Validation fails? Auto-rollback to the last good commit and retry. 3 consecutive failures? Auto-skip, move to the next task. You don't have to babysit.

### "AI-generated code piles up with no one reviewing it"

AI produces tons of code, but nobody reviews quality. Redundant logic, duplicate code — it grows until you're afraid to touch anything.

**Claude Coder's answer:**

Every N successful sessions, AI auto-runs code review (`simplify`) — inspects accumulated changes, removes redundancy, refactors structure, and auto-commits. **Coding and review, unified.**

### "I'm one person doing frontend, backend, testing, and deployment"

Solo dev or small team. You're doing everything.

**Claude Coder's answer:**

```bash
claude-coder go "E-commerce admin dashboard"   # AI assembles requirements
claude-coder run                               # Auto-code everything
```

From requirement analysis → UI design → task decomposition → coding → testing → Git commits — **fully automated pipeline**. Just describe what you want.

---

## End-to-End Workflow

```
  Requirement                                   Delivery
     │                                            ▲
     ▼                                            │
 ┌────────┐    ┌────────┐    ┌────────┐    ┌────────────────┐
 │ design │ →  │  plan  │ →  │  init  │ →  │  run (loop)     │
 │ UI     │    │ tasks  │    │ scan   │    │  ┌──────────┐  │
 │ .pen   │    │        │    │ profile│    │  │ Session N │  │
 └────────┘    └────────┘    └────────┘    │  │ Code→Test │  │
     │                                      │  │ →Commit   │  │
     └──── design_map.json ─────────────→  │  │ ↓read     │  │
            Auto-referenced during coding   │  │  design   │  │
                                            │  └──────────┘  │
                                            │  Validate→pass │
                                            │       or rollback│
                                            └────────────────┘
```

**Key: design → plan → run — fully connected.** Design files indexed by `design_map.json`; plan and run phases auto-discover and reference designs for seamless design-to-code delivery.

---

## Get Started in 30 Seconds

```bash
# 1. Install
npm install -g @anthropic-ai/claude-agent-sdk
npm install -g claude-coder

# 2. Configure (interactive)
claude-coder setup

# 3. Run
cd your-project
claude-coder init
claude-coder run "Implement user registration and login"
```

That's it.

---

## Core Capabilities

| | Capability | Description |
|---|-----------|-------------|
| **1** | **Requirement → Code** | One-liner or requirements doc → auto task decomposition → implement one by one |
| **2** | **AI-generated UI Design** | `design` command generates `.pen` mockups; coding agent auto-references designs for UI fidelity |
| **3** | **Long-running Autonomy** | Multi-session orchestration + activity monitoring — Agent codes for hours unattended |
| **4** | **Self-healing** | Auto-rollback on failure, AI repairs corrupted files, auto-skip after repeated failures |
| **5** | **Auto Code Review** | Every N sessions, AI reviews accumulated changes — removes redundancy, refactors |
| **6** | **Any Model** | Claude, DeepSeek, GLM, Qwen, or any Anthropic-compatible API |
| **7** | **Hook Prompt Injection** | JSON-configured rules inject guidance during tool calls — extend AI behavior without code changes |

---

## Command Reference

| Command | Description |
|---------|-------------|
| `setup` | Interactive configuration (model, MCP, safety limits) |
| `init` | Initialize project (scan tech stack, generate profile) |
| `go [requirement]` | AI-driven requirement assembly |
| `plan "requirement"` | Generate plan and decompose tasks |
| `plan -r [file]` | Generate plan from requirements file |
| `design [requirement]` | AI-generated UI design (`.pen` files) |
| `design --type fix` | Repair non-compliant design files |
| `run [requirement]` | Auto-coding loop |
| `simplify [focus]` | Code review and simplification |
| `auth [url]` | Configure browser test tools |
| `status` | View progress and costs |

**Options**: `--max N` limit sessions / `--pause N` pause every N / `--dry-run` preview / `--model M` specify model

---

## Recommended Models

### Long-running Agent (Most Stable)

```bash
ANTHROPIC_DEFAULT_OPUS_MODEL=glm-5
ANTHROPIC_DEFAULT_SONNET_MODEL=qwen3-coder-next
ANTHROPIC_DEFAULT_HAIKU_MODEL=qwen3-coder-plus
ANTHROPIC_MODEL=kimi-k2.5
```

### Personal Use (Strongest)

```bash
ANTHROPIC_DEFAULT_OPUS_MODEL=qwen3-max-2026-01-23
ANTHROPIC_DEFAULT_SONNET_MODEL=qwen3-coder-next
ANTHROPIC_DEFAULT_HAIKU_MODEL=qwen3-coder-plus
ANTHROPIC_MODEL=glm-5
```

---

## Learn More

| Document | Description |
|----------|-------------|
| [Architecture](../design/ARCHITECTURE.md) | Session class, module relations, prompt injection |
| [Hook Mechanism](../design/hook-mechanism.md) | Matching pipeline, config format, side effects |
| [Session Guard](../design/session-guard.md) | Countdown detection, tool state tracking |
| [Go Command](../design/go-flow.md) | Requirement assembly, recipe system |
| [UI Design Flow](../design/ui-design-flow.md) | Design command, .pen format, coding integration |
| [Browser Tools](PLAYWRIGHT_CREDENTIALS.md) | Playwright / Chrome DevTools MCP |
| [SDK Guide](CLAUDE_AGENT_SDK_GUIDE.md) | Claude Agent SDK API reference |

---

## Project Structure

```
your-project/
  .claude-coder/              # Runtime data (gitignored)
    .env                    # Model config
    project_profile.json    # Project scan results
    tasks.json              # Task list + status
    design/                 # UI design files
      design_map.json       # Design-to-page mapping
      pages/                # Page designs (.pen)
    go/                     # Go command output
    recipes/                # Recipe library (optional)
    .runtime/
      harness_state.json    # Runtime state
      logs/                 # Per-session logs
```

## FAQ

**Resume after interruption**: Just re-run `claude-coder run` — picks up where it left off.

**Skip a task**: Set `status` to `"done"` in `.claude-coder/tasks.json`.

**Long idle**: The model may have extended thinking on complex tasks. Auto-interrupts and retries after threshold. Adjust via `claude-coder setup`.

---

---

## References

[Anthropic: Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)

## License

MIT
