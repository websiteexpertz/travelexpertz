import { redirect } from "next/navigation";

export default function HomestaysSearchRedirect({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const params = new URLSearchParams();

  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
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
