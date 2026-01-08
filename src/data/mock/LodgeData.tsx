export interface Lodge {
  id: number;
  name: string;
  image: string;
  images: string[];
  rating: number;
  pricePerNight: string;
  nearestGates: string[];
  link: string;
  amenities: string[];
  ecoCertified: boolean;
  location: string;
}

export interface Feature {
  icon: string;
  name: string;
}

export interface ParkData {
  name: string;
  description: string;
  heroImage: string;
  bestTime: string;
  wildlife: string;
  features: Feature[];
  lodges: Lodge[];
}

export interface RegionData {
  [parkName: string]: ParkData;
}

export interface LodgesData {
  [region: string]: RegionData;
}

export const lodgesData: LodgesData = {
  india: {
    "Tadoba Andhari Tiger Reserve": {
      name: "Tadoba Andhari Tiger Reserve",
      description: "Maharashtra's oldest and largest national park, Tadoba is famous for its thriving tiger population and diverse wildlife including leopards, sloth bears, and wild dogs. The park's teak forests and bamboo groves provide an exceptional setting for wildlife viewing.",
      heroImage: "https://images.unsplash.com/photo-1615963244664-5b845b2025ee?w=1920&q=80",
      bestTime: "October to May",
      wildlife: "Tigers, Leopards, Sloth Bears, Wild Dogs, Gaur",
      features: [
        { icon: "🐅", name: "Tiger Reserve" },
        { icon: "🌳", name: "Dense Forests" },
        { icon: "🦌", name: "Rich Wildlife" },
        { icon: "📸", name: "Photography" },
      ],
      lodges: [
        {
          id: 1,
          name: "Tadoba Tiger Lodge",
          image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
          images: [
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
            "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
          ],
          rating: 4.8,
          pricePerNight: "₹15,000",
          nearestGates: ["Moharli Gate", "Tadoba Gate"],
          link: "https://www.junglore.com/tadoba-tiger-lodge",
          amenities: ["WiFi", "Pool", "Spa", "Safari", "AC"],
          ecoCertified: true,
          location: "Moharli, Chandrapur, Maharashtra",
        },
        {
          id: 2,
          name: "Tiger Trails Jungle Lodge",
          image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
          images: [
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
            "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
            "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
          ],
          rating: 4.7,
          pricePerNight: "₹12,500",
          nearestGates: ["Kolara Gate", "Moharli Gate"],
          link: "https://www.junglore.com/tiger-trails",
          amenities: ["WiFi", "Pool", "Safari", "Bar"],
          ecoCertified: true,
          location: "Kolara, Chandrapur, Maharashtra",
        },
        {
          id: 3,
          name: "Bamboo Forest Safari Lodge",
          image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
          images: [
            "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
            "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800",
          ],
          rating: 4.6,
          pricePerNight: "₹10,000",
          nearestGates: ["Tadoba Gate", "Navegaon Gate"],
          link: "https://www.junglore.com/bamboo-forest",
          amenities: ["WiFi", "Safari", "Library"],
          ecoCertified: false,
          location: "Navegaon, Chandrapur, Maharashtra",
        },
      ],
    },
    "Kanha National Park": {
      name: "Kanha National Park",
      description: "One of India's most stunning tiger reserves, Kanha is known for its successful conservation of the barasingha (swamp deer). The park's sal and bamboo forests, expansive meadows, and streams offer spectacular wildlife viewing opportunities.",
      heroImage: "https://images.unsplash.com/photo-1549366021-9f761d450615?w=1920&q=80",
      bestTime: "October to June",
      wildlife: "Tigers, Barasingha, Leopards, Wild Dogs, Sloth Bears",
      features: [
        { icon: "🦌", name: "Barasingha Home" },
        { icon: "🌲", name: "Sal Forests" },
        { icon: "🐅", name: "Tiger Territory" },
        { icon: "🏞️", name: "Scenic Meadows" },
      ],
      lodges: [
        {
          id: 4,
          name: "Kanha Earth Lodge",
          image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
          images: [
            "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
          ],
          rating: 4.9,
          pricePerNight: "₹18,000",
          nearestGates: ["Khatia Gate", "Mukki Gate"],
          link: "https://www.junglore.com/kanha-earth",
          amenities: ["WiFi", "Pool", "Spa", "Safari", "Gym", "AC"],
          ecoCertified: true,
          location: "Khatia, Mandla, Madhya Pradesh",
        },
        {
          id: 5,
          name: "Barasingha Wilderness Camp",
          image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800",
          images: [
            "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800",
            "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
            "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
          ],
          rating: 4.7,
          pricePerNight: "₹14,000",
          nearestGates: ["Mukki Gate"],
          link: "https://www.junglore.com/barasingha-camp",
          amenities: ["WiFi", "Safari", "Bonfire"],
          ecoCertified: true,
          location: "Mukki, Mandla, Madhya Pradesh",
        },
      ],
    },
    "Pench National Park": {
      name: "Pench National Park",
      description: "Famous as the inspiration for Rudyard Kipling's 'The Jungle Book', Pench is a pristine forest featuring the beautiful Pench River meandering through it. The park is home to tigers, leopards, and over 285 species of birds.",
      heroImage: "https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?w=1920&q=80",
      bestTime: "October to May",
      wildlife: "Tigers, Leopards, Wild Dogs, Sloth Bears, 285+ Bird Species",
      features: [
        { icon: "📚", name: "Jungle Book" },
        { icon: "🌊", name: "Pench River" },
        { icon: "🐆", name: "Leopards" },
        { icon: "🦅", name: "285+ Birds" },
      ],
      lodges: [],
    },
    "Jim Corbett National Park": {
      name: "Jim Corbett National Park",
      description: "India's oldest national park, Corbett is a haven for wildlife enthusiasts. Located in the foothills of the Himalayas, it features diverse ecosystems from grasslands to dense forests, home to the Royal Bengal Tiger.",
      heroImage: "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=1920&q=80",
      bestTime: "November to June",
      wildlife: "Bengal Tigers, Elephants, Leopards, Deer, 600+ Bird Species",
      features: [
        { icon: "🏔️", name: "Himalayan Foothills" },
        { icon: "🐅", name: "Bengal Tigers" },
        { icon: "🐘", name: "Elephants" },
        { icon: "🌿", name: "Rich Biodiversity" },
      ],
      lodges: [],
    },
    "Ranthambore National Park": {
      name: "Ranthambore National Park",
      description: "One of the best places to see tigers in their natural habitat, Ranthambore combines wildlife with history featuring ancient ruins. The park's landscape of rocky terrain, lakes, and forests creates a dramatic setting for wildlife photography.",
      heroImage: "https://images.unsplash.com/photo-1606505407554-f0fd32dd73c5?w=1920&q=80",
      bestTime: "October to April",
      wildlife: "Tigers, Leopards, Marsh Crocodiles, Sloth Bears, Sambar Deer",
      features: [
        { icon: "🏰", name: "Historic Ruins" },
        { icon: "🐅", name: "Tiger Sightings" },
        { icon: "💧", name: "Beautiful Lakes" },
        { icon: "📷", name: "Photography Hub" },
      ],
      lodges: [],
    },
    "Bandhavgarh National Park": {
      name: "Bandhavgarh National Park",
      description: "Known for having one of the highest density of tigers in India, Bandhavgarh also features the ancient Bandhavgarh Fort. The park's varied terrain of forests, grasslands, and rocky hills provides excellent wildlife viewing.",
      heroImage: "https://images.unsplash.com/photo-1612293331522-3eca87b51363?w=1920&q=80",
      bestTime: "October to June",
      wildlife: "Tigers, Leopards, White Tigers, Deer, Bison",
      features: [
        { icon: "👑", name: "Highest Tiger Density" },
        { icon: "🏛️", name: "Ancient Fort" },
        { icon: "🌾", name: "Grasslands" },
        { icon: "🐆", name: "Leopards" },
      ],
      lodges: [],
    },
  },
  africa: {
    "Kruger National Park": {
      name: "Kruger National Park",
      description: "South Africa's largest game reserve, Kruger is home to the Big Five and an incredible diversity of wildlife. Spanning nearly 2 million hectares, it offers one of the most authentic African safari experiences with excellent infrastructure.",
      heroImage: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1920&q=80",
      bestTime: "May to September",
      wildlife: "Lions, Elephants, Rhinos, Leopards, Buffalo, Wild Dogs",
      features: [
        { icon: "🦁", name: "Big Five" },
        { icon: "🌍", name: "Largest Reserve" },
        { icon: "🦏", name: "Rhinos" },
        { icon: "🐘", name: "Elephants" },
      ],
      lodges: [],
    },
    "Serengeti National Park": {
      name: "Serengeti National Park",
      description: "Famous for the annual wildebeest migration, the Serengeti is a UNESCO World Heritage Site. Its vast plains teem with wildlife including lions, leopards, and cheetahs, offering one of the world's most spectacular natural shows.",
      heroImage: "https://images.unsplash.com/photo-1547970810-dc1e684757a4?w=1920&q=80",
      bestTime: "June to October (Migration season)",
      wildlife: "Wildebeest, Lions, Cheetahs, Leopards, Elephants, Zebras",
      features: [
        { icon: "🦓", name: "Great Migration" },
        { icon: "🦁", name: "Lions Pride" },
        { icon: "🌾", name: "Endless Plains" },
        { icon: "🐆", name: "Cheetahs" },
      ],
      lodges: [],
    },
    "Maasai Mara": {
      name: "Maasai Mara",
      description: "Kenya's most celebrated game reserve, the Maasai Mara is renowned for its exceptional population of big cats and the dramatic wildebeest migration. The rolling grasslands and the Mara River create unforgettable wildlife encounters.",
      heroImage: "https://images.unsplash.com/photo-1549366021-9f761d450615?w=1920&q=80",
      bestTime: "July to October (Great Migration)",
      wildlife: "Lions, Cheetahs, Leopards, Wildebeest, Elephants, Giraffes",
      features: [
        { icon: "🐆", name: "Big Cats" },
        { icon: "🦓", name: "Migration" },
        { icon: "🌊", name: "Mara River" },
        { icon: "👥", name: "Maasai Culture" },
      ],
      lodges: [],
    },
    "Okavango Delta": {
      name: "Okavango Delta",
      description: "A unique inland delta in Botswana, the Okavango is a water wonderland in the heart of the Kalahari Desert. Its maze of channels, lagoons, and islands creates a pristine habitat for diverse wildlife and offers exclusive safari experiences.",
      heroImage: "https://images.unsplash.com/photo-1535083783855-76ae62b2914e?w=1920&q=80",
      bestTime: "May to September",
      wildlife: "Elephants, Hippos, Crocodiles, Lions, Wild Dogs, Lechwe",
      features: [
        { icon: "💧", name: "Water Safari" },
        { icon: "🦛", name: "Hippos" },
        { icon: "🐘", name: "Elephants" },
        { icon: "🚣", name: "Mokoro Rides" },
      ],
      lodges: [],
    },
    "Chobe National Park": {
      name: "Chobe National Park",
      description: "Home to one of the largest elephant populations in Africa, Chobe offers incredible river safaris along the Chobe River. The park's diverse ecosystems support lions, leopards, and vast herds of buffalo.",
      heroImage: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920&q=80",
      bestTime: "April to October",
      wildlife: "Elephants, Lions, Leopards, Buffalo, Hippos, Crocodiles",
      features: [
        { icon: "🐘", name: "Elephant Herds" },
        { icon: "🚤", name: "River Safari" },
        { icon: "🦁", name: "Predators" },
        { icon: "🦬", name: "Buffalo" },
      ],
      lodges: [],
    },
  },
};
