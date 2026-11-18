// Learning about Boise (Nov 18 2026). Each place: id, cat, optional photo, and en / es text.
export const CATS = [
  { id: 'do', e: '🎡', n: { en: 'Things to do', es: 'Cosas por hacer' } },
  { id: 'history', e: '📜', n: { en: 'How Boise began', es: 'Cómo empezó Boise' } },
  { id: 'nature', e: '🦅', n: { en: 'Animals and wild places', es: 'Animales y lugares salvajes' } },
];
export default [
 {
  "id": "zooboise",
  "cat": "do",
  "en": {
   "name": "Zoo Boise",
   "hook": "A zoo in the middle of a city park!",
   "facts": [
    "Zoo Boise is inside Julia Davis Park, Boise’s oldest city park.",
    "Animals from around the world live there, including giraffes and red pandas.",
    "Good zoos help protect animals that are in danger in the wild."
   ],
   "ask": "Pick one animal you want to meet. Find out where it lives in the wild and what it eats.",
   "quiz": {
    "q": "Which of these animals can you meet at Zoo Boise?",
    "opts": [
     "Blue whale",
     "Woolly mammoth",
     "Giraffe"
    ],
    "a": 2,
    "why": "Zoo Boise has giraffes. Blue whales live in the ocean, and mammoths are extinct."
   }
  },
  "es": {
   "name": "Zoo Boise",
   "hook": "¡Un zoológico en medio de un parque de la ciudad!",
   "facts": [
    "Zoo Boise está dentro del Julia Davis Park, el parque de la ciudad más antiguo de Boise.",
    "Allí viven animales de todo el mundo, como jirafas y pandas rojos.",
    "Los buenos zoológicos ayudan a proteger animales que están en peligro en la naturaleza."
   ],
   "ask": "Elige un animal que quieras conocer. Averigua dónde vive en la naturaleza y qué come.",
   "quiz": {
    "q": "¿Cuál de estos animales puedes conocer en Zoo Boise?",
    "opts": [
     "Ballena azul",
     "Mamut lanudo",
     "Jirafa"
    ],
    "a": 2,
    "why": "Zoo Boise tiene jirafas. Las ballenas azules viven en el océano y los mamuts ya se extinguieron."
   }
  }
 },
 {
  "id": "discovery",
  "cat": "do",
  "en": {
   "name": "Discovery Center of Idaho",
   "hook": "Touch it, build it, test it: a science museum for hands!",
   "facts": [
    "The Discovery Center of Idaho is a hands-on science museum near downtown Boise.",
    "Most exhibits are made to be touched, pushed, spun and tested.",
    "Scientists learn by trying things and asking “what happens if…?”"
   ],
   "ask": "Think of a “what happens if…?” question you can test at home with water, a ramp or a paper airplane. Try it and write down the result.",
   "quiz": {
    "q": "What do you do at a hands-on science museum?",
    "opts": [
     "Only look through glass",
     "Touch and test the exhibits",
     "Sit quietly and read"
    ],
    "a": 1,
    "why": "Hands-on means you get to try the exhibits yourself."
   }
  },
  "es": {
   "name": "Discovery Center of Idaho",
   "hook": "Tócalo, constrúyelo, pruébalo: ¡un museo de ciencias para las manos!",
   "facts": [
    "El Discovery Center of Idaho es un museo de ciencias para tocar y experimentar, cerca del centro de Boise.",
    "La mayoría de las exhibiciones se hicieron para tocarlas, empujarlas, hacerlas girar y probarlas.",
    "Los científicos aprenden probando cosas y preguntando “¿qué pasa si…?”."
   ],
   "ask": "Piensa en una pregunta “¿qué pasa si…?” que puedas probar en casa con agua, una rampa o un avión de papel. Pruébala y anota el resultado.",
   "quiz": {
    "q": "¿Qué haces en un museo de ciencias donde se toca todo?",
    "opts": [
     "Solo miras a través del vidrio",
     "Tocas y pruebas las exhibiciones",
     "Te sientas en silencio a leer"
    ],
    "a": 1,
    "why": "Un museo donde se toca todo te deja probar las exhibiciones tú mismo."
   }
  }
 },
 {
  "id": "bogus",
  "cat": "do",
  "en": {
   "name": "Bogus Basin",
   "hook": "Snow, night skiing and a mountain roller coaster, close to town!",
   "facts": [
    "Bogus Basin is a mountain recreation area about 16 miles north of Boise. It is run by a nonprofit group.",
    "In winter people ski, snowboard and tube there. Many runs are lit up for skiing at night.",
    "In summer you can ride a mountain coaster and a scenic chairlift, and hike or bike the trails."
   ],
   "ask": "Draw your own mountain park: which rides, trails and snowy slopes would you add?",
   "quiz": {
    "q": "Bogus Basin is run by a nonprofit. What does that mean?",
    "opts": [
     "It is free for everyone",
     "It is run by the government",
     "It puts the money it earns back into the mountain"
    ],
    "a": 2,
    "why": "A nonprofit does not pay profits to owners. It reinvests in its mission."
   }
  },
  "es": {
   "name": "Bogus Basin",
   "hook": "¡Nieve, esquí de noche y una montaña rusa en la montaña, cerca de la ciudad!",
   "facts": [
    "Bogus Basin es una zona de recreación en la montaña, a unas 16 millas al norte de Boise. La maneja una organización sin fines de lucro.",
    "En invierno la gente esquía, practica snowboard y se desliza en tubos. Muchas pistas se iluminan para esquiar de noche.",
    "En verano puedes subirte a una montaña rusa de montaña y a un telesilla panorámico, y caminar o andar en bici por los senderos."
   ],
   "ask": "Dibuja tu propio parque de montaña: ¿qué juegos, senderos y pistas de nieve le pondrías?",
   "quiz": {
    "q": "Bogus Basin lo maneja una organización sin fines de lucro. ¿Qué significa eso?",
    "opts": [
     "Es gratis para todos",
     "Lo maneja el gobierno",
     "Usa el dinero que gana para mejorar la montaña"
    ],
    "a": 2,
    "why": "Una organización sin fines de lucro no reparte ganancias a dueños. Las reinvierte en su misión."
   }
  }
 },
 {
  "id": "steelheads",
  "cat": "do",
  "en": {
   "name": "Idaho Steelheads Hockey",
   "hook": "Real ice hockey, and a night when stuffed animals rain onto the ice!",
   "facts": [
    "The Idaho Steelheads play professional hockey in downtown Boise. They belong to a league called the ECHL.",
    "A steelhead is a real fish: a big, ocean-going rainbow trout that swims back to Idaho’s rivers.",
    "At the yearly Teddy Bear Toss game, fans throw stuffed toys onto the ice after the Steelheads score their first goal. The toys are given to kids through Toys for Tots."
   ],
   "ask": "Draw a hockey rink. Label the goals, the blue lines and the center line. Then try to spot them all at a game.",
   "quiz": {
    "q": "At the Teddy Bear Toss, what happens to the stuffed toys?",
    "opts": [
     "They are sold back to the fans",
     "They go home with the players",
     "They are given to kids through Toys for Tots"
    ],
    "a": 2,
    "why": "The toys are donated to the Marine Corps Toys for Tots program to help kids in the Treasure Valley."
   }
  },
  "es": {
   "name": "Hockey de los Idaho Steelheads",
   "hook": "¡Hockey sobre hielo de verdad y una noche en que llueven peluches sobre la pista!",
   "facts": [
    "Los Idaho Steelheads juegan hockey profesional en el centro de Boise. Forman parte de una liga llamada ECHL.",
    "Un steelhead es un pez de verdad: una trucha arcoíris grande que vive en el mar y regresa a los ríos de Idaho.",
    "En el partido anual Teddy Bear Toss, los fans lanzan peluches a la pista cuando los Steelheads anotan su primer gol. Los peluches se regalan a niños mediante Toys for Tots."
   ],
   "ask": "Dibuja una pista de hockey. Marca las porterías, las líneas azules y la línea del centro. Luego búscalas todas en un partido.",
   "quiz": {
    "q": "En el Teddy Bear Toss, ¿qué pasa con los peluches?",
    "opts": [
     "Se les venden de nuevo a los fans",
     "Se van a casa con los jugadores",
     "Se regalan a niños mediante Toys for Tots"
    ],
    "a": 2,
    "why": "Los peluches se donan al programa Toys for Tots de los Marines para ayudar a niños del Treasure Valley."
   }
  }
 },
 {
  "id": "floatriver",
  "cat": "do",
  "en": {
   "name": "Floating the Boise River",
   "hook": "A lazy summer day on a giant tube!",
   "facts": [
    "On summer days, lots of people float the Boise River on tubes and rafts. The classic float runs about 6 miles, from Barber Park to Ann Morrison Park.",
    "The trip takes about two to three hours. You drift past parks and under bridges, and you might see herons and ducks.",
    "The river is cold and can be fast. Idaho law says kids 14 and younger must wear a life jacket, and grown-ups should wear one too."
   ],
   "ask": "With a grown-up, make a safe-float list. What would you bring, like a life jacket and water shoes, and what would you leave at home?",
   "quiz": {
    "q": "In Idaho, who must wear a life jacket when floating the Boise River?",
    "opts": [
     "Kids 14 and younger",
     "Only people who cannot swim",
     "Nobody, it is just a good idea"
    ],
    "a": 0,
    "why": "Idaho law requires kids 14 and younger to wear one, and officials say everyone should."
   }
  },
  "es": {
   "name": "Flotar por el río Boise",
   "hook": "¡Un tranquilo día de verano en un flotador gigante!",
   "facts": [
    "En los días de verano, mucha gente flota por el río Boise en flotadores y balsas. El recorrido clásico mide unas 6 millas, desde Barber Park hasta Ann Morrison Park.",
    "El paseo dura de dos a tres horas. Pasas junto a parques y bajo puentes, y quizás veas garzas y patos.",
    "El río es frío y puede correr rápido. La ley de Idaho dice que los niños de 14 años o menos deben usar chaleco salvavidas, y los adultos también deberían ponérselo."
   ],
   "ask": "Con un adulto, haz una lista para flotar con seguridad. ¿Qué llevarías, como un chaleco salvavidas y zapatos de agua, y qué dejarías en casa?",
   "quiz": {
    "q": "En Idaho, ¿quién debe usar chaleco salvavidas al flotar por el río Boise?",
    "opts": [
     "Los niños de 14 años o menos",
     "Solo quienes no saben nadar",
     "Nadie, solo es una buena idea"
    ],
    "a": 0,
    "why": "La ley de Idaho exige chaleco salvavidas a los niños de 14 años o menos, y las autoridades dicen que todos deberían usarlo."
   }
  }
 },
 {
  "id": "potatodrop",
  "cat": "do",
  "en": {
   "name": "The Idaho Potato Drop",
   "hook": "On New Year’s Eve, Boise lowers a giant glowing potato!",
   "facts": [
    "Idaho is famous for potatoes, so Boise rings in the New Year with a giant glowing potato nicknamed the GlowTato.",
    "At midnight, a crane lowers the potato while fireworks light the sky.",
    "The event is free and open to all ages. It is held at the Idaho State Capitol in downtown Boise, and it began in 2013."
   ],
   "ask": "If your town had a New Year’s drop, what would you lower? Draw it.",
   "quiz": {
    "q": "What lowers the giant potato at midnight?",
    "opts": [
     "A rocket",
     "A hot-air balloon",
     "A crane"
    ],
    "a": 2,
    "why": "A crane lowers the glowing potato at midnight."
   }
  },
  "es": {
   "name": "La Caída de la Papa de Idaho",
   "hook": "¡En Nochevieja, Boise baja una papa gigante que brilla!",
   "facts": [
    "Idaho es famoso por sus papas, así que Boise recibe el Año Nuevo con una papa gigante que brilla, apodada GlowTato.",
    "A medianoche, una grúa baja la papa mientras los fuegos artificiales iluminan el cielo.",
    "El evento es gratis y para todas las edades. Se hace en el Capitolio del Estado de Idaho, en el centro de Boise, y empezó en 2013."
   ],
   "ask": "Si tu ciudad tuviera una caída de Año Nuevo, ¿qué bajarías? Dibújalo.",
   "quiz": {
    "q": "¿Qué baja la papa gigante a medianoche?",
    "opts": [
     "Un cohete",
     "Un globo aerostático",
     "Una grúa"
    ],
    "a": 2,
    "why": "Una grúa baja la papa brillante a medianoche."
   }
  }
 },
 {
  "id": "juliadavis",
  "cat": "do",
  "en": {
   "name": "Julia Davis Park",
   "hook": "A park with a zoo, museums, paddle boats and a walk through the planets!",
   "facts": [
    "Julia Davis Park is Boise’s oldest city park. Thomas Davis gave the land to the city in 1907 in memory of his wife, Julia.",
    "Zoo Boise and several museums are in or beside the park, and there are paddle boats on its pond.",
    "The Solar System Trail is a loop of about three-quarters of a mile. It shows the planets at a scale that lets you feel how far apart they are."
   ],
   "ask": "Walk the Solar System Trail with a grown-up. Guess which planet will be next, then count your steps between two of them.",
   "quiz": {
    "q": "Julia Davis Park was given to Boise in 1907. Whose memory does it honor?",
    "opts": [
     "A pioneer cowboy",
     "Thomas Davis’s wife, Julia",
     "A circus performer"
    ],
    "a": 1,
    "why": "Thomas Davis gave the land as a memorial to his wife, Julia."
   }
  },
  "es": {
   "name": "Julia Davis Park",
   "hook": "¡Un parque con zoológico, museos, botes de pedales y un paseo por los planetas!",
   "facts": [
    "Julia Davis Park es el parque de la ciudad más antiguo de Boise. Thomas Davis regaló el terreno a la ciudad en 1907 en memoria de su esposa, Julia.",
    "Zoo Boise y varios museos están dentro del parque o junto a él, y hay botes de pedales en su estanque.",
    "El Solar System Trail es un circuito de unas tres cuartas partes de una milla. Muestra los planetas a una escala que te deja sentir qué tan lejos están unos de otros."
   ],
   "ask": "Recorre el Solar System Trail con un adulto. Adivina cuál planeta sigue y cuenta tus pasos entre dos de ellos.",
   "quiz": {
    "q": "Julia Davis Park se regaló a Boise en 1907. ¿A quién recuerda?",
    "opts": [
     "A un vaquero pionero",
     "A Julia, la esposa de Thomas Davis",
     "A una artista de circo"
    ],
    "a": 1,
    "why": "Thomas Davis regaló el terreno en memoria de su esposa, Julia."
   }
  }
 },
 {
  "id": "greenbelt",
  "cat": "do",
  "en": {
   "name": "Boise River Greenbelt",
   "hook": "A leafy path that follows the river through town!",
   "facts": [
    "The Greenbelt is a tree-lined path of nearly 30 miles. It runs along both sides of the Boise River, from Lucky Peak to Eagle.",
    "Boise calls the parks along it the “Ribbon of Jewels.” Many, like Julia Davis Park and Ann Morrison Park, are named for local women.",
    "Look along the water for ducks, Canada geese and tall great blue herons."
   ],
   "ask": "Take a walk or a bike ride on the Greenbelt. Count how many different birds you spot and draw your favorite. Keep to the right and watch for bikes.",
   "quiz": {
    "q": "What is the “Ribbon of Jewels”?",
    "opts": [
     "Boise’s riverside parks linked by the Greenbelt",
     "A necklace in a museum",
     "A mountain trail"
    ],
    "a": 0,
    "why": "The Greenbelt is the “ribbon” that links Boise’s riverside parks, the “jewels.”"
   }
  },
  "es": {
   "name": "Boise River Greenbelt",
   "hook": "¡Un camino con árboles que sigue el río por la ciudad!",
   "facts": [
    "El Greenbelt es un camino con árboles de casi 30 millas. Recorre las dos orillas del río Boise, desde Lucky Peak hasta Eagle.",
    "Boise llama “Ribbon of Jewels” (Cinta de Joyas) a los parques que lo acompañan. Muchos, como Julia Davis Park y Ann Morrison Park, llevan nombres de mujeres de la zona.",
    "Mira junto al agua: verás patos, gansos canadienses y garzas azules altas."
   ],
   "ask": "Da un paseo o una vuelta en bici por el Greenbelt. Cuenta cuántas aves distintas ves y dibuja tu favorita. Ve por la derecha y cuidado con las bicis.",
   "quiz": {
    "q": "¿Qué es el “Ribbon of Jewels”?",
    "opts": [
     "Los parques junto al río de Boise unidos por el Greenbelt",
     "Un collar en un museo",
     "Un sendero de montaña"
    ],
    "a": 0,
    "why": "El Greenbelt es la “cinta” que une los parques del río de Boise, las “joyas”."
   }
  }
 },
 {
  "id": "blueturf",
  "cat": "do",
  "en": {
   "name": "The Blue Field at Boise State",
   "hook": "A football field that is blue, not green!",
   "facts": [
    "Boise State University’s football team is the Broncos, and they play on a bright blue field.",
    "The blue turf was installed in 1986. It was the first field in college football that was not green.",
    "Fans have nicknamed it the “Smurf Turf” and “Bronco Bluegrass.”"
   ],
   "ask": "Design your own team field with a color nobody uses. What would your team be called?",
   "quiz": {
    "q": "What made Boise State’s field special in 1986?",
    "opts": [
     "It was the first field that was not green",
     "It was the first indoor field",
     "It was the first field with seats"
    ],
    "a": 0,
    "why": "No college team had played on a field that was not green before."
   }
  },
  "es": {
   "name": "La cancha azul de Boise State",
   "hook": "¡Una cancha de fútbol americano azul, no verde!",
   "facts": [
    "El equipo de fútbol americano de Boise State University se llama los Broncos y juega en una cancha de un azul brillante.",
    "El césped azul se instaló en 1986. Fue la primera cancha del fútbol americano universitario que no era verde.",
    "Los fans la apodaron “Smurf Turf” y “Bronco Bluegrass”."
   ],
   "ask": "Diseña la cancha de tu equipo con un color que nadie use. ¿Cómo se llamaría tu equipo?",
   "quiz": {
    "q": "¿Qué hizo especial la cancha de Boise State en 1986?",
    "opts": [
     "Fue la primera cancha que no era verde",
     "Fue la primera cancha cubierta",
     "Fue la primera cancha con asientos"
    ],
    "a": 0,
    "why": "Ningún equipo universitario había jugado antes en una cancha que no fuera verde."
   }
  }
 },
 {
  "id": "surfwave",
  "cat": "do",
  "en": {
   "name": "Boise Whitewater Park",
   "hook": "Surfing and kayaking right in the city!",
   "facts": [
    "Boise Whitewater Park is built into the Boise River in Boise, next to Quinn’s Pond and Esther Simplot Park. Many people also call it Boise River Park.",
    "Its waves are built into the river and can be adjusted, so surfers and kayakers can ride them again and again.",
    "You can watch the tricks from a viewing plaza by the water."
   ],
   "ask": "Why does a wave stay in one spot while the river keeps moving? Make a guess and share it with a grown-up. Watch from the plaza. The river is not for wading.",
   "quiz": {
    "q": "A wave that stays in one place while water rushes through it is called…",
    "opts": [
     "A standing wave",
     "A tidal wave",
     "A heat wave"
    ],
    "a": 0,
    "why": "The water moves through, but a standing wave stays put, so surfers can ride it."
   }
  },
  "es": {
   "name": "Boise Whitewater Park",
   "hook": "¡Surf y kayak en plena ciudad!",
   "facts": [
    "Boise Whitewater Park está construido en el río Boise, en Boise, junto a Quinn’s Pond y Esther Simplot Park. Mucha gente también lo llama Boise River Park.",
    "Sus olas están hechas en el río y se pueden ajustar, así que surfistas y kayakistas pueden montarlas una y otra vez.",
    "Puedes ver las acrobacias desde una plaza junto al agua."
   ],
   "ask": "¿Por qué una ola se queda en un lugar mientras el río sigue corriendo? Haz una suposición y compártela con un adulto. Mira desde la plaza. El río no es para meterse a caminar.",
   "quiz": {
    "q": "Una ola que se queda en un solo lugar mientras el agua pasa a toda velocidad se llama…",
    "opts": [
     "Una ola estacionaria",
     "Un maremoto",
     "Una ola de calor"
    ],
    "a": 0,
    "why": "El agua pasa, pero la ola estacionaria se queda quieta, y por eso los surfistas pueden montarla."
   }
  }
 },
 {
  "id": "freakalley",
  "cat": "do",
  "en": {
   "name": "Freak Alley Gallery",
   "hook": "An alley turned into a giant art museum!",
   "facts": [
    "Freak Alley Gallery is a downtown Boise alley covered in murals, which are huge paintings on walls. It started in 2002.",
    "Boise calls it the largest outdoor mural gallery in the Northwest.",
    "Artists add new murals every year, so the alley keeps changing. It runs on donations and volunteers."
   ],
   "ask": "Design a mural for a wall at your school. What would it show, and what colors would you use?",
   "quiz": {
    "q": "Why does Freak Alley look different from year to year?",
    "opts": [
     "The alley moves to a new street",
     "Artists keep adding new murals",
     "The buildings are rebuilt each spring"
    ],
    "a": 1,
    "why": "New murals are painted every year, so the art keeps changing."
   }
  },
  "es": {
   "name": "Freak Alley Gallery",
   "hook": "¡Un callejón convertido en un museo de arte gigante!",
   "facts": [
    "Freak Alley Gallery es un callejón del centro de Boise cubierto de murales, que son pinturas enormes en las paredes. Empezó en 2002.",
    "Boise dice que es la galería de murales al aire libre más grande del noroeste.",
    "Cada año los artistas agregan murales nuevos, y por eso el callejón cambia siempre. Funciona con donaciones y voluntarios."
   ],
   "ask": "Diseña un mural para una pared de tu escuela. ¿Qué mostraría y qué colores usarías?",
   "quiz": {
    "q": "¿Por qué Freak Alley se ve distinto de un año a otro?",
    "opts": [
     "El callejón se muda a otra calle",
     "Los artistas siguen agregando murales nuevos",
     "Los edificios se reconstruyen cada primavera"
    ],
    "a": 1,
    "why": "Cada año se pintan murales nuevos, así que el arte siempre cambia."
   }
  }
 },
 {
  "id": "botanical",
  "cat": "do",
  "en": {
   "name": "Idaho Botanical Garden",
   "hook": "Gardens by day, and a sea of lights in winter!",
   "facts": [
    "The Idaho Botanical Garden has many kinds of gardens, including roses, plants native to Idaho, and a Children’s Adventure Garden with a treehouse and a willow tunnel.",
    "It sits right next to the Old Idaho Penitentiary, east of downtown.",
    "In winter the garden glows with holiday lights during Winter Garden aGlow."
   ],
   "ask": "Pick a plant in your yard or park. Draw it and write three words that describe it.",
   "quiz": {
    "q": "What historic place is right next to the Idaho Botanical Garden?",
    "opts": [
     "Boise Depot",
     "Old Idaho Penitentiary",
     "Basque Block"
    ],
    "a": 1,
    "why": "The garden is in the Old Penitentiary neighborhood, next to the Old Idaho Penitentiary."
   }
  },
  "es": {
   "name": "Idaho Botanical Garden",
   "hook": "¡Jardines de día y un mar de luces en invierno!",
   "facts": [
    "El Idaho Botanical Garden tiene muchos tipos de jardines, como rosas, plantas nativas de Idaho y un Jardín de Aventuras para niños con una casa del árbol y un túnel de sauces.",
    "Está justo al lado de la Old Idaho Penitentiary, al este del centro.",
    "En invierno el jardín brilla con luces navideñas durante Winter Garden aGlow."
   ],
   "ask": "Elige una planta de tu patio o de un parque. Dibújala y escribe tres palabras que la describan.",
   "quiz": {
    "q": "¿Qué lugar histórico está justo al lado del Idaho Botanical Garden?",
    "opts": [
     "La Boise Depot",
     "La Old Idaho Penitentiary",
     "El Basque Block"
    ],
    "a": 1,
    "why": "El jardín está en el barrio de la antigua penitenciaría, junto a la Old Idaho Penitentiary."
   }
  }
 },
 {
  "id": "oldpen",
  "cat": "history",
  "en": {
   "name": "Old Idaho Penitentiary",
   "hook": "A stone prison that is now a history museum!",
   "facts": [
    "The Old Idaho Penitentiary housed prisoners from 1872 until 1973, which is more than 100 years.",
    "Most of its buildings are sandstone that prisoners quarried from the foothills above the prison.",
    "Today it is a museum run by the Idaho State Historical Society. You can walk through the old buildings and learn how people lived and worked there long ago."
   ],
   "ask": "Look at a thick stone wall and a wooden door. Which materials last longer, and why do you think builders chose them?",
   "quiz": {
    "q": "What kind of stone were most Old Pen buildings made from?",
    "opts": [
     "Sandstone",
     "Marble",
     "Lava rock"
    ],
    "a": 0,
    "why": "Most of the buildings are sandstone from the nearby foothills."
   }
  },
  "es": {
   "name": "Old Idaho Penitentiary",
   "hook": "¡Una prisión de piedra que ahora es un museo de historia!",
   "facts": [
    "La Old Idaho Penitentiary tuvo prisioneros desde 1872 hasta 1973, o sea, más de 100 años.",
    "Casi todos sus edificios son de arenisca que los prisioneros sacaron de las colinas que están sobre la prisión.",
    "Hoy es un museo que maneja la Idaho State Historical Society. Puedes recorrer los edificios antiguos y aprender cómo vivía y trabajaba la gente allí hace mucho tiempo."
   ],
   "ask": "Mira una pared gruesa de piedra y una puerta de madera. ¿Cuál material dura más y por qué crees que los constructores lo eligieron?",
   "quiz": {
    "q": "¿De qué tipo de piedra eran casi todos los edificios de la Old Pen?",
    "opts": [
     "Arenisca",
     "Mármol",
     "Roca de lava"
    ],
    "a": 0,
    "why": "La mayoría de los edificios son de arenisca de las colinas cercanas."
   }
  }
 },
 {
  "id": "goldrush",
  "cat": "history",
  "en": {
   "name": "The Boise Basin Gold Rush",
   "hook": "Gold in the hills brought thousands of people in 1862!",
   "facts": [
    "Gold was found in the Boise Basin in August 1862. The Basin is in the mountains northeast of Boise.",
    "Thousands of miners rushed there. Idaho City grew so fast that, for a year or two, it had more people than Portland, Oregon.",
    "In July 1863 the U.S. Army built Fort Boise and the town of Boise City was founded. Boise merchants sold supplies to miners and travelers."
   ],
   "ask": "Imagine you are a miner in 1862. List five things you would pack, and what you would do if you found a nugget.",
   "quiz": {
    "q": "Which Boise Basin town grew so fast it was bigger than Portland for a year or two?",
    "opts": [
     "Lewiston",
     "Pocatello",
     "Idaho City"
    ],
    "a": 2,
    "why": "Idaho City was a booming gold town with more than 6,000 people."
   }
  },
  "es": {
   "name": "La fiebre del oro de Boise Basin",
   "hook": "¡El oro de las colinas trajo a miles de personas en 1862!",
   "facts": [
    "Encontraron oro en Boise Basin en agosto de 1862. La cuenca está en las montañas al noreste de Boise.",
    "Miles de mineros llegaron corriendo. Idaho City creció tan rápido que, durante uno o dos años, tuvo más gente que Portland, Oregón.",
    "En julio de 1863 el Ejército de EE. UU. construyó Fort Boise y se fundó la ciudad de Boise City. Los comerciantes de Boise vendían provisiones a mineros y viajeros."
   ],
   "ask": "Imagina que eres minero en 1862. Haz una lista de cinco cosas que empacarías y qué harías si encontraras una pepita.",
   "quiz": {
    "q": "¿Qué pueblo de Boise Basin creció tan rápido que fue más grande que Portland por uno o dos años?",
    "opts": [
     "Lewiston",
     "Pocatello",
     "Idaho City"
    ],
    "a": 2,
    "why": "Idaho City era un pueblo del oro en pleno auge, con más de 6,000 habitantes."
   }
  }
 },
 {
  "id": "celebration",
  "cat": "history",
  "en": {
   "name": "Celebration Park",
   "hook": "Throw an atlatl and find rock art that is thousands of years old!",
   "facts": [
    "Celebration Park is Idaho’s only archaeological park. It sits in the Snake River canyon southwest of Boise, near Melba.",
    "The rocks there have petroglyphs, which are pictures carved into stone long ago. Some are thousands of years old.",
    "The park has an atlatl range. An atlatl is an ancient tool that helps a person throw a dart much farther."
   ],
   "ask": "Invent three picture symbols that tell a story without words, then let a grown-up guess the story. At the real park, only look at the petroglyphs. Never touch them or draw near them.",
   "quiz": {
    "q": "What is an atlatl?",
    "opts": [
     "A tool for throwing darts",
     "A kind of canoe",
     "A musical drum"
    ],
    "a": 0,
    "why": "An atlatl is a spear-thrower. It helps a dart fly farther."
   }
  },
  "es": {
   "name": "Celebration Park",
   "hook": "¡Lanza un atlatl y encuentra arte en rocas de hace miles de años!",
   "facts": [
    "Celebration Park es el único parque arqueológico de Idaho. Está en el cañón del río Snake, al suroeste de Boise, cerca de Melba.",
    "Las rocas tienen petroglifos, que son dibujos grabados en la piedra hace mucho tiempo. Algunos tienen miles de años.",
    "El parque tiene un campo de atlatl. Un atlatl es una herramienta antigua que ayuda a lanzar un dardo mucho más lejos."
   ],
   "ask": "Inventa tres símbolos dibujados que cuenten una historia sin palabras y deja que un adulto adivine la historia. En el parque de verdad, solo mira los petroglifos. Nunca los toques ni dibujes cerca de ellos.",
   "quiz": {
    "q": "¿Qué es un atlatl?",
    "opts": [
     "Una herramienta para lanzar dardos",
     "Un tipo de canoa",
     "Un tambor musical"
    ],
    "a": 0,
    "why": "Un atlatl es un lanzador de lanzas. Ayuda a que un dardo vuele más lejos."
   }
  }
 },
 {
  "id": "boisename",
  "cat": "history",
  "en": {
   "name": "How Boise Got Its Name",
   "hook": "A French word for “wooded” became the name of a whole city!",
   "facts": [
    "Boise comes from a French word, boisé, which means “wooded.”",
    "French-Canadian fur trappers used the name for the Boise River in the early 1800s. Trees lined the river in dry country, so the name fit.",
    "A famous story says someone in Captain Bonneville’s party shouted “Les bois! Les bois!” (“The trees! The trees!”) in 1833. Historians say there is no proof, so it may be a legend."
   ],
   "ask": "Say “Boise” the way people in Idaho do, BOY-see. Then think of a place near you and guess how it got its name.",
   "quiz": {
    "q": "The name Boise comes from a French word meaning what?",
    "opts": [
     "Wooded",
     "Hot water",
     "Golden"
    ],
    "a": 0,
    "why": "Boisé is French for “wooded,” and trees line the Boise River."
   }
  },
  "es": {
   "name": "Cómo recibió su nombre Boise",
   "hook": "¡Una palabra francesa que significa “arbolado” se volvió el nombre de toda una ciudad!",
   "facts": [
    "Boise viene de una palabra francesa, boisé, que significa “arbolado”.",
    "Los tramperos canadienses franceses usaron ese nombre para el río Boise a principios del siglo XIX. Había árboles a lo largo del río en una tierra seca, y por eso el nombre le quedaba bien.",
    "Una historia famosa dice que alguien del grupo del capitán Bonneville gritó “¡Les bois! ¡Les bois!” (“¡Los árboles! ¡Los árboles!”) en 1833. Los historiadores dicen que no hay pruebas, así que puede ser una leyenda."
   ],
   "ask": "Di “Boise” como lo dicen en Idaho: BOI-si. Luego piensa en un lugar cercano a ti y adivina cómo recibió su nombre.",
   "quiz": {
    "q": "El nombre Boise viene de una palabra francesa que significa…",
    "opts": [
     "Arbolado",
     "Agua caliente",
     "Dorado"
    ],
    "a": 0,
    "why": "Boisé en francés quiere decir “arbolado”, y hay árboles a lo largo del río Boise."
   }
  },
  "photo": {
   "src": "img/places/boise.jpg",
   "credit": "Jyoni Shuler",
   "license": "CC BY-SA 4.0",
   "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
   "source": "https://commons.wikimedia.org/wiki/File:Boise,_Idaho.jpg"
  }
 },
 {
  "id": "capitol",
  "cat": "history",
  "en": {
   "name": "Idaho State Capitol",
   "hook": "A big stone building heated by hot water from underground!",
   "facts": [
    "The Idaho State Capitol was built from 1905 to 1912, and two wings were added in 1919 and 1920. Most of its stone is sandstone from Table Rock.",
    "Idaho’s lawmakers meet inside to make the state’s laws. A copper eagle covered in gold leaf stands on top of the dome.",
    "It is the only state capitol in the United States heated with geothermal hot water from deep underground."
   ],
   "ask": "The Capitol is open to visitors. Ask a grown-up to pick up the free scavenger-hunt booklet there. If you made one law for kids in Idaho, what would it be?",
   "quiz": {
    "q": "What makes Idaho’s Capitol different from every other state capitol?",
    "opts": [
     "It is made of ice",
     "It has no dome",
     "It is heated with hot water from underground"
    ],
    "a": 2,
    "why": "Idaho’s is the only state capitol in the country heated by geothermal water."
   }
  },
  "es": {
   "name": "Capitolio del Estado de Idaho",
   "hook": "¡Un gran edificio de piedra calentado con agua caliente de bajo tierra!",
   "facts": [
    "El Capitolio del Estado de Idaho se construyó de 1905 a 1912, y se le añadieron dos alas en 1919 y 1920. Casi toda su piedra es arenisca de Table Rock.",
    "Los legisladores de Idaho se reúnen adentro para hacer las leyes del estado. Un águila de cobre cubierta con hoja de oro está sobre la cúpula.",
    "Es el único capitolio estatal de Estados Unidos calentado con agua caliente geotérmica de lo profundo de la tierra."
   ],
   "ask": "El Capitolio está abierto a los visitantes. Pídele a un adulto que recoja allí el folleto gratis de búsqueda del tesoro. Si pudieras hacer una ley para los niños de Idaho, ¿cuál sería?",
   "quiz": {
    "q": "¿Qué hace diferente al Capitolio de Idaho de todos los demás capitolios estatales?",
    "opts": [
     "Está hecho de hielo",
     "No tiene cúpula",
     "Se calienta con agua caliente de bajo tierra"
    ],
    "a": 2,
    "why": "El de Idaho es el único capitolio estatal del país calentado con agua geotérmica."
   }
  }
 },
 {
  "id": "basque",
  "cat": "history",
  "en": {
   "name": "The Basque Block",
   "hook": "A little piece of Spain and France, right in downtown Boise!",
   "facts": [
    "The Basque people come from a mountain homeland between Spain and France. Many came to Idaho long ago, and many worked as sheepherders.",
    "Southwest Idaho has one of the biggest Basque communities in the United States.",
    "The Basque Block on Grove Street has a museum in a restored 1864 boardinghouse, a market, restaurants and a fronton, an indoor court for Basque ball games."
   ],
   "ask": "Ask a grown-up: where did our family come from before we lived here? Find it on the World Map.",
   "quiz": {
    "q": "What is a fronton?",
    "opts": [
     "An indoor court for Basque ball games",
     "A kind of sheep",
     "A Basque hat"
    ],
    "a": 0,
    "why": "A fronton is a court where people play Basque handball and similar games."
   }
  },
  "es": {
   "name": "El Basque Block",
   "hook": "¡Un pedacito de España y Francia en pleno centro de Boise!",
   "facts": [
    "El pueblo vasco viene de una tierra montañosa entre España y Francia. Muchos llegaron a Idaho hace mucho tiempo, y muchos trabajaron como pastores de ovejas.",
    "El suroeste de Idaho tiene una de las comunidades vascas más grandes de Estados Unidos.",
    "El Basque Block, en Grove Street, tiene un museo en una pensión restaurada de 1864, un mercado, restaurantes y un frontón, una cancha cubierta para juegos de pelota vascos."
   ],
   "ask": "Pregúntale a un adulto: ¿de dónde venía nuestra familia antes de vivir aquí? Búscalo en el Mapa del mundo.",
   "quiz": {
    "q": "¿Qué es un frontón?",
    "opts": [
     "Una cancha cubierta para juegos de pelota vascos",
     "Un tipo de oveja",
     "Un sombrero vasco"
    ],
    "a": 0,
    "why": "Un frontón es una cancha donde se juega pelota vasca y juegos parecidos."
   }
  }
 },
 {
  "id": "oregontrail",
  "cat": "history",
  "en": {
   "name": "The Oregon Trail",
   "hook": "Covered wagons rolled right through Idaho!",
   "facts": [
    "Starting in the 1840s, thousands of families traveled west by covered wagon on the Oregon Trail.",
    "Part of the trail crossed southern Idaho along the Snake River. Fort Boise, a trading post near present-day Parma, was a stop for food and supplies.",
    "The trip took about five months, and many people walked beside the wagons."
   ],
   "ask": "A wagon could carry only a few things. Pick five things you would bring for a trip of five months, and explain why.",
   "quiz": {
    "q": "Which river did the Oregon Trail follow through much of southern Idaho?",
    "opts": [
     "Mississippi River",
     "Snake River",
     "Colorado River"
    ],
    "a": 1,
    "why": "The trail followed the Snake River across southern Idaho."
   }
  },
  "es": {
   "name": "El Camino de Oregón",
   "hook": "¡Las carretas cubiertas pasaron justo por Idaho!",
   "facts": [
    "A partir de la década de 1840, miles de familias viajaron hacia el oeste en carretas cubiertas por el Camino de Oregón.",
    "Una parte del camino cruzaba el sur de Idaho, junto al río Snake. Fort Boise, un puesto de comercio cerca de la actual Parma, era una parada para conseguir comida y provisiones.",
    "El viaje duraba unos cinco meses, y mucha gente caminaba al lado de las carretas."
   ],
   "ask": "Una carreta solo podía cargar unas pocas cosas. Elige cinco cosas que llevarías para un viaje de cinco meses y explica por qué.",
   "quiz": {
    "q": "¿Qué río seguía el Camino de Oregón por gran parte del sur de Idaho?",
    "opts": [
     "El río Misisipi",
     "El río Snake",
     "El río Colorado"
    ],
    "a": 1,
    "why": "El camino seguía el río Snake a través del sur de Idaho."
   }
  }
 },
 {
  "id": "potatoes",
  "cat": "history",
  "en": {
   "name": "Idaho Potatoes and J. R. Simplot",
   "hook": "Idaho grows about a third of America’s potatoes!",
   "facts": [
    "Idaho grows more potatoes than any other state, about a third of all the potatoes grown in the country. Idaho license plates even say “Famous Potatoes.”",
    "J. R. Simplot built a business in Idaho. In 1967 his company agreed to supply frozen french fries to McDonald’s.",
    "The J. R. Simplot Company is still based in Boise."
   ],
   "ask": "Count the potatoes or potato foods at your next meal. How many different kinds can you find?",
   "quiz": {
    "q": "What food made J. R. Simplot famous when his company froze it and shipped it to McDonald’s?",
    "opts": [
     "Pizza dough",
     "Ice cream",
     "French fries"
    ],
    "a": 2,
    "why": "Simplot’s company supplied frozen french fries starting in 1967."
   }
  },
  "es": {
   "name": "Las papas de Idaho y J. R. Simplot",
   "hook": "¡Idaho cultiva cerca de un tercio de las papas de Estados Unidos!",
   "facts": [
    "Idaho cultiva más papas que cualquier otro estado, cerca de un tercio de todas las papas del país. Hasta las placas de los carros de Idaho dicen “Famous Potatoes” (Papas famosas).",
    "J. R. Simplot hizo crecer un negocio en Idaho. En 1967 su empresa acordó surtir papas fritas congeladas a McDonald’s.",
    "La J. R. Simplot Company todavía tiene su sede en Boise."
   ],
   "ask": "Cuenta las papas o los alimentos de papa en tu próxima comida. ¿Cuántos tipos distintos encuentras?",
   "quiz": {
    "q": "¿Qué alimento hizo famoso a J. R. Simplot cuando su empresa lo congeló y lo envió a McDonald’s?",
    "opts": [
     "Masa de pizza",
     "Helado",
     "Papas fritas"
    ],
    "a": 2,
    "why": "La empresa de Simplot empezó a surtir papas fritas congeladas en 1967."
   }
  }
 },
 {
  "id": "milmuseum",
  "cat": "history",
  "en": {
   "name": "Idaho Military History Museum",
   "hook": "Real armored vehicles and the stories of Idahoans in uniform!",
   "facts": [
    "The museum is next to Gowen Field in Boise. A nonprofit group opened it in 1995, and volunteers help run it.",
    "Armored vehicles sit in an outdoor yard. Indoor exhibits tell stories of Idaho soldiers, sailors and airmen.",
    "The exhibits cover more than 100 years of history, including Gowen Field in World War II."
   ],
   "ask": "The military needs more than fighters. Pick one job, like pilot, medic, cook or mechanic, and list the skills it takes.",
   "quiz": {
    "q": "What sits in the museum’s outdoor yard?",
    "opts": [
     "Sailboats",
     "Roller coasters",
     "Armored vehicles"
    ],
    "a": 2,
    "why": "Armored vehicles are parked in an outdoor yard at the museum."
   }
  },
  "es": {
   "name": "Idaho Military History Museum",
   "hook": "¡Vehículos blindados de verdad y las historias de personas de Idaho de uniforme!",
   "facts": [
    "El museo está junto a Gowen Field, en Boise. Un grupo sin fines de lucro lo abrió en 1995 y lo ayudan a manejar voluntarios.",
    "Hay vehículos blindados en un patio al aire libre. Las exhibiciones de adentro cuentan historias de soldados, marineros y aviadores de Idaho.",
    "Las exhibiciones cubren más de 100 años de historia, incluido Gowen Field en la Segunda Guerra Mundial."
   ],
   "ask": "El ejército necesita más que combatientes. Elige un trabajo, como piloto, médico, cocinero o mecánico, y haz una lista de las habilidades que se necesitan.",
   "quiz": {
    "q": "¿Qué hay en el patio al aire libre del museo?",
    "opts": [
     "Veleros",
     "Montañas rusas",
     "Vehículos blindados"
    ],
    "a": 2,
    "why": "Hay vehículos blindados estacionados en un patio al aire libre del museo."
   }
  }
 },
 {
  "id": "blackhistory",
  "cat": "history",
  "en": {
   "name": "Idaho Black History Museum",
   "hook": "A whole church was moved so it could become a museum!",
   "facts": [
    "The museum is in the old St. Paul Baptist Church, built in 1921. It was the first African American church in Idaho.",
    "In 1998 the whole church building was moved to the edge of Julia Davis Park. Its eight stained-glass windows were saved.",
    "The museum tells the stories of African Americans in Idaho, from the early 1800s to today."
   ],
   "ask": "With a grown-up, pick one person from Idaho history to learn about. Write down three things that person did.",
   "quiz": {
    "q": "What was the museum’s building before it was a museum?",
    "opts": [
     "A train station",
     "A church",
     "A fire station"
    ],
    "a": 1,
    "why": "The museum is in the former St. Paul Baptist Church."
   }
  },
  "es": {
   "name": "Idaho Black History Museum",
   "hook": "¡Movieron una iglesia entera para que fuera un museo!",
   "facts": [
    "El museo está en la antigua iglesia St. Paul Baptist Church, construida en 1921. Fue la primera iglesia afroamericana de Idaho.",
    "En 1998 trasladaron todo el edificio de la iglesia a la orilla del Julia Davis Park. Salvaron sus ocho vitrales.",
    "El museo cuenta las historias de los afroamericanos en Idaho, desde principios del siglo XIX hasta hoy."
   ],
   "ask": "Con un adulto, elige a una persona de la historia de Idaho para conocerla. Anota tres cosas que esa persona hizo.",
   "quiz": {
    "q": "¿Qué era el edificio del museo antes de ser museo?",
    "opts": [
     "Una estación de tren",
     "Una iglesia",
     "Una estación de bomberos"
    ],
    "a": 1,
    "why": "El museo está en la antigua iglesia St. Paul Baptist Church."
   }
  }
 },
 {
  "id": "annefrank",
  "cat": "history",
  "en": {
   "name": "Anne Frank Human Rights Memorial",
   "hook": "A quiet place by the river that is about treating people fairly.",
   "facts": [
    "Anne Frank was a girl who wrote a diary while her family hid during World War II. People all over the world still read it.",
    "The memorial in Boise opened in 2002. It has a life-size bronze statue of Anne Frank.",
    "It also has more than 60 quotes about human rights from leaders around the world, and the full text of the Universal Declaration of Human Rights."
   ],
   "ask": "Read one quote with a grown-up. What do you think it means? Then write your own sentence about treating people fairly.",
   "quiz": {
    "q": "What did Anne Frank write while she was in hiding?",
    "opts": [
     "A diary",
     "A cookbook",
     "A map"
    ],
    "a": 0,
    "why": "Anne Frank wrote a diary that people still read today."
   }
  },
  "es": {
   "name": "Anne Frank Human Rights Memorial",
   "hook": "Un lugar tranquilo junto al río sobre tratar a las personas con justicia.",
   "facts": [
    "Anne Frank fue una niña que escribió un diario mientras su familia se escondía durante la Segunda Guerra Mundial. En todo el mundo todavía se lee.",
    "El memorial de Boise abrió en 2002. Tiene una estatua de bronce de Anne Frank del tamaño de una persona.",
    "También tiene más de 60 citas sobre derechos humanos de líderes de todo el mundo y el texto completo de la Declaración Universal de los Derechos Humanos."
   ],
   "ask": "Lee una cita con un adulto. ¿Qué crees que significa? Luego escribe tu propia frase sobre tratar a las personas con justicia.",
   "quiz": {
    "q": "¿Qué escribió Anne Frank mientras estaba escondida?",
    "opts": [
     "Un diario",
     "Un libro de cocina",
     "Un mapa"
    ],
    "a": 0,
    "why": "Anne Frank escribió un diario que la gente todavía lee hoy."
   }
  }
 },
 {
  "id": "birdsofprey",
  "cat": "nature",
  "en": {
   "name": "World Center for Birds of Prey",
   "hook": "Falcons, eagles and owls, up close!",
   "facts": [
    "The World Center for Birds of Prey is in Boise. It is the home of The Peregrine Fund, a group that works to save raptors, which are birds that hunt.",
    "Peregrine falcons nearly disappeared because of a pesticide called DDT. The Peregrine Fund helped bring them back, and in 1999 the falcon came off the U.S. endangered species list.",
    "A peregrine can dive at about 200 miles an hour, which makes it the fastest bird in the world."
   ],
   "ask": "Spread your arms wide like a falcon’s wings. Measure your wingspan with a tape measure, then look up how wide an eagle’s is.",
   "quiz": {
    "q": "About how fast can a peregrine falcon dive?",
    "opts": [
     "About 60 miles per hour",
     "About 200 miles per hour",
     "About 600 miles per hour"
    ],
    "a": 1,
    "why": "Peregrines dive on their prey at about 200 miles an hour, the fastest of any bird."
   }
  },
  "es": {
   "name": "World Center for Birds of Prey",
   "hook": "¡Halcones, águilas y búhos, de cerca!",
   "facts": [
    "El World Center for Birds of Prey está en Boise. Es la sede de The Peregrine Fund, un grupo que trabaja para salvar a las aves rapaces, que son aves que cazan.",
    "Los halcones peregrinos casi desaparecieron por un pesticida llamado DDT. The Peregrine Fund ayudó a recuperarlos y en 1999 el halcón salió de la lista de especies en peligro de EE. UU.",
    "Un halcón peregrino puede lanzarse en picada a unas 200 millas por hora, y por eso es el ave más rápida del mundo."
   ],
   "ask": "Abre los brazos como las alas de un halcón. Mide tu envergadura con una cinta métrica y luego averigua qué tan ancha es la de un águila.",
   "quiz": {
    "q": "¿A qué velocidad, más o menos, puede lanzarse en picada un halcón peregrino?",
    "opts": [
     "A unas 60 millas por hora",
     "A unas 200 millas por hora",
     "A unas 600 millas por hora"
    ],
    "a": 1,
    "why": "Los peregrinos se lanzan sobre sus presas a unas 200 millas por hora, la mayor velocidad de cualquier ave."
   }
  }
 },
 {
  "id": "albertson",
  "cat": "nature",
  "en": {
   "name": "Kathryn Albertson Park",
   "hook": "A quiet city park made for wildlife, with owls, turtles and beavers!",
   "facts": [
    "Kathryn Albertson Park is a 41-acre park near downtown Boise. It was made to give wild animals a home in the city.",
    "Ducks, herons, owls, turtles, bullfrogs and beavers live or visit there.",
    "Joe and Kathryn Albertson gave the park to Boise in 1989. It is one of the “Ribbon of Jewels” parks."
   ],
   "ask": "Visit at sunrise or sunset, when animals are most active. Sit still for five minutes and list every animal you see or hear. Stay on the path and watch from a distance.",
   "quiz": {
    "q": "Why was Kathryn Albertson Park made?",
    "opts": [
     "To race bikes",
     "To launch boats",
     "To give wildlife a home in the city"
    ],
    "a": 2,
    "why": "The park was designed as a home for resident and migrating wildlife in the city."
   }
  },
  "es": {
   "name": "Kathryn Albertson Park",
   "hook": "¡Un tranquilo parque de la ciudad hecho para la vida silvestre, con búhos, tortugas y castores!",
   "facts": [
    "Kathryn Albertson Park es un parque de 41 acres cerca del centro de Boise. Se hizo para darles hogar a los animales silvestres en la ciudad.",
    "Allí viven o visitan patos, garzas, búhos, tortugas, ranas toro y castores.",
    "Joe y Kathryn Albertson regalaron el parque a Boise en 1989. Es uno de los parques del “Ribbon of Jewels”."
   ],
   "ask": "Visítalo al amanecer o al atardecer, cuando los animales están más activos. Quédate quieto cinco minutos y haz una lista de cada animal que veas o escuches. Quédate en el camino y mira desde lejos.",
   "quiz": {
    "q": "¿Por qué se hizo Kathryn Albertson Park?",
    "opts": [
     "Para hacer carreras de bicis",
     "Para lanzar botes",
     "Para darles hogar a los animales silvestres en la ciudad"
    ],
    "a": 2,
    "why": "El parque se diseñó como hogar para la vida silvestre residente y migratoria en la ciudad."
   }
  }
 },
 {
  "id": "hagerman",
  "cat": "nature",
  "en": {
   "name": "Hagerman Fossil Beds (a day trip)",
   "hook": "Dig into the story of an ancient horse, Idaho’s state fossil!",
   "facts": [
    "Hagerman Fossil Beds National Monument is in south-central Idaho, near the town of Hagerman. It is a day trip from Boise.",
    "It is most famous for the Hagerman Horse, Idaho’s state fossil. Scientists dug up more than 100 horse skulls and about 20 nearly complete skeletons there.",
    "The fossil layers are more than 3 million years old. A well-preserved piece of the Oregon Trail is in the monument too."
   ],
   "ask": "Look up a picture of the Hagerman Horse. Which animal alive today does it look like? Draw it. At the monument, stay on the marked trails.",
   "quiz": {
    "q": "What is Idaho’s state fossil?",
    "opts": [
     "Hagerman Horse",
     "Woolly mammoth",
     "Tyrannosaurus rex"
    ],
    "a": 0,
    "why": "The Hagerman Horse is the Idaho state fossil."
   }
  },
  "es": {
   "name": "Hagerman Fossil Beds (un viaje de un día)",
   "hook": "¡Descubre la historia de un caballo antiguo, el fósil del estado de Idaho!",
   "facts": [
    "El Hagerman Fossil Beds National Monument está en el centro-sur de Idaho, cerca del pueblo de Hagerman. Es un viaje de un día desde Boise.",
    "Es famoso sobre todo por el Caballo de Hagerman, el fósil del estado de Idaho. Allí los científicos desenterraron más de 100 cráneos de caballo y unos 20 esqueletos casi completos.",
    "Las capas de fósiles tienen más de 3 millones de años. El monumento también tiene un tramo bien conservado del Camino de Oregón."
   ],
   "ask": "Busca una foto del Caballo de Hagerman. ¿A qué animal de hoy se parece? Dibújalo. En el monumento, quédate en los senderos marcados.",
   "quiz": {
    "q": "¿Cuál es el fósil del estado de Idaho?",
    "opts": [
     "El Caballo de Hagerman",
     "El mamut lanudo",
     "El Tyrannosaurus rex"
    ],
    "a": 0,
    "why": "El Caballo de Hagerman es el fósil del estado de Idaho."
   }
  }
 },
 {
  "id": "mknature",
  "cat": "nature",
  "en": {
   "name": "MK Nature Center",
   "hook": "Watch fish swim through underwater windows!",
   "facts": [
    "The MK Nature Center is a free park and visitor center run by Idaho Fish and Game. It sits along the Greenbelt near downtown Boise.",
    "A stream walk has underwater windows where you can watch fish swimming.",
    "Inside, a glass beehive lets you watch bees at work. The “MK” honors Morrison-Knudsen, a Boise company that helped pay for the center."
   ],
   "ask": "Sit quietly next to water for two minutes. How many living things can you spot or hear?",
   "quiz": {
    "q": "Which of these can you do at the MK Nature Center?",
    "opts": [
     "Ride a mountain coaster",
     "Watch fish through underwater windows",
     "See penguins"
    ],
    "a": 1,
    "why": "Underwater windows along the stream walk let you see fish."
   }
  },
  "es": {
   "name": "MK Nature Center",
   "hook": "¡Mira peces nadar a través de ventanas bajo el agua!",
   "facts": [
    "El MK Nature Center es un parque y centro de visitantes gratis que maneja Idaho Fish and Game. Está junto al Greenbelt, cerca del centro de Boise.",
    "Un paseo junto al arroyo tiene ventanas bajo el agua donde puedes ver peces nadando.",
    "Adentro, una colmena de vidrio te deja ver a las abejas trabajar. La “MK” honra a Morrison-Knudsen, una empresa de Boise que ayudó a pagar el centro."
   ],
   "ask": "Siéntate en silencio junto al agua dos minutos. ¿Cuántos seres vivos puedes ver o escuchar?",
   "quiz": {
    "q": "¿Cuál de estas cosas puedes hacer en el MK Nature Center?",
    "opts": [
     "Subirte a una montaña rusa de montaña",
     "Ver peces por ventanas bajo el agua",
     "Ver pingüinos"
    ],
    "a": 1,
    "why": "Las ventanas bajo el agua junto al arroyo te dejan ver peces."
   }
  }
 },
 {
  "id": "tablerock",
  "cat": "nature",
  "en": {
   "name": "Table Rock",
   "hook": "A flat-topped rock with a view of the whole valley!",
   "facts": [
    "Table Rock is a flat-topped sandstone mesa above Boise. A popular trail starts near the Old Idaho Penitentiary and climbs to the top.",
    "Prisoners from the Old Idaho Penitentiary quarried sandstone from Table Rock. It was used to build the prison and most of the Idaho State Capitol.",
    "Table Rock is sacred to several Native American tribes. From the top you can look out over the Boise Valley."
   ],
   "ask": "Look at a hill from far away, then draw how it might look from the top. If you hike it with a grown-up, start early. The trail is steep, and the mesa closes at sunset.",
   "quiz": {
    "q": "Which Boise building was made mostly from Table Rock sandstone?",
    "opts": [
     "A ski lodge at Bogus Basin",
     "Boise State’s football field",
     "The Idaho State Capitol"
    ],
    "a": 2,
    "why": "Most of the Capitol’s stone came from the Table Rock quarry."
   }
  },
  "es": {
   "name": "Table Rock",
   "hook": "¡Una roca de cima plana con vista a todo el valle!",
   "facts": [
    "Table Rock es una mesa de arenisca de cima plana sobre Boise. Un sendero popular empieza cerca de la Old Idaho Penitentiary y sube hasta la cima.",
    "Los prisioneros de la Old Idaho Penitentiary sacaron arenisca de Table Rock. Se usó para construir la prisión y casi todo el Capitolio del Estado de Idaho.",
    "Table Rock es sagrada para varias tribus nativas americanas. Desde la cima puedes mirar todo el valle de Boise."
   ],
   "ask": "Mira una colina desde lejos y luego dibuja cómo se vería desde arriba. Si la subes con un adulto, empieza temprano. El sendero es empinado y la mesa cierra al atardecer.",
   "quiz": {
    "q": "¿Qué edificio de Boise se hizo casi todo con arenisca de Table Rock?",
    "opts": [
     "Una cabaña de esquí en Bogus Basin",
     "La cancha de fútbol americano de Boise State",
     "El Capitolio del Estado de Idaho"
    ],
    "a": 2,
    "why": "Casi toda la piedra del Capitolio vino de la cantera de Table Rock."
   }
  }
 },
 {
  "id": "camelsback",
  "cat": "nature",
  "en": {
   "name": "Camel’s Back Park and the Foothills",
   "hook": "A hill shaped like a camel’s hump!",
   "facts": [
    "Camel’s Back Park is a city park at the base of a hill that looks like a camel’s hump.",
    "It is a starting point for many trails in the Boise Foothills. The Ridge to Rivers system has nearly 200 miles of trails for hiking and biking.",
    "The foothills are green in spring and dry and golden in summer."
   ],
   "ask": "Take a hike or a nature walk with a grown-up. Stay on the trail, bring water, and write down three animal tracks or signs. If the trail is muddy and sticks to your shoes, turn around.",
   "quiz": {
    "q": "What is Ridge to Rivers?",
    "opts": [
     "A river rafting company",
     "A ski run at Bogus Basin",
     "A system of nearly 200 miles of Foothills trails"
    ],
    "a": 2,
    "why": "Ridge to Rivers is the trail system that covers the Boise Foothills."
   }
  },
  "es": {
   "name": "Camel’s Back Park y las Foothills",
   "hook": "¡Una colina con forma de joroba de camello!",
   "facts": [
    "Camel’s Back Park es un parque de la ciudad al pie de una colina que parece la joroba de un camello.",
    "Es un punto de partida para muchos senderos de las Boise Foothills. El sistema Ridge to Rivers tiene casi 200 millas de senderos para caminar y andar en bici.",
    "Las colinas están verdes en primavera y secas y doradas en verano."
   ],
   "ask": "Da una caminata o un paseo por la naturaleza con un adulto. Quédate en el sendero, lleva agua y anota tres huellas o señales de animales. Si el sendero está lodoso y se te pega a los zapatos, regrésate.",
   "quiz": {
    "q": "¿Qué es Ridge to Rivers?",
    "opts": [
     "Una empresa de balsas en el río",
     "Una pista de esquí en Bogus Basin",
     "Un sistema de casi 200 millas de senderos de las Foothills"
    ],
    "a": 2,
    "why": "Ridge to Rivers es el sistema de senderos que cubre las Boise Foothills."
   }
  }
 },
 {
  "id": "luckypeak",
  "cat": "nature",
  "en": {
   "name": "Lucky Peak Lake",
   "hook": "A big blue lake in the hills, minutes from the city!",
   "facts": [
    "Lucky Peak Lake is a reservoir about 10 miles upstream of Boise. It is a lake made by a dam on the Boise River.",
    "The U.S. Army Corps of Engineers built the dam in the 1950s. It helps control floods, stores water for farms and makes electricity.",
    "People boat, fish and paddle there in summer. The water is cold and deep, so wear a life jacket."
   ],
   "ask": "What is a reservoir? Draw how a dam holds water behind it.",
   "quiz": {
    "q": "What jobs does Lucky Peak Dam do besides making a lake for fun?",
    "opts": [
     "It heats the Capitol",
     "It helps control floods and saves water for farms",
     "It makes snow for Bogus Basin"
    ],
    "a": 1,
    "why": "The dam holds back floodwater and stores water for farms. It also makes electricity."
   }
  },
  "es": {
   "name": "Lucky Peak Lake",
   "hook": "¡Un gran lago azul entre las colinas, a pocos minutos de la ciudad!",
   "facts": [
    "Lucky Peak Lake es un embalse a unas 10 millas río arriba de Boise. Es un lago formado por una presa en el río Boise.",
    "El Cuerpo de Ingenieros del Ejército de EE. UU. construyó la presa en la década de 1950. Ayuda a controlar las inundaciones, guarda agua para las granjas y produce electricidad.",
    "En verano la gente navega, pesca y rema allí. El agua es fría y profunda, así que usa chaleco salvavidas."
   ],
   "ask": "¿Qué es un embalse? Dibuja cómo una presa retiene el agua detrás de ella.",
   "quiz": {
    "q": "¿Qué trabajos hace la presa de Lucky Peak además de formar un lago para divertirse?",
    "opts": [
     "Calienta el Capitolio",
     "Ayuda a controlar inundaciones y guarda agua para las granjas",
     "Hace nieve para Bogus Basin"
    ],
    "a": 1,
    "why": "La presa detiene el agua de las inundaciones y guarda agua para las granjas. También produce electricidad."
   }
  }
 }
];
