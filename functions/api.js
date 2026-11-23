
export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== "POST") {
    return Response.json(
      { ok: false, message: "Method not allowed" },
      { status: 405 }
    );
  }

  try {
    if (!env.APPS_SCRIPT_URL || !env.MADAREK_API_SECRET) {
      return Response.json(
        { ok: false, message: "Server configuration missing" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const allowedActions = [
      "getSiteData",
      "registerStudent",
      "submitSuggestion"
    ];

    if (!allowedActions.includes(body.action)) {
      return Response.json(
        { ok: false, message: "Unknown action" },
        { status: 400 }
      );
    }

    const upstream = await fetch(env.APPS_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify({
        action: body.action,
        payload: body.payload || {},
        secret: env.MADAREK_API_SECRET
      })
    });

    const resultText = await upstream.text();

    let result;
    try {
      result = JSON.parse(resultText);
    } catch {
      throw new Error("Invalid response from Apps Script");
    }

    return Response.json(result, {
      headers: {
        "Cache-Control": "no-store"
      }
    });

  } catch (error) {
    return Response.json(
      { ok: false, message: "تعذر الاتصال بالخادم." },
      { status: 500 }
    );
  }
}
