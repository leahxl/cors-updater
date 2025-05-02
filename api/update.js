const fetch = require("node-fetch");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const { code } = req.body;
  if (!/^\d{6}$/.test(code)) {
    return res.status(400).json({ message: "Invalid code format" });
  }

  const githubToken = process.env.GITHUB_TOKEN;
  const repoOwner = "leahxl";
  const repoName = "live-code-display";
  const filePath = "data.json";
  const branch = "main";

  const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;

  const getResp = await fetch(apiUrl, {
    headers: { Authorization: `Bearer ${githubToken}` },
  });
  const fileData = await getResp.json();

  const newContent = { code };

  const updateResp = await fetch(apiUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${githubToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: `Update code to ${code}`,
      content: Buffer.from(JSON.stringify(newContent)).toString("base64"),
      sha: fileData.sha,
      branch,
    }),
  });

  if (!updateResp.ok) {
    return res.status(500).json({ message: "Update failed" });
  }

  res.status(200).json({ message: "Success" });
};
