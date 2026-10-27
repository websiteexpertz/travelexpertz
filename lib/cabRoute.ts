type PhotonFeature = {
  properties?: {
    name?: string;
    locality?: string;
    district?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  geometry?: {
    coordinates?: [number, number];
  };
};

type Coordinates = {
  longitude: number;
  latitude: number;
};

type PhotonSearchResult = {
  features?: PhotonFeature[];
};

type OsrmRouteResult = {
  code?: string;
  routes?: Array<{
    distance?: number;
    duration?: number;
  }>;
};

function normalizeLocation(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}, ]/gu, "")
    .toLocaleLowerCase()
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function getLocationWords(value: string) {
  return normalizeLocation(value).flatMap((part) => part.split(/\s+/));
}

async function geocodeLocation(query: string): Promise<Coordinates> {
  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "10");
  url.searchParams.set("lang", "en");
  url.searchParams.set("lat", "22.5");
  url.searchParams.set("lon", "79");
  url.searchParams.set("zoom", "4");
  url.searchParams.set("bbox", "68.1,6.5,97.4,37.1");

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(6000),
      next: { revalidate: 300 },
    });
  } catch {
    throw new Error("Location lookup is temporarily unavailable.");
  }
  if (!response.ok) {
    throw new Error("Location lookup is temporarily unavailable.");
  }

  const data = (await response.json()) as PhotonSearchResult;
  const queryWords = getLocationWords(query).filter(
    (word) => word.length > 1 && !/^\d+$/.test(word),
  );
  const candidates = (data.features ?? [])
    .filter((feature) => {
      const country = feature.properties?.country?.toLocaleLowerCase();
      const coordinates = feature.geometry?.coordinates;
      return (
        country === "india" &&
        Array.isArray(coordinates) &&
        Number.isFinite(coordinates[0]) &&
        Number.isFinite(coordinates[1])
      );
    })
    .map((feature, index) => {
      const properties = feature.properties!;
      const primaryWords = getLocationWords(
        [
          properties.name,
          properties.locality,
          properties.city,
          properties.district,
        ]
          .filter(Boolean)
          .join(", "),
      );
      const contextWords = getLocationWords(
        [
          properties.name,
          properties.locality,
          properties.city,
          properties.district,
          properties.state,
          properties.country,
        ]
          .filter(Boolean)
          .join(", "),
      );
      const score = queryWords.reduce((total, word) => {
        const matchingWord = contextWords.find(
          (candidateWord) =>
            candidateWord === word ||
            candidateWord.startsWith(word) ||
            candidateWord.includes(word),
        );
        if (!matchingWord) return total + 100;
        if (matchingWord === word) return total;
        if (primaryWords.includes(matchingWord)) return total + 1;
        return total + 2;
      }, 0);
      const hasPrimaryMatch = queryWords.some((word) =>
        primaryWords.some(
          (candidateWord) =>
            candidateWord === word ||
            candidateWord.startsWith(word) ||
            candidateWord.includes(word),
        ),
      );
      return { feature, index, score, hasPrimaryMatch };
    })
    .filter(
      ({ score, hasPrimaryMatch }) =>
        score < 100 && hasPrimaryMatch && queryWords.length > 0,
    )
    .sort((first, second) => first.score - second.score || first.index - second.index);

  const coordinates = candidates[0]?.feature.geometry?.coordinates;
  if (!coordinates) {
    throw new Error(
      `Could not find a routable location for "${query}". Choose a suggested location and try again.`,
    );
  }

  return { longitude: coordinates[0], latitude: coordinates[1] };
}

export async function calculateCabRoute(pickup: string, dropoff: string) {
  const [origin, destination] = await Promise.all([
    geocodeLocation(pickup),
    geocodeLocation(dropoff),
  ]);
  const url = new URL(
    `https://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`,
  );
  url.searchParams.set("overview", "false");
  url.searchParams.set("steps", "false");

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
      next: { revalidate: 300 },
    });
  } catch {
    throw new Error("Route calculation is temporarily unavailable.");
  }
  if (!response.ok) {
    throw new Error("Route calculation is temporarily unavailable.");
  }

  const data = (await response.json()) as OsrmRouteResult;
  const route = data.routes?.[0];
  if (
    !route ||
    data.code !== "Ok" ||
    typeof route.distance !== "number" ||
    !Number.isFinite(route.distance) ||
    typeof route.duration !== "number" ||
    !Number.isFinite(route.duration)
  ) {
    throw new Error(
      "No driving route was found for these locations. Choose another pickup or drop-off location.",
    );
  }

  const distanceKm = Math.round((route.distance / 1000) * 10) / 10;
  const durationMinutes = Math.max(1, Math.ceil(route.duration / 60));
  if (distanceKm < 1 || distanceKm > 5000) {
    throw new Error("The driving route must be between 1 and 5,000 km.");
  }

  return { distanceKm, durationMinutes };
}
