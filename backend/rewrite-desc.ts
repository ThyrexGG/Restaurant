import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const items = await prisma.menuItem.findMany();
  
  for (const item of items) {
    let newDesc = "";
    let name = item.name;
    let choices = "";
    
    // Extract choices from parentheses
    const match = name.match(/\(([^)]+)\)/);
    if (match) {
      choices = match[1].replace(/\//g, ', ');
      name = name.replace(/\([^)]+\)/, '').trim();
    }
    
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('smoothie')) {
      newDesc = `${name.replace(/ Smoothie/i, '')} blended with ice and milk.`;
    } else if (lowerName.includes('burger')) {
      newDesc = `Juicy ${name.replace(/ Burger/i, '').trim()} patty in a soft bun, served with fresh veggies.`;
    } else if (lowerName.includes('stir-fried') || lowerName.includes('stir fried')) {
      let ingredients = name.replace(/Stir-Fried /i, '').replace(/Stir-fried /i, '').replace(/Stir fried /i, '');
      newDesc = `Wok-tossed ${ingredients} with savory house sauce.`;
    } else if (lowerName.includes('fried rice')) {
      newDesc = `Classic fried rice cooked with egg, veggies, and ${name.replace(/ Fried Rice/i, '')}.`;
    } else if (lowerName.includes('soup')) {
      newDesc = `Comforting traditional soup with fresh herbs and spices.`;
    } else if (lowerName.includes('salad')) {
      newDesc = `Fresh mixed greens and ${name.replace(/ Salad/i, '')} tossed with tangy dressing.`;
    } else if (lowerName.includes('frappe')) {
      newDesc = `Icy blended beverage topped with whipped cream.`;
    } else if (lowerName.includes('macchiato') || lowerName.includes('latte') || lowerName.includes('coffee') || lowerName.includes('espresso') || lowerName.includes('americano') || lowerName.includes('cappuccino')) {
      newDesc = `Freshly brewed coffee beverage.`;
    } else if (lowerName.includes('amok')) {
      newDesc = `Traditional Cambodian coconut curry steamed in banana leaves.`;
    } else if (lowerName.includes('lok lak')) {
      newDesc = `Marinated meat stir-fried in peppery sauce, served with rice and fresh tomatoes.`;
    } else if (lowerName.includes('water') || lowerName.includes('coca') || lowerName.includes('sprite') || lowerName.includes('pepsi') || lowerName.includes('angkor') || lowerName.includes('cambodia can') || lowerName.includes('beer') || lowerName.includes('tea') || lowerName.includes('drink')) {
      newDesc = `Refreshing chilled beverage.`;
    } else if (lowerName.includes('french fries')) {
      newDesc = `Crispy golden fries.`;
    } else if (lowerName.includes('sandwich')) {
      newDesc = `Freshly made sandwich with premium fillings.`;
    } else {
      if (lowerName.includes('grilled')) {
         newDesc = `Charcoal-grilled to perfection.`;
      } else if (lowerName.includes('rice')) {
         newDesc = `Served with premium jasmine rice.`;
      } else {
         newDesc = `Freshly prepared with authentic ingredients.`;
      }
    }

    if (choices) {
      newDesc += ` Choice of: ${choices}.`;
    }

    // Capitalize first letter properly
    newDesc = newDesc.charAt(0).toUpperCase() + newDesc.slice(1);
    
    // Clean up spaces
    newDesc = newDesc.replace('  ', ' ');

    console.log(`Updating ${item.name}\n -> ${newDesc}`);
    
    await prisma.menuItem.update({
      where: { id: item.id },
      data: { description: newDesc }
    });
  }
  console.log("All descriptions updated successfully!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
