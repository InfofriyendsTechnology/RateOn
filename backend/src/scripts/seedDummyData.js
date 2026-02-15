import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import connectDB from '../config/mongodb.js';
import { User, Business, Item, Review } from '../models/index.js';

// Common password for all dummy accounts
const COMMON_PASSWORD = 'Password123';

// Realistic Indian first and last names
const FIRST_NAMES = [
    'Rajesh', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Anjali', 'Arjun', 'Pooja',
    'Rahul', 'Kavya', 'Rohan', 'Neha', 'Aditya', 'Divya', 'Karan', 'Riya',
    'Sanjay', 'Meera', 'Akash', 'Ishita', 'Manish', 'Shreya', 'Nikhil', 'Ananya',
    'Suresh', 'Deepika', 'Ashok', 'Nisha', 'Vikas', 'Simran', 'Praveen', 'Aarti',
    'Mahesh', 'Swati', 'Ramesh', 'Pallavi', 'Arun', 'Tanvi', 'Ajay', 'Kritika'
];

const LAST_NAMES = [
    'Sharma', 'Kumar', 'Singh', 'Patel', 'Reddy', 'Gupta', 'Verma', 'Joshi',
    'Mehta', 'Nair', 'Chopra', 'Malhotra', 'Iyer', 'Rao', 'Desai', 'Kapoor',
    'Agarwal', 'Jain', 'Shah', 'Pillai', 'Menon', 'Bhat', 'Kulkarni', 'Naik',
    'Shetty', 'Das', 'Banerjee', 'Chatterjee', 'Roy', 'Sen', 'Ghosh', 'Mukherjee',
    'Pandey', 'Mishra', 'Sinha', 'Thakur', 'Chauhan', 'Rajput', 'Saxena', 'Arora'
];

// Indian cities with coordinates
const CITIES = [
    { city: 'Mumbai', state: 'Maharashtra', coordinates: [72.8777, 19.0760] },
    { city: 'Delhi', state: 'Delhi', coordinates: [77.1025, 28.7041] },
    { city: 'Bangalore', state: 'Karnataka', coordinates: [77.5946, 12.9716] },
    { city: 'Hyderabad', state: 'Telangana', coordinates: [78.4867, 17.3850] },
    { city: 'Chennai', state: 'Tamil Nadu', coordinates: [80.2707, 13.0827] },
    { city: 'Kolkata', state: 'West Bengal', coordinates: [88.3639, 22.5726] },
    { city: 'Pune', state: 'Maharashtra', coordinates: [73.8567, 18.5204] },
    { city: 'Ahmedabad', state: 'Gujarat', coordinates: [72.5714, 23.0225] },
    { city: 'Jaipur', state: 'Rajasthan', coordinates: [75.7873, 26.9124] },
    { city: 'Lucknow', state: 'Uttar Pradesh', coordinates: [80.9462, 26.8467] }
];

