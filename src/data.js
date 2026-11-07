export const TRIP = { start: "2026-11-12", end: "2026-11-18" };
export const WD = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export const SCENES = {
  forrest: { film: "Forrest Gump", year: 1994, where: "Santa Monica Pier", day: 1, text: "A corrida de Forrest atravessa o país e termina aqui, de frente para o Pacífico." },
  venice: { film: "Homens Brancos Não Sabem Enterrar", year: 1992, where: "Venice Beach", day: 1, text: "As quadras de basquete da orla de Venice são o palco de Wesley Snipes e Woody Harrelson." },
  pretty: { film: "Uma Linda Mulher", year: 1990, where: "Rodeo Drive", day: 1, text: "\"Grande erro. Enorme.\" A volta de Vivian às lojas que a esnobaram foi filmada nesta rua." },
  urban: { film: "Urban Light", year: 2008, where: "LACMA", day: 1, text: "Chris Burden reuniu 202 postes antigos de Los Angeles. Eles acendem ao anoitecer." },
  cheesecake: { film: "The Big Bang Theory", year: 2007, where: "Cheesecake Factory", day: 1, text: "O restaurante onde a Penny trabalha nas primeiras temporadas." },
  sign: { film: "Hollywoodland", year: 1923, where: "Hollywood Sign", day: 2, text: "O letreiro nasceu como propaganda de um loteamento. As quatro últimas letras caíram em 1949." },
  bbt: { film: "Big Bang e Friends", year: 2007, where: "Warner Bros.", day: 3, text: "O Stage 48 guarda sets originais de The Big Bang Theory. No mesmo tour fica o sofá do Central Perk." },
  lalaland: { film: "La La Land", year: 2016, where: "Griffith Observatory", day: 3, text: "Mia e Sebastian dançam no planetário. Em 1955, James Dean filmou aqui Juventude Transviada." },
  bobs: { film: "Os Beatles", year: 1965, where: "Bob's Big Boy", day: 3, text: "Diner de 1949 em arquitetura Googie. A casa guarda o reservado onde os Beatles comeram em 1965." },
  hulk: { film: "Hulk", year: 2003, where: "Peggy Sue's", day: 4, text: "Diner de estrada de 1954 usado como locação. Nos fundos há um jardim de dinossauros de metal." },
  vegassign: { film: "Welcome to Las Vegas", year: 1959, where: "Las Vegas Blvd", day: 4, text: "Criado por Betty Willis, que nunca registrou o desenho. Por isso ele aparece em todo lugar." },
  oceans: { film: "Onze Homens e um Segredo", year: 2001, where: "Fontes do Bellagio", day: 4, text: "O bando assiste às fontes em silêncio e, um a um, vai embora." },
  hangover: { film: "Se Beber, Não Case!", year: 2009, where: "Caesars Palace", day: 4, text: "A suíte destruída, o tigre e o colchão. Tudo começou aqui." },
  bttf: { film: "De Volta para o Futuro", year: 1985, where: "Universal Studio Tour", day: 5, text: "O tour passa pela praça do relógio de Hill Valley e pela casa de Psicose." },
  gcm: { film: "La La Land", year: 2016, where: "Grand Central Market", day: 6, text: "Mia e Sebastian passam pelo mercado e sobem o Angels Flight, o bondinho em frente." },
  bradbury: { film: "Blade Runner", year: 1982, where: "Bradbury Building", day: 6, text: "O prédio de 1893 é a casa de J.F. Sebastian. Também aparece em (500) Dias com Ela." },
  randys: { film: "Homem de Ferro 2", year: 2010, where: "Randy's Donuts", day: 7, text: "Tony Stark toma café sentado dentro do donut gigante do telhado." }
};

const HOTEL = "Loews Hollywood Hotel, 1755 N Highland Ave, Los Angeles";
const INNOUT_SUNSET = "In-N-Out Burger, 7009 Sunset Blvd, Los Angeles";

