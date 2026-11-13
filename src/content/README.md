# Conteúdo do app (dados)

Cada arquivo tem um dono. Só o dono edita o arquivo. A sessão App só lê.

| Arquivo | Dono |
|---|---|
| `curiosities.js` | Sessão Curiosidades |
| `restaurants.js` | Sessão Restaurantes |

## restaurants.js

```js
export const MEALS = {
  "d3-almoco": {                       // id do item do roteiro (ver src/data.js)
    label: "Almoço em Burbank",
    from: "Warner Bros. Studio Tour",  // parada anterior (base da distância)
    criteria: "padrao",                // "padrao" ou "experiencia" (Universal)
    recommended: "portos",             // id da opção que vira a principal do roteiro
    options: [{
      id: "portos",                    // [a-z0-9-], estável
      name: "Porto's Bakery & Cafe",
      cuisine: "Padaria cubana",
      health: 2,                       // 1 menos saudável, 3 mais saudável
      price: 1,                        // 1 a 4 ($ a $$$$)
      ambiance: 2,                     // 1 simples, 3 especial
      rating: 4.6, reviews: 12000, ratingSource: "Google",
      minutes: 8, mode: "carro",       // da parada anterior: "a pé" ou "carro"
      address: "3614 W Magnolia Blvd, Burbank, CA",
      q: "Porto's Bakery, 3614 W Magnolia Blvd, Burbank, CA", // busca no Google Maps
      why: "Uma frase curta do porquê.",
      allergy: "Opcional: cuidado com peixe.",
      hours: "Opcional: horário relevante",
      sources: ["https://..."]
    }]
  }
};
```

Ids das refeições: d2-cafe, d2-almoco, d2-jantar, d3-cafe, d3-almoco, d3-jantar, d4-cafe, d4-almoco, d4-jantar, d5-almoco, d5-jantar, d6-almoco, d6-gcm, d7-cafe, d7-innout.
