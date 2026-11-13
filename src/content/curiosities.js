// Curiosidades do rolo (aba Cenas). Dono do conteudo: sessao Curiosidades.
// Schema: {id, place, day, itemIds[], tag: Filme|Serie|Historia|Bizarro|Musica, title, year, text, gen (bool, geracao 2000+), source (url)}
// Manter os ids existentes: o estado "cena gravada" no Firebase usa esses ids.
export const CURIOSITIES = [
  {
    "id": "forrest",
    "place": "Santa Monica Pier",
    "day": 1,
    "itemIds": [
      "d1-pier"
    ],
    "tag": "Filme",
    "title": "Forrest Gump",
    "year": 1994,
    "text": "A corrida de Forrest atravessa o país e termina aqui, de frente para o Pacífico.",
    "gen": false,
    "source": ""
  },
  {
    "id": "venice",
    "place": "Venice Beach",
    "day": 1,
    "itemIds": [
      "d1-venice"
    ],
    "tag": "Filme",
    "title": "Homens Brancos Não Sabem Enterrar",
    "year": 1992,
    "text": "As quadras de basquete da orla de Venice são o palco de Wesley Snipes e Woody Harrelson.",
    "gen": false,
    "source": ""
  },
  {
    "id": "pretty",
    "place": "Rodeo Drive",
    "day": 1,
    "itemIds": [
      "d1-bh"
    ],
    "tag": "Filme",
    "title": "Uma Linda Mulher",
    "year": 1990,
    "text": "\"Grande erro. Enorme.\" A volta de Vivian às lojas que a esnobaram foi filmada nesta rua.",
    "gen": false,
    "source": ""
  },
  {
    "id": "urban",
    "place": "LACMA",
    "day": 1,
    "itemIds": [
      "d1-urban"
    ],
    "tag": "História",
    "title": "Urban Light",
    "year": 2008,
    "text": "Chris Burden reuniu 202 postes antigos de Los Angeles. Eles acendem ao anoitecer.",
    "gen": false,
    "source": ""
  },
  {
    "id": "cheesecake",
    "place": "Cheesecake Factory",
    "day": 1,
    "itemIds": [
      "d1-jantar"
    ],
    "tag": "Série",
    "title": "The Big Bang Theory",
    "year": 2007,
    "text": "O restaurante onde a Penny trabalha nas primeiras temporadas.",
    "gen": false,
    "source": ""
  },
  {
    "id": "sign",
    "place": "Hollywood Sign",
    "day": 2,
    "itemIds": [
      "d2-trilha"
    ],
    "tag": "História",
    "title": "Hollywoodland",
    "year": 1923,
    "text": "O letreiro nasceu em 1923 como propaganda do loteamento Hollywoodland e deveria durar só um ano e meio. As quatro últimas letras foram retiradas em 1949.",
    "gen": false,
    "source": "https://en.wikipedia.org/wiki/Hollywood_Sign"
  },
  {
    "id": "sign-1978",
    "place": "Hollywood Sign",
    "day": 2,
    "itemIds": [
      "d2-trilha"
    ],
    "tag": "História",
    "title": "Reconstrução de 1978",
    "year": 1978,
    "text": "Deteriorado, o letreiro foi refeito em 1978 com nove doadores, cada um pagando cerca de US$ 27,7 mil por letra. Entre eles, Hugh Hefner, Alice Cooper e Gene Autry.",
    "gen": false,
    "source": "https://geneautry.com/news/2018/when-hollywood-waved-goodbye.php"
  },
  {
    "id": "sign-hollyweed",
    "place": "Hollywood Sign",
    "day": 2,
    "itemIds": [
      "d2-trilha"
    ],
    "tag": "Bizarro",
    "title": "Hollyweed",
    "year": 1976,
    "text": "No dia 1 de janeiro de 1976, o estudante de arte Danny Finegood cobriu letras com tecido e o letreiro amanheceu como \"Hollyweed\". A brincadeira se repetiu em 2017.",
    "gen": false,
    "source": "https://www.cbsnews.com/news/hollywood-sign-hollyweed-history-danny-finegood-activist"
  },
  {
    "id": "citadel-assiria",
    "place": "Citadel Outlets",
    "day": 2,
    "itemIds": [
      "d2-c1",
      "d2-c2"
    ],
    "tag": "História",
    "title": "Samson Tire & Rubber",
    "year": 1929,
    "text": "A fachada de 1929 da antiga fábrica de pneus copia o palácio do rei assírio Sargão II. A fábrica produziu pneus, já sob a Uniroyal, até 1978.",
    "gen": false,
    "source": "https://laist.com/shows/take-two/why-las-citadel-looks-like-an-ancient-assyrian-palace"
  },
  {
    "id": "citadel-arvore",
    "place": "Citadel Outlets",
    "day": 2,
    "itemIds": [
      "d2-c1",
      "d2-c2"
    ],
    "tag": "Bizarro",
    "title": "Árvore de Natal",
    "year": 2019,
    "text": "Todo ano o outlet ergue um pinheiro natural de cerca de 35 metros, anunciado como a maior árvore de Natal de corte natural do mundo. A iluminação costuma acontecer em novembro.",
    "gen": false,
    "source": "https://abc7.com/5687208"
  },
  {
    "id": "hollywood-potter",
    "place": "Hollywood Blvd",
    "day": 2,
    "itemIds": [
      "d2-jantar"
    ],
    "tag": "Filme",
    "title": "Harry Potter",
    "year": 2007,
    "text": "Em 2007, Daniel Radcliffe, Emma Watson e Rupert Grint deixaram mãos, pés e varinhas no cimento da calçada do Chinese Theatre.",
    "gen": true,
    "source": "https://en.wikipedia.org/wiki/List_of_Grauman%27s_Chinese_Theatre_handprint_ceremonies"
  },
  {
    "id": "hollywood-tarantino",
    "place": "Hollywood Blvd",
    "day": 2,
    "itemIds": [
      "d2-jantar"
    ],
    "tag": "Filme",
    "title": "Era Uma Vez em Hollywood",
    "year": 2019,
    "text": "Tarantino fechou o Hollywood Blvd entre a Cherokee e a Las Palmas e o vestiu como em 1969, com carros, cabines telefônicas e fachadas da época.",
    "gen": true,
    "source": "https://laist.com/shows/filmweek/how-once-upon-a-time-in-hollywood-is-recreating-a-stretch-of-hollywood-blvd-in-all-its-grimy-late-60s-glory"
  },
  {
    "id": "hollywood-shrek",
    "place": "Hollywood Blvd",
    "day": 2,
    "itemIds": [
      "d2-jantar"
    ],
    "tag": "Filme",
    "title": "Shrek",
    "year": 2010,
    "text": "O ogro ganhou estrela própria na Calçada da Fama em 2010, a de número 2.408, no 6931 do Hollywood Blvd. Mike Myers recebeu a homenagem ao lado dele.",
    "gen": true,
    "source": "https://walkoffame.com/shrek/"
  },
  {
    "id": "bbt",
    "place": "Warner Bros.",
    "day": 3,
    "itemIds": [
      "d3-wb"
    ],
    "tag": "Série",
    "title": "The Big Bang Theory",
    "year": 2007,
    "text": "No Stage 48 dá para sentar no lugar do Sheldon no apartamento 4A. Os 279 episódios foram gravados no Stage 25, hoje rebatizado com o nome da série.",
    "gen": true,
    "source": "https://moviefone.com/news/big-bang-theory-studio-tour"
  },
  {
    "id": "lalaland",
    "place": "Griffith Observatory",
    "day": 3,
    "itemIds": [
      "d3-griffith"
    ],
    "tag": "Filme",
    "title": "La La Land",
    "year": 2016,
    "text": "Mia e Sebastian flutuam no planetário do observatório. Em 1955, James Dean filmou aqui Juventude Transviada, e um busto dele fica no gramado.",
    "gen": true,
    "source": "https://movie-locations.com/movies/l/La-La-Land.php"
  },
  {
    "id": "bobs",
    "place": "Bob's Big Boy",
    "day": 3,
    "itemIds": [
      "d3-jantar"
    ],
    "tag": "Música",
    "title": "Os Beatles",
    "year": 1965,
    "text": "Uma placa marca o reservado onde, segundo a casa, os quatro Beatles comeram em 1965. Fãs já roubaram a placa várias vezes.",
    "gen": false,
    "source": "https://bobs.net/pages/the-beatles-booth"
  },
  {
    "id": "wb-friends",
    "place": "Warner Bros.",
    "day": 3,
    "itemIds": [
      "d3-wb"
    ],
    "tag": "Série",
    "title": "Friends",
    "year": 1994,
    "text": "A fonte da abertura de Friends não fica no Central Park. Ela foi filmada no rancho da Warner em Burbank, e a série foi gravada quase toda no Stage 24.",
    "gen": true,
    "source": "https://www.mentalfloss.com/article/592695/30-fascinating-facts-about-friends"
  },
  {
    "id": "wb-gilmore",
    "place": "Warner Bros.",
    "day": 3,
    "itemIds": [
      "d3-wb"
    ],
    "tag": "Série",
    "title": "Gilmore Girls",
    "year": 2000,
    "text": "A Midwest Street do backlot foi Stars Hollow em Gilmore Girls e depois Rosewood em Pretty Little Liars. A casa da Lorelai virou a casa da Spencer.",
    "gen": true,
    "source": "https://www.discoverlosangeles.com/things-to-do/discover-iconic-filming-locations-at-warner-bros-studio-tour-hollywood"
  },
  {
    "id": "wb-lalaland",
    "place": "Warner Bros.",
    "day": 3,
    "itemIds": [
      "d3-wb"
    ],
    "tag": "Filme",
    "title": "La La Land",
    "year": 2016,
    "text": "O café onde Mia trabalha é uma fachada do backlot da Warner. A janela em frente, que ela mostra a Sebastian, foi usada no flashback de Paris em Casablanca.",
    "gen": true,
    "source": "https://www.slashfilm.com/549534/la-la-land-set-on-the-warner-bros-studio-tour/"
  },
  {
    "id": "portos",
    "place": "Porto's",
    "day": 3,
    "itemIds": [
      "d3-almoco"
    ],
    "tag": "História",
    "title": "Rosa Porto",
    "year": 1976,
    "text": "Rosa Porto vendia bolos às escondidas em Cuba, onde o comércio privado era proibido. Em 1976 a família abriu em Los Angeles uma padaria de cerca de 28 m².",
    "gen": false,
    "source": "https://pbssocal.org/shows/the-migrant-kitchen/portos-from-communist-cuba-secret-to-southern-california-icon"
  },
  {
    "id": "griffith-terminator",
    "place": "Griffith Observatory",
    "day": 3,
    "itemIds": [
      "d3-griffith"
    ],
    "tag": "Filme",
    "title": "O Exterminador do Futuro",
    "year": 1984,
    "text": "O ciborgue de Schwarzenegger chega do futuro entre raios ao lado do observatório, na cena de abertura do filme.",
    "gen": false,
    "source": "https://movie-locations.com/movies/t/Terminator.php"
  },
  {
    "id": "griffith-gratis",
    "place": "Griffith Observatory",
    "day": 3,
    "itemIds": [
      "d3-griffith"
    ],
    "tag": "História",
    "title": "Griffith J. Griffith",
    "year": 1935,
    "text": "O industrial que doou o terreno e o dinheiro da obra exigiu entrada gratuita. Desde a abertura, em 1935, só as sessões do planetário são pagas.",
    "gen": false,
    "source": "https://en.wikipedia.org/wiki/Griffith_Observatory"
  },
  {
    "id": "bobs-carhop",
    "place": "Bob's Big Boy",
    "day": 3,
    "itemIds": [
      "d3-jantar"
    ],
    "tag": "História",
    "title": "Big Boy mais antigo",
    "year": 1949,
    "text": "Projetado por Wayne McAllister em 1949, é o Bob's Big Boy mais antigo dos EUA. Nas noites de sábado e domingo a casa volta a servir no carro.",
    "gen": false,
    "source": "https://bobs.net/pages/history"
  },
  {
    "id": "hulk",
    "place": "Peggy Sue's",
    "day": 4,
    "itemIds": [
      "d4-cafe"
    ],
    "tag": "Filme",
    "title": "Hulk",
    "year": 2003,
    "text": "Diner de estrada de 1954 usado como locação. Nos fundos há um jardim de dinossauros de metal.",
    "gen": false,
    "source": ""
  },
  {
    "id": "vegassign",
    "place": "Las Vegas Blvd",
    "day": 4,
    "itemIds": [
      "d4-sign"
    ],
    "tag": "História",
    "title": "Welcome to Las Vegas",
    "year": 1959,
    "text": "Criado por Betty Willis, que nunca registrou o desenho. Por isso ele aparece em todo lugar.",
    "gen": false,
    "source": ""
  },
  {
    "id": "oceans",
    "place": "Fontes do Bellagio",
    "day": 4,
    "itemIds": [
      "d4-bellagio"
    ],
    "tag": "Filme",
    "title": "Onze Homens e um Segredo",
    "year": 2001,
    "text": "O bando assiste às fontes em silêncio e, um a um, vai embora.",
    "gen": false,
    "source": ""
  },
  {
    "id": "hangover",
    "place": "Caesars Palace",
    "day": 4,
    "itemIds": [
      "d4-caesars"
    ],
    "tag": "Filme",
    "title": "Se Beber, Não Case!",
    "year": 2009,
    "text": "A suíte destruída, o tigre e o colchão. Tudo começou aqui.",
    "gen": false,
    "source": ""
  },
  {
    "id": "bttf",
    "place": "Universal Studio Tour",
    "day": 5,
    "itemIds": [
      "d5-upper"
    ],
    "tag": "Filme",
    "title": "De Volta para o Futuro",
    "year": 1985,
    "text": "O tour passa pela praça do relógio de Hill Valley e pela casa de Psicose.",
    "gen": false,
    "source": ""
  },
  {
    "id": "gcm",
    "place": "Grand Central Market",
    "day": 6,
    "itemIds": [
      "d6-gcm"
    ],
    "tag": "Filme",
    "title": "La La Land",
    "year": 2016,
    "text": "Mia e Sebastian passam pelo mercado e sobem o Angels Flight, o bondinho em frente.",
    "gen": false,
    "source": ""
  },
  {
    "id": "bradbury",
    "place": "Bradbury Building",
    "day": 6,
    "itemIds": [
      "d6-gcm"
    ],
    "tag": "Filme",
    "title": "Blade Runner",
    "year": 1982,
    "text": "O prédio de 1893 é a casa de J.F. Sebastian. Também aparece em (500) Dias com Ela.",
    "gen": false,
    "source": ""
  },
  {
    "id": "randys",
    "place": "Randy's Donuts",
    "day": 7,
    "itemIds": [
      "d7-randys"
    ],
    "tag": "Filme",
    "title": "Homem de Ferro 2",
    "year": 2010,
    "text": "Tony Stark toma café sentado dentro do donut gigante do telhado.",
    "gen": false,
    "source": ""
  }
];
