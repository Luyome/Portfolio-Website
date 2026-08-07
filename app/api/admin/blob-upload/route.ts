import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { allowedContentTypesForPathname, maxBytesFor, UploadPolicyError } from "@/lib/upload-policy";

export async function POST(request: Request): Promise<NextResponse> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const valid = token ? await verifySessionToken(token) : false;
  if (!valid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const allowedContentTypes = allowedContentTypesForPathname("image", pathname);
        if (!allowedContentTypes) {
          throw new UploadPolicyError("Unsupported file type.");
        }
        return {
          allowedContentTypes: [...allowedContentTypes],
          maximumSizeInBytes: maxBytesFor("image"),
          addRandomSuffix: true,
        };
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    // Never forward `error.message` to the client — it may echo Blob/provider
    // detail. A rejected file/policy is a safe, generic 400; anything else is
    // an unexpected failure, a generic 500. Server-side logging stays scoped
    // to the message text, never the raw payload or any cookie/token.
    if (error instanceof UploadPolicyError) {
      console.error("Upload rejected:", error.message);
      return NextResponse.json({ error: "Invalid file or upload request." }, { status: 400 });
    }
    console.error("Upload failed:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
