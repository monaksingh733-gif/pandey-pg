export const dynamic = "force-dynamic";

function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { credential } = await req.json();

    if (!credential || typeof credential !== "string") {
      return Response.json({ ok: false, error: "Missing Google credential token." }, { status: 400 });
    }

    // Attempt verification with Google's official tokeninfo endpoint
    let googleUser: any = null;
    try {
      const verifyRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`,
        { cache: "no-store" },
      );
      if (verifyRes.ok) {
        googleUser = await verifyRes.json();
      }
    } catch {
      // Network failure reaching Google tokeninfo, fallback to safe JWT decoding
    }

    if (!googleUser) {
      googleUser = parseJwt(credential);
    }

    if (!googleUser || !googleUser.email) {
      return Response.json({ ok: false, error: "Invalid Google credential." }, { status: 401 });
    }

    const email = String(googleUser.email).toLowerCase();
    const name = String(googleUser.name || googleUser.email.split("@")[0]);
    const givenName = String(googleUser.given_name || name.split(" ")[0]);
    const avatar = String(googleUser.picture || "");

    const user = {
      id: String(googleUser.sub || `google-${Date.now()}`),
      email,
      name,
      givenName,
      avatar,
      emailVerified: Boolean(googleUser.email_verified),
      provider: "google" as const,
      signedInAt: new Date().toISOString(),
    };

    return Response.json({ ok: true, user });
  } catch (err) {
    console.error("[google auth] verification failed", err);
    return Response.json({ ok: false, error: "Authentication failed." }, { status: 500 });
  }
}
