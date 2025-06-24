import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Octokit } from "octokit";

/* ─────────── paths ─────────── */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const jsonPath = path.resolve(__dirname, "../playwright-report/results.json");

/* ─────────── helpers ─────────── */
function loadResults() {
  if (!fs.existsSync(jsonPath)) {
    console.error("❌ results.json não encontrado em:", jsonPath);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
}

function extractTests(data: any) {
  return (
    data.suites?.flatMap(
      (suite: any) =>
        suite.specs?.flatMap(
          (spec: any) =>
            spec.tests?.flatMap((test: any) =>
              test.results?.map((r: any) => ({
                file: suite.file,
                title: spec.title,
                status: r.status, // passed | failed | flaky
                retry: r.retry,
                error: r.errors?.[0]?.message ?? null,
              }))
            ) ?? []
        ) ?? []
    ) ?? []
  );
}

/* ─────────── main ─────────── */
(async () => {
  /* Carrega JSON do Playwright */
  const allTests = extractTests(loadResults());

  if (allTests.length === 0) {
    console.log("⚠️ Nenhum teste encontrado na estrutura do JSON.");
    return;
  }

  /* Separa falhas/flaky para comentário */
  const failed = allTests.filter(
    (t) =>
      t.status === "failed" || t.status === "flaky" || t.status === "timedOut"
  );

  /* 🔎 Arquivos alterados (string separada por espaço) */
  const changedFiles = (process.env.CHANGED_FILES || "").split(/\s+/);
  const testWasEdited = (file: string) =>
    changedFiles.some((f) => f.endsWith(file));

  /* Log local */
  allTests.forEach(({ status, file, title, retry, error }) => {
    const tag =
      status === "passed"
        ? "✅ OK"
        : status === "failed"
        ? "❌ FALHOU"
        : status === "flaky"
        ? "⚠️ FLAKY"
        : `❓ ${status}`;
    console.log(`${tag.padEnd(10)} → ${file} → ${title}`);
    if (retry) console.log("   retry:", retry);
    if (error) console.log("   erro :", error);
  });

  if (!failed.length) {
    console.log("✅ Todos os testes passaram. Sem comentário no PR.");
    return;
  }

  /* ─────────── GitHub env ─────────── */
  const token = process.env.GITHUB_TOKEN;
  const prStr = process.env.PR_NUMBER;
  const repoFull = process.env.GITHUB_REPOSITORY;

  if (!token || !prStr || !repoFull) {
    console.error(
      "❌ Variáveis GITHUB_TOKEN / PR_NUMBER / GITHUB_REPOSITORY ausentes."
    );
    process.exit(1);
  }

  const prNumber = Number(prStr);
  const [owner, repo] = repoFull.split("/");
  const octokit = new Octokit({ auth: token });

  /* ─────────── Decide label ─────────── */
  let label: "flaky" | "qa-test-bug" | "regression-app";
  if (failed.some((t) => t.status === "flaky")) {
    label = "flaky";
  } else if (failed.some((t) => testWasEdited(t.file))) {
    label = "qa-test-bug";
  } else {
    label = "regression-app";
  }

  /* ─────────── Monta comentário ─────────── */
  const body = [
    "## ❌ Falhas ou testes flaky detectados",
    "",
    ...failed.map(
      (t) =>
        `- **[${t.status.toUpperCase()}]** \`${t.file}\` → ${t.title}${
          t.error ? `\n  🧨 ${t.error}` : ""
        }`
    ),
    "",
    `_Comentário gerado automaticamente pelo Playwright QA Bot – label \`${label}\`_`,
  ].join("\n");

  /* ─────────── Cria ou atualiza comentário ─────────── */
  const { data: comments } = await octokit.issues.listComments({
    owner,
    repo,
    issue_number: prNumber,
  });

  const existing = comments.find(
    (c) =>
      c.user?.type === "Bot" &&
      c.body?.startsWith("## ❌ Falhas ou testes flaky detectados")
  );

  if (existing) {
    await octokit.issues.updateComment({
      owner,
      repo,
      comment_id: existing.id,
      body,
    });
    console.log("🔄 Comentário atualizado.");
  } else {
    await octokit.issues.createComment({
      owner,
      repo,
      issue_number: prNumber,
      body,
    });
    console.log("💬 Comentário criado.");
  }

  /* ─────────── Aplica label ─────────── */
  await octokit.issues.addLabels({
    owner,
    repo,
    issue_number: prNumber,
    labels: [label],
  });
  console.log(`🏷️  Label '${label}' aplicada ao PR #${prNumber}`);
})();
