#!/usr/bin/env python3
"""Dev-only generator: emits the 5 static role pages from one shell template.
Output is plain static HTML (the deployed site has no build step)."""
import html as _h

FONTS = '<link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet">'

CONTACT_BTNS = """
        <a href="https://thetrillioniar.me" target="_blank" rel="noopener" class="btn btn-primary" aria-label="Open thetrillioniar.me in a new tab">thetrillioniar.me <span aria-hidden="true">&#8599;</span></a>
        <a href="mailto:abdulhadijunaidahmedkhan@gmail.com" class="btn btn-ghost">Email</a>
        <a href="https://github.com/Abdulhadi446" target="_blank" rel="noopener" class="btn btn-ghost" aria-label="Abdulhadi on GitHub">GitHub</a>
        <a href="https://www.linkedin.com/in/abdulhadi-junaid-485795378/" target="_blank" rel="noopener" class="btn btn-ghost" aria-label="Abdulhadi on LinkedIn">LinkedIn</a>
        <a href="https://huggingface.co/thetrillioniar" target="_blank" rel="noopener" class="btn btn-ghost" aria-label="Abdulhadi on HuggingFace">HuggingFace</a>"""


def tags_html(tags):
    return "".join(f'<span class="tag">{_h.escape(t)}</span>' for t in tags)


def chips_html(chips):
    return "".join(f'<span class="chip">{_h.escape(c)}</span>' for c in chips)


def render_featured(f):
    side = []
    if f.get("img"):
        side.append(f'<figure class="work-shot"><img src="{f["img"]["src"]}" alt="{_h.escape(f["img"]["alt"])}" width="960" height="600" loading="lazy"></figure>')
    if f.get("metric"):
        side.append(f'<div class="project-metric"><strong>{f["metric"][0]}</strong><span>{f["metric"][1]}</span></div>')
    if f.get("link"):
        l = f["link"]
        aria = f' aria-label="{_h.escape(l["aria"])}"' if l.get("aria") else ""
        side.append(f'<a href="{l["href"]}" target="_blank" rel="noopener" class="p-link"{aria}>{_h.escape(l["label"])} <span aria-hidden="true">&#8599;</span></a>')
    items = "".join(f"<li>{i}</li>" for i in f["list"])
    return f"""    <article class="work-featured reveal" data-tilt>
      <div class="wf-grid">
        <div class="wf-main">
          <p class="wf-role">{_h.escape(f["role"])}</p>
          <h3>{_h.escape(f["title"])}</h3>
          <p class="wf-desc">{_h.escape(f["desc"])}</p>
          <ul class="wf-list">{items}</ul>
          <div class="p-tags">{tags_html(f["tags"])}</div>
        </div>
        <div class="wf-side">{''.join(side)}</div>
      </div>
    </article>"""


def render_item(it):
    head_bits = [f'<p class="wf-role">{_h.escape(it["role"])}</p>',
                 f'<h3>{_h.escape(it["title"])}</h3>',
                 f'<p class="wf-desc">{_h.escape(it["desc"])}</p>']
    if it.get("img"):
        head_bits.append(f'<figure class="work-shot"><img src="{it["img"]["src"]}" alt="{_h.escape(it["img"]["alt"])}" width="800" height="260" loading="lazy"></figure>')
    if it.get("form"):
        fm = it["form"]
        head_bits.append(f"""<form class="project-tool sodeom-tool" action="{fm["action"]}" method="get" target="_blank" rel="noopener">
              <label for="sodeom-query">{_h.escape(fm["label"])}</label>
              <div class="project-tool-row">
                <input id="sodeom-query" name="q" type="search" placeholder="{_h.escape(fm["ph"])}" autocomplete="off" required>
                <button type="submit" aria-label="Search with Sodeom">Search</button>
              </div>
            </form>""")
    link = ""
    if it.get("link"):
        l = it["link"]
        aria = f' aria-label="{_h.escape(l["aria"])}"' if l.get("aria") else ""
        link = f'<a href="{l["href"]}" target="_blank" rel="noopener" class="p-link"{aria}>{_h.escape(l["label"])} <span aria-hidden="true">&#8599;</span></a>'
    items = "".join(f"<li>{i}</li>" for i in it["list"])
    return f"""      <article class="work-item reveal">
        <div class="wi-head">
          <div>{''.join(head_bits)}</div>
          {link}
        </div>
        <ul class="wi-list">{items}</ul>
        <div class="p-tags">{tags_html(it["tags"])}</div>
      </article>"""


def render_skills(cards):
    out = []
    for c in cards:
        cls = "skill-card skill-card-accent" if c.get("accent") else "skill-card"
        out.append(f"""      <div class="{cls}">
        <div class="skill-head"><div class="skill-ico" aria-hidden="true">{_h.escape(c["ico"])}</div><h3>{_h.escape(c["title"])}</h3></div>
        <div class="skill-items">{chips_html(c["chips"])}</div>
      </div>""")
    return "\n".join(out)


def render_proof(stats, link):
    items = "".join(
        f'<div class="proof-item"><strong data-count="{n}">{n}</strong><small>{_h.escape(lab)}</small></div>'
        for n, lab in stats)
    aria = f' aria-label="{_h.escape(link["aria"])}"' if link.get("aria") else ""
    return f"""  <div class="proof-strip reveal" aria-label="{_h.escape(link.get("k","Proof"))}">
    <span class="proof-k">{_h.escape(link["k"])}</span>
    {items}
    <a href="{link["href"]}" target="_blank" rel="noopener"{aria}>{_h.escape(link["label"])} &#8599;</a>
  </div>"""