export const DAYS = [
  { n: 1, date: "2026-11-12", art: "pier", tint: "velvet", title: "Santa Monica, Venice e LACMA",
    planb: "Priorizar Santa Monica, Venice, check-in e Urban Light. Beverly Hills e Target podem cair.",
    notes: ["Dia cheio e dependente do trânsito.", "A The Grove tem bonde gratuito ligando ao Farmers Market."],
    items: [
      { id: "d1-car", t: "08:00", k: "move", title: "Retirar o carro no LAX", q: "LAX Rental Car Center, Los Angeles", core: 1 },
      { id: "d1-go", t: "08:45", k: "move", title: "Rumo a Santa Monica", note: "Margem para trânsito e retirada do carro.", core: 1 },
      { id: "d1-cafe", t: "09:15", e: "10:15", k: "meal", title: "Café no Rae's Restaurant", note: "Diner retrô clássico. Confirmar horário e fila.", q: "Rae's Restaurant, 2901 Pico Blvd, Santa Monica, CA", core: 1 },
      { id: "d1-pier", t: "10:30", e: "12:00", k: "visit", title: "Santa Monica Pier", q: "Santa Monica Pier", scene: ["forrest"], core: 1 },
      { id: "d1-almoco", t: "12:00", e: "13:00", k: "meal", title: "Bay Cities Italian Deli", short: "Bay Cities", note: "Famosa pelo Godmother. Dividir um e completar com salada.", q: "Bay Cities Italian Deli, 1517 Lincoln Blvd, Santa Monica, CA",
        alts: [
          { id: "cava", title: "CAVA", short: "CAVA", note: "Bowls, saladas e wraps.", q: "CAVA Santa Monica, CA" },
          { id: "alfalfa", title: "Alfalfa", short: "Alfalfa", note: "Saladas e bowls bem servidos.", q: "Alfalfa Santa Monica, CA" },
          { id: "window", title: "The Win-Dow", short: "Win-Dow", note: "Smash burger em Venice.", q: "The Win-Dow, Venice, CA" }] },
      { id: "d1-venice", t: "13:00", e: "14:15", k: "visit", title: "Venice Beach e Canals", note: "Se der tempo, Abbot Kinney Blvd.", q: "Venice Canals Historic District, Venice, CA", extra: [{ l: "Abbot Kinney", q: "Abbot Kinney Blvd, Venice, CA" }, { l: "Boardwalk", q: "Venice Beach Boardwalk" }], scene: ["venice"], core: 1 },
      { id: "d1-bh", t: "14:15", e: "15:30", k: "visit", title: "Rodeo Drive", q: "Rodeo Drive, Beverly Hills, CA", scene: ["pretty"] },
      { id: "d1-checkin", t: "15:30", e: "16:45", k: "move", title: "Check-in no Loews", note: "Check-in a partir das 16h.", q: HOTEL, core: 1 },
      { id: "d1-urban", t: "16:45", e: "17:30", k: "visit", title: "Urban Light ao anoitecer", note: "Pôr do sol por volta de 16h55.", q: "Urban Light, LACMA, Los Angeles", scene: ["urban"], core: 1, sunset: 1 },
      { id: "d1-jantar", t: "17:45", e: "19:15", k: "meal", title: "Farmers Market e The Grove", short: "Farmers Market", note: "Mercado de 1934, aberto até 21h. Evitar barracas de frutos do mar.", q: "Original Farmers Market, 6333 W 3rd St, Los Angeles", extra: [{ l: "The Grove", q: "The Grove, Los Angeles" }], core: 1,
        alts: [{ id: "cheesecake", title: "Cheesecake Factory", short: "Cheesecake", note: "Referência de The Big Bang Theory. Porções grandes.", q: "The Cheesecake Factory, The Grove, Los Angeles", scene: ["cheesecake"] }] },
      { id: "d1-target", t: "19:30", e: "20:15", k: "move", title: "Target", note: "A lista está na aba Listas.", q: "Target, 5520 W Sunset Blvd, Los Angeles", list: "target" }
    ] },
  { n: 2, date: "2026-11-13", art: "sign", tint: "midnight", title: "Hollywood Sign e Camarillo",
    planb: "Dormir mais e trocar a trilha por chegar ao outlet na abertura.",
    notes: ["A trilha precisa combinar com o condicionamento e a previsão do tempo.", "Conferir o horário do outlet para 13/11.", "Sair depois das 19h tende a pegar a 101 menos travada."],
    items: [
      { id: "d2-cafe", t: "06:30", k: "meal", title: "Café no hotel" },
      { id: "d2-trilha", t: "07:00", e: "10:00", k: "visit", title: "Trilha do Hollywood Sign", note: "Escolher a rota e conferir estacionamento.", q: "Hollywood Sign, Los Angeles", extra: [{ l: "Lake Hollywood Park", q: "Lake Hollywood Park, Los Angeles" }], scene: ["sign"] },
      { id: "d2-ida", t: "10:00", e: "11:15", k: "move", title: "Estrada até Camarillo", q: "Camarillo Premium Outlets, Camarillo, CA", core: 1 },
      { id: "d2-c1", t: "11:15", e: "14:00", k: "visit", title: "Compras, parte 1", note: "Levar sacolas ao carro a cada etapa.", q: "Camarillo Premium Outlets, Camarillo, CA", core: 1 },
      { id: "d2-almoco", t: "14:00", e: "14:45", k: "meal", title: "Almoço no outlet", note: "Proteína e vegetais. BiBro Grill é uma opção.", core: 1 },
      { id: "d2-c2", t: "14:45", e: "18:30", k: "visit", title: "Compras, parte 2", note: "Lanche leve no meio da tarde.", core: 1 },
      { id: "d2-volta", t: "18:30", e: "19:30", k: "move", title: "Volta para Hollywood", q: HOTEL, core: 1 },
      { id: "d2-jantar", t: "19:30", e: "20:45", k: "meal", title: "Joe's Pizza", short: "Joe's Pizza", note: "Fatia estilo Nova York. Duas por pessoa resolvem.", q: "Joe's Pizza, 6504 Hollywood Blvd, Los Angeles", core: 1,
        alts: [{ id: "innout", title: "In-N-Out", short: "In-N-Out", note: "A 10 minutos a pé do hotel.", q: INNOUT_SUNSET }] }
    ] },
  { n: 3, date: "2026-11-14", art: "observatory", tint: "forest", title: "Warner Bros. e Griffith",
    planb: "Almoço rápido no Zankou e ir direto ao Griffith. Jantar perto do hotel.",
    notes: ["O Griffith lota no fim da tarde. Não chegar em cima do pôr do sol.", "O Bob's fica a 20 a 25 minutos do Griffith, na direção oposta ao hotel."],
    items: [
      { id: "d3-cafe", t: "08:15", e: "09:15", k: "meal", title: "Café no IHOP", note: "Dividir panquecas e pedir ovos ou omelete.", q: "IHOP, 7006 W Sunset Blvd, Los Angeles" },
      { id: "d3-sair", t: "09:45", k: "move", title: "Rumo à Warner Bros.", q: "Warner Bros. Studio Tour Hollywood, 3400 W Riverside Dr, Burbank, CA", core: 1 },
      { id: "d3-wb", t: "11:00", e: "14:00", k: "visit", title: "Warner Bros. Studio Tour", note: "Stage 48: sets originais de The Big Bang Theory.", q: "Warner Bros. Studio Tour Hollywood, 3400 W Riverside Dr, Burbank, CA", scene: ["bbt"], core: 1 },
      { id: "d3-almoco", t: "14:15", e: "15:15", k: "meal", title: "Porto's Bakery", short: "Porto's", note: "Sanduíche cubano, potato balls e cheese rolls.", q: "Porto's Bakery, 3614 W Magnolia Blvd, Burbank, CA",
        alts: [{ id: "zankou", title: "Zankou Chicken", short: "Zankou", note: "Frango assado, salada e homus.", q: "Zankou Chicken, Burbank, CA" }] },
      { id: "d3-ida", t: "15:15", e: "16:00", k: "move", title: "Rumo ao Griffith", core: 1 },
      { id: "d3-griffith", t: "16:00", e: "17:30", k: "visit", title: "Griffith Observatory", note: "Vistas da cidade e pôr do sol.", q: "Griffith Observatory, Los Angeles", scene: ["lalaland"], core: 1, sunset: 1 },
      { id: "d3-volta", t: "17:45", e: "18:15", k: "move", title: "Volta a Burbank" },
      { id: "d3-jantar", t: "18:15", e: "19:30", k: "meal", title: "Bob's Big Boy", short: "Bob's", note: "Diner de 1949. Vale dividir o milkshake.", q: "Bob's Big Boy, 4211 W Riverside Dr, Burbank, CA", scene: ["bobs"],
        alts: [{ id: "innout", title: "In-N-Out", short: "In-N-Out", note: "Perto do hotel, sem voltar a Burbank.", q: INNOUT_SUNSET }] },
      { id: "d3-hotel", t: "19:30", e: "20:00", k: "move", title: "Volta ao hotel", q: HOTEL, core: 1 }
    ] },
  { n: 4, date: "2026-11-15", art: "vegas", tint: "plum", title: "Bate-volta a Las Vegas",
    planb: "Cortar Caesars e Venetian e sair mais cedo. Cansaço é motivo para pernoitar.",
    notes: ["Cerca de 9 a 10 horas de estrada no total.", "Confirmar o horário do Peggy Sue's.", "Não dirigir com sono."],
    items: [
      { id: "d4-saida", t: "05:00", e: "05:30", k: "move", title: "Saída de Hollywood", note: "Conferir trânsito e combustível.", core: 1 },
      { id: "d4-cafe", t: "07:30", e: "08:15", k: "meal", title: "Peggy Sue's 50's Diner", note: "I-15, saída Ghost Town Rd.", q: "Peggy Sue's 50's Diner, 35654 Yermo Rd, Yermo, CA", scene: ["hulk"], core: 1 },
      { id: "d4-chegada", t: "10:00", e: "10:30", k: "move", title: "Chegada a Las Vegas", core: 1 },
      { id: "d4-sign", t: "10:30", e: "12:00", k: "visit", title: "Welcome to Las Vegas Sign", note: "Depois, Luxor e Mandalay Bay.", q: "Welcome to Fabulous Las Vegas Sign", extra: [{ l: "Luxor", q: "Luxor Las Vegas" }], scene: ["vegassign"], core: 1 },
      { id: "d4-almoco", t: "12:00", e: "13:00", k: "meal", title: "Earl of Sandwich", short: "Earl", note: "Prático, no Planet Hollywood.", q: "Earl of Sandwich, Planet Hollywood, Las Vegas", core: 1,
        alts: [{ id: "truefood", title: "True Food Kitchen", short: "True Food", note: "Mais equilibrado. Custa um pouco mais.", q: "True Food Kitchen, Las Vegas" }] },
      { id: "d4-bellagio", t: "13:00", e: "15:00", k: "visit", title: "Bellagio e a Strip", note: "Jardins e fontes.", q: "Bellagio Conservatory & Botanical Gardens, Las Vegas", extra: [{ l: "Fontes", q: "Fountains of Bellagio" }], scene: ["oceans"], core: 1 },
      { id: "d4-caesars", t: "15:00", e: "16:45", k: "visit", title: "Caesars Palace e Venetian", q: "Caesars Palace, Las Vegas", extra: [{ l: "Venetian", q: "The Venetian Resort Las Vegas" }], scene: ["hangover"] },
      { id: "d4-jantar", t: "17:00", e: "18:00", k: "meal", title: "Secret Pizza", short: "Secret Pizza", note: "Sem placa, escondida no Cosmopolitan. A graça é achar a entrada.", q: "Secret Pizza, The Cosmopolitan of Las Vegas", core: 1,
        alts: [{ id: "innout", title: "In-N-Out", short: "In-N-Out", note: "Rápido antes da estrada.", q: "In-N-Out Burger, Las Vegas Strip" }] },
      { id: "d4-retorno", t: "18:00", e: "22:30", k: "move", title: "Estrada de volta", note: "Revezar a direção.", q: HOTEL, core: 1 },
      { id: "d4-la", t: "22:30", e: "24:00", k: "move", title: "Chegada a Los Angeles", core: 1 }
    ] },
  { n: 5, date: "2026-11-16", art: "coaster", tint: "velvet", title: "Universal Studios, dia 1",
    planb: "Fila do Hollywood Drift acima de 1h? Single rider ou Express avulso (US$ 19,95).",
    notes: ["Jurassic World: The Ride fechada até 21/11.", "Hollywood Drift: melhores chances na abertura ou na última hora.", "Express completo provavelmente não vale para dois dias de baixo movimento.", "Horários estimados com abertura às 9h. Conferir no app da Universal."],
    items: [
      { id: "d5-antes", t: "08:00", lbl: "Antes", k: "move", title: "B Line até a Universal", note: "Chegar 1 hora antes da abertura.", q: "Universal Studios Hollywood", extra: [{ l: "Hollywood/Highland", q: "Hollywood/Highland Station, Los Angeles" }], core: 1 },
      { id: "d5-lower", t: "09:00", e: "11:30", lbl: "Abertura", k: "visit", title: "Lower Lot", note: "Direto ao Mario Kart.", list: "u1", range: [0, 4], q: "Super Nintendo World, Universal Studios Hollywood", core: 1 },
      { id: "d5-almoco", t: "11:30", e: "12:30", k: "meal", title: "Krusty Burger", short: "Krusty", note: "Almoço cedo, antes do pico.", q: "Krusty Burger, Universal Studios Hollywood", core: 1,
        alts: [{ id: "mels", title: "Mel's Diner", short: "Mel's", note: "Diner retrô dentro do parque.", q: "Mel's Diner, Universal Studios Hollywood" }] },
      { id: "d5-upper", t: "12:30", e: "20:00", k: "visit", title: "Upper Lot até o fechamento", list: "u1", range: [5, 11], q: "Universal Studios Hollywood", scene: ["bttf"], core: 1 },
      { id: "d5-jantar", t: "20:00", e: "21:00", lbl: "Depois", k: "meal", title: "In-N-Out da Sunset", note: "Pedir protein style.", q: INNOUT_SUNSET, core: 1 }
    ] },
  { n: 6, date: "2026-11-17", art: "funicular", tint: "midnight", title: "Universal e Downtown",
    planb: "Cansados? CityWalk no lugar de Downtown e jantar perto do hotel.",
    notes: ["Algumas barracas do Grand Central Market fecham antes das 21h.", "Evitar barracas de peixe e pratos com molho de peixe."],
    items: [
      { id: "d6-park", t: "09:00", e: "12:00", lbl: "Abertura", k: "visit", title: "Hollywood Drift e Hogwarts", list: "u2", range: [0, 6], q: "Universal Studios Hollywood", core: 1 },
      { id: "d6-almoco", t: "12:00", e: "13:00", k: "meal", title: "Three Broomsticks", note: "Procurar pratos com frango.", q: "Three Broomsticks, Universal Studios Hollywood", core: 1 },
      { id: "d6-tarde", t: "13:00", e: "17:00", k: "visit", title: "Repetecos, Butterbeer e fotos", core: 1 },
      { id: "d6-bline", t: "17:00", e: "17:30", k: "move", title: "B Line até Pershing Square", q: "Pershing Square Station, Los Angeles" },
      { id: "d6-gcm", t: "17:30", e: "19:30", k: "meal", title: "Grand Central Market", short: "Grand Central", note: "Mercado de 1917. O Bradbury fica em frente.", q: "Grand Central Market, 317 S Broadway, Los Angeles", extra: [{ l: "Bradbury", q: "Bradbury Building, 304 S Broadway, Los Angeles" }, { l: "Angels Flight", q: "Angels Flight Railway, Los Angeles" }], scene: ["gcm", "bradbury"],
        alts: [
          { id: "philippe", title: "Philippe The Original", short: "Philippe's", note: "O French dip desde 1908.", q: "Philippe The Original, 1001 N Alameda St, Los Angeles" },
          { id: "citywalk", title: "CityWalk", short: "CityWalk", note: "Voodoo Doughnut, Pink's e cama cedo.", q: "Universal CityWalk Hollywood" }] },
      { id: "d6-volta", t: "19:30", e: "20:15", k: "move", title: "B Line de volta", q: "Hollywood/Highland Station, Los Angeles" }
    ] },
  { n: 7, date: "2026-11-18", art: "donut", tint: "forest", title: "Último rolo",
    planb: "Tempo curto? Cortar as duas paradas e ir direto à locadora.",
    notes: ["Horários estimados. Ajustar ao voo, terminal e locadora.", "O trânsito para o LAX pode ser imprevisível."],
    items: [
      { id: "d7-cafe", t: "08:00", lbl: "Manhã", k: "meal", title: "Café sem pressa", note: "O IHOP da Sunset fica aberto 24h.", q: "IHOP, 7006 W Sunset Blvd, Los Angeles" },
      { id: "d7-randys", t: "10:00", lbl: "No caminho", k: "visit", title: "Randy's Donuts", q: "Randy's Donuts, 805 W Manchester Blvd, Inglewood, CA", scene: ["randys"] },
      { id: "d7-innout", t: "11:00", lbl: "No caminho", k: "meal", title: "In-N-Out com aviões", note: "Vagas gratuitas na rua 92.", q: "In-N-Out Burger, 9149 S Sepulveda Blvd, Los Angeles" },
      { id: "d7-lax", t: "12:00", lbl: "3h30 antes", k: "move", title: "Devolver o carro e embarcar", q: "LAX Rental Car Center, Los Angeles", core: 1 }
    ] }
];

