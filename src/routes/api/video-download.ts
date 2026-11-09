import { createFileRoute } from "@tanstack/react-router";
import { checkRateLimit } from "@/lib/rate-limit";
// @ts-ignore
import * as btch from "btch-downloader";

interface VideoFormat {
  quality: string;
  label: string;
  url: string;
  ext: "mp4" | "mp3";
  size?: string;
  isDirectDownload?: boolean;
  needsPrepare?: boolean;
  formatCode?: string;
}

interface VideoInfoResult {
  success: boolean;
  platform: string;
  title: string;
  thumbnail?: string;
  duration?: string;
  author?: string;
  formats: VideoFormat[];
  error?: string;
}

function detectPlatform(url: string): string {
  const u = url.toLowerCase();
  if (u.includes("tiktok.com")) return "TikTok";
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "YouTube";
  if (u.includes("instagram.com")) return "Instagram";
  if (u.includes("facebook.com") || u.includes("fb.watch") || u.includes("fb.com")) return "Facebook";
  if (u.includes("twitter.com") || u.includes("x.com")) return "Twitter/X";
  if (u.includes("pinterest.com") || u.includes("pin.it")) return "Pinterest";
  if (u.includes("reddit.com")) return "Reddit";
  return "General Video";
}

async function prepareLoaderDownload(targetUrl: string, format: string): Promise<string> {
  const initResp = await fetch(
    `https://loader.to/ajax/download.php?format=${format}&url=${encodeURIComponent(targetUrl)}`,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(8000),
    },
  );

  const initData = await initResp.json();
  if (initData.download_url) {
    return initData.download_url;
  }

  if (!initData.progress_url) {
    throw new Error("Unable to initialize video conversion");
  }

  // Poll up to 25 times (1 sec interval)
  for (let i = 0; i < 25; i++) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    try {
      const pResp = await fetch(initData.progress_url, { signal: AbortSignal.timeout(5000) });
      const pData = await pResp.json();
      if (pData.download_url) {
        return pData.download_url;
      }
    } catch {}
  }

  throw new Error("Video processing timed out");
}

