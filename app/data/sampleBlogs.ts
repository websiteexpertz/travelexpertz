export interface SampleBlog {
  _id: string;
  title: string;
  description: string;
  categories: string[];
  image: string;
  date: string;
  createdAt?: string;
}

export const SAMPLE_BLOGS: SampleBlog[] = [
  {
    _id: "blog_1",
    title: "10 Hidden Gems in Himachal Pradesh You Must Visit in 2026",
    description:
      "Escape the tourist rush with our curated guide to untouched pine forests, secret valley hamlets, and serene homestays in Himachal Pradesh. From the quiet orchards of Jibhi and the mystical charm of Malana to high-altitude monasteries in Spiti, explore mountain retreats where time stands still and nature reveals its pristine beauty.",
    categories: ["Travel Guide", "Mountains"],
    image: "/hero1.jpeg",
    date: "2026-11-18",
    createdAt: "2026-11-18T10:00:00.000Z",
  },
  {
    _id: "blog_2",
    title: "A Culinary & Royal Heritage Walk Through the Streets of Jaipur",
    description:
      "From authentic ghevar and steaming pyaaz kachoris to majestic havelis and astronomical wonders, immerse yourself in Rajasthan's royal history and vibrant cultural folklore. Discover centuries-old bazaars, handloom block printing workshops, and palace rooftops that overlook the Pink City at sunset.",
    categories: ["Culture", "Heritage"],
    image: "/hero4.jpeg",
    date: "2026-11-15",
    createdAt: "2026-11-15T10:00:00.000Z",
  },
  {
    _id: "blog_3",
    title: "Best Beach Escapes in South Goa for Solitude & Sunset Cruises",
    description:
      "Discover tranquil shores, secluded luxury beachfront villas, and private backwater boat rides away from the busy northern beaches. Unwind on the golden sands of Palolem and Agonda, savor fresh seafood curry at sunset shacks, and experience the slow, restorative pace of coastal Goa.",
    categories: ["Beaches", "Luxury"],
    image: "/hero3.jpeg",
    date: "2026-11-12",
    createdAt: "2026-11-12T10:00:00.000Z",
  },
  {
    _id: "blog_4",
    title: "Exploring the Living Root Bridges & Mist-Clad Hills of Meghalaya",
    description:
      "A thrilling trekking expedition across wet valleys, crystal waterfalls, and natural bio-engineering wonders of Northeast India. Walk beneath ancient ficus tree bridges entwined over centuries, descend into deep rainforest gorges, and witness why Meghalaya is called the abode of clouds.",
    categories: ["Adventure", "Nature"],
    image: "/hero2.jpeg",
    date: "2026-11-08",
    createdAt: "2026-11-08T10:00:00.000Z",
  },
  {
    _id: "blog_5",
    title: "A Complete Beginner's Guide to Planning Your First Himalayan Trek",
    description:
      "Essential packing tips, high-altitude acclimatization techniques, and scenic trail routes suitable for first-time mountain adventurers. Learn how to choose between Kedarkantha, Brahmatal, or Har Ki Dun, prepare your fitness, and travel responsibly in fragile Himalayan ecosystems.",
    categories: ["Trekking", "Tips"],
    image: "/hero-bg.jpg",
    date: "2026-11-02",
    createdAt: "2026-11-02T10:00:00.000Z",
  },
  {
    _id: "blog_6",
    title: "Spiritual Varanasi: Evening Ganga Aarti & Sacred Boat Experiences",
    description:
      "Feel the divine energy of India's oldest living city as thousands of diyas light up the timeless riverbanks of Varanasi. Experience dawn boat rides gliding past centuries-old ghats, witness vibrant musical chants, and navigate ancient labyrinthine alleyways filled with aromatic chai and silk weavers.",
    categories: ["Spiritual", "Culture"],
    image: "/hero4.jpeg",
    date: "2026-10-28",
    createdAt: "2026-10-28T10:00:00.000Z",
  },
];