def render_dossier(rows):
    out = []
    for dt, dd in rows:
        out.append(f'<div class="dossier-row"><dt>{_h.escape(dt)}</dt><dd>{dd}</dd></div>')
    return "".join(out)


SHELL = """<!DOCTYPE html>
<html lang="en" data-role="__ROLE__">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Abdulhadi: __NAVROLE__</title>
<meta name="description" content="__DESC__">
<script>document.documentElement.classList.add('js');</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
__FONTS__
<link rel="stylesheet" href="styles.css">
</head>
<body>

<div class="grain" aria-hidden="true"></div>

<div class="nav-shell">
  <nav aria-label="Primary">
    <a href="index.html" class="logo"><span class="logo-mark" aria-hidden="true">A</span> Abdulhadi <span class="role-name">/__ROLEKEY__</span></a>
    <div class="nav-links">
      <a href="#work">Work</a>
      <a href="#skills">Skills</a>
      <a href="#about">About</a>
      <a href="#contact">Contact</a>
    </div>
    <div class="nav-tools">
      <a href="index.html" class="nav-home">All tracks</a>
      <a href="#contact" class="nav-cta">Start a conversation <span aria-hidden="true">&#8599;</span></a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu" aria-label="Open navigation menu"><span></span><span></span></button>
    </div>
  </nav>
  <div class="mobile-menu" id="mobile-menu">
    <a href="#work">Work</a>
    <a href="#skills">Skills</a>
    <a href="#about">About</a>
    <a href="#contact">Contact</a>
    <a href="index.html">All tracks</a>
  </div>
</div>

<div class="wrap">

  <header class="hero">
    <div class="hero-copy">
      <p class="eyebrow">__EYEBROW__</p>
      <h1 class="hero-title">__TITLE__</h1>
      <p class="lede">__LEDE__</p>
      <div class="hero-cta">
        <a href="#work" class="btn btn-primary">See the work <span aria-hidden="true">&#8595;</span></a>
        <a href="#contact" class="text-link">Get in touch</a>
      </div>
    </div>
    <aside class="hero-aside reveal">
      <div class="signal-card" data-tilt>
        <div class="signal-top"><span class="live-dot" aria-hidden="true"></span> __SIGNAL_TOP__</div>
        <h2>__SIGNAL_TITLE__</h2>
        <p>__SIGNAL_DESC__</p>
        <a href="__SIGNAL_HREF__" target="_blank" rel="noopener" class="signal-link">__SIGNAL_LABEL__ <span aria-hidden="true">&#8599;</span></a>
      </div>
    </aside>
  </header>

__PROOF__

  <section id="work">
    <div class="sec-head reveal">
      <h2>__WORK_H__</h2>
      <p class="sec-sub">__WORK_SUB__</p>
    </div>
__FEATURED__
    <div class="work-list">
__ITEMS__
    </div>
  </section>

  <section id="skills">
    <div class="sec-head reveal">
      <h2>__SKILLS_H__</h2>
    </div>
    <div class="skills-grid reveal">
__SKILLS__
    </div>
  </section>

  <section id="about">
    <div class="sec-head reveal">
      <h2>__ABOUT_H__</h2>
    </div>
    <div class="about-grid">
      <div class="about-text reveal">
__ABOUT_TEXT__
      </div>
      <div class="about-side reveal">
        <figure class="portrait">
          <img src="https://github.com/Abdulhadi446.png" alt="Portrait of Abdulhadi" width="460" height="460" loading="lazy">
        </figure>
        <dl class="dossier">
__DOSSIER__
        </dl>
      </div>
    </div>
  </section>

  <section id="education">
    <div class="edu reveal">
      <div class="edu-bar" aria-hidden="true"></div>
      <div class="edu-main">
        <h2 class="edu-title">Still learning. Always shipping.</h2>
        <h3>Agentic AI program, batch 3 at SMIT</h3>
        <p>Specialized program focused on agentic systems, LLM orchestration, and production AI workflows.</p>
      </div>
      <div class="edu-dates">Dec 2025 - Aug 2026</div>
    </div>
  </section>

  <section id="contact">
    <div class="contact-box reveal">
      <h2>Have a hard problem?<br><em>Let's make it real.</em></h2>
      <p>__CONTACT_SUB__</p>
      <div class="contact-links">
__CONTACT_BTNS__
      </div>
    </div>
  </section>

</div>

<footer>
  <div class="wrap foot-in">
    <div class="foot-copy">&copy; 2026 Abdulhadi <span>__NAVROLE__</span></div>
    <div class="foot-links">
      <a href="index.html" class="foot-back">&#8592; All tracks</a>
      <a href="https://thetrillioniar.me" target="_blank" rel="noopener">Website</a>
      <a href="https://sodeom.com" target="_blank" rel="noopener">Sodeom</a>
      <a href="https://blogs.thetrillioniar.me" target="_blank" rel="noopener">Blog</a>
      <a href="https://github.com/Abdulhadi446" target="_blank" rel="noopener">GitHub</a>
      <a href="https://huggingface.co/thetrillioniar" target="_blank" rel="noopener">HuggingFace</a>
    </div>
  </div>
</footer>

<script src="script.js"></script>
</body>
</html>
"""

