import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Reset database tables
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.storeSetting.deleteMany();

  // Create Store Setting
  await prisma.storeSetting.create({
    data: {
      id: 'default',
      storeName: '',
      status: 'OPEN',
      closedMessage: 'ขออภัย วันนี้ร้านปิดให้บริการ จะกลับมาเปิดใหม่อีกครั้งพรุ่งนี้ครับ',
      promptpayId: '',
      promptpayName: '',
    },
  });

  // Create Categories
  const catRice = await prisma.category.create({
    data: { name: 'อาหารจานเดียว (Rice Dishes)', sortOrder: 1 },
  });

  const catNoodle = await prisma.category.create({
    data: { name: 'เมนูก๋วยเตี๋ยว & เส้น (Noodles)', sortOrder: 2 },
  });

  const catDrink = await prisma.category.create({
    data: { name: 'เครื่องดื่ม (Drinks & Beverages)', sortOrder: 3 },
  });

  const catDessert = await prisma.category.create({
    data: { name: 'ของหวาน (Desserts)', sortOrder: 4 },
  });

  // Create Menu Items
  const menuItems = [
    {
      name: 'ข้าวกะเพราหมูกรอบ ไข่ดาว (Crispy Pork Holy Basil)',
      description: 'กะเพราหมูกรอบรสจัดจ้าน กรอบนอกนุ่มใน เสิร์ฟพร้อมไข่ดาวกรอบขอบกรอบ',
      price: 65,
      imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
      categoryId: catRice.id,
      isAvailable: true,
      isRecommended: true,
    },
    {
      name: 'ข้าวผัดต้มยำกุ้งสด (Tom Yum Fried Rice with Prawns)',
      description: 'ข้าวผัดซอสผัดต้มยำหอมเครื่องเทศ กุ้งแม่น้ำตัวใหญ่ หอมมะนาวสด',
      price: 85,
      imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80',
      categoryId: catRice.id,
      isAvailable: true,
      isRecommended: true,
    },
    {
      name: 'ข้าวมันไก่ตอน สูตรคุณแม่ (Hainanese Chicken Rice)',
      description: 'เนื้อไก่นุ่มฉ่ำ ข้าวมันหอมกระเทียมเสิร์ฟพร้อมน้ำจิ้มเต้าเจี้ยวกลมกล่อม',
      price: 60,
      imageUrl: 'https://images.unsplash.com/photo-1626804475297-41608e074eb1?w=600&auto=format&fit=crop&q=80',
      categoryId: catRice.id,
      isAvailable: true,
      isRecommended: false,
    },
    {
      name: 'ข้าวขาหมูคั่วพริกเกลือ (Crispy Stewed Pork Rice)',
      description: 'ขาหมูพะโล้นุ่มเปื่อยนำไปคั่วพริกเกลือกระเทียมแห้ง รสเด็ดเข้มข้น',
      price: 75,
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      categoryId: catRice.id,
      isAvailable: true,
      isRecommended: true,
    },
    {
      name: 'ผัดไทยกุ้งสด ห่อไข่ (Pad Thai with Fresh Shrimp)',
      description: 'เส้นจันทน์เหนียวนุ่ม ผัดซอสมะขามเปียกเข้มข้น ห่อด้วยไข่นุ่มๆ',
      price: 80,
      imageUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=600&auto=format&fit=crop&q=80',
      categoryId: catNoodle.id,
      isAvailable: true,
      isRecommended: true,
    },
    {
      name: 'ก๋วยเตี๋ยวเรือหมูน้ำตก เข้มข้น (Thai Boat Noodle)',
      description: 'น้ำซุปพะโล้เข้มข้นหอมกะทิสด ลูกชิ้นหมูแน่นๆ และหมูหมักนุ่ม',
      price: 55,
      imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80',
      categoryId: catNoodle.id,
      isAvailable: true,
      isRecommended: false,
    },
    {
      name: 'ชาไทยเย็น โบราณ (Traditional Thai Milk Tea)',
      description: 'ชาไทยตรามือเข้มข้น ใส่นมสดแท้ 100% หอมหวานกำลังดี',
      price: 35,
      imageUrl: 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=600&auto=format&fit=crop&q=80',
      categoryId: catDrink.id,
      isAvailable: true,
      isRecommended: true,
    },
    {
      name: 'น้ำมะนาวคั้นสด โซดา (Fresh Lime Soda)',
      description: 'มะนาวแป้นคั้นสดผสมโซดาซ่าส์ ดับกระหายสดชื่น',
      price: 40,
      imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
      categoryId: catDrink.id,
      isAvailable: true,
      isRecommended: false,
    },
    {
      name: 'บิงซูชาไทย เฉาก๊วย (Thai Tea Bingsu)',
      description: 'น้ำแข็งไสเกล็ดหิมะรสชาไทย โรยหน้าด้วยเฉาก๊วยหนึบและนมข้นหวาน',
      price: 89,
      imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&auto=format&fit=crop&q=80',
      categoryId: catDessert.id,
      isAvailable: true,
      isRecommended: true,
    },
    {
      name: 'ข้าวเหนียวมะม่วง อกฮ่องกง (Mango Sticky Rice)',
      description: 'มะม่วงน้ำดอกไม้สุกหวานฉ่ำ เสิร์ฟพร้อมข้าวเหนียวมูนกะทิหอมมัน',
      price: 95,
      imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600&auto=format&fit=crop&q=80',
      categoryId: catDessert.id,
      isAvailable: false, // Out of stock example
      isRecommended: false,
    },
  ];

  for (const item of menuItems) {
    await prisma.menuItem.create({ data: item });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
