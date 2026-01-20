export interface FieldNote {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  author: string;
  park: string;
  image: string;
  date: string;
  readTime: string;
}

export const fieldNotesData: FieldNote[] = [
  {
    id: 1,
    slug: 'the-kanha-migration-patterns',
    title: 'THE KANHA MIGRATION PATTERNS',
    excerpt: 'Exploring the fascinating seasonal movement patterns of wildlife through this celebrated corridor, studying both herbivore and predator migration cycles.',
    content: [
      'The Kanha Tiger Reserve represents one of India\'s most significant wildlife corridors, witnessing remarkable seasonal migration patterns that have captivated naturalists for generations.',
      'During the monsoon months, herbivores disperse across the expanded grasslands, following the fresh growth. Tigers and leopards adjust their territories accordingly, creating a dynamic ecosystem.',
      'Research teams have documented these patterns for decades, revealing intricate relationships between prey movement, water availability, and predator behavior.',
      'The corridor connecting Kanha to neighboring reserves plays a crucial role in maintaining genetic diversity and allowing animals to access seasonal resources across a larger landscape.',
      'Understanding these migration patterns is essential for conservation planning and helps inform decisions about corridor protection and habitat management.'
    ],
    author: 'Kanha National Park',
    park: 'KANHA NATIONAL PARK',
    image: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800&h=600&fit=crop',
    date: 'Dec 20, 2025',
    readTime: '7 min read'
  },
  {
    id: 2,
    slug: 'shadows-of-pench',
    title: 'SHADOWS OF PENCH',
    excerpt: 'A rare behind-the-scenes look into how the dense sal forests of Pench create perfect cover for the park\'s apex predators, especially during twilight.',
    content: [
      'Pench Tiger Reserve, straddling Madhya Pradesh and Maharashtra, is renowned for its dense sal forests that create a cathedral-like atmosphere, perfect for predator-prey dynamics.',
      'The interplay of light and shadow in these forests creates natural camouflage that tigers have evolved to exploit. Their stripes blend seamlessly with vertical shadows cast by sal trees.',
      'Twilight hours, known as the "golden hour" for wildlife photographers, reveal heightened predator activity. This is when tigers emerge from dense cover to patrol their territories.',
      'The Pench experience is deeply connected to the rhythm of light and shadow, teaching observers to look beyond the obvious and tune into subtle movements and sounds.',
      'Conservation efforts focus on maintaining the integrity of these forest blocks, ensuring that the natural cover remains intact for generations of predators to come.'
    ],
    author: 'Pench Tiger Reserve',
    park: 'PENCH TIGER RESERVE',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    date: 'Dec 18, 2025',
    readTime: '6 min read'
  },
  {
    id: 3,
    slug: 'bandhavgarhs-fortress',
    title: 'BANDHAVGARH\'S FORTRESS',
    excerpt: 'Exploring the historical fort between the ancient fort and the tiger dynasty that calls this terrain home. How ruins and wildlife coexist.',
    content: [
      'Bandhavgarh National Park is unique in Indian wildlife conservation, where ancient human history and apex predators coexist in remarkable harmony.',
      'The 2000-year-old Bandhavgarh Fort, perched atop the park\'s highest point, bears witness to both royal dynasties of the past and the tiger dynasty of today.',
      'Tigers have adapted to navigate the rocky terrain and ancient structures, using ruins as territorial markers and vantage points. The fort\'s caves provide shelter during extreme weather.',
      'This intersection of cultural heritage and natural history makes Bandhavgarh a living museum, where every safari can yield both wildlife encounters and historical discoveries.',
      'Conservation challenges include balancing tourism with heritage preservation, ensuring both the fort and its wild inhabitants receive appropriate protection and respect.'
    ],
    author: 'Bandhavgarh National Park',
    park: 'BANDHAVGARH NATIONAL PARK',
    image: 'https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?w=800&h=600&fit=crop',
    date: 'Dec 15, 2025',
    readTime: '8 min read'
  },
  {
    id: 4,
    slug: 'the-great-migration-of-serengeti',
    title: 'THE GREAT MIGRATION OF SERENGETI',
    excerpt: 'Witnessing the world\'s most spectacular wildlife movement as millions of wildebeest and zebras traverse the plains.',
    content: [
      'The Great Migration of the Serengeti-Mara ecosystem is Earth\'s most spectacular wildlife phenomenon, involving over 1.5 million wildebeest, 200,000 zebras, and numerous other species.',
      'This circular journey spans approximately 800 kilometers, driven by the ancient rhythm of rainfall and grass growth. Animals follow predictable patterns established over millennia.',
      'The migration faces numerous challenges: river crossings where crocodiles wait, vast plains where lions hunt, and the constant search for water and grazing.',
      'Modern threats include habitat fragmentation, climate change affecting rainfall patterns, and increased human activity along migration corridors.',
      'Conservation efforts focus on maintaining connectivity between protected areas and working with local communities to ensure the migration can continue unimpeded.'
    ],
    author: 'Serengeti',
    park: 'SERENGETI',
    image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop',
    date: 'Dec 10, 2025',
    readTime: '10 min read'
  }
];
