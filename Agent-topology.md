graph TD

    subgraph MCP["🛠 MCP Servers"]
        clerk[[Clerk Auth Server]]
        neon[[Neon DB Server]]
        github[[GitHub Agent Server]]
        git[[Local Git Server]]
        fs[[File System Server]]
        playwright[[Playwright Test Server]]
    end

    subgraph AGENTS["🤖 AI Agents"]
        codex["ChatGPT Codex Agent"]
        copilot["VS Code Copilot Agent"]
        githubAI["GitHub Copilot Agent"]
    end

    subgraph OPS["🧱 FleetFusion DevOps"]
        vercel[Vercel Hosting & CI/CD]
        db[(Neon Postgres)]
        auth[(Clerk Org + JWT)]
    end

    %% Agent Delegation
    codex --> clerk
    codex --> neon
    codex --> fs
    codex --> git

    copilot --> fs
    copilot --> playwright
    copilot --> git

    githubAI --> github
    githubAI --> vercel

    %% Runtime Coordination
    clerk --> auth
    neon --> db
    github --> vercel
    git --> github

    %% Meta
    codex --> githubAI
    copilot --> codex
