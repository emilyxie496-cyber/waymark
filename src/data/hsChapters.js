// ---------- HS chapters (2-digit) ----------
// Chapter titles from the Harmonized System chapter list. Keywords are an
// illustrative lookup for a classification STARTING POINT — NOT a classification.
// Bare material words (e.g. "cotton", "leather") sit with the material chapters;
// finished articles sit with later chapters, which win ties (see utils/classify.js).

export const HS_CHAPTERS = [
  // Section 1 — Live animals; animal products
  { chapter: '01', label: 'Live animals', keywords: ['live animal', 'livestock', 'live cattle', 'live poultry', 'horse'] },
  { chapter: '02', label: 'Meat and edible meat offal', keywords: ['meat', 'beef', 'pork', 'chicken', 'lamb', 'poultry meat', 'bacon', 'ham'] },
  { chapter: '03', label: 'Fish and crustaceans, molluscs and other aquatic invertebrates', keywords: ['fish', 'seafood', 'shrimp', 'prawn', 'salmon', 'tuna', 'lobster', 'crab', 'mussel', 'oyster'] },
  { chapter: '04', label: "Dairy produce; birds' eggs; natural honey; edible products of animal origin, not elsewhere specified", keywords: ['dairy', 'milk', 'cheese', 'butter', 'yogurt', 'yoghurt', 'egg', 'honey', 'cream'] },
  { chapter: '05', label: 'Products of animal origin, not elsewhere specified or included', keywords: ['animal hair', 'bone', 'feather', 'animal product'] },

  // Section 2 — Vegetable products
  { chapter: '06', label: 'Live trees and other plants; bulbs, roots and the like; cut flowers and ornamental foliage', keywords: ['live plant', 'plant', 'flower', 'bulb', 'seedling', 'tree', 'bouquet'] },
  { chapter: '07', label: 'Edible vegetables and certain roots and tubers', keywords: ['vegetable', 'potato', 'onion', 'tomato', 'carrot', 'lettuce', 'garlic', 'bean', 'pea'] },
  { chapter: '08', label: 'Edible fruit and nuts; peel of citrus fruit or melons', keywords: ['fruit', 'nut', 'apple', 'banana', 'orange', 'grape', 'berry', 'berries', 'almond', 'cashew', 'citrus', 'mango', 'dried fruit'] },
  { chapter: '09', label: 'Coffee, tea, mate and spices', keywords: ['coffee', 'tea', 'spice', 'pepper', 'cinnamon', 'ginger', 'turmeric', 'mate'] },
  { chapter: '10', label: 'Cereals', keywords: ['cereal grain', 'rice', 'wheat', 'corn', 'maize', 'barley', 'oat'] },
  { chapter: '11', label: 'Products of the milling industry; malt; starches; inulin; wheat gluten', keywords: ['flour', 'malt', 'starch', 'gluten', 'semolina'] },
  { chapter: '12', label: 'Oil seeds and oleaginous fruits; miscellaneous grains, seeds and fruit; industrial or medicinal plants; straw and fodder', keywords: ['seed', 'soybean', 'soya', 'oilseed', 'sesame', 'hop', 'medicinal plant', 'fodder', 'hay'] },
  { chapter: '13', label: 'Lac; gums, resins and other vegetable saps and extracts', keywords: ['lac', 'gum arabic', 'natural resin', 'plant extract', 'vegetable sap', 'pectin'] },
  { chapter: '14', label: 'Vegetable plaiting materials; vegetable products not elsewhere specified or included', keywords: ['bamboo cane', 'rattan', 'plaiting material'] },

  // Section 3 — Fats and oils
  { chapter: '15', label: 'Animal, vegetable or microbial fats and oils and their cleavage products; prepared edible fats; animal or vegetable waxes', keywords: ['cooking oil', 'olive oil', 'vegetable oil', 'palm oil', 'margarine', 'lard', 'fat', 'beeswax'] },

  // Section 4 — Prepared foodstuffs; beverages; tobacco
  { chapter: '16', label: 'Preparations of meat, of fish, of crustaceans, molluscs or other aquatic invertebrates, or of insects', keywords: ['sausage', 'canned meat', 'canned fish', 'canned tuna', 'jerky', 'meat preparation'] },
  { chapter: '17', label: 'Sugars and sugar confectionery', keywords: ['sugar', 'candy', 'candies', 'confectionery', 'syrup', 'molasses', 'gum'] },
  { chapter: '18', label: 'Cocoa and cocoa preparations', keywords: ['cocoa', 'chocolate', 'cacao'] },
  { chapter: '19', label: "Preparations of cereals, flour, starch or milk; pastrycooks' products", keywords: ['pasta', 'noodle', 'bread', 'biscuit', 'cookie', 'cracker', 'cake', 'pastry', 'pastries', 'breakfast cereal', 'baby food'] },
  { chapter: '20', label: 'Preparations of vegetables, fruit, nuts or other parts of plants', keywords: ['jam', 'juice', 'pickle', 'canned vegetable', 'canned fruit', 'peanut butter', 'tomato paste'] },
  { chapter: '21', label: 'Miscellaneous edible preparations', keywords: ['sauce', 'soup', 'condiment', 'ketchup', 'mayonnaise', 'seasoning', 'yeast', 'protein powder', 'supplement'] },
  { chapter: '22', label: 'Beverages, spirits and vinegar', keywords: ['beverage', 'drink', 'water', 'soda', 'beer', 'wine', 'spirit', 'liquor', 'vodka', 'whisky', 'vinegar', 'kombucha'] },
  { chapter: '23', label: 'Residues and waste from the food industries; prepared animal fodder', keywords: ['pet food', 'dog food', 'cat food', 'animal feed', 'feed'] },
  { chapter: '24', label: 'Tobacco and manufactured tobacco substitutes; nicotine products intended for inhalation without combustion; other nicotine products', keywords: ['tobacco', 'cigarette', 'cigar', 'vape', 'e-cigarette', 'nicotine'] },

  // Section 5 — Mineral products
  { chapter: '25', label: 'Salt; sulphur; earths and stone; plastering materials, lime and cement', keywords: ['salt', 'sulphur', 'sulfur', 'cement', 'lime', 'sand', 'gravel', 'gypsum', 'clay'] },
  { chapter: '26', label: 'Ores, slag and ash', keywords: ['ore', 'slag', 'ash', 'iron ore', 'copper ore'] },
  { chapter: '27', label: 'Mineral fuels, mineral oils and products of their distillation; bituminous substances; mineral waxes', keywords: ['fuel', 'oil', 'petroleum', 'diesel', 'gasoline', 'coal', 'natural gas', 'propane', 'paraffin', 'bitumen', 'asphalt', 'kerosene', 'motor oil', 'engine oil'] },

  // Section 6 — Chemical or allied industries
  { chapter: '28', label: 'Inorganic chemicals; compounds of precious metals, rare earth metals, radioactive elements or isotopes', keywords: ['inorganic chemical', 'acid', 'hydrogen peroxide', 'sodium hydroxide', 'chlorine'] },
  { chapter: '29', label: 'Organic chemicals', keywords: ['organic chemical', 'alcohol', 'ethanol', 'methanol', 'solvent', 'acetone'] },
  { chapter: '30', label: 'Pharmaceutical products', keywords: ['pharmaceutical', 'medicine', 'medication', 'drug', 'vaccine', 'tablet', 'capsule', 'bandage', 'first aid'] },
  { chapter: '31', label: 'Fertilisers', keywords: ['fertiliser', 'fertilizer', 'compost'] },
  { chapter: '32', label: 'Tanning or dyeing extracts; dyes, pigments and other colouring matter; paints and varnishes; putty and other mastics; inks', keywords: ['paint', 'varnish', 'dye', 'pigment', 'ink', 'putty', 'stain', 'lacquer'] },
  { chapter: '33', label: 'Essential oils and resinoids; perfumery, cosmetic or toilet preparations', keywords: ['shampoo', 'cosmetic', 'lotion', 'makeup', 'skincare', 'perfume', 'essential oil', 'deodorant', 'toothpaste', 'conditioner', 'sunscreen', 'lipstick', 'moisturiser', 'moisturizer', 'face cream', 'hand cream'] },
  { chapter: '34', label: 'Soap, washing and lubricating preparations, artificial and prepared waxes, polishing preparations, candles, modelling pastes, dental waxes', keywords: ['soap', 'detergent', 'cleaner', 'cleaning product', 'lubricant', 'candle', 'wax', 'polish', 'modelling clay', 'play dough'] },
  { chapter: '35', label: 'Albuminoidal substances; modified starches; glues; enzymes', keywords: ['glue', 'adhesive', 'enzyme', 'gelatin', 'casein'] },
  { chapter: '36', label: 'Explosives; pyrotechnic products; matches; pyrophoric alloys; certain combustible preparations', keywords: ['explosive', 'firework', 'match', 'matches', 'lighter fluid', 'fire starter'] },
  { chapter: '37', label: 'Photographic or cinematographic goods', keywords: ['photographic film', 'camera film', 'photo paper', 'x-ray film'] },
  { chapter: '38', label: 'Miscellaneous chemical products', keywords: ['chemical', 'pesticide', 'insecticide', 'herbicide', 'disinfectant', 'antifreeze', 'biodiesel'] },

  // Section 7 — Plastics; rubber
  { chapter: '39', label: 'Plastics and articles thereof', keywords: ['plastic', 'container', 'bottle', 'bag', 'pvc', 'polyethylene', 'acrylic', 'vinyl', 'resin', 'storage box', 'food wrap'] },
  { chapter: '40', label: 'Rubber and articles thereof', keywords: ['rubber', 'tire', 'tyre', 'latex', 'gasket', 'hose', 'glove'] },

  // Section 8 — Hides, leather, travel goods
  { chapter: '41', label: 'Raw hides and skins (other than furskins) and leather', keywords: ['leather', 'hide', 'rawhide', 'animal skin'] },
  { chapter: '42', label: 'Articles of leather; saddlery and harness; travel goods, handbags and similar containers', keywords: ['handbag', 'purse', 'wallet', 'luggage', 'suitcase', 'backpack', 'briefcase', 'belt', 'saddle', 'harness', 'travel bag', 'leather bag', 'tote'] },
  { chapter: '43', label: 'Furskins and artificial fur; manufactures thereof', keywords: ['fur', 'faux fur', 'furskin'] },

  // Section 9 — Wood, cork, basketware
  { chapter: '44', label: 'Wood and articles of wood; wood charcoal', keywords: ['wood', 'wooden', 'lumber', 'timber', 'plywood', 'charcoal', 'pallet', 'cutting board', 'mdf'] },
  { chapter: '45', label: 'Cork and articles of cork', keywords: ['cork'] },
  { chapter: '46', label: 'Manufactures of straw, of esparto or of other plaiting materials; basketware and wickerwork', keywords: ['basket', 'wicker', 'straw', 'woven basket'] },

  // Section 10 — Pulp, paper
  { chapter: '47', label: 'Pulp of wood or other fibrous cellulosic material; recovered paper or paperboard', keywords: ['pulp', 'wood pulp', 'scrap paper', 'waste paper'] },
  { chapter: '48', label: 'Paper and paperboard; articles of paper pulp, of paper or of paperboard', keywords: ['paper', 'paperboard', 'cardboard', 'carton', 'tissue', 'napkin', 'notebook', 'envelope', 'packaging box', 'toilet paper'] },
  { chapter: '49', label: 'Printed books, newspapers, pictures and other products of the printing industry; manuscripts, typescripts and plans', keywords: ['book', 'newspaper', 'magazine', 'printed', 'poster', 'calendar', 'brochure', 'map', 'greeting card'] },

  // Section 11 — Textiles
  { chapter: '50', label: 'Silk', keywords: ['silk', 'silk fabric', 'silk yarn'] },
  { chapter: '51', label: 'Wool, fine or coarse animal hair; horsehair yarn and woven fabric', keywords: ['wool', 'cashmere', 'merino', 'wool yarn'] },
  { chapter: '52', label: 'Cotton', keywords: ['cotton', 'cotton yarn', 'cotton fabric', 'denim fabric'] },
  { chapter: '53', label: 'Other vegetable textile fibres; paper yarn and woven fabrics of paper yarn', keywords: ['linen', 'flax', 'jute', 'hemp', 'ramie'] },
  { chapter: '54', label: 'Man-made filaments; strip and the like of man-made textile materials', keywords: ['polyester', 'nylon', 'filament yarn', 'synthetic fabric'] },
  { chapter: '55', label: 'Man-made staple fibres', keywords: ['staple fibre', 'staple fiber', 'viscose', 'rayon', 'acrylic fibre'] },
  { chapter: '56', label: 'Wadding, felt and nonwovens; special yarns; twine, cordage, ropes and cables', keywords: ['felt', 'nonwoven', 'rope', 'twine', 'cord', 'netting', 'wadding'] },
  { chapter: '57', label: 'Carpets and other textile floor coverings', keywords: ['carpet', 'rug', 'floor mat', 'doormat'] },
  { chapter: '58', label: 'Special woven fabrics; tufted textile fabrics; lace; tapestries; trimmings; embroidery', keywords: ['lace', 'embroidery', 'tapestry', 'tapestries', 'ribbon', 'velvet', 'trim'] },
  { chapter: '59', label: 'Impregnated, coated, covered or laminated textile fabrics; textile articles for industrial use', keywords: ['coated fabric', 'laminated fabric', 'canvas', 'conveyor belt', 'industrial textile'] },
  { chapter: '60', label: 'Knitted or crocheted fabrics', keywords: ['knitted fabric', 'jersey fabric', 'fleece fabric'] },
  { chapter: '61', label: 'Articles of apparel and clothing accessories, knitted or crocheted', keywords: ['shirt', 't-shirt', 'tee', 'sweater', 'hoodie', 'knit', 'knitted', 'sweatshirt', 'leggings', 'socks', 'underwear', 'jumper', 'cardigan', 'polo'] },
  { chapter: '62', label: 'Articles of apparel and clothing accessories, not knitted or crocheted', keywords: ['jacket', 'coat', 'dress', 'trousers', 'pants', 'jeans', 'woven', 'apparel', 'clothing', 'blouse', 'skirt', 'suit', 'scarf', 'scarves', 'tie'] },
  { chapter: '63', label: 'Other made up textile articles; sets; worn clothing and worn textile articles; rags', keywords: ['towel', 'bedsheet', 'bed sheet', 'bedding', 'blanket', 'curtain', 'tablecloth', 'pillowcase', 'duvet cover', 'tent', 'tarp', 'tarpaulin', 'sack', 'used clothing'] },

  // Section 12 — Footwear, headgear, umbrellas
  { chapter: '64', label: 'Footwear, gaiters and the like; parts of such articles', keywords: ['shoe', 'footwear', 'boot', 'sneaker', 'sandal', 'slipper', 'heel', 'insole'] },
  { chapter: '65', label: 'Headgear and parts thereof', keywords: ['hat', 'cap', 'helmet', 'beanie', 'headwear', 'headgear'] },
  { chapter: '66', label: 'Umbrellas, sun umbrellas, walking-sticks, seat-sticks, whips, riding-crops and parts thereof', keywords: ['umbrella', 'parasol', 'walking stick', 'cane', 'whip'] },
  { chapter: '67', label: 'Prepared feathers and down and articles thereof; artificial flowers; articles of human hair', keywords: ['artificial flower', 'fake flower', 'wig', 'hair extension', 'down feather'] },

  // Section 13 — Stone, ceramics, glass
  { chapter: '68', label: 'Articles of stone, plaster, cement, asbestos, mica or similar materials', keywords: ['stone', 'marble', 'granite', 'concrete', 'plaster', 'countertop', 'abrasive', 'sandpaper'] },
  { chapter: '69', label: 'Ceramic products', keywords: ['ceramic', 'porcelain', 'mug', 'tile', 'stoneware', 'earthenware', 'brick', 'toilet', 'sink'] },
  { chapter: '70', label: 'Glass and glassware', keywords: ['glass', 'glassware', 'mirror', 'jar', 'wine glass', 'fibreglass', 'fiberglass'] },

  // Section 14 — Precious metals, jewellery
  { chapter: '71', label: 'Natural or cultured pearls, precious or semi-precious stones, precious metals and articles thereof; imitation jewellery; coin', keywords: ['jewellery', 'jewelry', 'necklace', 'ring', 'bracelet', 'earring', 'gold', 'silver', 'diamond', 'pearl', 'gemstone', 'coin'] },

  // Section 15 — Base metals
  { chapter: '72', label: 'Iron and steel', keywords: ['steel coil', 'steel sheet', 'steel bar', 'steel plate', 'pig iron', 'ingot', 'iron'] },
  { chapter: '73', label: 'Articles of iron or steel', keywords: ['cookware', 'pot', 'pan', 'skillet', 'frying pan', 'utensil', 'stainless', 'steel', 'kitchen', 'screw', 'bolt', 'nail', 'nut and bolt', 'pipe', 'wire', 'chain', 'spring', 'radiator'] },
  { chapter: '74', label: 'Copper and articles thereof', keywords: ['copper', 'brass', 'bronze'] },
  { chapter: '75', label: 'Nickel and articles thereof', keywords: ['nickel'] },
  { chapter: '76', label: 'Aluminium and articles thereof', keywords: ['aluminium', 'aluminum', 'foil', 'tin foil'] },
  { chapter: '77', label: '(Reserved for possible future use in the Harmonized System)', keywords: [] },
  { chapter: '78', label: 'Lead and articles thereof', keywords: ['lead pipe', 'lead sheet'] },
  { chapter: '79', label: 'Zinc and articles thereof', keywords: ['zinc'] },
  { chapter: '80', label: 'Tin and articles thereof', keywords: ['tin', 'pewter'] },
  { chapter: '81', label: 'Other base metals; cermets; articles thereof', keywords: ['titanium', 'tungsten', 'magnesium', 'cobalt', 'molybdenum'] },
  { chapter: '82', label: 'Tools, implements, cutlery, spoons and forks, of base metal; parts thereof', keywords: ['tool', 'hand tool', 'cutlery', 'knife', 'knives', 'spoon', 'fork', 'scissors', 'hammer', 'wrench', 'screwdriver', 'pliers', 'saw', 'drill bit'] },
  { chapter: '83', label: 'Miscellaneous articles of base metal', keywords: ['lock', 'padlock', 'hinge', 'key', 'buckle', 'hook', 'bracket', 'metal sign'] },

  // Section 16 — Machinery and electrical equipment
  { chapter: '84', label: 'Nuclear reactors, boilers, machinery and mechanical appliances; parts thereof', keywords: ['pump', 'valve', 'bearing', 'machine', 'machinery', 'engine', 'compressor', 'gear', 'computer', 'laptop', 'printer', 'dishwasher', 'washing machine', 'refrigerator', 'fridge', 'air conditioner', 'boiler', 'turbine', 'coffee maker', 'tablet computer'] },
  { chapter: '85', label: 'Electrical machinery and equipment and parts thereof; sound and television recorders and reproducers, and parts and accessories', keywords: ['cable', 'charger', 'battery', 'batteries', 'led', 'circuit', 'electronic', 'electronics', 'speaker', 'adapter', 'motor', 'phone', 'smartphone', 'headphone', 'earbud', 'television', 'tv', 'camera', 'microwave', 'kettle', 'toaster', 'hair dryer', 'blender', 'solar panel', 'transformer', 'semiconductor'] },

  // Section 17 — Vehicles, aircraft, vessels
  { chapter: '86', label: 'Railway or tramway locomotives, rolling-stock, track fixtures and fittings; mechanical traffic signalling equipment', keywords: ['railway', 'locomotive', 'rail car', 'tram', 'shipping container'] },
  { chapter: '87', label: 'Vehicles other than railway or tramway rolling-stock, and parts and accessories thereof', keywords: ['car', 'vehicle', 'truck', 'auto part', 'car part', 'bicycle', 'bike', 'e-bike', 'motorcycle', 'scooter', 'trailer', 'stroller', 'wheelchair', 'tractor'] },
  { chapter: '88', label: 'Aircraft, spacecraft, and parts thereof', keywords: ['aircraft', 'airplane', 'drone', 'helicopter', 'spacecraft', 'satellite'] },
  { chapter: '89', label: 'Ships, boats and floating structures', keywords: ['ship', 'boat', 'yacht', 'kayak', 'canoe', 'vessel'] },

  // Section 18 — Instruments, clocks, musical instruments
  { chapter: '90', label: 'Optical, photographic, cinematographic, measuring, checking, precision, medical or surgical instruments and apparatus; parts and accessories', keywords: ['optical', 'lens', 'eyeglasses', 'glasses', 'sunglasses', 'contact lens', 'microscope', 'medical device', 'surgical', 'thermometer', 'sensor', 'gauge', 'measuring instrument', 'stethoscope', 'syringe'] },
  { chapter: '91', label: 'Clocks and watches and parts thereof', keywords: ['clock', 'watch', 'wristwatch', 'smartwatch'] },
  { chapter: '92', label: 'Musical instruments; parts and accessories of such articles', keywords: ['musical instrument', 'guitar', 'piano', 'violin', 'drum', 'flute', 'keyboard instrument'] },

  // Section 19 — Arms and ammunition
  { chapter: '93', label: 'Arms and ammunition; parts and accessories thereof', keywords: ['firearm', 'gun', 'rifle', 'ammunition', 'ammo'] },

  // Section 20 — Miscellaneous manufactured articles
  { chapter: '94', label: 'Furniture; bedding, mattresses, cushions and similar stuffed furnishings; luminaires and lighting fittings; illuminated signs; prefabricated buildings', keywords: ['furniture', 'chair', 'sofa', 'couch', 'desk', 'table', 'mattress', 'shelf', 'shelves', 'cabinet', 'bed frame', 'cushion', 'pillow', 'lamp', 'light fixture', 'lighting', 'chandelier', 'prefabricated'] },
  { chapter: '95', label: 'Toys, games and sports requisites; parts and accessories thereof', keywords: ['toy', 'game', 'puzzle', 'doll', 'board game', 'video game console', 'sports equipment', 'ball', 'fitness equipment', 'gym equipment', 'yoga mat', 'fishing rod', 'golf', 'christmas decoration'] },
  { chapter: '96', label: 'Miscellaneous manufactured articles', keywords: ['pen', 'pencil', 'marker', 'crayon', 'brush', 'toothbrush', 'comb', 'button', 'zipper', 'diaper', 'sanitary pad', 'lighter', 'vacuum flask'] },

  // Section 21 — Works of art; special provisions
  { chapter: '97', label: "Works of art, collectors' pieces and antiques", keywords: ['artwork', 'painting', 'sculpture', 'antique', 'collectible', 'stamp collection'] },
  { chapter: '98', label: 'Commodities special provisions', keywords: [] },
]
