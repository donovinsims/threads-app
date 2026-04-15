# threads-app prompt pack

This pack gives you a clean starter setup for OpenCode + oh-my-opencode / oh-my-openagent.

## What is inside
- `AGENTS.md`
- `.opencode/commands/00-bootstrap-repo.md`
- `.opencode/commands/01-plan-product.md`
- `.opencode/commands/02-build-foundation.md`
- `.opencode/commands/03-build-threads-api.md`
- `.opencode/commands/04-build-ios-ui.md`
- `.opencode/commands/05-build-hermes-integration.md`
- `.opencode/commands/06-hardening-and-launch.md`
- `.opencode/oh-my-opencode.jsonc.template`

## Repo name
Use: `threads-app`

## Best execution order
1. Create a new empty repo/folder named `threads-app`
2. Copy `AGENTS.md` into the repo root
3. Copy the `.opencode` folder into the repo
4. Run `/00-bootstrap-repo`
5. Run `/01-plan-product`
6. Run `/02-build-foundation`
7. Run `/03-build-threads-api`
8. Run `/04-build-ios-ui`
9. Run `/05-build-hermes-integration`
10. Run `/06-hardening-and-launch`

## Recommended agent + model pairing
These are the practical pairings based on your current UI labels.

- `00-bootstrap-repo`
  - Agent: `atlas`
  - Preferred UI model: `Big Pickle`
  - Fallback UI model: `MiniMax M2.5 Free`

- `01-plan-product`
  - Agent: `prometheus`
  - Preferred UI model: `Big Pickle`
  - Fallback UI model: `Nemotron 3 Super Free`

- `02-build-foundation`
  - Agent: `atlas`
  - Preferred UI model: `Big Pickle`
  - Fallback UI model: `MiniMax M2.5 Free`

- `03-build-threads-api`
  - Agent: `hephaestus`
  - Preferred UI model: `Big Pickle`
  - Fallback UI model: `Nemotron 3 Super Free`

- `04-build-ios-ui`
  - Agent: `hephaestus`
  - Preferred UI model: `MiniMax M2.5 Free`
  - Fallback UI model: `Big Pickle`

- `05-build-hermes-integration`
  - Agent: `hephaestus`
  - Preferred UI model: `Big Pickle`
  - Fallback UI model: `Nemotron 3 Super Free`

- `06-hardening-and-launch`
  - Agent: `sisyphus`
  - Preferred UI model: `Nemotron 3 Super Free`
  - Fallback UI model: `Big Pickle`

## Can OpenCode switch agents and models automatically?
Yes, mostly.

OpenCode custom command files support both `agent` and `model` in command frontmatter, so a command can be pinned to a specific agent and model. OpenCode’s docs show both fields in markdown command files. citeturn492158view0

Oh My OpenAgent / Oh My OpenCode also supports agent-level model configuration, and its model resolution follows an override chain where explicit user config wins over fallback behavior. The docs recommend checking effective resolution with `bunx oh-my-opencode doctor`. citeturn492158view1turn492158view2

## Important reality check
Your screenshot shows friendly display names like `Big Pickle`, `MiniMax M2.5 Free`, and `Nemotron 3 Super Free`. Those may be aliases, not the exact model IDs OpenCode expects in command frontmatter. Because of that, the command files in this pack pin the **agent** directly and include the **recommended UI model** in the prompt text, but they do **not** hardcode a `model:` field that might be wrong.

If you want fully automatic model pinning:
1. run `opencode models`
2. find the exact model IDs behind those UI labels
3. paste those IDs into `.opencode/oh-my-opencode.jsonc.template`
4. rename it to `.opencode/oh-my-opencode.jsonc`

## First prompt to run
OpenCode should create the repo structure first, then stop.
