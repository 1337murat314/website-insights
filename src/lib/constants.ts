// Restaurant Information
export const RESTAURANT_NAME = "Califorian Restaurant";
export const RESTAURANT_TAGLINE = "23 Years of Culinary Excellence";
export const RESTAURANT_DESCRIPTION = "Experience the perfect blend of Mediterranean flavors and modern cuisine in an unforgettable atmosphere.";

// Branches
export const BRANCHES = [
  {
    id: "lefkosa",
    name: "Lefkoşa",
    address: "Dereboyu Caddesi No: 45, Lefkoşa",
    phone: "+90 392 123 4567",
    hours: "11:00 - 23:00",
    mapUrl: "https://maps.google.com/?q=Lefkosa",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
  },
  {
    id: "gazimagusa",
    name: "Gazimağusa",
    address: "Salamis Yolu No: 78, Gazimağusa",
    phone: "+90 392 234 5678",
    hours: "11:00 - 23:00",
    mapUrl: "https://maps.google.com/?q=Gazimagusa",
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800",
  },
  {
    id: "esentepe",
    name: "Esentepe",
    address: "Sahil Yolu No: 12, Esentepe",
    phone: "+90 392 345 6789",
    hours: "10:00 - 00:00",
    mapUrl: "https://maps.google.com/?q=Esentepe",
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800",
  },
];

// Menu Categories
export const MENU_CATEGORIES = [
  { id: "all", name: "All", nameEn: "All", nameTr: "Tümü" },
  { id: "starters", name: "Starters", nameEn: "Starters", nameTr: "Başlangıçlar" },
  { id: "pizzas", name: "Pizzas", nameEn: "Pizzas", nameTr: "Pizzalar" },
  { id: "mains", name: "Main Courses", nameEn: "Main Courses", nameTr: "Ana Yemekler" },
  { id: "desserts", name: "Desserts", nameEn: "Desserts", nameTr: "Tatlılar" },
  { id: "beverages", name: "Beverages", nameEn: "Beverages", nameTr: "İçecekler" },
];

// Sample Menu Items
export const MENU_ITEMS = [
  {
    id: 1,
    name: "Bruschetta Trio",
    nameTr: "Bruschetta Üçlüsü",
    description: "Classic tomato, mushroom, and olive tapenade on toasted ciabatta",
    descriptionTr: "Kızarmış ciabatta üzerinde klasik domates, mantar ve zeytin ezmesi",
    price: 145,
    category: "starters",
    image: "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=600",
    tags: ["vegetarian"],
  },
  {
    id: 2,
    name: "Calamari Fritti",
    nameTr: "Kalamar Tava",
    description: "Crispy fried calamari with lemon aioli and marinara sauce",
    descriptionTr: "Limonlu aioli ve marinara sosu ile çıtır kalamar",
    price: 185,
    category: "starters",
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600",
    tags: [],
  },
  {
    id: 3,
    name: "Margherita Pizza",
    nameTr: "Margherita Pizza",
    description: "San Marzano tomatoes, fresh mozzarella, basil, extra virgin olive oil",
    descriptionTr: "San Marzano domates, taze mozzarella, fesleğen, sızma zeytinyağı",
    price: 220,
    category: "pizzas",
    image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=600",
    tags: ["vegetarian"],
  },
  {
    id: 4,
    name: "Quattro Formaggi",
    nameTr: "Dört Peynirli Pizza",
    description: "Mozzarella, gorgonzola, parmesan, and fontina cheese blend",
    descriptionTr: "Mozzarella, gorgonzola, parmesan ve fontina peynir karışımı",
    price: 265,
    category: "pizzas",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600",
    tags: ["vegetarian"],
  },
  {
    id: 5,
    name: "Diavola Pizza",
    nameTr: "Diavola Pizza",
    description: "Spicy salami, chili flakes, mozzarella, tomato sauce",
    descriptionTr: "Acılı salam, pul biber, mozzarella, domates sosu",
    price: 245,
    category: "pizzas",
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600",
    tags: ["spicy"],
  },
  {
    id: 6,
    name: "Grilled Sea Bass",
    nameTr: "Izgara Levrek",
    description: "Mediterranean sea bass with herb butter, roasted vegetables",
    descriptionTr: "Otlu tereyağı ve kavrulmuş sebzeler ile Akdeniz levreği",
    price: 385,
    category: "mains",
    image: "https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=600",
    tags: ["gluten-free"],
  },
  {
    id: 7,
    name: "Beef Tenderloin",
    nameTr: "Dana Bonfile",
    description: "Premium beef tenderloin with red wine reduction and truffle mash",
    descriptionTr: "Kırmızı şarap sosu ve trüflü patates püresi ile premium dana bonfile",
    price: 450,
    category: "mains",
    image: "https://images.unsplash.com/photo-1558030006-450675393462?w=600",
    tags: [],
  },
  {
    id: 8,
    name: "Tiramisu",
    nameTr: "Tiramisu",
    description: "Classic Italian dessert with espresso-soaked ladyfingers and mascarpone",
    descriptionTr: "Espresso emdirilmiş kadayıf ve mascarpone ile klasik İtalyan tatlısı",
    price: 95,
    category: "desserts",
    image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600",
    tags: ["vegetarian"],
  },
  {
    id: 9,
    name: "Panna Cotta",
    nameTr: "Panna Cotta",
    description: "Vanilla bean panna cotta with fresh berry compote",
    descriptionTr: "Taze meyve kompostosu ile vanilya panna cotta",
    price: 85,
    category: "desserts",
    image: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=600",
    tags: ["vegetarian", "gluten-free"],
  },
  {
    id: 10,
    name: "Fresh Lemonade",
    nameTr: "Taze Limonata",
    description: "House-made lemonade with fresh mint",
    descriptionTr: "Taze nane ile ev yapımı limonata",
    price: 45,
    category: "beverages",
    image: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=600",
    tags: ["vegan"],
  },
  {
    id: 11,
    name: "Espresso",
    nameTr: "Espresso",
    description: "Double shot of premium Italian espresso",
    descriptionTr: "Premium İtalyan espresso çift shot",
    price: 35,
    category: "beverages",
    image: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=600",
    tags: ["vegan"],
  },
  {
    id: 12,
    name: "House Wine",
    nameTr: "Ev Şarabı",
    description: "Selected red or white wine by the glass",
    descriptionTr: "Seçilmiş kırmızı veya beyaz şarap (kadeh)",
    price: 75,
    category: "beverages",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600",
    tags: ["vegan"],
  },
];

