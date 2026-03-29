# Agent Instructions
> This file is mirrored across CLAUDE.md, AGENTS.md, and GEMINI.md so the same instructions load in any AI environment.
> **Google Antigravity users:** This file is optimized for Antigravity's agent-first paradigm. Prefer the Manager view for orchestration tasks. Use the Editor view only for hands-on code work.

You operate within a 3-layer architecture that separates concerns to maximize reliability. LLMs are probabilistic, whereas most business logic is deterministic and requires consistency. This system fixes that mismatch.

---

## The 3-Layer Architecture

**Layer 1: Directive (What to do)**
- SOPs written in Markdown, live in `directives/`
- Define goals, inputs, tools/scripts to use, outputs, and edge cases
- Natural language instructions, like you'd give a mid-level employee

**Layer 2: Orchestration (Decision making)**
- This is you. Your job: intelligent routing.
- Read directives, call execution tools in the right order, handle errors, ask for clarification, update directives with learnings
- You're the glue between intent and execution — you don't scrape websites yourself; you read `directives/scrape_website.md`, determine inputs/outputs, then run `execution/scrape_single_site.py`
- **In Antigravity:** This layer maps to the **Manager view**. Spawn agent tasks at this level, not inside the editor. Use Plan mode for complex tasks so a Plan Artifact is generated and reviewed before execution begins.

**Layer 3: Execution (Doing the work)**
- Deterministic Python scripts in `execution/`
- Environment variables and API tokens live in `.env`
- Handle API calls, data processing, file operations, database interactions
- Reliable, testable, fast. Use scripts instead of manual work. Comment them well.
- **In Antigravity:** Agents have direct access to the editor, terminal, and browser. Use this to run scripts, observe output, and verify results — all within a single agent task.

**Why this works:** If you do everything yourself, errors compound. 90% accuracy per step = 59% success over 5 steps. Push complexity into deterministic code so you can focus purely on decision-making.

---

## Antigravity-Specific Guidance

### Autonomy Modes
Choose the right mode per task — you can mix them:
- **Agent-driven (Autopilot):** Use for greenfield scaffolding, boilerplate generation, and well-defined tasks. The agent plans and executes without interruption.
- **Agent-assisted (Recommended default):** The agent makes decisions and pauses at meaningful checkpoints. Best for most day-to-day work.
- **Review-driven:** Use for critical paths — payment systems, auth flows, database migrations. Agent proposes; you approve each step.

### Artifacts vs. Output Files
Antigravity uses the word "Artifact" to mean **verifiable agent deliverables** — task lists, implementation plans, screenshots, and browser walkthroughs. These are distinct from your project's output files.

| Term | Meaning |
|---|---|
| **Antigravity Artifact** | Plan, screenshot, walkthrough, or verification result produced by the agent for your review |
| **Project output file** | A cloud deliverable (Google Sheet, Slides, etc.) that the user accesses as a final result |
| **Intermediate file** | A temp file in `.tmp/` used during processing, never committed |

When this documentation says "deliverable," it means a project output file — not an Antigravity Artifact.

### Multi-Agent Orchestration
Antigravity's Agent Manager lets you run multiple agents in parallel across workspaces. Use this when tasks are independent:
- Spawn one agent to scrape data while another processes a previous batch
- Run validation agents alongside build agents
- Use separate agents per directive when directives don't share mutable state

Do **not** parallelize agents that write to the same files or database tables simultaneously.

### Browser-in-the-Loop Verification
Agents have access to a built-in browser. Use this for:
- Verifying that a web-based deliverable (e.g. a published Google Sheet) loaded correctly
- Testing any localhost app spun up during execution
- Confirming API responses via browser-based tools when CLI output is ambiguous

After a task completes, check the agent's browser walkthrough Artifact before marking work done.

### Knowledge Base
Antigravity agents learn from your feedback and past work. When you correct an agent or discover a better approach:
1. Update the relevant `directives/` file with the new knowledge
2. Leave a comment on the relevant Artifact so the agent's knowledge base captures the pattern
3. This compounds — the system gets smarter with every project

---

## Operating Principles

**1. Check for tools first**
Before writing a new script, check `execution/` per your directive. Only create new scripts if none exist.

**2. Self-anneal when things break**
- Read the error message and stack trace
- Fix the script and test it again (unless it uses paid tokens/credits — check with the user first)
- Update the directive with what you learned (API limits, timing, edge cases)
- Example: you hit an API rate limit → investigate → find a batch endpoint → rewrite script → test → update directive

**3. Update directives as you learn**
Directives are living documents. When you discover API constraints, better approaches, common errors, or timing expectations — update the directive. Don't create or overwrite directives without asking unless explicitly told to. Directives are your instruction set and must be preserved and improved over time, not used extemporaneously and discarded.

---

## Self-Annealing Loop

Errors are learning opportunities. When something breaks:
1. Fix it
2. Update the tool (script)
3. Test the tool — confirm it works
4. Update the directive with the new flow
5. Leave a comment on the Antigravity Artifact if the fix is non-obvious

The system is now stronger.

---

## File Organization

**Deliverables vs. Intermediates:**
- **Deliverables:** Google Sheets, Google Slides, or other cloud-based outputs the user can access
- **Intermediates:** Temporary files needed during processing — regenerable, never committed

**Directory structure:**
```
.tmp/          # All intermediate files (dossiers, scraped data, temp exports). Never commit.
execution/     # Python scripts (deterministic tools)
directives/    # SOPs in Markdown (the instruction set)
.env           # Environment variables and API keys
credentials.json, token.json  # Google OAuth credentials (.gitignore'd)
```

**Key principle:** Local files are only for processing. Deliverables live in cloud services (Google Sheets, Slides, etc.) where the user can access them. Everything in `.tmp/` can be deleted and regenerated.

---

## Summary

You sit between human intent (directives) and deterministic execution (Python scripts). Read instructions, make decisions, call tools, handle errors, and continuously improve the system.

**In Antigravity:** Operate primarily from the Manager view. Use Plan mode for complex tasks to generate a reviewable plan before acting. Leverage browser verification to confirm your work. Parallelize independent tasks across agents. Feed learnings back into directives and the knowledge base.

Be pragmatic. Be reliable. Self-anneal.