export const LISTS = [
  { id: "prep", title: "Antes de ir", add: true, items: ["Ingresso e horário da Warner Bros.", "Calendário da Universal para 16 e 17/11", "Baixar o app da Universal", "Condições da trilha do Hollywood Sign", "Estacionamento do Griffith", "Café da manhã incluso no Loews?", "Retirada do carro no LAX às 8h", "Horário e terminal do voo de volta"] },
  { id: "target", title: "Target", add: true, items: ["Água e bebidas sem açúcar", "Frutas e berries", "Iogurte grego", "Barrinhas de proteína", "Nuts e amêndoas", "Baby carrots e homus", "Crackers", "Snacks para o outlet e a estrada"] },
  { id: "vegas", title: "Estrada", add: true, items: ["Dormir cedo no dia 3", "Tanque cheio na véspera", "Água e snacks no carro", "Playlist e carregador", "Trânsito na I-15 antes de sair", "Combinar o revezamento", "Decidir até 17h se há pernoite"] },
  { id: "u1", title: "Universal 1", items: ["Mario Kart: Bowser's Challenge", "Revenge of the Mummy", "Transformers: The Ride 3D", "Yoshi's Adventure (fila < 20 min)", "Starway e almoço às 11h30", "Studio Tour, carro 3", "Simpsons Ride e Minion Mayhem", "Secret Life of Pets", "WaterWorld", "Hippogriff, Forbidden Journey e Ollivanders", "Hollywood Drift na última hora"] },
  { id: "u2", title: "Universal 2", items: ["Hollywood Drift na abertura", "Forbidden Journey com a área vazia", "Repetir no single rider", "Shows que ficaram de fora", "Mario Kart (fila < 45 min)", "Lojas, Butterbeer e fotos"] }
];

export const LETTER_PRESETS = [
  { l: "Urban Light", d: "2026-11-12", t: "16:55" },
  { l: "Hollywood Sign", d: "2026-11-13", t: "08:30" },
  { l: "Griffith", d: "2026-11-14", t: "16:50" },
  { l: "Estrada de Vegas", d: "2026-11-15", t: "07:30" },
  { l: "Bellagio", d: "2026-11-15", t: "14:00" },
  { l: "Hogwarts", d: "2026-11-16", t: "17:00" },
  { l: "Bradbury", d: "2026-11-17", t: "18:00" },
  { l: "Antes do voo", d: "2026-11-18", t: "11:00" }
];
