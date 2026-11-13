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
    "text": "O letreiro nasceu como propaganda de um loteamento. As quatro últimas letras caíram em 1949.",
    "gen": false,
    "source": ""
  },
  {
    "id": "bbt",
    "place": "Warner Bros.",
    "day": 3,
    "itemIds": [
      "d3-wb"
    ],
    "tag": "Série",
    "title": "Big Bang e Friends",
    "year": 2007,
    "text": "O Stage 48 guarda sets originais de The Big Bang Theory. No mesmo tour fica o sofá do Central Perk.",
    "gen": false,
    "source": ""
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
    "text": "Mia e Sebastian dançam no planetário. Em 1955, James Dean filmou aqui Juventude Transviada.",
    "gen": false,
    "source": ""
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
    "text": "Diner de 1949 em arquitetura Googie. A casa guarda o reservado onde os Beatles comeram em 1965.",
    "gen": false,
    "source": ""
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
