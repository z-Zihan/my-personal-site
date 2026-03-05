import { execSync } from "child_process";
import fs from "fs";
import path from "path";

export default function buildInfoPlugin() {
  return {
    name: "vite-build-info-plugin",
    closeBundle: async () => {
      // 北京时间
      const buildTime = new Intl.DateTimeFormat("zh-CN", {
        timeZone: "Asia/Shanghai",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
        .format(new Date())
        .replace(/\//g, "-");

      let commitHash = "unknown";
      try {
        commitHash = execSync("git rev-parse --short HEAD").toString().trim();
      } catch (e) {
        console.log("Not a git repository, using default values");
      }

      // 读取 package.json version
      const pkg = JSON.parse(
        fs.readFileSync(path.resolve("package.json"), "utf-8"),
      );
      const version = pkg.version || "unknown";

      const comment = `<!--
================================================================================
  Zihan's Blog - Build Information
================================================================================
  Build Time: ${buildTime} (Beijing Time)
  Commit:     ${commitHash}
  Version:    ${version}
================================================================================
-->
`;

      const distPath = path.resolve("dist", "index.html");
      const content = fs.readFileSync(distPath, "utf-8");
      fs.writeFileSync(distPath, comment + content, "utf-8");

      console.log("Build info injected into index.html");
    },
  };
}
