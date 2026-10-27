/* eslint @typescript-eslint/no-require-imports: "off" */
const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");

const statesAndCities = {
  "Andhra Pradesh": ["Amaravati", "Visakhapatnam", "Vijayawada", "Tirupati", "Guntur", "Nellore", "Kurnool", "Rajahmundry"],
  "Arunachal Pradesh": ["Itanagar", "Tawang", "Ziro", "Pasighat", "Bomdila", "Along"],
  Assam: ["Dispur", "Guwahati", "Dibrugarh", "Jorhat", "Tezpur", "Silchar", "Kaziranga"],
  Bihar: ["Patna", "Gaya", "Bodh Gaya", "Muzaffarpur", "Bhagalpur", "Darbhanga"],
  Chhattisgarh: ["Raipur", "Bilaspur", "Jagdalpur", "Durg", "Bhilai", "Ambikapur"],
  Goa: ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Calangute", "Canacona"],
  Gujarat: ["Gandhinagar", "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Dwarka", "Somnath", "Bhuj", "Junagadh"],
  Haryana: ["Chandigarh", "Gurugram", "Faridabad", "Panipat", "Karnal", "Hisar", "Kurukshetra"],
  "Himachal Pradesh": ["Shimla", "Manali", "Dharamshala", "Kullu", "Dalhousie", "Chamba", "Kasauli", "Spiti"],
  Jharkhand: ["Ranchi", "Jamshedpur", "Dhanbad", "Deoghar", "Hazaribagh", "Bokaro"],
  Karnataka: ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi", "Hampi", "Coorg", "Gokarna", "Belagavi", "Shivamogga"],
  Kerala: ["Thiruvananthapuram", "Kochi", "Kozhikode", "Alappuzha", "Munnar", "Kollam", "Thrissur", "Wayanad", "Kumarakom"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain", "Khajuraho", "Sanchi", "Orchha"],
  Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik", "Chhatrapati Sambhajinagar", "Kolhapur", "Shirdi", "Mahabaleshwar", "Lonavala"],
  Manipur: ["Imphal", "Bishnupur", "Ukhrul", "Churachandpur"],
  Meghalaya: ["Shillong", "Cherrapunji", "Mawlynnong", "Tura", "Jowai"],
  Mizoram: ["Aizawl", "Lunglei", "Champhai", "Serchhip"],
  Nagaland: ["Kohima", "Dimapur", "Mokokchung", "Mon", "Tuensang"],
  Odisha: ["Bhubaneswar", "Puri", "Cuttack", "Konark", "Sambalpur", "Rourkela", "Brahmapur"],
  Punjab: ["Chandigarh", "Amritsar", "Ludhiana", "Jalandhar", "Patiala", "Bathinda", "Pathankot"],
  Rajasthan: ["Jaipur", "Udaipur", "Jodhpur", "Jaisalmer", "Pushkar", "Bikaner", "Ajmer", "Mount Abu", "Kota"],
  Sikkim: ["Gangtok", "Pelling", "Namchi", "Lachung", "Ravangla", "Geyzing"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Ooty", "Kodaikanal", "Rameswaram", "Thanjavur", "Tiruchirappalli", "Kanyakumari"],
  Telangana: ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Ramagundam"],
  Tripura: ["Agartala", "Udaipur", "Dharmanagar", "Kailashahar"],
  "Uttar Pradesh": ["Lucknow", "Agra", "Varanasi", "Prayagraj", "Ayodhya", "Kanpur", "Mathura", "Noida", "Jhansi", "Meerut"],
  Uttarakhand: ["Dehradun", "Haridwar", "Rishikesh", "Nainital", "Mussoorie", "Almora", "Chamoli", "Roorkee", "Jim Corbett"],
  "West Bengal": ["Kolkata", "Darjeeling", "Siliguri", "Durgapur", "Howrah", "Kalimpong", "Sundarbans"],
  "Andaman and Nicobar Islands": ["Port Blair", "Havelock Island", "Neil Island", "Diglipur"],
  Chandigarh: ["Chandigarh"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Daman", "Diu", "Silvassa"],
  Delhi: ["New Delhi", "Delhi"],
  "Jammu and Kashmir": ["Srinagar", "Jammu", "Gulmarg", "Pahalgam", "Sonamarg", "Katra"],
  Ladakh: ["Leh", "Kargil", "Nubra Valley", "Pangong"],
  Lakshadweep: ["Kavaratti", "Agatti", "Minicoy", "Bangaram"],
  Puducherry: ["Puducherry", "Karaikal", "Mahe", "Yanam"],
};

const additionalCitiesByState = {
  "Andhra Pradesh": ["Anakapalle", "Anantapur", "Bapatla", "Chittoor", "Eluru", "Hindupur", "Kadapa", "Kakinada", "Machilipatnam", "Madanapalle", "Markapur", "Nandyal", "Ongole", "Pithapuram", "Proddatur", "Srikakulam", "Tenali", "Vijayanagaram", "Yemmiganur"],
  "Arunachal Pradesh": ["Anini", "Basar", "Changlang", "Daporijo", "Khonsa", "Koloriang", "Namsai", "Roing", "Seppa", "Tezu", "Yingkiong"],
  Assam: ["Amingaon", "Barpeta", "Bongaigaon", "Dhubri", "Diphu", "Goalpara", "Golaghat", "Haflong", "Hailakandi", "Kokrajhar", "Lanka", "Mangaldoi", "Margherita", "Nagaon", "Nalbari", "North Lakhimpur", "Sivasagar", "Tinsukia"],
  Bihar: ["Arrah", "Aurangabad", "Banka", "Begusarai", "Bettiah", "Buxar", "Chapra", "Danapur", "Dehri", "Forbesganj", "Hajipur", "Jamui", "Jehanabad", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhubani", "Motihari", "Munger", "Purnia", "Saharsa", "Samastipur", "Sitamarhi", "Siwan"],
  Chhattisgarh: ["Balod", "Baloda Bazar", "Bemetara", "Dhamtari", "Dongargarh", "Kanker", "Kawardha", "Kondagaon", "Korba", "Mahasamund", "Manendragarh", "Mungeli", "Narayanpur", "Rajnandgaon", "Sukma", "Surajpur"],
  Goa: ["Bicholim", "Canacona", "Cuncolim", "Curchorem", "Pernem", "Ponda", "Quepem", "Sanquelim", "Valpoi"],
  Gujarat: ["Amreli", "Anand", "Bardoli", "Bharuch", "Bhavnagar", "Botad", "Dahod", "Gandhidham", "Godhra", "Himmatnagar", "Jamnagar", "Mehsana", "Morbi", "Nadiad", "Navsari", "Palanpur", "Porbandar", "Surendranagar", "Veraval", "Vapi", "Valsad"],
  Haryana: ["Ambala", "Bahadurgarh", "Bhiwani", "Charkhi Dadri", "Fatehabad", "Gohana", "Jind", "Kaithal", "Narnaul", "Palwal", "Panchkula", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"],
  "Himachal Pradesh": ["Baijnath", "Bilaspur", "Hamirpur", "Keylong", "Mandi", "Nadaun", "Palampur", "Paonta Sahib", "Parwanoo", "Rohru", "Sarkaghat", "Sundernagar", "Theog"],
  Jharkhand: ["Adityapur", "Chatra", "Chaibasa", "Chirkunda", "Daltonganj", "Dumka", "Giridih", "Gumla", "Jhumri Telaiya", "Khunti", "Lohardaga", "Medininagar", "Phusro", "Ramgarh", "Sahibganj", "Simdega"],
  Karnataka: ["Bagalkot", "Ballari", "Bidar", "Chamarajanagar", "Chikkamagaluru", "Chitradurga", "Davanagere", "Hassan", "Haveri", "Kalaburagi", "Kolar", "Madikeri", "Mandya", "Raichur", "Ramanagara", "Udupi", "Vijayapura", "Yadgir"],
  Kerala: ["Angamaly", "Changanassery", "Kannur", "Kasaragod", "Kattappana", "Kochi", "Kottayam", "Mananthavady", "Muvattupuzha", "Nedumangad", "Neyyattinkara", "Palakkad", "Pathanamthitta", "Payyanur", "Perinthalmanna", "Ponnani", "Sulthan Bathery", "Thalassery", "Tirur"],
  "Madhya Pradesh": ["Balaghat", "Betul", "Burhanpur", "Chhindwara", "Dewas", "Dhar", "Guna", "Hoshangabad", "Itarsi", "Khandwa", "Khargone", "Mandla", "Mandsaur", "Morena", "Neemuch", "Pachmarhi", "Panna", "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", "Shivpuri", "Singrauli", "Vidisha"],
  Maharashtra: ["Ahmednagar", "Akola", "Amravati", "Baramati", "Beed", "Bhiwandi", "Chandrapur", "Dhule", "Gondia", "Ichalkaranji", "Jalgaon", "Latur", "Malegaon", "Miraj", "Nanded", "Nandurbar", "Osmanabad", "Palghar", "Panvel", "Parbhani", "Ratnagiri", "Sangli", "Satara", "Solapur", "Thane", "Vasai-Virar", "Wardha", "Yavatmal"],
  Manipur: ["Chandel", "Churachandpur", "Jiribam", "Kakching", "Kamjong", "Moreh", "Senapati", "Tamenglong", "Thoubal"],
  Meghalaya: ["Baghmara", "Jowai", "Mairang", "Mawkyrwat", "Nongpoh", "Nongstoin", "Resubelpara", "Williamnagar"],
  Mizoram: ["Bairabi", "Biate", "Hnahthial", "Khawzawl", "Kolasib", "Lawngtlai", "Mamit", "Saitual", "Thenzawl"],
  Nagaland: ["Changtongya", "Chumukedima", "Kiphire", "Longleng", "Meluri", "Noklak", "Peren", "Pfutsero", "Phek", "Wokha", "Zunheboto"],
  Odisha: ["Angul", "Balangir", "Balasore", "Baripada", "Bhadrak", "Bhawanipatna", "Dhenkanal", "Jajpur", "Jharsuguda", "Kendrapara", "Keonjhar", "Paradip", "Phulbani", "Rayagada", "Titlagarh"],
  Punjab: ["Abohar", "Barnala", "Batala", "Firozpur", "Gobindgarh", "Hoshiarpur", "Kapurthala", "Khanna", "Malerkotla", "Moga", "Mohali", "Muktsar", "Nabha", "Rajpura", "Rupnagar", "Sangrur", "Tarn Taran"],
  Rajasthan: ["Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara", "Bundi", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Dungarpur", "Hanumangarh", "Jhalawar", "Jhunjhunu", "Karauli", "Nagaur", "Pali", "Sawai Madhopur", "Sikar", "Sirohi", "Sri Ganganagar", "Tonk"],
  Sikkim: ["Gyalshing", "Mangan", "Pakyong", "Rangpo", "Singtam", "Soreng"],
  "Tamil Nadu": ["Ariyalur", "Chengalpattu", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Hosur", "Kanchipuram", "Karur", "Krishnagiri", "Nagapattinam", "Nagercoil", "Namakkal", "Perambalur", "Pollachi", "Rajapalayam", "Salem", "Sivakasi", "Tenkasi", "Theni", "Thoothukudi", "Tirunelveli", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Vellore", "Villupuram", "Virudhunagar"],
  Telangana: ["Adilabad", "Badangpet", "Bhongir", "Bodhan", "Gadwal", "Jagtial", "Kamareddy", "Kothagudem", "Mahabubabad", "Mahbubnagar", "Mancherial", "Medak", "Sangareddy", "Siddipet", "Suryapet"],
  Tripura: ["Ambassa", "Belonia", "Bishalgarh", "Khowai", "Kumarghat", "Sabroom", "Sonamura", "Teliamura"],
  "Uttar Pradesh": ["Aligarh", "Amroha", "Azamgarh", "Badaun", "Bahraich", "Ballia", "Barabanki", "Basti", "Bijnor", "Bulandshahr", "Deoria", "Etawah", "Faizabad", "Farrukhabad", "Fatehpur", "Firozabad", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hapur", "Hardoi", "Hathras", "Jaunpur", "Kannauj", "Kasganj", "Lakhimpur", "Lalitpur", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", "Rampur", "Saharanpur", "Sambhal", "Shahjahanpur", "Sitapur", "Sultanpur", "Unnao"],
  Uttarakhand: ["Bageshwar", "Barkot", "Bhimtal", "Champawat", "Haldwani", "Joshimath", "Kashipur", "Khatima", "Kotdwar", "Lansdowne", "Munsiyari", "Pauri", "Pithoragarh", "Ramnagar", "Ranikhet", "Rudraprayag", "Rudrapur", "Tehri", "Uttarkashi"],
  "West Bengal": ["Asansol", "Baharampur", "Balurghat", "Bankura", "Bardhaman", "Basirhat", "Chandannagar", "Cooch Behar", "Contai", "Diamond Harbour", "English Bazar", "Haldia", "Jalpaiguri", "Kharagpur", "Krishnanagar", "Malda", "Midnapore", "Purulia", "Ranaghat", "Raiganj", "Suri"],
  "Andaman and Nicobar Islands": ["Bamboo Flat", "Car Nicobar", "Diglipur", "Mayabunder", "Rangat"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Dadra", "Diu", "Dudhani", "Silvassa"],
  Delhi: ["Dwarka", "Karol Bagh", "Mehrauli", "Rohini", "Saket", "Shahdara"],
  "Jammu and Kashmir": ["Anantnag", "Baramulla", "Doda", "Ganderbal", "Kathua", "Kupwara", "Poonch", "Pulwama", "Rajouri", "Samba", "Udhampur"],
  Ladakh: ["Drass", "Diskit", "Khaltse", "Nyoma", "Padum", "Tangtse"],
  Lakshadweep: ["Andrott", "Amini", "Kadmat", "Kalpeni", "Kiltan"],
  Puducherry: ["Ariyankuppam", "Bahour", "Villianur"],
};

function readEnvValue(name, envContent) {
  const match = envContent.match(new RegExp(`^\\s*${name}\\s*=\\s*(.*)\\s*$`, "m"));
  if (!match) return undefined;
  const value = match[1].trim();
  return value.replace(/^(['"])(.*)\1$/, "$2");
}

async function seedIndiaLocations() {
  const envPath = path.join(__dirname, "..", ".env.local");
  const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
  const uri = process.env.MONGODB_URI || readEnvValue("MONGODB_URI", envContent);
  const databaseName =
    process.env.MONGODB_DB ||
    readEnvValue("MONGODB_DB", envContent) ||
    "travelexpertz";

  if (!uri) {
    throw new Error("MONGODB_URI is not set in the environment or .env.local.");
  }

  const allCitiesByState = Object.fromEntries(
    Object.entries(statesAndCities).map(([stateName, cities]) => [
      stateName,
      [...new Set([...cities, ...(additionalCitiesByState[stateName] || [])])],
    ]),
  );
  const records = Object.entries(allCitiesByState).flatMap(([stateName, cities]) => [
    { stateName, cityName: "" },
    ...cities.map((cityName) => ({ stateName, cityName })),
  ]);
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const collection = client.db(databaseName).collection("hotel_destination_states");
    const result = await collection.bulkWrite(
      records.map(({ stateName, cityName }) => ({
        updateOne: {
          filter: { stateName, cityName },
          update: { $setOnInsert: { stateName, cityName, createdAt: new Date() } },
          upsert: true,
        },
      })),
      { ordered: false },
    );

    console.log(
      `Seeded ${Object.keys(allCitiesByState).length} states/UTs and ${records.length - Object.keys(allCitiesByState).length} cities into ${databaseName}.`,
    );
    console.log(
      `Added ${result.upsertedCount} records; existing matching records were left unchanged.`,
    );
  } finally {
    await client.close();
  }
}

seedIndiaLocations().catch((error) => {
  console.error("Failed to seed India locations:", error);
  process.exitCode = 1;
});
