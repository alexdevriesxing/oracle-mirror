import { build } from "esbuild";
import { execSync } from "node:child_process";

let commit = (process.env.GITHUB_SHA || "").trim();
if (!commit) {
  try {
    commit = execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
  } catch {
    commit = "development";
  }
}

await build({
  entryPoints: ["src/v2-index.ts"],
  bundle: true,
  outfile: "dist/index.js",
  format: "esm",
  platform: "neutral",
  define: {
    __BUILD_COMMIT__: JSON.stringify(commit),
  },
});

console.log(`Worker built successfully for commit: ${commit}`);