// Business templates with realistic data
const BUSINESS_TEMPLATES = {
    restaurant: [
        {
            names: ['The Royal Spice', 'Taste of India', 'Curry House', 'Masala Magic', 'Tandoor Tales'],
            category: 'Indian Cuisine',
            subcategory: 'North Indian',
            description: 'Authentic Indian cuisine with a modern twist. Experience the rich flavors of traditional recipes passed down through generations.',
            items: [
                { name: 'Butter Chicken', category: 'Main Course', price: 350, description: 'Tender chicken in creamy tomato gravy' },
                { name: 'Paneer Tikka Masala', category: 'Main Course', price: 280, description: 'Grilled cottage cheese in spiced gravy' },
                { name: 'Biryani', category: 'Rice', price: 320, description: 'Aromatic basmati rice with spices and meat' },
                { name: 'Naan', category: 'Bread', price: 60, description: 'Fresh oven-baked flatbread' },
                { name: 'Dal Makhani', category: 'Main Course', price: 240, description: 'Creamy black lentils slow-cooked overnight' },
                { name: 'Samosa', category: 'Appetizers', price: 80, description: 'Crispy pastry filled with spiced potatoes' },
                { name: 'Gulab Jamun', category: 'Desserts', price: 100, description: 'Sweet milk-solid dumplings in sugar syrup' },
                { name: 'Mango Lassi', category: 'Beverages', price: 120, description: 'Refreshing yogurt drink with mango' }
            ],
            imageQuery: 'indian food restaurant'
        },
        {
            names: ['Pizza Paradise', 'Italiano Bistro', 'Roma Kitchen', 'Pasta House', 'The Italian Job'],
            category: 'Italian Cuisine',
            subcategory: 'Pizza & Pasta',
            description: 'Authentic Italian pizzas and pasta made with love. Fresh ingredients imported directly from Italy.',
            items: [
                { name: 'Margherita Pizza', category: 'Pizza', price: 380, description: 'Classic tomato, mozzarella and basil' },
                { name: 'Pepperoni Pizza', category: 'Pizza', price: 450, description: 'Loaded with pepperoni and cheese' },
                { name: 'Carbonara Pasta', category: 'Pasta', price: 340, description: 'Creamy pasta with bacon and parmesan' },
                { name: 'Lasagna', category: 'Main Course', price: 420, description: 'Layered pasta with meat sauce and cheese' },
                { name: 'Tiramisu', category: 'Desserts', price: 180, description: 'Classic Italian coffee-flavored dessert' },
                { name: 'Garlic Bread', category: 'Appetizers', price: 120, description: 'Toasted bread with garlic butter' },
                { name: 'Caesar Salad', category: 'Salads', price: 250, description: 'Fresh romaine with caesar dressing' },
                { name: 'Italian Soda', category: 'Beverages', price: 150, description: 'Fizzy flavored drink' }
            ],
            imageQuery: 'italian pizza pasta'
        },
        {
            names: ['Burger Town', 'Grill Masters', 'The Burger Joint', 'Fast Bites', 'American Diner'],
            category: 'Fast Food',
            subcategory: 'Burgers',
            description: 'Juicy burgers and crispy fries. The perfect American-style fast food experience.',
            items: [
                { name: 'Classic Burger', category: 'Burgers', price: 180, description: 'Beef patty with lettuce, tomato and cheese' },
                { name: 'Chicken Burger', category: 'Burgers', price: 200, description: 'Crispy chicken with special sauce' },
                { name: 'Veggie Burger', category: 'Burgers', price: 160, description: 'Plant-based patty with fresh veggies' },
                { name: 'French Fries', category: 'Sides', price: 100, description: 'Crispy golden fries' },
                { name: 'Chicken Wings', category: 'Appetizers', price: 280, description: 'Spicy buffalo wings' },
                { name: 'Milkshake', category: 'Beverages', price: 150, description: 'Thick and creamy shake' },
                { name: 'Onion Rings', category: 'Sides', price: 120, description: 'Crispy fried onion rings' }
            ],
            imageQuery: 'burger fries fast food'
        }
    ],
    cafe: [
        {
            names: ['Brew & Bean', 'The Coffee Culture', 'Espresso Express', 'Cafe Mocha', 'Bean There'],
            category: 'Cafe',
            subcategory: 'Coffee & Snacks',
            description: 'Cozy cafe with artisanal coffee and delicious snacks. Perfect spot for work or relaxation.',
            items: [
                { name: 'Cappuccino', category: 'Coffee', price: 150, description: 'Espresso with steamed milk foam' },
                { name: 'Latte', category: 'Coffee', price: 160, description: 'Smooth espresso with milk' },
                { name: 'Cold Brew', category: 'Coffee', price: 180, description: 'Slow-brewed cold coffee' },
                { name: 'Croissant', category: 'Bakery', price: 120, description: 'Buttery flaky pastry' },
                { name: 'Blueberry Muffin', category: 'Bakery', price: 100, description: 'Fresh baked muffin' },
                { name: 'Avocado Toast', category: 'Food', price: 250, description: 'Sourdough with smashed avocado' },
                { name: 'Sandwich', category: 'Food', price: 200, description: 'Fresh veggie or chicken sandwich' },
                { name: 'Smoothie Bowl', category: 'Healthy', price: 280, description: 'Acai bowl with fresh fruits' }
            ],
            imageQuery: 'coffee cafe latte'
        }
    ],
    shop: [
        {
            names: ['Fashion Hub', 'Style Station', 'Trendy Threads', 'The Wardrobe', 'Fashion Forward'],
            category: 'Clothing',
            subcategory: 'Fashion Store',
            description: 'Latest fashion trends and timeless classics. Your one-stop destination for style.',
            items: [
                { name: 'Cotton T-Shirt', category: 'Casual Wear', price: 499, description: 'Comfortable cotton tee' },
                { name: 'Jeans', category: 'Casual Wear', price: 1299, description: 'Classic denim jeans' },
                { name: 'Formal Shirt', category: 'Formal Wear', price: 899, description: 'Crisp formal shirt' },
                { name: 'Summer Dress', category: 'Women', price: 1599, description: 'Flowy summer dress' },
                { name: 'Jacket', category: 'Outerwear', price: 2499, description: 'Stylish winter jacket' },
                { name: 'Sneakers', category: 'Footwear', price: 1999, description: 'Comfortable sneakers' }
            ],
            imageQuery: 'fashion clothing store'
        },
        {
            names: ['Tech World', 'Gadget Galaxy', 'Digital Den', 'Tech Store', 'Electronics Plus'],
            category: 'Electronics',
            subcategory: 'Gadgets',
            description: 'Latest electronics and gadgets. Authorized dealer of all major brands.',
            items: [
                { name: 'Wireless Earbuds', category: 'Audio', price: 2999, description: 'True wireless earbuds with noise cancellation' },
                { name: 'Smart Watch', category: 'Wearables', price: 8999, description: 'Fitness tracker smartwatch' },
                { name: 'Phone Case', category: 'Accessories', price: 499, description: 'Protective phone cover' },
                { name: 'Power Bank', category: 'Accessories', price: 1499, description: '10000mAh portable charger' },
                { name: 'Bluetooth Speaker', category: 'Audio', price: 3499, description: 'Portable wireless speaker' },
                { name: 'USB Cable', category: 'Accessories', price: 299, description: 'Fast charging cable' }
            ],
            imageQuery: 'electronics gadgets store'
        }
    ],
    service: [
        {
            names: ['Glam Studio', 'Beauty Lounge', 'Style Salon', 'The Beauty Bar', 'Elegance Spa'],
            category: 'Beauty & Wellness',
            subcategory: 'Salon & Spa',
            description: 'Premium salon and spa services. Expert stylists and beauticians.',
            items: [
                { name: 'Haircut', category: 'Hair Services', price: 500, description: 'Professional haircut and styling' },
                { name: 'Hair Color', category: 'Hair Services', price: 2500, description: 'Full hair coloring service' },
                { name: 'Facial', category: 'Skin Care', price: 1200, description: 'Deep cleansing facial' },
                { name: 'Manicure', category: 'Nail Care', price: 600, description: 'Hand care and nail polish' },
                { name: 'Pedicure', category: 'Nail Care', price: 700, description: 'Foot care and nail polish' },
                { name: 'Body Massage', category: 'Spa', price: 1800, description: 'Relaxing full body massage' }
            ],
            imageQuery: 'beauty salon spa'
        }
    ]
};