# ---------------------------------------------------------------- ROLES
ROLES = [
  # ======================= AI / ML ENGINEER =======================
  dict(
    file="ai-ml-engineer.html", role="ai-ml", rolekey="ai-ml", navrole="AI/ML Engineer",
    desc="Abdulhadi is an AI/ML engineer working on quantization, distillation, and model evaluation: 1.58-bit ternary models, distillation datasets, and benchmarks.",
    eyebrow="AI/ML Engineer",
    title='Compressing models to their <span class="cond">essence</span>.',
    lede="Quantization, distillation, and evaluation. Making big models small enough to actually run, and proving they still work.",
    signal_top="Open-source research", signal_title="TriMind",
    signal_desc="BitNet and ternary quantization, distilled and benchmarked in the open.",
    signal_href="https://huggingface.co/thetrillioniar", signal_label="See the models",
    proof_k="Public research log",
    stats=[(66, "public repos"), (976, "finetune dataset pulls / mo"), (95, "bitnet model pulls / mo")],
    proof_link=dict(k="Research", href="https://huggingface.co/thetrillioniar", label="On HuggingFace", aria="Abdulhadi on HuggingFace"),
    work_h='Quantize. Distill.<br><span>Then measure.</span>',
    work_sub="Research that ships as tools, checkpoints, and datasets anyone can pull.",
    featured=dict(
      role="Open-source research", title="TriMind",
      desc="Quantization and distillation research, open-sourced and published.",
      list=[
        "Compared Qwen3-8B quantization tiers, FP32, INT4, INT2, Q2_K, and BitNet, on Kaggle 2xT4 using LLaMA-Factory and TRL.",
        "Built quant-it, a 1-bit and ternary quantization tool that is MoE-aware, with expert batch streaming and STE distillation, tuned for 2x T4 and 32GB RAM.",
        "Published thetrillioniar/Qwen3-8B-1Q and gemma-4-12b-bitnet on HuggingFace as pullable checkpoints.",
        "Shipped trimind-bitnet, a post-training pipeline that swaps every nn.Linear for a TernaryLinear with hardware auto-detect across CUDA, TPU, and CPU.",
      ],
      tags=["Quantization", "BitNet", "ternary", "LLaMA-Factory", "TRL", "PyTorch", "Unsloth"],
      img=dict(src="assets/work-trillionir.jpg", alt="The Trillionir AI homepage showing open-source models behind one API"),
      metric=("1.58", "bit ternary<br>weights"),
      link=dict(href="https://huggingface.co/thetrillioniar", label="HuggingFace", aria="Abdulhadi on HuggingFace"),
    ),
    items=[
      dict(role="Distillation", title="Distillation datasets",
           desc="Teacher to student, turned into clean training data.",
           list=[
             "Built a Claude and OpenAI fine-tuning dataset of about 1.5M rows across 29 sources, including GSM8K, IFEval, HumanEval, and SWE-bench Pro.",
             "Generated a Mythos and Fable model-outputs dataset in OpenAI messages format, later used as training data by another team.",
             "Ran QLoRA on Kimi-VL-A3B-Thinking, a GLM-5.2 distillation set, and distilled Qwen3.6-35B-A3B into Falcon 3B.",
           ],
           tags=["Distillation", "QLoRA", "PEFT", "OpenAI format", "HuggingFace"],
           link=dict(href="https://huggingface.co/thetrillioniar", label="Datasets", aria="Abdulhadi datasets on HuggingFace")),
      dict(role="Evaluation", title="Model evaluation",
           desc="Benchmarks that tell you if compression actually cost anything.",
           list=[
             "Built a RULER-inspired benchmark measuring how retrieval affects long-context performance across three cloud LLMs on retrieval, reasoning, and aggregation.",
             "Runs an openbench evaluation pipeline against a custom OpenAI-compatible proxy, covering Gemma 4 31B, Devstral 24B, and SmolLM 135M.",
             "Shipped the Trillionir Decision API: a self-hosted verdict-151m ModernBERT classifier returning calibrated probabilities with an abstention option.",
           ],
           tags=["openbench", "RULER", "ModernBERT", "Benchmarking", "Calibration"]),
      dict(role="Efficient systems", title="omnimodel",
           desc="A multimodal system that fits in 1GB of RAM.",
           list=[
             "Built a multimodal pipeline handling text, image, audio, video, and PDF on 1GB RAM hardware.",
             "Focus on serving constrained environments rather than datacenter GPUs.",
           ],
           tags=["Multimodal", "Efficient inference", "Python"]),
    ],
    skills=[
      dict(ico="AI", accent=True, title="Core ML", chips=["Quantization", "Distillation", "Model evaluation", "Benchmarking", "BitNet / ternary", "QLoRA / PEFT"]),
      dict(ico="TR", title="Training", chips=["PyTorch", "LLaMA-Factory", "TRL", "Unsloth", "DeepSpeed", "Kaggle 2xT4"]),
      dict(ico="HF", title="HuggingFace", chips=["Transformers", "Safetensors", "Model cards", "Dataset publishing", "Fine-tuning JSONL"]),
      dict(ico="BE", title="ML systems", chips=["FastAPI", "OpenAI SDK", "Calibrated classifiers", "Serving", "Routing"]),
      dict(ico="EV", title="Evaluation", chips=["openbench", "RULER-style RAG", "Long-context", "Abstention"]),
      dict(ico="+", title="Also", chips=["MoE", "Expert batching", "Small models", "Model selection", "Python"]),
    ],
    about_h='Research that<br><span>ships.</span>',
    about_text=[
      "AI/ML engineer deep in the weeds on <strong>quantization, distillation, and evaluation</strong>. The goal is always the same: keep the capability, delete the weight.",
      "Published work includes <strong>1-bit and ternary checkpoints</strong>, MoE-aware quantization tooling, and about <strong>1.5M rows</strong> of fine-tuning data other people actually train on.",
      "Compared FP32, INT4, INT2, Q2_K, and BitNet on <strong>Kaggle 2xT4</strong>, so the research is grounded in hardware that students and small teams really have.",
      "Moderator of an AI research community, and regularly reading into <strong>HRM, inference-time scaling, interpretability, and small models</strong>.",
    ],
    contact_sub="Open to ML engineering work, quantization and evaluation problems, and open-source collaboration.",
    dossier_rows=[
      ("Location", "Karachi, Pakistan"),
      ("Focus", "Quantization and small models"),
      ("Models", '<a href="https://huggingface.co/thetrillioniar" target="_blank" rel="noopener">thetrillioniar on HuggingFace</a>'),
      ("Role", "AI/ML engineer"),
      ("Education", "Agentic AI, batch 3 at SMIT"),
    ],
  ),

  # ======================= AI AUTOMATION ENGINEER =======================
  dict(
    file="ai-automation-engineer.html", role="ai-automation", rolekey="ai-automation", navrole="AI Automation Engineer",
    desc="Abdulhadi builds AI automation: cron agents, content and outreach pipelines, n8n flows, and self-running growth systems.",
    eyebrow="AI Automation Engineer",
    title='Agents that <span class="cond">run</span> the business.',
    lede="Cron-driven agents, content pipelines, and growth automation that keep working after I close the laptop.",
    signal_top="Always on", signal_title="Hermes growth loop",
    signal_desc="Four cron agents running blog, research, outreach, and video on their own.",
    signal_href="https://blogs.thetrillioniar.me", signal_label="See the output",
    proof_k="Automation log",
    stats=[(103, "articles auto-published"), (4, "cron agents"), (66, "public repos")],
    proof_link=dict(k="Pipeline", href="https://blogs.thetrillioniar.me", label="Read the blog", aria="Abdulhadi's automated blog"),
    work_h='Set it running.<br><span>It keeps running.</span>',
    work_sub="Pipelines that write, research, reach out, and publish without a human in the loop.",
    featured=dict(
      role="Automation, growth", title="Hermes growth loop",
      desc="Cron-driven agents running the Trillionir and Sodeom growth loop.",
      list=[
        "Blog agent searches the web for AI news and auto-publishes posts to blogs.thetrillioniar.me.",
        "Research agent hunts founders' emails from sources like Hacker News hiring posts and writes a daily lead CSV.",
        "Outreach agent reads that file and cold-emails each lead through Resend with the self-hosted-models pitch, sending them to the B2B form.",
        "Video agent turns JS animations into short videos and posts them via Buffer. All agents run on gemma4:31b from Ollama, and an n8n flow mirrors daily commit activity to LinkedIn.",
      ],
      tags=["Hermes", "Cron agents", "Resend", "Ollama", "n8n", "Buffer"],
      img=dict(src="assets/work-b2b.png", alt="The Trillionir business tier page that the outreach funnel sends leads to"),
      metric=("4", "agents on<br>a schedule"),
      link=dict(href="https://b2b-sodeom.netlify.app/", label="B2B form", aria="The Trillionir B2B form"),
    ),
    items=[
      dict(role="Automation, media", title="AI blog and video pipeline",
           desc="Daily AI news posts and short-form video, fully automated.",
           img=dict(src="assets/work-blog.jpg", alt="The Trillionir blog homepage with article counts and latest posts"),
           list=[
             "Built an AI-powered cron pipeline that auto-writes daily AI news posts, using MCP tool calling for live web search and dynamic model selection across providers.",
             "Evaluated models on reasoning, tool-calling, and rate limits, landing on mistral-medium-3.5 with gemma4:31b as a quota-efficient fallback.",
             "Extended it into a daily speedrun: posts become short videos with edge-tts narration and ffmpeg slideshows, auto-published to LinkedIn and YouTube through Buffer.",
           ],
           tags=["MCP tool use", "Cron pipelines", "Dynamic model selection", "edge-tts", "ffmpeg", "Buffer"],
           link=dict(href="https://blogs.thetrillioniar.me", label="Visit site", aria="Visit the automated blog")),
      dict(role="Framework", title="AgentOS",
           desc="A way to automate everything, even the automation.",
           list=[
             "Built an agent and automation framework in Python for wiring scheduled, tool-using agents together.",
             "Designed around composable agents that can be run, monitored, and extended without a heavy orchestration dependency.",
           ],
           tags=["Python", "Agents", "Orchestration", "Open source"],
           link=dict(href="https://github.com/Abdulhadi446", label="GitHub", aria="Abdulhadi on GitHub")),
      dict(role="Automation, ops", title="Pipeline plumbing",
           desc="The unglamorous glue that keeps it all alive.",
           list=[
             "Runs upptime to monitor the visibility and uptime of every property he ships.",
             "Uses n8n to mirror commit activity to LinkedIn, and claude-code-installer style tooling to keep agent environments reproducible.",
             "Browser automation and web scraping feed research agents without hand-collected data.",
           ],
           tags=["n8n", "Upptime", "Browser automation", "Web scraping", "Observability"]),
    ],
    skills=[
      dict(ico="AU", accent=True, title="Pipelines", chips=["Cron pipelines", "MCP tool use", "Dynamic model selection", "n8n", "Background jobs"]),
      dict(ico="AG", title="Agents", chips=["Agent orchestration", "Tool calling", "Hermes", "OpenClaw", "OpenCode", "AgentOS"]),
      dict(ico="OUT", title="Outreach", chips=["Resend", "Cold email", "Lead research", "Buffer", "LinkedIn"]),
      dict(ico="MED", title="Media", chips=["edge-tts", "ffmpeg", "Short-form video", "Slideshow rendering"]),
      dict(ico="OP", title="Runtime", chips=["Ollama", "gemma4:31b", "Linux / Ubuntu", "System admin", "Cloudflare Tunnel"]),
      dict(ico="+", title="Also", chips=["Web scraping", "Browser automation", "Model selection", "Debugging", "Product shipping"]),
    ],
    about_h='Nothing runs<br><span>twice.</span>',
    about_text=[
      "AI automation engineer who builds systems that <strong>keep working unattended</strong>. If a task repeats, it becomes an agent on a schedule.",
      "The growth loop runs four <strong>cron agents</strong> for blog, research, outreach, and video, all on self-hosted models through Ollama, coordinated with <strong>n8n</strong>.",
      "Extended that into a fully automated <strong>content engine</strong>: over 100 articles published on a near-daily cadence, plus short-form video pushed out through Buffer.",
      "Comfortable wiring the boring parts too: <strong>scraping, uptime monitoring, lead CSVs, and reproducible agent environments</strong>.",
    ],
    contact_sub="Open to automation engineering, agent pipeline work, and systems that should run themselves.",
    dossier_rows=[
      ("Location", "Karachi, Pakistan"),
      ("Focus", "Agents and automation"),
      ("Blog", '<a href="https://blogs.thetrillioniar.me" target="_blank" rel="noopener">blogs.thetrillioniar.me</a>'),
      ("Role", "AI automation engineer"),
      ("Education", "Agentic AI, batch 3 at SMIT"),
    ],
  ),

  # ======================= FOUNDER =======================
  dict(
    file="founder.html", role="founder", rolekey="founder", navrole="Founder",
    desc="Abdulhadi is the founder of Trillionir AI, a flat-rate LLM inference platform, and Sodeom, a privacy-first search engine.",
    eyebrow="Founder",
    title='Two products, <span class="cond">end to end</span>.',
    lede="I build and run Trillionir AI and Sodeom: from the inference layer down to the landing page and the outreach that brings users in.",
    signal_top="Currently building", signal_title="Trillionir AI",
    signal_desc="Flat-rate inference with OpenAI and Anthropic compatible routing.",
    signal_href="https://thetrillioniar.me", signal_label="Visit the platform",
    proof_k="Founder log",
    stats=[(21, "community users"), (371, "k requests served"), (4, "shipped products")],
    proof_link=dict(k="Trillionir", href="https://thetrillioniar.me", label="See the platform", aria="Open the Trillionir platform"),
    work_h='Idea to running<br><span>software.</span>',
    work_sub="Products I own end to end: architecture, shipping, users, and growth.",
    featured=dict(
      role="Founder, infrastructure", title="Trillionir AI",
      desc="A flat-rate LLM inference API with OpenAI and Anthropic compatible routing.",
      list=[
        "Shipped a flat-rate LLM inference API with OpenAI and Anthropic compatible routing, so clients swap in with zero code changes. Inference that just works and never says it is out of credits.",
        "Built a model evaluation pipeline with openbench against a custom OpenAI-compatible proxy, benchmarking models including Gemma 4 31B, Devstral 24B, and SmolLM 135M.",
        "Running an early Community Hub: 21 users, 371k requests, and 62k tokens served in the first weeks (October 2026).",
        "Shipping a B2B tier for unlimited open-weight tokens, already serving a Minecraft server owner's AI bots at around 10k requests a day.",
      ],
      tags=["OpenAI SDK", "API routing", "Model evaluation", "openbench", "Ubuntu", "Docker"],
      img=dict(src="assets/work-trillionir.jpg", alt="The Trillionir AI homepage: open-source AI, one API, free for individuals"),
      metric=("∞", "flat-rate<br>inference"),
      link=dict(href="https://thetrillioniar.me/", label="Visit site", aria="Visit thetrillioniar.me"),
    ),
    items=[
      dict(role="Founder, search", title="Sodeom",
           desc="Zero-tracking search across web, image, video, and news.",
           img=dict(src="assets/work-sodeom.png", alt="The Sodeom search engine homepage: private search without tracking"),
           form=dict(action="https://sodeom.com/", label="Search privately", ph="Search the web..."),
           list=[
             "Built and operate a privacy-first search engine with zero tracking, spanning web, image, video, and news search.",
             "Rebuilt search on SearXNG after originally crawling result pages directly, cutting the maintenance surface.",
             "Stood up sodeom.com/v1, an OpenAI-compatible proxy endpoint that powers product AI features and external model benchmarking.",
             "Shipped Aura Counter, a satirical counter with a full account system, under the Sodeom umbrella and marketed it across social platforms.",
           ],
           tags=["SearXNG", "Privacy", "OpenAI-compatible proxy", "Growth"],
           link=dict(href="https://sodeom.com", label="Visit site", aria="Visit sodeom.com")),
      dict(role="Founder, growth", title="B2B and the growth engine",
           desc="Getting users without a sales team.",
           list=[
             "Shipping a B2B tier with a lead-gen form, budget buckets, and a same-day reply promise, sizing dedicated deployments against a client's current spend.",
             "A four-agent growth loop handles blog, lead research, cold outreach through Resend, and video, all on self-hosted models.",
             "The automated blog doubles as the content marketing channel: over 100 articles on a near-daily cadence.",
           ],
           tags=["B2B", "Lead gen", "Resend", "Content marketing", "n8n"],
           link=dict(href="https://b2b-sodeom.netlify.app/", label="B2B form", aria="The Trillionir B2B form")),
      dict(role="Founder, research", title="TriMind",
           desc="Open-source research that feeds the product story.",
           list=[
             "Open-source quantization and distillation research that keeps the Trillionir brand technical and credible.",
             "Published quantized checkpoints and datasets on HuggingFace that other teams pull and train on.",
           ],
           tags=["Quantization", "Open source", "HuggingFace"],
           link=dict(href="https://huggingface.co/thetrillioniar", label="HuggingFace", aria="Abdulhadi on HuggingFace")),
    ],
    skills=[
      dict(ico="FO", accent=True, title="Founding", chips=["Product shipping", "Platform ops", "Roadmap", "Wearing every hat"]),
      dict(ico="GTM", title="Go to market", chips=["B2B lead gen", "Cold outreach", "Content marketing", "Social", "Community"]),
      dict(ico="API", title="Platform", chips=["API design", "OpenAI compatibility", "Model evaluation", "Routing", "Usage dashboards"]),
      dict(ico="INF", title="Infrastructure", chips=["Linux / Ubuntu", "Docker", "Cloudflare Tunnel", "Ollama", "Self-hosting"]),
      dict(ico="EV", title="Quality", chips=["openbench", "Benchmarking", "Model selection", "Honest benchmarks"]),
      dict(ico="+", title="Also", chips=["Full-stack delivery", "Search infra", "Product design", "Debugging"]),
    ],
    about_h='Owner of the<br><span>whole stack.</span>',
    about_text=[
      "Founder running <strong>Trillionir AI</strong> and <strong>Sodeom</strong>, built and operated end to end. That means the inference layer, the landing page, the pricing, and the outreach that brings people in.",
      "Trillionir puts <strong>open-weight models behind one OpenAI-compatible API</strong> at a flat rate, so developers swap a base URL and never hit a credit wall.",
      "Sodeom is a <strong>privacy-first search engine</strong>: no cookies, no profiles, no tracking, running on SearXNG.",
      "Both products are <strong>self-hosted and bootstrapped</strong>, which keeps me close to every cost, outage, and decision.",
    ],
    contact_sub="Open to inference platform clients, collaborations, and talking to other founders.",
    dossier_rows=[
      ("Location", "Karachi, Pakistan"),
      ("Role", "Founder, Trillionir AI and Sodeom"),
      ("Website", '<a href="https://thetrillioniar.me" target="_blank" rel="noopener">thetrillioniar.me</a>'),
      ("Products", "Trillionir AI, Sodeom"),
      ("Education", "Agentic AI, batch 3 at SMIT"),
    ],
  ),

  # ======================= FULLSTACK DEVELOPER =======================
  dict(
    file="fullstack-developer.html", role="fullstack", rolekey="fullstack", navrole="Fullstack Developer",
    desc="Abdulhadi builds fullstack web apps with Next.js, React, and TypeScript, from 3D showcases to AI product interfaces.",
    eyebrow="Fullstack Developer",
    title='Interfaces with <span class="cond">craft</span>.',
    lede="Next.js, React, and TypeScript. Product UIs, 3D showcases, and the dashboards that make AI systems usable.",
    signal_top="Showcase", signal_title="Porsche 911",
    signal_desc="Next.js 16, React 19, and React Three Fiber, with a scroll-driven timeline.",
    signal_href="https://github.com/Abdulhadi446/porsches", signal_label="See the repo",
    proof_k="Build log",
    stats=[(161, "spec'd variants"), (179, "prerendered routes"), (66, "public repos")],
    proof_link=dict(k="Frontend", href="https://github.com/Abdulhadi446", label="On GitHub", aria="Abdulhadi on GitHub"),
    work_h='Polished where<br><span>it counts.</span>',
    work_sub="From hackathon-speed builds to production product interfaces.",
    featured=dict(
      role="Fullstack, showcase", title="Porsche 911 Showcase",
      desc="An unofficial fan showcase of every 911 generation, built as a front-end tour de force.",
      list=[
        "Next.js 16 App Router, React 19, strict TypeScript, and Tailwind v4 across 9 chapters and 161 spec'd variants.",
        "WebGL hero and scroll-driven timeline with React Three Fiber, GSAP ScrollTrigger, and Lenis smooth scrolling.",
        "179 prerendered routes, sharp-converted AVIF and WebP media on Cloudflare R2, and 840 attribution entries on the credits page.",
        "GitHub Actions CI, Node 24, and Playwright smoke tests, with a Wikimedia asset pipeline that tracks licenses.",
      ],
      tags=["Next.js 16", "React 19", "TypeScript", "Tailwind v4", "React Three Fiber", "GSAP", "Lenis"],
      metric=("179", "prerendered<br>routes"),
      link=dict(href="https://github.com/Abdulhadi446/porsches", label="Repo", aria="Porsche showcase repository"),
    ),
    items=[
      dict(role="Fullstack, product", title="chat-to-video and paperclip",
           desc="Hackathon-speed AI apps from a reusable project template.",
           list=[
             "chat-to-video: describe a video in chat, get a rendered MP4 back, built in under 12 hours.",
             "paperclip: a companion build from the same template, proving the setup ships real features fast.",
             "Both use a personal project template that handles auth, layout, and deploy so the focus stays on the idea.",
           ],
           tags=["TypeScript", "AI product", "Template", "Hackathons"]),
      dict(role="Fullstack, 3D", title="Trisonic and Library of Babel",
           desc="Creative coding with real interaction.",
           list=[
             "Trisonic: a Spotify-style player driven by a conversational AI agent that controls playback.",
             "3D Library of Babel: the Library of Babel explorable in 3D, with doors.",
             "An every-model Audi site built by parallel sub-agents, and a Blender city rendered through Blender MCP.",
           ],
           tags=["Three.js", "Generative", "Creative coding", "AI control"]),
      dict(role="Fullstack, product UI", title="Product interfaces",
           desc="The UIs behind the AI systems.",
           list=[
             "Trillionir chat and dashboard UI: model picker, Chat and Decide tabs, and a real-time token, latency, and cost dashboard.",
             "Sodeom search interface with a working private search box across web, image, video, and news.",
             "HCM Lite: an AI-assisted human capital management app built for a hackathon, plus portfolio and design system work.",
           ],
           tags=["React", "Dashboard", "Supabase", "Search UI", "Design systems"]),
    ],
    skills=[
      dict(ico="UI", accent=True, title="Frontend", chips=["Next.js", "React", "TypeScript", "Tailwind", "Framer Motion", "GSAP"]),
      dict(ico="3D", title="Immersive", chips=["React Three Fiber", "three.js", "WebGL", "Lenis", "ScrollTrigger", "Postprocessing"]),
      dict(ico="BE", title="Backend", chips=["FastAPI", "REST API design", "Supabase", "Webhooks", "Background jobs"]),
      dict(ico="DX", title="Tooling", chips=["Next.js 16", "React 19", "Vercel", "GitHub Actions", "Playwright", "Node 24"]),
      dict(ico="MEDIA", title="Media", chips=["Cloudflare R2", "AVIF / WebP", "sharp", "ffmpeg", "Edge storage"]),
      dict(ico="+", title="Also", chips=["Dark mode", "Design systems", "Responsive UI", "Accessibility", "Product shipping"]),
    ],
    about_h='Comfortable in<br><span>the browser.</span>',
    about_text=[
      "Fullstack developer equally happy in a <strong>design system and a WebGL scene</strong>. The bar is software that feels finished, not just functional.",
      "Recent front-end work spans a <strong>Porsche 911 showcase on Next.js 16 and React 19</strong>, complete with 3D, scroll animation, and a real CI pipeline.",
      "Also build the <strong>product interfaces</strong> behind the AI systems: inference dashboards, search UIs, and chat surfaces with model pickers and live metrics.",
      "Comfortable across the stack, from <strong>FastAPI backends to Tailwind frontends</strong>, and I ship fast, hackathon-style when the idea calls for it.",
    ],
    contact_sub="Open to front-end and fullstack work, product UI, and anything that should feel good to use.",
    dossier_rows=[
      ("Location", "Karachi, Pakistan"),
      ("Focus", "Next.js, React, TypeScript"),
      ("Stack", "React Three Fiber, GSAP, Tailwind"),
      ("Role", "Fullstack developer"),
      ("Education", "Agentic AI, batch 3 at SMIT"),
    ],
  ),

  # ======================= FORWARD DEPLOYED ENGINEER =======================
  dict(
    file="forward-deployed-engineer.html", role="fde", rolekey="fde", navrole="Forward Deployed Engineer",
    desc="Abdulhadi deploys AI into a customer's existing stack: drop-in API migrations, dedicated deployments, and end-to-end delivery.",
    eyebrow="Forward Deployed Engineer",
    title='Into the <span class="cond">customer\'s</span> stack.',
    lede="I take AI from pilot to production inside someone else's environment: drop-in migrations, dedicated deployments, and owning the outcome end to end.",
    signal_top="In production", signal_title="Zero-code migration",
    signal_desc="Customers swap a base URL and move off their provider with no code changes.",
    signal_href="https://thetrillioniar.me", signal_label="See how it works",
    proof_k="Delivery log",
    stats=[(0, "code changes to migrate"), (10, "k req/day for a client"), (1, "day reply time")],
    proof_link=dict(k="B2B", href="https://b2b-sodeom.netlify.app/", label="B2B form", aria="The Trillionir B2B form"),
    work_h='Embed, integrate,<br><span>own the outcome.</span>',
    work_sub="Real integration work: plugging AI into a client's stack and making it stick.",
    featured=dict(
      role="Forward deployed, integration", title="Trillionir dedicated deployments",
      desc="Moving a customer off a metered provider onto self-hosted models, without touching their code.",
      list=[
        "Drop-in compatibility with the OpenAI and Anthropic SDKs, Claude Code, and Codex, so a client changes one base URL and keeps shipping.",
        "Sizes a dedicated deployment against the client's current provider and spend, then quotes a flat rate with a same-day reply.",
        "Runs per-user Docker isolation with API keys scoped to models, IPs, and endpoints, so the deployment fits the client's security model.",
        "Ships a real-time token, latency, and cost dashboard so the customer can see the migration paying off.",
      ],
      tags=["OpenAI SDK", "Migration", "Docker", "Dedicated deployment", "Dashboards", "Scoping"],
      img=dict(src="assets/work-trillionir.jpg", alt="The Trillionir AI homepage showing one API for open-source models"),
      metric=("0", "code changes<br>to migrate"),
      link=dict(href="https://thetrillioniar.me/", label="Visit site", aria="Visit thetrillioniar.me"),
    ),
    items=[
      dict(role="Support, integration", title="TriageDesk",
           desc="A multi-agent customer support orchestrator, built to sit inside a support org.",
           list=[
             "Built a production multi-agent customer support orchestrator in Python and FastAPI, including a custom BaseAgent orchestration layer on the OpenAI SDK with no framework dependency.",
             "Deployed and operated it on an Ubuntu VM via Cloudflare Tunnel, handling day-to-day systems administration and keeping it running.",
           ],
           tags=["Python", "FastAPI", "Multi-agent", "OpenAI SDK", "Cloudflare Tunnel"]),
      dict(role="Integration surface", title="OpenAI-compatible proxies",
           desc="The layer customers actually plug into.",
           list=[
             "Runs sodeom.com/v1 and Trillionir's OpenAI and Anthropic endpoints as compatibility surfaces that external tools connect to directly.",
             "Keeps the compatibility honest: branded model names are documented as aliases routing to self-hosted models, so clients always know what they are calling.",
             "Three API surfaces (OpenAI, Anthropic, and native Ollama-style) let a client integrate without rewriting their stack.",
           ],
           tags=["OpenAI compatibility", "Anthropic API", "Ollama API", "Proxies", "JWT"],
           link=dict(href="https://thetrillioniar.me", label="Docs", aria="Trillionir platform")),
      dict(role="Client delivery", title="Shipped for real users",
           desc="Builds that ended up in someone else's hands.",
           list=[
             "Built the St. George's School learning app with an AI chatbot, a real external build for an actual institution.",
             "HCM Lite: an AI-assisted human capital management app delivered for a hackathon, aimed at a real business domain.",
             "End-to-end delivery means the boring parts too: Ubuntu servers, Cloudflare Tunnel, Docker, and keeping the lights on after handoff.",
           ],
           tags=["Client work", "Ubuntu", "Docker", "Cloudflare Tunnel", "Handoff"]),
    ],
    skills=[
      dict(ico="FD", accent=True, title="Deployment", chips=["SDK migration", "Base-URL swap", "Dedicated deployments", "Solution sizing", "Scoping"]),
      dict(ico="IN", title="Integration", chips=["OpenAI SDK", "Anthropic API", "Ollama API", "Proxies", "Webhooks", "REST"]),
      dict(ico="OPS", title="Operations", chips=["Linux / Ubuntu", "Docker", "Cloudflare Tunnel", "System admin", "Observability"]),
      dict(ico="CUS", title="Customer", chips=["Discovery", "Scoping against spend", "Same-day reply", "Dashboards", "Handoff"]),
      dict(ico="BE", title="Systems", chips=["FastAPI", "Multi-agent", "Python", "JWT", "API key scoping"]),
      dict(ico="+", title="Also", chips=["Model evaluation", "Debugging", "Product shipping", "Full-stack delivery"]),
    ],
    about_h='The last mile<br><span>is the job.</span>',
    about_text=[
      "Forward deployed engineer focused on the part most people skip: <strong>getting AI to work inside someone else's environment</strong> and staying until it sticks.",
      "The core motion is a <strong>drop-in migration</strong>: a client swaps one base URL, keeps their existing SDK and code, and moves onto self-hosted models with <strong>zero code changes</strong>.",
      "That means <strong>sizing the deployment</strong> against their current spend, scoping keys to their security model, and shipping a dashboard that proves it worked.",
      "Comfortable owning the <strong>whole delivery</strong>: Ubuntu servers, Docker isolation, Cloudflare Tunnel, and the support orchestrators and proxies that make integration real.",
    ],
    contact_sub="Open to forward deployed and solutions engineering roles, AI integration work, and hard deployment problems.",
    dossier_rows=[
      ("Location", "Karachi, Pakistan"),
      ("Focus", "AI integration and delivery"),
      ("Motion", "Drop-in migration, zero code changes"),
      ("Role", "Forward deployed engineer"),
      ("Education", "Agentic AI, batch 3 at SMIT"),
    ],
  ),
]


