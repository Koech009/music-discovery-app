export default async function handler(req, res) {
  const path = req.url.replace("/api/lyrics", "");
  const url = `https://api.lyrics.ovh/v1${path}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Lyrics proxy failed" });
  }
}
