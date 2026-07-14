const fs = require('fs');

const menuPath = './src/assets/menu.json';
const menu = JSON.parse(fs.readFileSync(menuPath, 'utf8'));

const adjectives = ["Delicious", "Savory", "Authentic", "Mouth-watering", "Classic", "Traditional", "Signature", "Flavorful", "Hearty", "Fresh", "Zesty", "Exquisite", "Delectable", "Tempting", "Scrumptious", "Vibrant"];
const endings = ["Perfect for any time of the day.", "A must-try for food lovers.", "Served fresh and hot.", "Crafted with the finest ingredients.", "A local favorite.", "Guaranteed to satisfy your cravings.", "Prepared with our chef's special touch.", "Experience the true taste of Cambodia.", "A delightful culinary experience.", "Enjoy every bite."];

function getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

const facts = {
    'amok': 'A traditional Cambodian delicacy featuring a rich, aromatic coconut curry base flavored with lemongrass, kaffir lime, and galangal, gently steamed to perfection.',
    'lok lak': 'A classic Khmer dish of tender, marinated meat stir-fried in a savory brown sauce, traditionally served with crisp lettuce, tomatoes, and a tangy lime-pepper dipping sauce.',
    'lab': 'A vibrant, spicy, and sour minced meat salad tossed with fresh herbs, toasted rice powder, and a zesty lime dressing.',
    'prama fish': 'A robust and deeply flavorful traditional salted and fermented fish, pan-fried to golden perfection and often served with egg.',
    'somlor machu': 'A comforting and tangy Cambodian sour soup, balanced with tamarind, fragrant herbs, and a savory broth.',
    'prahok': 'A quintessential Cambodian fermented fish paste that adds a deep, savory umami flavor to authentic Khmer cuisine.',
    'kuy teav': 'A popular Cambodian noodle soup with a delicate pork or beef broth, garnished with fresh herbs and bean sprouts.',
    'fried rice': 'Wok-tossed to smoky perfection with premium jasmine rice, eggs, and fresh vegetables.',
    'fried noodle': 'Stir-fried noodles with crisp vegetables and a savory soy-based sauce.',
    'burger': 'A juicy, perfectly grilled patty served in a soft bun with crisp veggies and savory sauces.',
    'smoothie': 'A refreshing, ice-cold blend of fresh ingredients, perfectly sweetened.',
    'macchiato': 'A rich espresso layered with creamy milk and flavored syrup.',
    'frappe': 'A blended, icy beverage topped with a generous dollop of whipped cream.',
    'pancake': 'Fluffy, golden-brown pancakes served warm with delightful toppings.',
    'spring roll': 'Crispy or fresh rolls packed with vibrant ingredients and served with a complementary dipping sauce.',
    'sandwich': 'Freshly assembled with premium fillings between slices of toasted or soft bread.'
};

let uniqueCounter = 1;

menu.forEach(item => {
    let nameLower = item.Name.toLowerCase();
    let baseFact = "";
    
    // Fact checking / finding base description
    for (const [key, fact] of Object.entries(facts)) {
        if (nameLower.includes(key)) {
            baseFact = fact;
            break;
        }
    }
    
    if (!baseFact) {
        if (item.Category && item.Category.toLowerCase() === 'beverage') {
            baseFact = 'A carefully crafted drink to quench your thirst and elevate your mood.';
        } else {
            baseFact = `A carefully prepared ${item.Category ? item.Category.toLowerCase() : 'dish'} showcasing premium ingredients and balanced flavors.`;
        }
    }
    
    // Make it absolutely unique by combining different parts and the item's own name
    let adj = getRandom(adjectives);
    let end = getRandom(endings);
    
    // Sometimes add the name into the description for uniqueness
    let desc = `${adj} ${item.Name}. ${baseFact} ${end}`;
    
    // If there's a variant like "(Beef/Seafood)", integrate it
    if (item.Name.includes('(')) {
        desc += ` Choose your favorite variation for a personalized touch.`;
    }
    
    // Add a tiny unique invisible or visible marker to guarantee uniqueness if needed, 
    // but the combination of Name + Adjective + Ending + Fact is usually unique enough.
    // To be strictly unique, we can ensure no two descriptions are perfectly identical
    item.Description = desc;
});

// Double check uniqueness
let seen = new Set();
menu.forEach((item, index) => {
    if (seen.has(item.Description)) {
        item.Description += ` (Item ${uniqueCounter++})`;
    }
    seen.add(item.Description);
});

fs.writeFileSync(menuPath, JSON.stringify(menu, null, 4), 'utf8');
console.log('Descriptions updated successfully! Total updated:', menu.length);
