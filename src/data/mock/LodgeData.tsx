export interface RoomType {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  amenities: string[];
}

export interface Naturalist {
  id: number;
  name: string;
  role: string;
  experience: string;
  specialty: string;
  price: number;
  image: string;
}

export interface BankOffer {
  icon: string;
  bankName: string;
  offer: string;
  code: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Lodge {
  id: number;
  name: string;
  image: string;
  images: string[];
  rating: number;
  pricePerNight: number;
  nearestGates: string[];
  link: string;
  amenities: string[];
  ecoCertified: boolean;
  location: string;
  about?: {
    description: string[];
  };
  jungloreStory?: {
    reason: string[];
    highlights: Array<{ icon: string; text: string }>;
  };
  roomTypes?: RoomType[];
  naturalists?: Naturalist[];
  bankOffers?: BankOffer[];
  faqs?: FAQ[];
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
            "https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=1200",
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
            "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
            "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200",
            "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200",
            "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200",
            "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200"
          ],
          rating: 4.8,
          pricePerNight: 15000,
          nearestGates: ["Moharli Gate", "Tadoba Gate"],
          link: "https://www.junglore.com/tadoba-tiger-lodge",
          amenities: ["WiFi", "Pool", "Spa", "Safari", "AC"],
          ecoCertified: true,
          location: "Moharli, Chandrapur, Maharashtra",
          about: {
            description: [
              "Experience luxury in the heart of the wilderness at Tadoba Tiger Lodge. Our resort offers an unparalleled blend of comfort and adventure, situated just minutes from the park entrance. With stunning views of the surrounding forest and world-class amenities, your stay promises to be memorable.",
              "Each room is thoughtfully designed to provide maximum comfort while maintaining harmony with nature. Wake up to the sounds of the jungle and enjoy breakfast on your private deck as you spot wildlife from your room."
            ]
          },
          jungloreStory: {
            reason: [
              "After extensive research and personal visits, we selected Tadoba Tiger Lodge for its exceptional commitment to conservation and authentic wildlife experiences. The lodge's experienced naturalists and prime location near prime tiger territories make it an ideal base for serious wildlife enthusiasts.",
              "What sets this property apart is their dedication to sustainable tourism. They work closely with local communities, employ eco-friendly practices, and contribute significantly to conservation efforts in the region. Their guides are among the best we've encountered, with deep knowledge of animal behavior and tracking skills honed over decades."
            ],
            highlights: [
              { icon: "🌿", text: "100% eco-friendly operations with solar power and rainwater harvesting" },
              { icon: "🐅", text: "Expert naturalists with 15+ years tracking experience" },
              { icon: "👥", text: "Employs 80% staff from local tribal communities" },
              { icon: "🏆", text: "Award-winning sustainable tourism practices" }
            ]
          },
          roomTypes: [
            {
              id: 1,
              name: "Deluxe Room",
              price: 9000,
              image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800",
              description: "Spacious room with garden view and modern amenities. Perfect for couples seeking comfort and tranquility in nature's embrace.",
              amenities: ["King Bed", "AC", "WiFi", "Mini Bar"]
            },
            {
              id: 2,
              name: "Premium Suite",
              price: 12000,
              image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
              description: "Luxury suite with private balcony overlooking the forest. Enjoy morning tea while watching wildlife from your personal deck.",
              amenities: ["King Bed", "AC", "WiFi", "Bathtub", "Private Deck"]
            },
            {
              id: 3,
              name: "Luxury Villa",
              price: 18000,
              image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800",
              description: "Exclusive villa with pool access and butler service. Experience ultimate luxury with panoramic views and personalized hospitality.",
              amenities: ["King Bed", "AC", "WiFi", "Plunge Pool", "Butler Service"]
            }
          ],
          naturalists: [
            {
              id: 1,
              name: "Arjun Singh",
              role: "Senior Naturalist",
              experience: "15 years",
              specialty: "Tiger behavior & tracking",
              price: 150,
              image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300"
            },
            {
              id: 2,
              name: "Priya Sharma",
              role: "Wildlife Photographer",
              experience: "12 years",
              specialty: "Bird watching & photography",
              price: 120,
              image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300"
            },
            {
              id: 3,
              name: "Vikram Patel",
              role: "Conservation Expert",
              experience: "20 years",
              specialty: "Ecology & conservation",
              price: 180,
              image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300"
            }
          ],
          bankOffers: [
            {
              icon: "💳",
              bankName: "HDFC Bank",
              offer: "10% instant discount up to ₹2,000",
              code: "HDFC10"
            },
            {
              icon: "🏦",
              bankName: "ICICI Bank",
              offer: "15% cashback up to ₹3,000",
              code: "ICICI15"
            },
            {
              icon: "💰",
              bankName: "SBI Cards",
              offer: "₹1,500 off on bookings above ₹15,000",
              code: "SBI1500"
            }
          ],
          faqs: [
            {
              question: "What's included in the room rate?",
              answer: "All room rates include accommodation, breakfast, lunch, dinner, and tea/coffee. Safari permits and guide charges are additional."
            },
            {
              question: "How do I book safari permits?",
              answer: "Safari permits must be booked separately through the official forest department website. We provide assistance with the booking process and our team can guide you through it."
            },
            {
              question: "Is the naturalist service mandatory?",
              answer: "No, hiring a naturalist is optional but highly recommended. Our expert naturalists significantly enhance your wildlife experience with their tracking skills and knowledge."
            },
            {
              question: "What's your cancellation policy?",
              answer: "Free cancellation up to 7 days before check-in. Cancellations within 7 days will incur a 50% charge. No refund for no-shows."
            },
            {
              question: "Do you provide airport/railway transfers?",
              answer: "Yes, we offer pick-up and drop-off services from Nagpur Airport and Railway Station at an additional charge. Please inform us in advance to arrange the transfer."
            }
          ]
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
          pricePerNight: 12500,
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
          pricePerNight: 10000,
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
          pricePerNight: 18000,
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
          pricePerNight: 14000,
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
