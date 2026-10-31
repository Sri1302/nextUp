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
