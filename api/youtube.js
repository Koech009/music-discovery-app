export default async function handler(req, res) {
  const path = req.url.replace("/api/youtube", "");
  const url = `https://www.googleapis.com/youtube/v3${path}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "YouTube proxy failed" });
  }
}
