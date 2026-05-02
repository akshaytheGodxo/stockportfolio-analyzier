export async function POST(req: Request) {
  try {
    const body = await req.json();

    const res = await fetch("https://chatbot-api-v2-x81j.onrender.com/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return Response.json(data);
  } catch (err) {
    console.error("Proxy error:", err);
    return Response.json({ error: "Proxy failed" }, { status: 500 });
  }
}
