export async function handler(event) {
    const url = new URLSearchParams(event.queryStringParameters).get("url");
    if (!url) {
      return { statusCode: 400, body: "Missing image URL" };
    }
  
    try {
      const imageRes = await fetch(url);
      const contentType = imageRes.headers.get("content-type");
      const buffer = await imageRes.arrayBuffer();
  
      return {
        statusCode: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Length": buffer.byteLength.toString(),
          "Cache-Control": "public, max-age=3600"
        },
        body: Buffer.from(buffer).toString("base64"),
        isBase64Encoded: true,
      };
    } catch (err) {
      return { statusCode: 500, body: `Proxy error: ${err.message}` };
    }
  }