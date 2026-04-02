import { getServerSession } from "next-auth";
import { authOptions } from "./options";

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Non authentifié");
  }
  return session;
}
