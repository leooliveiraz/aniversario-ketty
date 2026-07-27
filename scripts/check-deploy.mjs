import https from "https";

https.get("https://leooliveiraz.github.io/aniversario-ketty/", (res) => {
  let data = "";
  res.on("data", (chunk) => (data += chunk));
  res.on("end", () => {
    const lines = data.split("\n");
    for (const line of lines) {
      if (
        line.includes("supabaseUrl") ||
        line.includes("supabase") ||
        (line.includes("error") && line.length < 300)
      ) {
        console.log("LINE:", line.substring(0, 300));
      }
    }

    const scripts = [...data.matchAll(/<script[^>]*src="([^"]+)"[^>]*>/g)];
    for (const m of scripts) {
      console.log("Script:", m[1]);
    }
  });
});