def build(r):
    featured = render_featured(r["featured"])
    items = "\n".join(render_item(i) for i in r["items"])
    skills = render_skills(r["skills"])
    proof = render_proof(r["stats"], r["proof_link"])
    about = "\n".join(f"        <p>{p}</p>" for p in r["about_text"])
    dossier = render_dossier(r["dossier_rows"])
    page = (SHELL
        .replace("__ROLE__", r["role"])
        .replace("__ROLEKEY__", r["rolekey"])
        .replace("__NAVROLE__", r["navrole"])
        .replace("__DESC__", r["desc"])
        .replace("__FONTS__", FONTS)
        .replace("__EYEBROW__", r["eyebrow"])
        .replace("__TITLE__", r["title"])
        .replace("__LEDE__", r["lede"])
        .replace("__SIGNAL_TOP__", r["signal_top"])
        .replace("__SIGNAL_TITLE__", r["signal_title"])
        .replace("__SIGNAL_DESC__", r["signal_desc"])
        .replace("__SIGNAL_HREF__", r["signal_href"])
        .replace("__SIGNAL_LABEL__", r["signal_label"])
        .replace("__PROOF__", proof)
        .replace("__WORK_H__", r["work_h"])
        .replace("__WORK_SUB__", r["work_sub"])
        .replace("__FEATURED__", featured)
        .replace("__ITEMS__", items)
        .replace("__SKILLS_H__", r["skills_h"] if "skills_h" in r else "Close to the metal,<br><span>comfortable in the browser.</span>")
        .replace("__SKILLS__", skills)
        .replace("__ABOUT_H__", r["about_h"])
        .replace("__ABOUT_TEXT__", about)
        .replace("__DOSSIER__", dossier)
        .replace("__CONTACT_SUB__", r["contact_sub"])
        .replace("__CONTACT_BTNS__", CONTACT_BTNS)
    )
    return page


if __name__ == "__main__":
    for r in ROLES:
        out = build(r)
        with open(r["file"], "w") as f:
            f.write(out)
        print("wrote", r["file"], len(out), "bytes")
