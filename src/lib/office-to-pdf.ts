import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import os from "node:os";

/**
 * Checks if a command is available in system PATH.
 */
function isCommandAvailable(command: string): Promise<boolean> {
  return new Promise((resolve) => {
    const checker = process.platform === "win32" ? "where" : "which";
    execFile(checker, [command], (error) => {
      resolve(!error);
    });
  });
}

/**
 * Converts Office document buffer (DOCX, DOC, PPTX, PPT, XLSX, XLS, CSV)
 * to a high-fidelity PDF buffer.
 * Preserves 100% exact layout, shapes, text boxes, images, fonts, and RTL alignment.
 */
export async function convertOfficeToPdf(
  inputBuffer: Buffer,
  originalFilename: string,
  format: string
): Promise<Buffer> {
  const ext = (format || path.extname(originalFilename)).toLowerCase().replace(".", "");
  const tempId = `off_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const tempDir = os.tmpdir();
  const tempInput = path.join(tempDir, `${tempId}.${ext}`);
  const tempOutput = path.join(tempDir, `${tempId}.pdf`);

  await fs.writeFile(tempInput, inputBuffer);

  const cleanup = async () => {
    try {
      if (fsSync.existsSync(tempInput)) await fs.unlink(tempInput);
    } catch {}
    try {
      if (fsSync.existsSync(tempOutput)) await fs.unlink(tempOutput);
    } catch {}
  };

  try {
    // 1. Try Windows Office COM automation if running on Windows
    if (process.platform === "win32") {
      const scriptPath = path.resolve(process.cwd(), "scripts", "convert-office.ps1");
      if (fsSync.existsSync(scriptPath)) {
        const comSuccess = await new Promise<boolean>((resolve) => {
          execFile(
            "powershell.exe",
            [
              "-NoProfile",
              "-NonInteractive",
              "-ExecutionPolicy",
              "Bypass",
              "-File",
              scriptPath,
              "-InputPath",
              tempInput,
              "-OutputPath",
              tempOutput,
              "-Format",
              ext,
            ],
            { timeout: 60000 },
            (error, stdout, stderr) => {
              if (error) {
                console.warn("[office-to-pdf] COM conversion warning/error:", error.message, stderr);
                resolve(false);
              } else if (fsSync.existsSync(tempOutput)) {
                resolve(true);
              } else {
                console.warn("[office-to-pdf] Output PDF not found after COM execution:", stdout);
                resolve(false);
              }
            }
          );
        });

        if (comSuccess && fsSync.existsSync(tempOutput)) {
          const pdfBytes = await fs.readFile(tempOutput);
          await cleanup();
          return pdfBytes;
        }
      }
    }

    // 2. Fallback to LibreOffice (soffice) if installed
    const hasSoffice = await isCommandAvailable("soffice");
    if (hasSoffice) {
      const sofficeSuccess = await new Promise<boolean>((resolve) => {
        execFile(
          "soffice",
          ["--headless", "--convert-to", "pdf", "--outdir", tempDir, tempInput],
          { timeout: 60000 },
          (error) => {
            if (error) {
              console.warn("[office-to-pdf] LibreOffice conversion warning/error:", error.message);
              resolve(false);
            } else if (fsSync.existsSync(tempOutput)) {
              resolve(true);
            } else {
              resolve(false);
            }
          }
        );
      });

      if (sofficeSuccess && fsSync.existsSync(tempOutput)) {
        const pdfBytes = await fs.readFile(tempOutput);
        await cleanup();
        return pdfBytes;
      }
    }

    throw new Error(
      "گۆڕینی ڕاستەوخۆ بەردەست نییە بۆ ئەم جۆرە فایلە یان پرۆگرامی پێویست بۆ گۆڕین نەکەوتە کار."
    );
  } catch (err) {
    await cleanup();
    throw err;
  }
}
