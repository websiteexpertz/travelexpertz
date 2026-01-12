import mongoose from 'mongoose';
import { Homestay } from './src/models/homestay.js';

const DATABASE_URL = 'mongodb://localhost:27017/travelexpertz';

const homestaysData = [
  {
    name: "Cozy Mountain Retreat",
    location: "Manali, Himachal Pradesh",
    address: "Old Manali Road, Near Manu Temple, Manali, HP 175131",
    price: 3500,
    rating: 4.7,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800",
    images: [
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800"
    ],
    description: "Experience authentic Himalayan hospitality in our beautiful mountain homestay. Wake up to stunning valley views, enjoy home-cooked local cuisine, and explore the serene beauty of Old Manali.",
    amenities: ["WiFi", "Mountain View", "Home-cooked Meals", "Bonfire", "Parking", "Trekking Guide"],
    nearbyPlaces: [
      { name: "Manu Temple", distance: "500m" },
      { name: "Mall Road", distance: "2km" },
      { name: "Hidimba Temple", distance: "3km" }
    ],
    checkInTime: "12:00 PM",
    checkOutTime: "11:00 AM",
    propertyType: "Entire Place",
    hostName: "Rajesh Sharma",
    hostEmail: "rajesh.sharma@example.com",
    hostPhone: "+91-9876543210",
    hostLanguages: ["Hindi", "English", "Punjabi"],
    yearsHosting: 5,
    rooms: [
      {
        id: "room1",
        type: "Deluxe Room with Valley View",
        price: 3500,
        maxGuests: 2,
        bedType: "King Bed",
        size: 25,
        amenities: ["WiFi", "Valley View", "Attached Bathroom", "Hot Water"],
        images: ["https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800"],
        availability: 3,
        cancellationPolicy: "Free cancellation up to 48 hours before check-in"
      },
      {
        id: "room2",
        type: "Standard Room",
        price: 2500,
        maxGuests: 2,
        bedType: "Queen Bed",
        size: 20,
        amenities: ["WiFi", "Attached Bathroom", "Hot Water"],
        images: ["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800"],
        availability: 2,
        cancellationPolicy: "Free cancellation up to 48 hours before check-in"
      }
    ],
    userReviews: [
      {
        id: "review1",
        userName: "Priya Mehta",
        rating: 5,
        date: "2024-12-20",
        comment: "Amazing homestay! The host was incredibly welcoming and the food was delicious. The view from the room was breathtaking.",
        helpful: 12
      }
    ],
    policies: {
      cancellation: "Free cancellation up to 48 hours before check-in. 50% refund for cancellations within 48 hours.",
      checkIn: "Flexible check-in from 12:00 PM onwards",
      checkOut: "Check-out by 11:00 AM",
      pets: "Pets allowed with prior permission",
      smoking: "Smoking not allowed indoors",
      parties: "No parties or events allowed"
    },
    popular: true,
    active: true
  },
  {
    name: "Traditional Kerala Homestay",
    location: "Alleppey, Kerala",
    address: "Near Marari Beach, Alleppey, Kerala 688549",
    price: 4000,
    rating: 4.8,
    reviews: 124,
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
    images: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
      "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800"
    ],
    description: "Stay in a traditional Kerala house with modern amenities. Experience authentic Kerala culture, cuisine, and hospitality. Close to backwaters and beaches.",
    amenities: ["WiFi", "Swimming Pool", "Authentic Kerala Cuisine", "Backwater View", "Parking", "Bicycle Rental"],
    nearbyPlaces: [
      { name: "Marari Beach", distance: "1km" },
      { name: "Alleppey Backwaters", distance: "5km" },
      { name: "Lighthouse", distance: "3km" }
    ],
    checkInTime: "1:00 PM",
    checkOutTime: "10:00 AM",
    propertyType: "Private Room",
    hostName: "Lakshmi Nair",
    hostEmail: "lakshmi.nair@example.com",
    hostPhone: "+91-9123456789",
    hostLanguages: ["Malayalam", "English", "Hindi"],
    yearsHosting: 8,
    rooms: [
      {
        id: "room1",
        type: "Heritage Room with Pool View",
        price: 4000,
        maxGuests: 2,
        bedType: "King Bed",
        size: 30,
        amenities: ["AC", "WiFi", "Pool View", "Traditional Decor", "Attached Bathroom"],
        images: ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800"],
        availability: 2,
        cancellationPolicy: "Free cancellation up to 3 days before check-in"
      }
    ],
    userReviews: [
      {
        id: "review1",
        userName: "Amit Kumar",
        rating: 5,
        date: "2024-12-15",
        comment: "Exceptional hospitality! The Kerala meals prepared by the host were outstanding. Highly recommend for an authentic experience.",
        helpful: 18
      },
      {
        id: "review2",
        userName: "Sarah Johnson",
        rating: 4,
        date: "2024-12-10",
        comment: "Beautiful traditional house, very clean and comfortable. The location is perfect for exploring backwaters.",
        helpful: 8
      }
    ],
    policies: {
      cancellation: "Free cancellation up to 3 days before check-in",
      checkIn: "Check-in from 1:00 PM",
      checkOut: "Check-out by 10:00 AM",
      pets: "Pets not allowed",
      smoking: "Smoking not allowed",
      parties: "No parties or events"
    },
    popular: true,
    active: true
  },
  {
    name: "Rajasthani Heritage Home",
    location: "Jaipur, Rajasthan",
    address: "Old City, Near Hawa Mahal, Jaipur, Rajasthan 302002",
    price: 3000,
    rating: 4.6,
    reviews: 67,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
      "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800"
    ],
    description: "Step into royalty with our heritage homestay in the heart of Pink City. Experience Rajasthani culture, traditional hospitality, and explore the magnificent forts and palaces.",
    amenities: ["WiFi", "Traditional Rajasthani Meals", "Rooftop Terrace", "Cultural Programs", "Parking"],
    nearbyPlaces: [
      { name: "Hawa Mahal", distance: "500m" },
      { name: "City Palace", distance: "1km" },
      { name: "Jantar Mantar", distance: "1.5km" }
    ],
    checkInTime: "2:00 PM",
    checkOutTime: "11:00 AM",
    propertyType: "Entire Place",
    hostName: "Vikram Singh Rathore",
    hostEmail: "vikram.rathore@example.com",
    hostPhone: "+91-9988776655",
    hostLanguages: ["Hindi", "English", "Rajasthani"],
    yearsHosting: 6,
    rooms: [
      {
        id: "room1",
        type: "Royal Suite",
        price: 3000,
        maxGuests: 3,
        bedType: "King Bed + Single Bed",
        size: 35,
        amenities: ["AC", "WiFi", "Traditional Decor", "Attached Bathroom", "Balcony"],
        images: ["https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800"],
        availability: 2,
        cancellationPolicy: "Free cancellation up to 2 days before check-in"
      }
    ],
    userReviews: [
      {
        id: "review1",
        userName: "Emily Watson",
        rating: 5,
        date: "2024-12-05",
        comment: "An unforgettable experience! The host arranged a cultural evening with folk music and dance. The location is perfect for sightseeing.",
        helpful: 15
      }
    ],
    policies: {
      cancellation: "Free cancellation up to 2 days before check-in",
      checkIn: "Check-in from 2:00 PM",
      checkOut: "Check-out by 11:00 AM",
      pets: "Pets not allowed",
      smoking: "Smoking allowed on rooftop only",
      parties: "Small gatherings allowed with prior permission"
    },
    popular: false,
    active: true
  },
  {
    name: "Goan Beach Cottage",
    location: "Palolem, Goa",
    address: "Palolem Beach Road, Canacona, South Goa 403702",
    price: 5000,
    rating: 4.9,
    reviews: 156,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800"
    ],
    description: "Charming beach cottage just steps away from the pristine Palolem Beach. Enjoy the sound of waves, stunning sunsets, and authentic Goan hospitality.",
    amenities: ["WiFi", "Beach Access", "Outdoor Seating", "BBQ Facility", "Parking", "Bicycle Rental"],
    nearbyPlaces: [
      { name: "Palolem Beach", distance: "50m" },
      { name: "Butterfly Beach", distance: "2km" },
      { name: "Cabo de Rama Fort", distance: "15km" }
    ],
    checkInTime: "1:00 PM",
    checkOutTime: "11:00 AM",
    propertyType: "Entire Place",
    hostName: "Maria D'Souza",
    hostEmail: "maria.dsouza@example.com",
    hostPhone: "+91-9876512345",
    hostLanguages: ["English", "Hindi", "Konkani"],
    yearsHosting: 10,
    rooms: [
      {
        id: "room1",
        type: "Beach View Cottage",
        price: 5000,
        maxGuests: 4,
        bedType: "2 Queen Beds",
        size: 40,
        amenities: ["AC", "WiFi", "Beach View", "Kitchen", "Outdoor Shower"],
        images: ["https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800"],
        availability: 1,
        cancellationPolicy: "Free cancellation up to 7 days before check-in"
      }
    ],
    userReviews: [
      {
        id: "review1",
        userName: "David Miller",
        rating: 5,
        date: "2024-12-01",
        comment: "Paradise found! The cottage is beautifully designed, clean, and the location couldn't be better. Maria is an excellent host.",
        helpful: 25
      },
      {
        id: "review2",
        userName: "Anjali Gupta",
        rating: 5,
        date: "2024-11-25",
        comment: "Perfect beach getaway! Loved waking up to the sound of waves. The host recommended great local restaurants.",
        helpful: 19
      }
    ],
    policies: {
      cancellation: "Free cancellation up to 7 days before check-in. 50% refund for 3-7 days notice.",
      checkIn: "Flexible check-in from 1:00 PM",
      checkOut: "Check-out by 11:00 AM",
      pets: "Pets allowed",
      smoking: "Smoking allowed outdoors only",
      parties: "No loud parties"
    },
    popular: true,
    active: true
  }
];

async function seedHomestays() {
  try {
    await mongoose.connect(DATABASE_URL);
    console.log('Connected to MongoDB');

    // Clear existing homestays
    await Homestay.deleteMany({});
    console.log('Cleared existing homestays');

    // Insert new homestays
    const result = await Homestay.insertMany(homestaysData);
    console.log(`Successfully seeded ${result.length} homestays`);

    mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding homestays:', error);
    process.exit(1);
  }
}

seedHomestays();