// Generate random number in range
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Generate random element from array
const randomElement = (arr) => arr[randomInt(0, arr.length - 1)];

// Generate Unsplash image URL using proper Unsplash API format
const getUnsplashImage = (query, width = 800, height = 600) => {
    const cleanQuery = encodeURIComponent(query);
    const randomId = Math.floor(Math.random() * 1000);
    // Use picsum.photos as a reliable fallback
    return `https://picsum.photos/seed/${cleanQuery}${randomId}/${width}/${height}`;
};

// Generate business hours
const generateBusinessHours = () => {
    return ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => ({
        day,
        open: '09:00',
        close: day === 'sunday' ? '20:00' : '22:00',
        isClosed: false
    }));
};

// Main seed function
const seedDummyData = async () => {
    try {
        await connectDB();
        const dummyUsers = await User.find({ 
            email: { $regex: '@business\.com$' }
        }).select('_id');
        
        const dummyUserIds = dummyUsers.map(u => u._id);
        
        if (dummyUserIds.length > 0) {
            await Review.deleteMany({ userId: { $in: dummyUserIds } });
            await Business.deleteMany({ owner: { $in: dummyUserIds } });
            await Item.deleteMany({ createdBy: { $in: dummyUserIds } });
            await User.deleteMany({ _id: { $in: dummyUserIds } });
        }
        
        const businessOwners = [];
        const usedNames = new Set();
        
        for (let i = 1; i <= 100; i++) {
            // Generate unique name
            let fullName, firstName, lastName, username;
            do {
                firstName = randomElement(FIRST_NAMES);
                lastName = randomElement(LAST_NAMES);
                fullName = `${firstName} ${lastName}`;
                username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
            } while (usedNames.has(username));
            
            usedNames.add(username);
            
            const city = randomElement(CITIES);
            
            // Hash password before creating user
            const hashedPassword = await bcrypt.hash(COMMON_PASSWORD, 10);
            
            const owner = new User({
                username: username,
                email: `${username}@business.com`,
                password: hashedPassword,
                role: 'business_owner',
                isEmailVerified: true,
                name: fullName,
                profile: {
                    firstName: `Business`,
                    lastName: `Owner ${i}`,
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=owner${i}`,
                    bio: 'Passionate business owner committed to quality and customer satisfaction.',
                    city: city.city,
                    state: city.state,
                    country: 'India',
                    coordinates: {
                        type: 'Point',
                        coordinates: city.coordinates
                    }
                },
                trustScore: randomInt(60, 95),
                level: randomInt(3, 8)
            });
            
            await owner.save();
            businessOwners.push(owner);
        }
        
        // Review comment templates
        const REVIEW_COMMENTS = [
            'Absolutely loved it! Great quality and service.',
            'Decent experience, would visit again.',
            'Not bad, but could be better. Average service.',
            'Excellent! Highly recommended to everyone.',
            'Good value for money. Satisfied with the purchase.',
            'Amazing quality! Exceeded my expectations.',
            'Pretty good, but room for improvement.',
            'Outstanding service and great ambiance!',
            'Okay experience, nothing special.',
            'Fantastic! Will definitely come back.',
            'Average, meets basic expectations.',
            'Superb quality and friendly staff!',
            'Could be improved, but not terrible.',
            'Great experience overall!',
            'Satisfied with the quality and service.'
        ];
        
        let totalBusinesses = 0;
        let totalItems = 0;
        let totalReviews = 0;
        
        for (const owner of businessOwners) {
            const numBusinesses = randomInt(2, 5);
            
            for (let b = 0; b < numBusinesses; b++) {
                // Select random business type
                const businessType = randomElement(['restaurant', 'cafe', 'shop', 'service']);
                const templates = BUSINESS_TEMPLATES[businessType];
                const template = randomElement(templates);
                
                const city = randomElement(CITIES);
                const businessName = `${randomElement(template.names)} - ${city.city}`;
                
                // Add small random offset to coordinates for variety
                const coords = [
                    city.coordinates[0] + (Math.random() - 0.5) * 0.1,
                    city.coordinates[1] + (Math.random() - 0.5) * 0.1
                ];
                
                const business = new Business({
                    name: businessName,
                    type: businessType,
                    category: template.category,
                    subcategory: template.subcategory,
                    description: template.description,
                    logo: getUnsplashImage(`${template.imageQuery} logo`, 400, 400),
                    coverImages: [
                        getUnsplashImage(template.imageQuery, 1200, 600),
                        getUnsplashImage(`${template.imageQuery} interior`, 1200, 600)
                    ],
                    location: {
                        address: `${randomInt(1, 999)} MG Road, ${city.city}`,
                        city: city.city,
                        state: city.state,
                        country: 'India',
                        pincode: `${randomInt(100000, 999999)}`,
                        coordinates: {
                            type: 'Point',
                            coordinates: coords
                        }
                    },
                    contact: {
                        phone: `+91${randomInt(7000000000, 9999999999)}`,
                        whatsapp: `+91${randomInt(7000000000, 9999999999)}`,
                        email: `${businessName.toLowerCase().replace(/[^a-z0-9]/g, '')}@business.com`,
                        website: `https://${businessName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`
                    },
                    businessHours: generateBusinessHours(),
                    owner: owner._id,
                    createdBy: owner._id,
                    isClaimed: true,
                    isVerified: randomInt(0, 100) > 30, // 70% verified
                    rating: {
                        average: 0, // Will be calculated from actual reviews
                        count: 0
                    },
                    stats: {
                        totalItems: template.items.length,
                        totalReviews: 0, // Will be calculated from actual reviews
                        avgRating: 0,
                        views: randomInt(100, 5000)
                    }
                });
                
                await business.save();
                totalBusinesses++;
                
                // Create items for this business
                const numItems = randomInt(5, Math.min(template.items.length, 15));
                const selectedItems = template.items
                    .sort(() => Math.random() - 0.5)
                    .slice(0, numItems);
                
                const createdItems = [];
                for (const itemTemplate of selectedItems) {
                    const item = new Item({
                        businessId: business._id,
                        name: itemTemplate.name,
                        description: itemTemplate.description,
                        price: itemTemplate.price,
                        category: itemTemplate.category,
                        images: [
                            getUnsplashImage(`${itemTemplate.name} food`, 800, 600),
                            getUnsplashImage(`${itemTemplate.name}`, 800, 600)
                        ],
                        availability: {
                            status: randomInt(0, 100) > 10 ? 'available' : 'out_of_stock'
                        },
                        stats: {
                            averageRating: 0, // Will be calculated from actual reviews
                            totalReviews: 0,
                            views: randomInt(50, 1000)
                        },
                        createdBy: owner._id,
                        isActive: true
                    });
                    
                    await item.save();
                    createdItems.push(item);
                    totalItems++;
                }
                
                // Create reviews for 60% of items from random users
                const itemsToReview = createdItems.filter(() => Math.random() > 0.4);
                
                for (const item of itemsToReview) {
                    const numReviews = randomInt(2, 8);
                    const reviewers = businessOwners
                        .filter(bo => bo._id.toString() !== owner._id.toString())
                        .sort(() => Math.random() - 0.5)
                        .slice(0, numReviews);
                    
                    let totalRating = 0;
                    
                    for (const reviewer of reviewers) {
                        const rating = randomInt(3, 5); // Most reviews are positive
                        totalRating += rating;
                        
                        const review = new Review({
                            itemId: item._id,
                            businessId: business._id,
                            userId: reviewer._id,
                            rating: rating,
                            comment: randomElement(REVIEW_COMMENTS),
                            reviewText: randomElement(REVIEW_COMMENTS),
                            images: Math.random() > 0.7 ? [getUnsplashImage(`${item.name}`, 600, 400)] : [],
                            status: 'approved'
                        });
                        
                        await review.save();
                        totalReviews++;
                    }
                    
                    // Update item stats
                    item.stats.totalReviews = numReviews;
                    item.stats.averageRating = parseFloat((totalRating / numReviews).toFixed(1));
                    await item.save();
                }
            }
        }
        
        // Update business stats based on their items' reviews
        const businesses = await Business.find({});
        for (const business of businesses) {
            const items = await Item.find({ businessId: business._id });
            
            let totalReviews = 0;
            let totalRating = 0;
            
            for (const item of items) {
                totalReviews += item.stats.totalReviews || 0;
                totalRating += (item.stats.averageRating || 0) * (item.stats.totalReviews || 0);
            }
            
            if (totalReviews > 0) {
                business.stats.totalReviews = totalReviews;
                business.stats.avgRating = parseFloat((totalRating / totalReviews).toFixed(1));
                business.rating.average = business.stats.avgRating;
                business.rating.count = totalReviews;
                await business.save();
            }
        }
        
        console.log(`✅ Seed Complete: ${totalBusinesses} businesses, ${totalItems} items, ${totalReviews} reviews`);
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Seed Failed');
        process.exit(1);
    }
};

// Run seed
seedDummyData();