export const Route = createFileRoute("/api/video-download")({
  server: {
    handlers: {
      // ── GET: Streaming Proxy for direct in-browser download ─────────────
      GET: async ({ request }) => {
        const urlObj = new URL(request.url);
        const mediaUrl = urlObj.searchParams.get("url");
        const filename = urlObj.searchParams.get("filename") || "video.mp4";

        if (!mediaUrl) {
          return new Response("Missing media url", { status: 400 });
        }

        try {
          let referer = "";
          try {
            referer = new URL(mediaUrl).origin;
          } catch {}

          const mediaResp = await fetch(mediaUrl, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
              ...(referer ? { Referer: referer } : {}),
            },
            redirect: "follow",
          });

          if (!mediaResp.ok || !mediaResp.body) {
            return Response.redirect(mediaUrl, 302);
          }

          const contentType = mediaResp.headers.get("content-type") || "application/octet-stream";
          const contentLength = mediaResp.headers.get("content-length");

          const headers = new Headers();
          headers.set(
            "Content-Disposition",
            `attachment; filename="${encodeURIComponent(filename)}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
          );
          headers.set("Content-Type", contentType);
          if (contentLength) {
            headers.set("Content-Length", contentLength);
          }
          headers.set("Access-Control-Allow-Origin", "*");

          return new Response(mediaResp.body, {
            status: 200,
            headers,
          });
        } catch (e: any) {
          console.error("Proxy streaming error:", e);
          return Response.redirect(mediaUrl, 302);
        }
      },

      // ── POST: Extract info OR prepare download link on-demand ────────────
      POST: async ({ request }) => {
        const rate = checkRateLimit(request, 60, 60 * 1000);
        if (!rate.ok) {
          return Response.json(
            { error: "داواکارییەکانت زۆرن، تکایە کەمێکی تر چاوەڕێ بکە." },
            { status: 429 },
          );
        }

        try {
          const body = (await request.json()) as {
            action?: "info" | "prepare";
            url?: string;
            formatCode?: string;
          };

          const { action = "info", url, formatCode } = body;

          if (!url || typeof url !== "string" || !url.trim().startsWith("http")) {
            return Response.json(
              { error: "تکایە بەستەرێکی (لینکی) دروستی ڤیدیۆ بنووسە." },
              { status: 400 },
            );
          }

          const cleanUrl = url.trim();

          // ── ACTION: PREPARE (Generates exact direct download URL on button click) ─
          if (action === "prepare") {
            const fmt = formatCode || "720";
            try {
              const downloadUrl = await prepareLoaderDownload(cleanUrl, fmt);
              return Response.json({
                success: true,
                downloadUrl,
              });
            } catch (err: any) {
              console.error("Prepare download failed:", err);
              // Fallback to btch
              try {
                const ytData = await btch.youtube(cleanUrl);
                const fallbackUrl = fmt === "mp3" ? ytData.mp3 : ytData.mp4;
                if (fallbackUrl) {
                  return Response.json({ success: true, downloadUrl: fallbackUrl });
                }
              } catch {}

              return Response.json(
                { error: "نەتوانرا فایلی ڤیدیۆ ئامادە بکرێت، تکایە دووبارە هەوڵبدەرەوە." },
                { status: 500 },
              );
            }
          }

          // ── ACTION: INFO (Extracts title, thumbnail, and format options) ──
          const platform = detectPlatform(cleanUrl);

          // ── 1. TikTok Handler ──────────────────────────────────────────
          if (platform === "TikTok") {
            try {
              const tikResp = await fetch(
                `https://www.tikwm.com/api/?url=${encodeURIComponent(cleanUrl)}&hd=1`,
                {
                  headers: {
                    "User-Agent":
                      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                  },
                },
              );
              const data = await tikResp.json();
              if (data && data.code === 0 && data.data) {
                const d = data.data;
                const formats: VideoFormat[] = [];
                if (d.hdplay || d.play) {
                  formats.push({
                    quality: "HD (بێ واتەرمارک)",
                    label: "ڤیدیۆ HD بێ لۆگۆ (MP4)",
                    url: d.hdplay || d.play,
                    ext: "mp4",
                    isDirectDownload: true,
                  });
                }
                if (d.play && d.hdplay) {
                  formats.push({
                    quality: "SD ئاسایی",
                    label: "ڤیدیۆ SD ئاسایی (MP4)",
                    url: d.play,
                    ext: "mp4",
                    isDirectDownload: true,
                  });
                }
                if (d.music || d.music_info?.play) {
                  formats.push({
                    quality: "Audio MP3",
                    label: "تنێ دەنگ (MP3)",
                    url: d.music || d.music_info?.play,
                    ext: "mp3",
                    isDirectDownload: true,
                  });
                }

                return Response.json({
                  success: true,
                  platform: "TikTok",
                  title: d.title || "ڤیدیۆیا تیکتۆک",
                  thumbnail: d.cover || d.origin_cover,
                  duration: d.duration ? `${d.duration} چرکە` : undefined,
                  author: d.author?.nickname ? `@${d.author.unique_id || d.author.nickname}` : undefined,
                  formats,
                } satisfies VideoInfoResult);
              }
            } catch (tikError) {
              console.warn("TikTok extraction fallback:", tikError);
            }
          }

          // ── 2. YouTube Handler ─────────────────────────────────────────
          if (platform === "YouTube") {
            let videoId = "";
            const matchYt = cleanUrl.match(
              /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/,
            );
            if (matchYt && matchYt[1]) videoId = matchYt[1];

            // Get video title from oEmbed or loader info
            let videoTitle = videoId ? `YouTube Video [${videoId}]` : "ڤیدیۆیا یوتیوب";
            let videoAuthor: string | undefined = undefined;
            let videoThumb: string | undefined = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : undefined;

            try {
              const oEmbed = await fetch(
                `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
                { signal: AbortSignal.timeout(3000) },
              );
              if (oEmbed.ok) {
                const oData = await oEmbed.json();
                if (oData.title) videoTitle = oData.title;
                if (oData.author_name) videoAuthor = oData.author_name;
                if (oData.thumbnail_url) videoThumb = oData.thumbnail_url;
              }
            } catch {}

            const formats: VideoFormat[] = [
              {
                quality: "720p HD",
                label: "ڤیدیۆیا HD (MP4)",
                url: "",
                ext: "mp4",
                needsPrepare: true,
                formatCode: "720",
                isDirectDownload: true,
              },
              {
                quality: "360p SD (خێرا)",
                label: "ڤیدیۆیا خێرا ب 360p (MP4)",
                url: "",
                ext: "mp4",
                needsPrepare: true,
                formatCode: "360",
                isDirectDownload: true,
              },
              {
                quality: "MP3 دەنگ (320kbps)",
                label: "دەنگی ڤیدیۆیێ (MP3)",
                url: "",
                ext: "mp3",
                needsPrepare: true,
                formatCode: "mp3",
                isDirectDownload: true,
              },
            ];

            return Response.json({
              success: true,
              platform: "YouTube",
              title: videoTitle,
              thumbnail: videoThumb,
              author: videoAuthor,
              formats,
            } satisfies VideoInfoResult);
          }

          // ── 3. Facebook Handler ────────────────────────────────────────
          if (platform === "Facebook") {
            try {
              const fbData = await btch.fbdown(cleanUrl);
              if (fbData && fbData.status && (fbData.HD || fbData.Normal_video)) {
                const formats: VideoFormat[] = [];
                if (fbData.HD) {
                  formats.push({
                    quality: "HD Video (MP4)",
                    label: "ڤیدیۆیا HD ب کوالێتیا بەرز",
                    url: fbData.HD,
                    ext: "mp4",
                    isDirectDownload: true,
                  });
                }
                if (fbData.Normal_video) {
                  formats.push({
                    quality: "SD Video (MP4)",
                    label: "ڤیدیۆیا ئاسایی (SD)",
                    url: fbData.Normal_video,
                    ext: "mp4",
                    isDirectDownload: true,
                  });
                }
                return Response.json({
                  success: true,
                  platform: "Facebook",
                  title: "ڤیدیۆیا فەیسبووک",
                  thumbnail: undefined,
                  formats,
                } satisfies VideoInfoResult);
              }
            } catch (fbError) {
              console.warn("btch.fbdown error:", fbError);
            }
          }

          // ── 4. Twitter/X Handler ───────────────────────────────────────
          if (platform === "Twitter/X") {
            try {
              const twData = await btch.twitter(cleanUrl);
              if (twData && twData.status && Array.isArray(twData.url) && twData.url.length > 0) {
                const formats: VideoFormat[] = twData.url
                  .filter((item: any) => item.hd || item.sd || item.url)
                  .map((item: any, i: number) => ({
                    quality: item.quality || (i === 0 ? "HD (MP4)" : "SD (MP4)"),
                    label: `ڤیدیۆیا تویتەر / X (${item.quality || (i === 0 ? "HD" : "SD")})`,
                    url: item.hd || item.url || item.sd,
                    ext: "mp4",
                    isDirectDownload: true,
                  }));

                if (formats.length > 0) {
                  return Response.json({
                    success: true,
                    platform: "Twitter/X",
                    title: twData.title || "ڤیدیۆیا تویتەر (X)",
                    thumbnail: undefined,
                    formats,
                  } satisfies VideoInfoResult);
                }
              }
            } catch (twError) {
              console.warn("btch.twitter error:", twError);
            }
          }

          // ── 5. Pinterest Handler ───────────────────────────────────────
          if (platform === "Pinterest") {
            try {
              const pinData = await btch.pinterest(cleanUrl);
              const pinResult: any = pinData?.result?.result || pinData?.result;
              if (pinResult && (pinResult.video_url || pinResult.image)) {
                const formats: VideoFormat[] = [];
                if (pinResult.video_url) {
                  formats.push({
                    quality: "HD Video (MP4)",
                    label: "ڤیدیۆیا پینترست (MP4)",
                    url: pinResult.video_url,
                    ext: "mp4",
                    isDirectDownload: true,
                  });
                }
                return Response.json({
                  success: true,
                  platform: "Pinterest",
                  title: pinResult.title || "پۆستی پینترست",
                  thumbnail: pinResult.image || undefined,
                  formats,
                } satisfies VideoInfoResult);
              }
            } catch (pinError) {
              console.warn("btch.pinterest error:", pinError);
            }
          }

          // ── 6. Instagram / General Fallback Handler ────────────────────
          try {
            const tikAlt = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(cleanUrl)}&hd=1`);
            const tikData = await tikAlt.json();
            if (tikData?.code === 0 && tikData?.data?.play) {
              return Response.json({
                success: true,
                platform,
                title: tikData.data.title || `ڤیدیۆیا ${platform}`,
                thumbnail: tikData.data.cover,
                formats: [
                  {
                    quality: "HD Video (MP4)",
                    label: `ڤیدیۆیا ${platform} ب کوالێتیا HD`,
                    url: tikData.data.hdplay || tikData.data.play,
                    ext: "mp4",
                    isDirectDownload: true,
                  },
                ],
              } satisfies VideoInfoResult);
            }
          } catch {}

          return Response.json(
            {
              error:
                "نەتوانرا لینکی داگرتنی ڕاستەوخۆ دەربهێنرێت. تکایە دڵنیابە لە دروستی بەستەرەکە (Link) و دووبارە هەوڵبدەرەوە.",
            },
            { status: 400 },
          );
        } catch (err: any) {
          console.error("Video download API error:", err);
          return Response.json(
            { error: "نەتوانرا زانیاریێن ڤیدیۆیێ بهێنە دەرهێنان. تکایە لینکێ خۆ بپشکنە." },
            { status: 500 },
          );
        }
      },
    },
  },
});
