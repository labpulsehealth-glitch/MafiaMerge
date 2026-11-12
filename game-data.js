/* MafiaMerge item catalog. Items are fictional game collectibles; no real-world construction instructions. */
window.MafiaData = {
  dessert: {
    title:"DESSERT HOUSE", board:"DESSERT MERGE BOARD", cost:5,
    items:[
      {id:"cocoa",name:"Cocoa Square",icon:"🍫",family:"chocolate",tier:1},{id:"truffle",name:"Velvet Truffle",icon:"🍬",family:"chocolate",tier:2},{id:"bonbon",name:"Gold Bonbon",icon:"🍮",family:"chocolate",tier:3},{id:"chocbox",name:"Truffle Gift Box",icon:"🎁",family:"chocolate",tier:4},
      {id:"cookie",name:"Butter Cookie",icon:"🍪",family:"pastry",tier:1},{id:"croissant",name:"Golden Croissant",icon:"🥐",family:"pastry",tier:2},{id:"danish",name:"Berry Danish",icon:"🥮",family:"pastry",tier:3},{id:"pastrybox",name:"Pastry Selection",icon:"🧁",family:"pastry",tier:4},
      {id:"cupcake",name:"Vanilla Cupcake",icon:"🧁",family:"cake",tier:1},{id:"slice",name:"Velvet Cake Slice",icon:"🍰",family:"cake",tier:2},{id:"cake",name:"Celebration Cake",icon:"🎂",family:"cake",tier:3},{id:"royalcake",name:"Royal Celebration Cake",icon:"👑",family:"cake",tier:4},
      {id:"juice",name:"Fresh Juice",icon:"🧃",family:"drink",tier:1},{id:"coffee",name:"Café Mocha",icon:"☕",family:"drink",tier:2},{id:"milkshake",name:"Signature Shake",icon:"🥤",family:"drink",tier:3},{id:"drinkset",name:"Luxury Drink Set",icon:"🍹",family:"drink",tier:4}
    ],
    starter:["cocoa","cocoa","cookie","cookie","cupcake","cupcake","juice","juice","cocoa","cookie","cupcake","juice"],
    orderPool:[["truffle",145,"A guest wants a box of velvet truffles."],["slice",110,"A regular ordered a velvet cake slice."],["croissant",95,"The café needs a fresh golden croissant."],["coffee",105,"Prepare a café mocha for a VIP customer."],["bonbon",190,"A collector requested a gold bonbon."],["cake",240,"A family celebration needs a cake."]]
  },
  weapons: {
    title:"ARMORY", board:"ARMORY COLLECTION BOARD", cost:8,
    items:[
      {id:"knife",name:"Collector Knife",icon:"🗡️",family:"blades",tier:1},{id:"dagger",name:"Ceremonial Dagger",icon:"⚔️",family:"blades",tier:2},{id:"sabre",name:"Antique Sabre",icon:"🗡️",family:"blades",tier:3},{id:"sword",name:"Heirloom Sword",icon:"⚔️",family:"blades",tier:4},
      {id:"bow",name:"Display Bow",icon:"🏹",family:"archery",tier:1},{id:"arrows",name:"Arrow Set",icon:"➶",family:"archery",tier:2},{id:"longbow",name:"Longbow Relic",icon:"🏹",family:"archery",tier:3},{id:"archeryset",name:"Master Archer Set",icon:"🎯",family:"archery",tier:4},
      {id:"pistol",name:"Vintage Sidearm",icon:"🔫",family:"firearms",tier:1},{id:"case",name:"Collector Case",icon:"🧰",family:"firearms",tier:2},{id:"rifle",name:"Heritage Rifle",icon:"🎯",family:"firearms",tier:3},{id:"vaultcase",name:"Vault Collection",icon:"💼",family:"firearms",tier:4},
      {id:"vest",name:"Protective Vest",icon:"🦺",family:"gear",tier:1},{id:"helmet",name:"Armoured Helmet",icon:"🪖",family:"gear",tier:2},{id:"shield",name:"Display Shield",icon:"🛡️",family:"gear",tier:3},{id:"guardset",name:"Elite Guard Set",icon:"🏅",family:"gear",tier:4}
    ],
    starter:["knife","knife","bow","bow","pistol","pistol","vest","vest","knife","bow","pistol","vest"],
    orderPool:[["dagger",175,"A collector is looking for a ceremonial dagger."],["arrows",125,"Prepare an arrow set for the display room."],["case",160,"A client requested a collector case."],["helmet",135,"The guard collection needs an armoured helmet."],["sabre",220,"An antique sabre has been requested."],["shield",210,"A display shield is needed for the gallery."]]
  }
};
