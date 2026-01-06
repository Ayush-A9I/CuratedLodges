export interface LodgeCardData {
  id: number;
  image: string;
  title: string;
  location: string;
  rating: number;
  price: string;
  link?: string;
}

export const lodgeCardsData: LodgeCardData[] = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1549366021-9f761d450615?w=800",
    title: "Tiger's Nest Sanctuary",
    location: "KANHA NATIONAL PARK, INDIA",
    rating: 4.9,
    price: "$450",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800",
    title: "The Ebony River Lodge",
    location: "PENCH TIGER RESERVE, INDIA",
    rating: 4.8,
    price: "$580",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800",
    title: "Wilderness Haven",
    location: "BANDHAVGARH, INDIA",
    rating: 4.7,
    price: "$520",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800",
    title: "Ranthambore Retreat",
    location: "RANTHAMBORE NATIONAL PARK, INDIA",
    rating: 4.6,
    price: "$495",
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
    title: "Corbett Wilderness Camp",
    location: "JIM CORBETT NATIONAL PARK, INDIA",
    rating: 4.8,
    price: "$620",
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800",
    title: "Tadoba Tiger Trail",
    location: "TADOBA NATIONAL PARK, INDIA",
    rating: 4.9,
    price: "$550",
  },
  // Add more lodge cards below - just copy the format above and update the details
];