// Gallery Images
export const GALLERY_IMAGES = [
  { id: 1, src: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800", alt: "Restaurant interior", category: "interior" },
  { id: 2, src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800", alt: "Gourmet dish", category: "food" },
  { id: 3, src: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800", alt: "Outdoor seating", category: "interior" },
  { id: 4, src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800", alt: "Signature pasta", category: "food" },
  { id: 5, src: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800", alt: "Wood-fired pizza", category: "food" },
  { id: 6, src: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800", alt: "Bar area", category: "interior" },
  { id: 7, src: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800", alt: "Private event", category: "events" },
  { id: 8, src: "https://images.unsplash.com/photo-1544148103-0773bf10d330?w=800", alt: "Chef preparing", category: "team" },
  { id: 9, src: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800", alt: "Steak dish", category: "food" },
  { id: 10, src: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800", alt: "Celebration dinner", category: "events" },
  { id: 11, src: "https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=800", alt: "Dining room", category: "interior" },
  { id: 12, src: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800", alt: "Dessert selection", category: "food" },
];

// Navigation Links
export const NAV_LINKS = [
  { href: "/", labelEn: "Home", labelTr: "Ana Sayfa" },
  { href: "/menu", labelEn: "Menu", labelTr: "Menü" },
  { href: "/gallery", labelEn: "Gallery", labelTr: "Galeri" },
  { href: "/locations", labelEn: "Locations", labelTr: "Şubeler" },
  { href: "/about", labelEn: "About", labelTr: "Hakkımızda" },
  { href: "/reservations", labelEn: "Reservations", labelTr: "Rezervasyon" },
];

// Testimonials
export const TESTIMONIALS = [
  {
    id: 1,
    name: "Ayşe K.",
    text: "The best dining experience in Cyprus! The atmosphere and food are absolutely incredible.",
    textTr: "Kıbrıs'taki en iyi yemek deneyimi! Atmosfer ve yemekler kesinlikle inanılmaz.",
    rating: 5,
  },
  {
    id: 2,
    name: "Mehmet A.",
    text: "We celebrated our anniversary here. The service was impeccable and the food divine.",
    textTr: "Yıldönümümüzü burada kutladık. Servis kusursuz, yemekler muhteşemdi.",
    rating: 5,
  },
  {
    id: 3,
    name: "Sarah M.",
    text: "A hidden gem! The pizzas are authentic and the staff makes you feel like family.",
    textTr: "Gizli bir hazine! Pizzalar otantik ve personel sizi aile gibi hissettiriyor.",
    rating: 5,
  },
];