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
    "tag": "História",
    "title": "Peggy Sue's",
    "year": 1954,
    "text": "O diner foi erguido em 1954 com dormentes e argamassa do pátio ferroviário da Union Pacific ao lado. Nos fundos fica o Diner-saur Park, com dinossauros de metal de cerca de 3 metros.",
    "gen": false,
    "source": "https://www.californiacuriosities.com/peggy-sues-50s-diner-diner-saur-park/"
  },
  {
    "id": "vegassign",
    "place": "Welcome to Las Vegas",
    "day": 4,
    "itemIds": [
      "d4-sign"
    ],
    "tag": "História",
    "title": "Welcome to Las Vegas",
    "year": 1959,
    "text": "Criado por Betty Willis, que nunca registrou o desenho, por isso ele aparece em todo lugar. Os círculos atrás das letras representam dólares de prata do Silver State.",
    "gen": false,
    "source": "https://www.visitlasvegas.com/experience/post/a-brief-history-of-the-welcome-to-fabulous-las-vegas-sign/"
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
    "text": "Na cena final, o bando de Danny Ocean assiste às fontes do Bellagio em silêncio e, um a um, vai embora.",
    "gen": true,
    "source": "https://en.wikipedia.org/wiki/Fountains_of_Bellagio"
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
    "text": "A suíte destruída foi um cenário montado num estúdio da Warner em Burbank. O terraço é real, no topo da Forum Tower, e o quarto 2452 existe no hotel.",
    "gen": true,
    "source": "https://neon.reviewjournal.com/entertainment/movies/hangover-movies-have-been-a-pr-bonanza-for-caesars-vegas/"
  },
  {
    "id": "mojave-termometro",
    "place": "I-15 e Mojave",
    "day": 4,
    "itemIds": [
      "d4-cafe",
      "d4-retorno"
    ],
    "tag": "Bizarro",
    "title": "Maior termômetro do mundo",
    "year": 1991,
    "text": "Em Baker, na I-15, um termômetro de 134 pés lembra os 134 °F (56,7 °C) do Vale da Morte em 1913, ainda o recorde oficial de calor do planeta.",
    "gen": false,
    "source": "https://en.wikipedia.org/wiki/World%27s_Tallest_Thermometer"
  },
  {
    "id": "mojave-zzyzx",
    "place": "I-15 e Mojave",
    "day": 4,
    "itemIds": [
      "d4-cafe",
      "d4-retorno"
    ],
    "tag": "Bizarro",
    "title": "Zzyzx Road",
    "year": 1944,
    "text": "A saída da I-15 leva um nome inventado em 1944 por Curtis Springer, que o anunciava como a última palavra da língua inglesa para promover seu spa no deserto.",
    "gen": false,
    "source": "https://en.wikipedia.org/wiki/Zzyzx,_California"
  },
  {
    "id": "bellagio-fontes",
    "place": "Fontes do Bellagio",
    "day": 4,
    "itemIds": [
      "d4-bellagio"
    ],
    "tag": "História",
    "title": "1.214 bicos",
    "year": 1998,
    "text": "As fontes estrearam com o hotel em 1998 e hoje somam 1.214 bicos. Os jatos mais fortes, acrescentados depois, chegam a cerca de 140 metros de altura.",
    "gen": false,
    "source": "https://en.wikipedia.org/wiki/Fountains_of_Bellagio"
  },
  {
    "id": "strip-bourne",
    "place": "Strip",
    "day": 4,
    "itemIds": [
      "d4-bellagio",
      "d4-caesars"
    ],
    "tag": "Filme",
    "title": "Jason Bourne",
    "year": 2016,
    "text": "Para a perseguição final, a produção fechou o Strip de madrugada entre a Harmon e a Flamingo por quase duas semanas. Carros voaram em frente ao Bellagio.",
    "gen": true,
    "source": "https://lasvegassun.com/news/2016/apr/17/a-day-in-the-life-of-a-movie-extra/"
  },
  {
    "id": "venetian-sands",
    "place": "Venetian",
    "day": 4,
    "itemIds": [
      "d4-caesars"
    ],
    "tag": "História",
    "title": "Hotel Sands",
    "year": 1999,
    "text": "O Venetian abriu em maio de 1999 no terreno do antigo Hotel Sands, demolido em 1996 para dar lugar ao novo resort.",
    "gen": false,
    "source": "https://www.sands.com/news/the-venetian-las-vegas-the-first-integrated-resort/"
  },
  {
    "id": "cosmo-secret",
    "place": "Cosmopolitan",
    "day": 4,
    "itemIds": [
      "d4-jantar"
    ],
    "tag": "Bizarro",
    "title": "Secret Pizza",
    "year": 2010,
    "text": "A pizzaria não tem placa nem aparece no mapa do hotel. A entrada é um corredor sem identificação, no terceiro andar, forrado de capas de discos.",
    "gen": false,
    "source": "https://www.atlasobscura.com/places/secret-pizza-las-vegas"
  },
  {
    "id": "cosmo-chandelier",
    "place": "Cosmopolitan",
    "day": 4,
    "itemIds": [
      "d4-jantar"
    ],
    "tag": "História",
    "title": "The Chandelier",
    "year": 2010,
    "text": "O bar central do Cosmopolitan ocupa três andares dentro de um lustre de cerca de 2 milhões de cristais, em fios que descem do teto quase até o chão.",
    "gen": false,
    "source": "https://vegasinc.com/places/chandelier-bar"
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
    "text": "O tram passa pela Courthouse Square, a praça do relógio de Hill Valley. No alto do morro fica a casa de Psicose, que já mudou de lugar várias vezes.",
    "gen": false,
    "source": "https://www.seeing-stars.com/studiotours/UniversalStudiosHollywood.shtml"
  },
  {
    "id": "nintendo-world",
    "place": "Super Nintendo World",
    "day": 5,
    "itemIds": [
      "d5-lower"
    ],
    "tag": "História",
    "title": "Super Nintendo World",
    "year": 2023,
    "text": "A área abriu em 17 de fevereiro de 2023. O Mario Kart daqui se chama Bowser's Challenge, no Japão é Koopa's Challenge, e a pontuação da pulseira não passa de um parque para o outro.",
    "gen": true,
    "source": "https://www.travelpulse.com/news/entertainment/universal-studios-hollywood-reveals-details-of-mario-kart-bowsers-challenge"
  },
  {
    "id": "lower-starway",
    "place": "Universal Lower Lot",
    "day": 5,
    "itemIds": [
      "d5-lower"
    ],
    "tag": "Bizarro",
    "title": "Starway",
    "year": 1991,
    "text": "As escadas rolantes que descem a encosta do Upper Lot até o Lower Lot funcionam desde 1991. A viagem completa leva de 7 a 8 minutos.",
    "gen": false,
    "source": "https://www.thestudiotour.com/ush/attractions/starway.shtml"
  },
  {
    "id": "upper-wisteria",
    "place": "Universal Studio Tour",
    "day": 5,
    "itemIds": [
      "d5-upper"
    ],
    "tag": "Série",
    "title": "Desperate Housewives",
    "year": 2004,
    "text": "A Wisteria Lane da série é uma rua do backlot da Universal, e o tram passa entre as casas das vizinhas.",
    "gen": true,
    "source": "https://www.seeing-stars.com/studiotours/UniversalStudiosHollywood.shtml"
  },
  {
    "id": "upper-1915",
    "place": "Universal Studio Tour",
    "day": 5,
    "itemIds": [
      "d5-upper"
    ],
    "tag": "História",
    "title": "Carl Laemmle",
    "year": 1915,
    "text": "O fundador abriu o estúdio ao público em 1915. Por 25 centavos o visitante assistia às filmagens de uma arquibancada, e a marmita de frango custava mais 5.",
    "gen": false,
    "source": "https://pbssocal.org/shows/lost-la/the-birth-of-the-universal-studios-tour"
  },
  {
    "id": "upper-kong",
    "place": "Universal Studio Tour",
    "day": 5,
    "itemIds": [
      "d5-upper"
    ],
    "tag": "Bizarro",
    "title": "Incêndio de 2008",
    "year": 2008,
    "text": "Um maçarico usado num telhado começou o incêndio que destruiu a New York Street e o King Kong do tour em 2008. O gorila voltou em 2010, em 3D.",
    "gen": false,
    "source": "https://www.thestudiotour.com/wp/studios/universal-studios-hollywood/backlot/fires-and-storms/2008-fire/"
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
    "gen": true,
    "source": "https://movie-locations.com/movies/l/La-La-Land.php"
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
    "text": "O prédio de 1893 é a casa de J.F. Sebastian em Blade Runner. Também aparece em (500) Dias com Ela.",
    "gen": false,
    "source": "https://en.wikipedia.org/wiki/Bradbury_Building"
  },
  {
    "id": "hp-hollywood",
    "place": "Hogwarts",
    "day": 6,
    "itemIds": [
      "d6-park"
    ],
    "tag": "Filme",
    "title": "Harry Potter",
    "year": 2016,
    "text": "O Wizarding World de Hollywood abriu em 7 de abril de 2016 com projeções no castelo de Hogwarts. Ao lado, o Flight of the Hippogriff foi a primeira montanha-russa ao ar livre do parque.",
    "gen": true,
    "source": "https://www.thestudiotour.com/wp/studios/universal-studios-hollywood/theme-park/attractions/the-wizarding-world-of-harry-potter/press-releases-photographs/"
  },
  {
    "id": "hollywood-drift",
    "place": "Hollywood Drift",
    "day": 6,
    "itemIds": [
      "d6-park"
    ],
    "tag": "Filme",
    "title": "Velozes e Furiosos",
    "year": 2026,
    "text": "A montanha-russa da franquia, com abertura marcada para 16 de setembro de 2026, chega a cerca de 116 km/h e é anunciada como a mais rápida da Universal no mundo.",
    "gen": true,
    "source": "https://www.themeparkinsider.com/flume/202608/12638/"
  },
  {
    "id": "three-broomsticks",
    "place": "Three Broomsticks",
    "day": 6,
    "itemIds": [
      "d6-almoco"
    ],
    "tag": "Filme",
    "title": "Cerveja Amanteigada",
    "year": 2016,
    "text": "O Três Vassouras serve as bebidas dos livros, Cerveja Amanteigada e Suco de Abóbora. A cerveja também sai no Hog's Head, o pub ao lado.",
    "gen": true,
    "source": "https://blog.discoveruniversal.com/guides-and-tips/guide-to-the-wizarding-world-of-harry-potter-at-universal-studios-hollywood"
  },
  {
    "id": "gcm-1917",
    "place": "Grand Central Market",
    "day": 6,
    "itemIds": [
      "d6-gcm"
    ],
    "tag": "História",
    "title": "Homer Laughlin Building",
    "year": 1917,
    "text": "O mercado abriu em 1917 no térreo do Homer Laughlin Building. Na década de 1920, Frank Lloyd Wright teve escritório no prédio.",
    "gen": false,
    "source": "https://laconservancy.org/learn/historic-places/grand-central-market"
  },
  {
    "id": "angels-flight",
    "place": "Angels Flight",
    "day": 6,
    "itemIds": [
      "d6-gcm"
    ],
    "tag": "História",
    "title": "Angels Flight",
    "year": 1901,
    "text": "Inaugurado em 1901, o bondinho é chamado de ferrovia mais curta do mundo. Desmontado em 1969, voltou em 1996 com um trilho de cerca de 91 metros.",
    "gen": false,
    "source": "https://en.wikipedia.org/wiki/Angels_Flight"
  },
  {
    "id": "bradbury-ouija",
    "place": "Bradbury Building",
    "day": 6,
    "itemIds": [
      "d6-gcm"
    ],
    "tag": "Bizarro",
    "title": "Tabuleiro Ouija",
    "year": 1893,
    "text": "Segundo a lenda, o projetista George Wyman só aceitou a obra depois que o irmão morto, por um tabuleiro Ouija, disse que o prédio o deixaria famoso.",
    "gen": false,
    "source": "https://www.atlasobscura.com/places/bradbury-building"
  },
  {
    "id": "bline-vine",
    "place": "Metrô B Line",
    "day": 6,
    "itemIds": [
      "d6-bline"
    ],
    "tag": "História",
    "title": "Estação Hollywood/Vine",
    "year": 1999,
    "text": "O teto da estação é coberto por mais de 20 mil rolos de filme, comprados a 25 centavos cada. No mezanino ficam dois projetores da Paramount dos anos 1930.",
    "gen": false,
    "source": "https://lamag.com/urbandevelopment/ask-chris-waiting-subway-hollywood-vine-metro-station-noticed-ceiling-decorated-thousands-old-film-reels-come/"
  },
  {
    "id": "bline-tunel",
    "place": "Metrô B Line",
    "day": 6,
    "itemIds": [
      "d6-bline"
    ],
    "tag": "História",
    "title": "Túnel sob as montanhas",
    "year": 2000,
    "text": "Entre Hollywood/Highland e Universal City, o metrô passa em túnel por baixo das Santa Monica Mountains. O trecho foi aberto em 2000.",
    "gen": false,
    "source": "https://en.wikipedia.org/wiki/B_Line_(Los_Angeles_Metro)"
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
