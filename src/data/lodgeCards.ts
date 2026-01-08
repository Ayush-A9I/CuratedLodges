export interface LodgeCardData {
  id: number;
  image: string;
  images: string[];
  title: string;
  location: string;
  rating: number;
  price: string;
  link?: string;
  amenities: string[];
  ecoCertified: boolean;
}

export const lodgeCardsData: LodgeCardData[] = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1549366021-9f761d450615?w=800",
    images: [
      "https://images.unsplash.com/photo-1549366021-9f761d450615?w=800",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
      "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800",
    ],
    title: "Tiger's Nest Sanctuary",
    location: "Khatia, Mandla, Madhya Pradesh",
    rating: 4.9,
    price: "$450",
    amenities: ["WiFi", "Pool", "Spa", "Safari"],
    ecoCertified: true,
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800",
    images: [
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
    ],
    title: "The Ebony River Lodge",
    location: "Pench, Seoni, Madhya Pradesh",
    rating: 4.8,
    price: "$580",
    amenities: ["WiFi", "Pool", "Safari", "Bar"],
    ecoCertified: true,
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800",
    images: [
      "https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
    ],
    title: "Wilderness Haven",
    location: "Tala, Umaria, Madhya Pradesh",
    rating: 4.7,
    price: "$520",
    amenities: ["WiFi", "Spa", "Safari", "Library"],
    ecoCertified: false,
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800",
    images: [
      "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
    ],
    title: "Ranthambore Retreat",
    location: "Sawai Madhopur, Rajasthan",
    rating: 4.6,
    price: "$495",
    amenities: ["WiFi", "Pool", "Safari", "Gym"],
    ecoCertified: true,
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
    images: [
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
      "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800",
    ],
    title: "Corbett Wilderness Camp",
    location: "Dhikuli, Nainital, Uttarakhand",
    rating: 4.8,
    price: "$620",
    amenities: ["WiFi", "Pool", "Safari", "Bonfire"],
    ecoCertified: true,
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800",
    images: [
      "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
    ],
    title: "Tadoba Tiger Trail",
    location: "Moharli, Chandrapur, Maharashtra",
    rating: 4.9,
    price: "$550",
    amenities: ["WiFi", "Pool", "Spa", "Safari", "AC"],
    ecoCertified: true,
  },
  // Add more lodge cards below - just copy the format above and update the details
];
