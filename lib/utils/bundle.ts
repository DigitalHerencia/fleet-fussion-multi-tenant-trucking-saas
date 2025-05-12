import archiver from "archiver";
import { createWriteStream } from "fs";

export async function bundleDocuments(
  filePaths: string[],
  outputZip: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const output = createWriteStream(outputZip);
    const archive = archiver("zip", { zlib: { level: 9 } });
    output.on("close", () => resolve(outputZip));
    archive.on("error", (err) => reject(err));
    archive.pipe(output);
    filePaths.forEach((file) => {
      archive.file(file, { name: file.split("/").pop() || file });
    });
    archive.finalize();
  });
}
