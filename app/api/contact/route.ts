import { handleContactPost } from "../../../src/contact-api";

export async function POST(request: Request) {
  return handleContactPost(request);
}
