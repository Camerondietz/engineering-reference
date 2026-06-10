// app/content/artificial-intelligence.tsx

export default function ArtificialIntelligencePage() {
  return (
    <article className="prose">
      <h1>Artificial Intelligence</h1>

      <div className="doc-layout">
        <details className="doc-sidebar" open>
          <summary>On this page</summary>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#sub-fields">Sub-Fields</a></li>
            <li><a href="#ml-vs-dl">ML vs Deep Learning</a></li>
            <li><a href="#llms">Large Language Models</a></li>
            <li><a href="#workflow">ML Workflow</a></li>
            <li><a href="#tools">Tools &amp; Standards</a></li>
          </ul>
        </details>

        <div className="doc-content">
          <p>
            Artificial intelligence builds systems that perceive, reason,
            learn, and act. In practice, modern AI is dominated by{" "}
            <strong>machine learning</strong> — models trained on data
            rather than rules written by hand.
          </p>

          <h2 id="overview">Overview</h2>
          <p>
            AI ranges from classical symbolic systems (rule engines, search,
            planning) through statistical ML to today&rsquo;s deep neural networks
            and transformer-based foundation models.
          </p>

          <h2 id="sub-fields">Sub-Fields</h2>
          <ul>
            <li>Machine learning (supervised, unsupervised, reinforcement).</li>
            <li>Deep learning (CNN, RNN, Transformer, diffusion).</li>
            <li>Natural language processing (NLP).</li>
            <li>Computer vision.</li>
            <li>Robotics &amp; autonomous systems.</li>
            <li>Knowledge representation, planning, search.</li>
            <li>Reinforcement learning (PPO, SAC, DQN).</li>
          </ul>

          <h2 id="ml-vs-dl">ML vs Deep Learning</h2>
          <ul>
            <li>Classical ML — feature-engineered; linear/logistic regression, trees, SVM, gradient boosting (XGBoost, LightGBM).</li>
            <li>Deep learning — learns features; needs more data &amp; compute (GPU/TPU).</li>
            <li>For tabular data, gradient-boosted trees still often beat deep nets.</li>
            <li>For images, text, audio — deep learning wins.</li>
          </ul>

          <h2 id="llms">Large Language Models</h2>
          <ul>
            <li>Transformer architecture (attention is all you need, 2017).</li>
            <li>Pre-train on huge corpora; fine-tune or use few-shot prompting.</li>
            <li>RAG — retrieve-then-generate for up-to-date / proprietary data.</li>
            <li>Function/tool calling, agentic workflows.</li>
            <li>Evaluation — benchmarks, golden sets, human review, LLM-as-judge.</li>
          </ul>

          <h2 id="workflow">ML Workflow</h2>
          <ol>
            <li>Define the problem &amp; success metric.</li>
            <li>Collect, label, and clean data.</li>
            <li>Split train / validation / test.</li>
            <li>Feature engineering / model selection.</li>
            <li>Train; track experiments.</li>
            <li>Evaluate; check fairness &amp; drift.</li>
            <li>Deploy; monitor for performance decay.</li>
          </ol>

          <h2 id="tools">Tools &amp; Standards</h2>
          <ul>
            <li><strong>Frameworks:</strong> PyTorch, TensorFlow, JAX, scikit-learn.</li>
            <li><strong>LLMs:</strong> OpenAI, Anthropic Claude, Google Gemini, Meta Llama, Mistral.</li>
            <li><strong>MLOps:</strong> MLflow, Weights &amp; Biases, Kubeflow, SageMaker, Vertex AI.</li>
            <li><strong>Data:</strong> pandas, Polars, DuckDB, Spark.</li>
            <li><strong>Governance:</strong> NIST AI RMF, ISO/IEC 42001, EU AI Act.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
