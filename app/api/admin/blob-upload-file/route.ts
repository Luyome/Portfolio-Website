import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { allowedContentTypesForPathname, maxBytesFor, type UploadCategory } from "@/lib/upload-policy";

// Same admin-gated blob upload flow as blob-upload/route.ts, but for
// non-image Admin files: the CV ("document" category — image or PDF) and
// downloadable game build links ("gameBuild" category — archives/installers)
// rather than the image/* allow-list. The caller states which via
// `clientPayload` (set by FileUploadField); an unrecognized or missing value
// is rejected rather than defaulting to the wider category.
const CATEGORIES: readonly UploadCategory[] = ["document", "gameBuild"];

function isUploadCategory(value: string | null): value is UploadCategory {
  return value !== null && (CATEGORIES as readonly string[]).includes(value);
}

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
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!isUploadCategory(clientPayload)) {
          throw new Error("Unsupported file type.");
        }
        const allowedContentTypes = allowedContentTypesForPathname(clientPayload, pathname);
        if (!allowedContentTypes) {
          throw new Error("Unsupported file type.");
        }
        return {
          allowedContentTypes: [...allowedContentTypes],
          maximumSizeInBytes: maxBytesFor(clientPayload),
          addRandomSuffix: true,
        };
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
