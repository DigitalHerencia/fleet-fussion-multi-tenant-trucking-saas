import { NextRequest, NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as HandleUploadBody;
    
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Generate a client token for the browser to upload the file
        // ⚠️ Authenticate and authorize users before generating the token.
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/gif", "application/pdf"],
          tokenPayload: JSON.stringify({
            // optional, sent to your server on upload completion
          })
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Get notified of client upload completion
        console.log("blob upload completed", blob, tokenPayload);
        // Run any logic after the file upload completed
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
