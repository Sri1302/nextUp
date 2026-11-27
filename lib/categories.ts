import { MAX_CATEGORIES, type Category } from "./types";

// YouTube tags channels with Wikipedia topic URLs (topicDetails.topicCategories),
// e.g. https://en.wikipedia.org/wiki/Food. Map those slugs onto our categories.
const TOPIC_MAP: Record<string, Category> = {
  Technology: "tech",
  Food: "food",
  Tourism: "travel",
  Video_game_culture: "gaming",
  Action_game: "gaming",
  "Action-adventure_game": "gaming",
  Casual_game: "gaming",
  Music_video_game: "gaming",
  Puzzle_video_game: "gaming",
  Racing_video_game: "gaming",
  "Role-playing_video_game": "gaming",
  Simulation_video_game: "gaming",
  Sports_game: "gaming",
  Strategy_video_game: "gaming",
  Physical_fitness: "fitness",
  Health: "fitness",
  Physical_attractiveness: "beauty",
  Fashion: "fashion",
  Music: "music",
  Christian_music: "music",
  Classical_music: "music",
  Country_music: "music",
  Electronic_music: "music",
  "Hip_hop_music": "music",
  Independent_music: "music",
  Jazz: "music",
  Music_of_Asia: "music",
  Music_of_Latin_America: "music",
  Pop_music: "music",
  "Rhythm_and_blues": "music",
  Rock_music: "music",
  Soul_music: "music",
  Reggae: "music",
  Knowledge: "education",
  Humour: "comedy",
  "Lifestyle_(sociology)": "lifestyle",
  Hobby: "art",
  Business: "finance",
  Sport: "sports",
  American_football: "sports",
  Association_football: "sports",
  Baseball: "sports",
  Basketball: "sports",
  Boxing: "sports",
  Cricket: "sports",
  Golf: "sports",
  Ice_hockey: "sports",
  Mixed_martial_arts: "sports",
  Motorsport: "sports",
  Professional_wrestling: "sports",
  Tennis: "sports",
  Volleyball: "sports",
  Entertainment: "entertainment",
  Film: "entertainment",
  Television_program: "entertainment",
  Performing_arts: "entertainment",
  Vehicle: "lifestyle",
  Pet: "lifestyle",
};

export function categoriesFromYouTubeTopics(topicUrls: string[] = []): Category[] {
  const found: Category[] = [];
  for (const url of topicUrls) {
    const slug = decodeURIComponent(url.split("/wiki/")[1] ?? "");
    const cat = TOPIC_MAP[slug];
    if (cat && !found.includes(cat)) found.push(cat);
  }
  // Specific topics first: generic ones like Lifestyle/Entertainment only fill leftover slots.
  const generic: Category[] = ["lifestyle", "entertainment"];
  found.sort((a, b) => Number(generic.includes(a)) - Number(generic.includes(b)));
  return found.slice(0, MAX_CATEGORIES);
}

// YouTube's own video categories (videos.snippet.categoryId) mapped onto ours.
const VIDEO_CATEGORY: Record<string, Category> = {
  "1": "entertainment", // Film & Animation
  "2": "lifestyle", // Autos & Vehicles
  "10": "music",
  "15": "lifestyle", // Pets & Animals
  "17": "sports",
  "19": "travel", // Travel & Events
  "20": "gaming",
  "22": "lifestyle", // People & Blogs
  "23": "comedy",
  "24": "entertainment",
  "26": "lifestyle", // Howto & Style: refined by keywords below
  "27": "education",
  "28": "tech", // Science & Technology
};

// Words in a channel's title, description and keywords that point at a niche.
const KEYWORDS: [Category, RegExp][] = [
  ["food", /\b(food|foodie|recipes?|cooking|cook|kitchen|chef|baking|bake|street ?food|biryani|restaurants?|eats?)\b/i],
  ["travel", /\b(travel|travell?er|travelling|traveling|trips?|backpack\w*|wanderlust|nomad|tourism|explor(e|ing)|countries)\b/i],
  ["tech", /\b(tech|technology|gadgets?|smartphones?|unboxing|tech reviews?|phone reviews?|coding|programming|developer|software|ai|laptops?|pc builds?)\b/i],
  ["gaming", /\b(gaming|gamer|games?|gameplay|esports|minecraft|gta|valorant|fortnite|bgmi|pubg|free ?fire|playthrough|let'?s play)\b/i],
  ["fitness", /\b(fitness|workouts?|gym|yoga|exercise|bodybuilding|calisthenics|weight ?loss|running|crossfit|pilates)\b/i],
  ["beauty", /\b(beauty|makeup|make-up|skincare|skin ?care|cosmetics|hair ?care|nails)\b/i],
  ["fashion", /\b(fashion|outfits?|style|styling|ootd|streetwear|clothing|wardrobe)\b/i],
  ["music", /\b(music|songs?|singer|singing|covers?|guitar|piano|rapper|band|producer|beats)\b/i],
  ["education", /\b(education|learn(ing)?|tutorials?|lessons?|courses?|study|exam|upsc|science|history|explained)\b/i],
  ["comedy", /\b(comedy|comedian|funny|sketch(es)?|pranks?|memes?|stand-?up|roast)\b/i],
  ["finance", /\b(finance|money|invest(ing|ment)?|stocks?|trading|crypto|personal finance|business|startups?|entrepreneur)\b/i],
  ["sports", /\b(sports?|cricket|football|soccer|basketball|ipl|nba|fifa|tennis|athlete)\b/i],
  ["art", /\b(art|artist|drawing|painting|sketching|diy|crafts?|handmade|illustration|animation)\b/i],
];

// Best-guess niches for a channel from every signal we have, strongest first (max 3).
export function detectNiche(o: { topicUrls?: string[]; videoCategoryIds?: string[]; text?: string }): Category[] {
  const score = new Map<Category, number>();
  const add = (c: Category, n: number) => score.set(c, (score.get(c) ?? 0) + n);

  for (const c of categoriesFromYouTubeTopics(o.topicUrls)) add(c, 3);
  for (const id of o.videoCategoryIds ?? []) {
    const c = VIDEO_CATEGORY[id];
    if (c) add(c, 1);
  }
  for (const [c, re] of KEYWORDS) {
    const hits = (o.text ?? "").match(new RegExp(re.source, "gi"))?.length ?? 0;
    if (hits) add(c, Math.min(hits, 3) * 1.5);
  }

  const generic: Category[] = ["lifestyle", "entertainment"];
  return [...score.entries()]
    .filter(([, n]) => n >= 1.5)
    .sort((a, b) => Number(generic.includes(a[0])) - Number(generic.includes(b[0])) || b[1] - a[1])
    .map(([c]) => c)
    .slice(0, MAX_CATEGORIES);
}
