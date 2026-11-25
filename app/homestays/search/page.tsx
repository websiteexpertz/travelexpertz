import { redirect } from "next/navigation";

export default async function HomestaysSearchRedirect({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const params = new URLSearchParams();

  if (resolvedSearchParams) {
    for (const [key, value] of Object.entries(resolvedSearchParams)) {
      if (key === "type") continue;
      if (typeof value === "string") {
        params.set(key, value);
      } else if (Array.isArray(value) && value[0]) {
        params.set(key, value[0]);
      }
    }
  }

  // Always treat this route as homestays search
  params.set("type", "homestays");

  redirect(`/hotels/search?${params.toString()}`);
}
