const ExcelJS = require('exceljs');
const fs = require('fs');

async function convert() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Products');
  
  // Correct order: sku, name, category, brand, price, mrp, stock, description, mainImage, image2, image3, active
  const content = `sku,name,category,brand,price,mrp,stock,description,mainImage,image2,image3,active
IP15-PRO-CASE-01,iPhone 15 Pro Leather Case - Midnight,Protective Cases,Apple,499900,599900,50,Premium leather case for iPhone 15 Pro,iphone15_case_main.jpg,,,true
SAM-S24U-CASE-01,Galaxy S24 Ultra Silicone Cover,Protective Cases,Samsung,349900,399900,75,Soft silicone cover for Galaxy S24 Ultra,s24_cover.jpg,,,true
ANK-NANO-30W,Anker Nano 30W Fast Charger,Fast Chargers,Anker,199900,249900,120,Compact 30W USB-C charger,anker_nano.jpg,,,true
APP-MAG-CHG,Apple MagSafe Charger,Fast Chargers,Apple,390000,450000,45,Official MagSafe charger for iPhone,magsafe_main.jpg,,,true
SONY-WF1000XM5,Sony WF-1000XM5 Earbuds,Premium Audio,Sony,2499000,2999000,20,Noise cancelling wireless earbuds,sony_xm5_1.jpg,sony_xm5_2.jpg,,true
SPI-IP15-GLASS,Spigen Glas.tR EZ Fit iPhone 15,Protective Cases,Spigen,149900,199900,150,Tempered glass screen protector,spigen_glass.jpg,,,true
ANK-PB-10K,Anker PowerCore 10000mAh,Power Banks,Anker,299900,349900,85,Slim 10000mAh power bank,anker_pb.jpg,,,true
SAM-BUDS2-PRO,Galaxy Buds2 Pro,Premium Audio,Samsung,1499900,1799900,30,True wireless earbuds with ANC,buds2_pro.jpg,,,true
APP-AIRPODS-PRO2,AirPods Pro (2nd Gen),Premium Audio,Apple,2490000,2490000,60,AirPods Pro with USB-C,airpods_pro.jpg,,,true
SPI-S24-ARMOR,Spigen Tough Armor Galaxy S24,Protective Cases,Spigen,249900,299900,40,Heavy duty protection for S24,spigen_armor.jpg,,,true
ANK-CABLE-C2C,Anker 100W USB-C to USB-C Cable,Fast Chargers,Anker,99900,129900,200,Braided 100W charging cable,anker_cable.jpg,,,true
SAM-45W-CHG,Samsung 45W Power Adapter,Fast Chargers,Samsung,299900,349900,90,Super Fast Charging 2.0 adapter,sam_45w.jpg,,,true
APP-FINEWOV-WALLET,FineWoven Wallet with MagSafe,Protective Cases,Apple,590000,590000,25,Magnetic wallet for iPhone,wallet.jpg,,,true
SONY-WH1000XM5,Sony WH-1000XM5 Headphones,Premium Audio,Sony,3499000,3499000,15,Over-ear noise cancelling headphones,wh_xm5.jpg,,,true
SPI-IP14-ULTRA,Spigen Ultra Hybrid iPhone 14,Protective Cases,Spigen,129900,179900,100,Clear case with drop protection,ultra_hybrid.jpg,,,true
ANK-PB-24K,Anker 737 Power Bank 24K,Power Banks,Anker,1299900,1499900,10,140W fast charging power bank,anker_737.jpg,,,true
SAM-TAG2,Galaxy SmartTag2,Accessories,Samsung,249900,299900,110,Bluetooth tracker,smarttag2.jpg,,,true
APP-WATCH-BAND,Apple Watch Sport Band,Accessories,Apple,450000,450000,55,Fluoroelastomer sport band,sport_band.jpg,,,true
SONY-LINKBUDS,Sony LinkBuds S,Premium Audio,Sony,1299000,1699000,35,Comfortable noise cancelling earbuds,linkbuds.jpg,,,true
ANK-MAG-BATT,Anker 622 Magnetic Battery,Power Banks,Anker,499900,599900,65,MagSafe compatible power bank,mag_batt.jpg,,,true`;

  const lines = content.split('\n');
  
  lines.forEach(line => {
    if (line.trim() !== '') {
      sheet.addRow(line.split(','));
    }
  });

  await workbook.xlsx.writeFile('sample-import-20.xlsx');
  
  // Also write the correct CSV format for consistency
  fs.writeFileSync('sample-import-20.csv', content);
  
  console.log("Files updated with correct column order");
}

convert();
