
(() => {
  const $ = id => document.getElementById(id);
  const data = window.MafiaData;

  const customers = [
    {id:"don",name:"Don Alessandro",role:"Rival mafia don",business:"weapons",portrait:"♛",special:true,dialogue:"I hear your family is rebuilding. Let us see what you can offer."},
    {id:"officer",name:"Officer Elena",role:"Police officer",business:"dessert",portrait:"E",special:false,dialogue:"Just a little something for the station. Nothing unusual, I hope."},
    {id:"child",name:"Sofia",role:"Young visitor",business:"dessert",portrait:"S",special:false,dialogue:"Could I please have something sweet?"},
    {id:"marcus",name:"Marcus Vale",role:"Private collector",business:"weapons",portrait:"M",special:false,dialogue:"I am looking for something rare for my collection."},
    {id:"lady",name:"Lady Vivienne",role:"Wealthy benefactor",business:"dessert",portrait:"V",special:true,dialogue:"I have heard wonderful things about your establishment."},
    {id:"victor",name:"Victor Moretti",role:"Family adviser",business:"weapons",portrait:"V",special:true,dialogue:"The family needs quality. Do not disappoint me."}
  ];

  const gifts = [
    {id:"welcome",name:"Welcome to Bellavita",icon:"🎁",desc:"A welcome package.",energy:50,coins:500,gems:5},
    {id:"energy",name:"Energy Reserve",icon:"⚡",desc:"A generous energy refill.",energy:100},
    {id:"pink",name:"Pink Diamond Box",icon:"💎",desc:"A beautiful premium gift.",gems:20},
    {id:"founder",name:"Founder's Gift",icon:"👑",desc:"A gift for rebuilding the empire.",coins:1500,gems:15},
    {id:"midnight",name:"Midnight Delivery",icon:"🌙",desc:"A mysterious delivery.",energy:40,coins:700},
    {id:"lucky",name:"Lucky Envelope",icon:"💌",desc:"A little unexpected fortune.",coins:1000,gems:8},
    {id:"royal",name:"Royal Surprise",icon:"🎀",desc:"An exclusive surprise.",gems:35,coins:1200},
    {id:"gold",name:"Golden Chest",icon:"🏆",desc:"A magnificent reward.",energy:80,coins:2000,gems:25},
    {id:"district",name:"District Welcome",icon:"🏛️",desc:"The district recognises your return.",coins:900,gems:10},
    {id:"vip",name:"VIP Gift",icon:"💝",desc:"A rare visitor's generous gift.",energy:100,coins:2500,gems:50}
  ];

  const GENERATOR_ID = "board-generator";
  const GENERATOR_COST = 5;
  const GENERATOR_MAX_CHARGES = 5;
  const GENERATOR_RECHARGE_MS = 30000;
  const GIFT_OPEN_MS = 10000;

  const state = {
    energy:200,maxEnergy:200,coins:1500,gems:50,
    active:"dessert",
    boards:{dessert:[],weapons:[]},
    board:[],
    orders:{dessert:[],weapons:[]},
    discoveries:{dessert:[],weapons:[]},
    giftList:[],
    customerVisits:{},
    selectedGift:null,
    nextOrderId:1,
    nextGiftId:1
  };

  let touchSource = null;
  let pointerStart = null;

  function toast(message){
    const el=$("toast");
    el.textContent=message;
    el.classList.add("show");
    setTimeout(()=>el.classList.remove("show"),2400);
  }

  function save(){
    state.board = state.boards[state.active];
    localStorage.setItem("mafiamerge-save-v3",JSON.stringify(state));
  }

  function load(){
    try{
      let saved=JSON.parse(localStorage.getItem("mafiamerge-save-v3"));

      // Migrate the previous save version if necessary.
      if(!saved){
        const old=JSON.parse(localStorage.getItem("mafiamerge-save-v2"));
        if(old){
          saved=old;
          saved.boards={dessert:old.board||[],weapons:[]};
          saved.orders={dessert:[],weapons:[]};
        }
      }

      if(saved) Object.assign(state,saved);
    }catch(e){
      console.warn("Save could not be loaded.",e);
    }

    if(!state.boards)state.boards={dessert:[],weapons:[]};
    if(!state.orders)state.orders={dessert:[],weapons:[]};
    if(!state.discoveries)state.discoveries={dessert:[],weapons:[]};
    if(!state.giftList)state.giftList=[];
    if(!state.customerVisits)state.customerVisits={};
    if(!state.nextOrderId)state.nextOrderId=1;
    if(!state.nextGiftId)state.nextGiftId=1;
  }

  function catalog(){
    return data[state.active];
  }

  function getItem(id){
    return catalog().items.find(x=>x.id===id);
  }

  function board(){
    return state.boards[state.active];
  }

  function emptyBoard(){
    return Array(25).fill(null);
  }

  function updateStats(){
    $("energy-value").textContent=state.energy+" / "+state.maxEnergy;
    $("energy-fill").style.width=(state.energy/state.maxEnergy*100)+"%";
    $("cash-value").textContent=state.coins.toLocaleString();
    $("gem-value").textContent="💎 "+state.gems;
    $("gift-count").textContent=state.giftList.length;
  }

  function addGift(id){
    const gift=gifts.find(g=>g.id===id);
    if(!gift)return;

    state.giftList.push({
      ...gift,
      uid:"gift-"+(state.nextGiftId++)
    });

    updateStats();
    save();
  }

  function nextItem(id){
    const current=getItem(id);
    if(!current)return null;

    return catalog().items.find(x=>
      x.family===current.family &&
      x.tier===current.tier+1
    );
  }

  function starterItem(){
    const starters=catalog().starter;
    return starters[Math.floor(Math.random()*starters.length)];
  }

  function buildBoard(){
    const starters=catalog().starter;
    const current=state.boards[state.active];

    if(Array.isArray(current)&&current.length===25){
      renderBoard();
      return;
    }

    const fresh=emptyBoard();
    const positions=[0,1,3,4,6,7,10,11,13,14,16,17];

    positions.forEach((p,i)=>{
      fresh[p]=starters[i%starters.length];
    });

    // The generator occupies its own board space.
    fresh[24]={
      type:"generator",
      charges:GENERATOR_MAX_CHARGES,
      readyAt:0
    };

    state.boards[state.active]=fresh;
    renderBoard();
    save();
  }

  function findEmptyCell(){
    return board().findIndex(cell=>cell===null);
  }

  function spawnItem(id){
    const empty=findEmptyCell();

    if(empty<0){
      toast("Your board is full. Make some space first.");
      return false;
    }

    board()[empty]=id;

    if(!state.discoveries[state.active].includes(id)){
      state.discoveries[state.active].push(id);
      const item=getItem(id);
      if(item)toast("New discovery: "+item.name);
    }

    return true;
  }

  function renderBoard(){
    const el=$("merge-board");
    if(!el)return;

    el.innerHTML="";

    board().forEach((cell,index)=>{
      const node=document.createElement("div");
      node.className="merge-cell"+(!cell?" empty":"");
      node.dataset.index=index;

      if(typeof cell==="string"){
        const item=getItem(cell);

        if(item){
          node.innerHTML=
            `<span class="item-icon">${item.icon}</span>
             <span class="item-name">${item.name}</span>`;
          node.draggable=true;
          node.addEventListener("dragstart",e=>{
            e.dataTransfer.setData("text/plain",String(index));
            node.classList.add("dragging");
          });
          node.addEventListener("dragend",()=>node.classList.remove("dragging"));
        }
      }

      if(cell&&typeof cell==="object"&&cell.type==="generator"){
        const cooling=cell.readyAt>Date.now();
        const remaining=Math.max(0,Math.ceil((cell.readyAt-Date.now())/1000));

        node.classList.add("generator-cell");
        node.innerHTML=
          `<span class="item-icon">🏭</span>
           <span class="item-name">ITEM GENERATOR</span>
           <span class="generator-charge">${cooling?remaining+"s":cell.charges+" charges"}</span>`;
      }

      if(cell&&typeof cell==="object"&&cell.type==="gift"){
        const opening=cell.openingUntil>Date.now();
        const remaining=Math.max(0,Math.ceil((cell.openingUntil-Date.now())/1000));

        node.classList.add("gift-board-cell");
        if(opening)node.classList.add("gift-opening");

        node.innerHTML=
          `<span class="item-icon">${opening?"⏳":cell.icon}</span>
           <span class="item-name">${opening?"OPENING...":cell.name}</span>
           <span class="gift-timer">${opening?remaining+"s":"TAP TO OPEN"}</span>`;
      }

      node.addEventListener("dragover",e=>e.preventDefault());
      node.addEventListener("drop",e=>{
        e.preventDefault();
        const from=Number(e.dataTransfer.getData("text/plain"));
        moveItem(from,index);
      });

      node.addEventListener("pointerdown",e=>{
        if(!cell||typeof cell!=="string")return;
        touchSource=index;
        pointerStart={x:e.clientX,y:e.clientY};
        node.classList.add("dragging");
      });

      node.addEventListener("pointerup",e=>{
        if(touchSource===null)return;

        const from=touchSource;
        const start=pointerStart;
        touchSource=null;
        pointerStart=null;

        const target=document.elementFromPoint(e.clientX,e.clientY);
        const destination=target?.closest(".merge-cell");
        const to=destination?Number(destination.dataset.index):from;

        node.classList.remove("dragging");

        if(start&&Math.abs(e.clientX-start.x)+Math.abs(e.clientY-start.y)<12){
          if(to===from)activateBoardCell(from);
          return;
        }

        moveItem(from,to);
      });

      node.addEventListener("pointercancel",()=>{
        touchSource=null;
        pointerStart=null;
        node.classList.remove("dragging");
      });

      node.addEventListener("click",()=>{
        if(cell&&typeof cell==="object")activateBoardCell(index);
      });

      el.appendChild(node);
    });

    renderOrders();
    updateGeneratorLabel();
  }

  function activateBoardCell(index){
    const cell=board()[index];
    if(!cell||typeof cell!=="object")return;

    if(cell.type==="generator"){
      useGenerator(index);
    }else if(cell.type==="gift"){
      openGiftBox(index);
    }
  }

  function updateGeneratorLabel(){
    const generator=board().find(x=>
      x&&typeof x==="object"&&x.type==="generator"
    );

    if(!generator){
      $("board-energy").textContent="⚡ GENERATOR";
      return;
    }

    const remaining=Math.max(0,Math.ceil((generator.readyAt-Date.now())/1000));

    $("board-energy").textContent=
      remaining>0
      ?"⚡ RECHARGING "+remaining+"s"
      :"⚡ "+generator.charges+" GENERATOR CHARGES";
  }

  function useGenerator(index){
    const machine=board()[index];
    if(!machine||machine.type!=="generator")return;

    if(machine.readyAt>Date.now()){
      toast("Your generator is recharging.");
      return;
    }

    if(machine.charges<=0){
      machine.readyAt=Date.now()+GENERATOR_RECHARGE_MS;
      machine.charges=GENERATOR_MAX_CHARGES;
      toast("Generator recharging. Please wait.");
      renderBoard();
      save();
      return;
    }

    if(state.energy<GENERATOR_COST){
      toast("Not enough energy to produce an item.");
      return;
    }

    if(findEmptyCell()<0){
      toast("Your board is full. Make space before producing items.");
      return;
    }

    state.energy-=GENERATOR_COST;
    machine.charges--;

    const id=starterItem();
    spawnItem(id);

    if(machine.charges===0){
      machine.readyAt=Date.now()+GENERATOR_RECHARGE_MS;
      toast("Generator empty. It will recharge shortly.");
    }else{
      toast("New item produced!");
    }

    updateStats();
    renderBoard();
    updateCollection();
    save();
  }

  function moveItem(from,to){
    if(from===to||!Number.isInteger(from)||!Number.isInteger(to))return;

    const cells=board();
    const first=cells[from];
    const second=cells[to];

    if(!first||typeof first!=="string"){
      toast("That item cannot be moved.");
      renderBoard();
      return;
    }

    if(second===null){
      cells[to]=first;
      cells[from]=null;
      renderBoard();
      save();
      return;
    }

    if(typeof second!=="string"){
      toast("That space is occupied.");
      renderBoard();
      return;
    }

    if(first!==second){
      toast("These items cannot be merged.");
      renderBoard();
      return;
    }

    // Merging is free. Energy is not deducted here.
    const upgraded=nextItem(first);

    if(!upgraded){
      toast("This item has reached its highest level.");
      return;
    }

    cells[from]=null;
    cells[to]=upgraded.id;

    if(!state.discoveries[state.active].includes(upgraded.id)){
      state.discoveries[state.active].push(upgraded.id);
      toast("New discovery: "+upgraded.name);
    }

    renderBoard();
    updateCollection();
    save();
  }

  function createOrder(customer){
    const pool=catalog().orderPool;
    const choice=pool[Math.floor(Math.random()*pool.length)];

    const order={
      uid:state.nextOrderId++,
      customerId:customer.id,
      id:choice[0],
      reward:choice[1],
      desc:choice[2],
      createdAt:Date.now()
    };

    state.orders[state.active].push(order);
    return order;
  }

  function createInitialOrders(){
    const existing=state.orders[state.active];

    if(existing.length)return;

    const pool=customers.filter(c=>c.business===state.active);

    pool.slice(0,3).forEach(customer=>{
      state.customerVisits[customer.id]=(state.customerVisits[customer.id]||0)+1;
      createOrder(customer);

      if(customer.special&&Math.random()<0.25){
        addGift(customer.id==="don"?"gold":"vip");
        toast(customer.name+" has brought you a special gift!");
      }
    });
  }

  function addReplacementOrder(customer){
    state.customerVisits[customer.id]=(state.customerVisits[customer.id]||0)+1;
    createOrder(customer);

    if(customer.special&&Math.random()<0.35){
      addGift(customer.id==="don"?"gold":"vip");
      toast(customer.name+" has brought you a special gift!");
    }
  }

  function renderOrders(){
    const el=$("orders-list");
    if(!el)return;

    el.innerHTML="";

    const orders=state.orders[state.active]||[];

    if(!orders.length){
      el.textContent="No active orders.";
      return;
    }

    orders.forEach(order=>{
      const customer=customers.find(c=>c.id===order.customerId);
      const item=getItem(order.id);
      const ready=board().includes(order.id);

      const card=document.createElement("div");
      card.className="order-card"+(ready?" order-ready":"");

      card.innerHTML=
        `<div class="order-customer">
          <span class="customer-avatar small">${customer?customer.portrait:"?"}</span>
          <span><b>${customer?customer.name:"Customer"}</b>
          <small>${customer?customer.role:"Visitor"}</small></span>
        </div>
        <div class="order-details">
          <b>${item?item.icon+" "+item.name:"Requested item"}</b>
          <p>${order.desc}</p>
          <span class="order-reward">🪙 ${order.reward} coins</span>
        </div>
        <button class="primary wide serve-order" ${ready?"":"disabled"} data-order="${order.uid}">
          ${ready?"SERVE CUSTOMER":"ITEM NOT READY"}
        </button>
        ${ready?'<div class="ready-label">✦ ORDER READY ✦</div>':""}`;

      el.appendChild(card);
    });

    el.querySelectorAll(".serve-order").forEach(button=>{
      button.addEventListener("click",()=>{
        serveOrder(Number(button.dataset.order));
      });
    });
  }

  function serveOrder(uid){
    const orders=state.orders[state.active];
    const index=orders.findIndex(o=>o.uid===uid);

    if(index<0)return;

    const order=orders[index];
    const itemIndex=board().indexOf(order.id);

    if(itemIndex<0){
      toast("The requested item is not ready yet.");
      return;
    }

    const customer=customers.find(c=>c.id===order.customerId);

    board()[itemIndex]=null;
    state.coins+=order.reward;
    orders.splice(index,1);

    toast("Order completed for "+customer.name+"! +"+order.reward+" coins");

    addReplacementOrder(customer);

    renderBoard();
    renderCustomerList();
    updateStats();
    save();
  }

  function renderCustomerList(){
    const el=$("customer-list");
    el.innerHTML="";

    customers.filter(c=>c.business===state.active).forEach(c=>{
      const visits=state.customerVisits[c.id]||0;
      const row=document.createElement("div");
      row.className="customer-row";

      row.innerHTML=
        `<span class="customer-avatar small">${c.portrait}</span>
         <span><b>${c.name}</b>
         <small>${c.role} • ${visits} visits</small></span>`;

      el.appendChild(row);
    });
  }

  function updateCollection(){
    const el=$("collection-list");
    el.innerHTML="";

    state.discoveries[state.active].forEach(id=>{
      const item=getItem(id);
      if(!item)return;

      const chip=document.createElement("span");
      chip.className="collection-chip discovered";
      chip.textContent=item.icon+" "+item.name;
      el.appendChild(chip);
    });

    if(!el.children.length){
      el.textContent="Your discoveries will appear here.";
    }
  }

  function switchBusiness(name){
    state.active=name;

    document.querySelectorAll(".tab").forEach(t=>
      t.classList.toggle("selected",t.dataset.tab===name)
    );

    $("business-title").textContent=catalog().title;
    $("board-name").textContent=catalog().board;

    buildBoard();
    createInitialOrders();
    renderBoard();
    renderCustomerList();
    updateCollection();
    updateStats();
    save();
  }

  function openBusiness(name){
    switchBusiness(name);
    $("city-screen").classList.remove("active");
    $("story-screen").classList.remove("active");
    $("business-screen").classList.add("active");
  }

  function refreshBoard(){
    toast("Use your generator to produce items. Merging is free.");
  }

  function renderGifts(){
    const el=$("gift-list");
    el.innerHTML="";

    state.giftList.forEach(g=>{
      const button=document.createElement("button");
      button.className="gift-option"+(state.selectedGift===g.uid?" selected":"");

      button.innerHTML=
        `<span class="gift-icon">${g.icon}</span>
         <span><b>${g.name}</b><small>${g.desc}</small></span>`;

      button.onclick=()=>{
        state.selectedGift=g.uid;
        renderGifts();
      };

      el.appendChild(button);
    });

    if(!state.giftList.length){
      el.textContent="No gifts waiting. More visitors may bring surprises.";
    }
  }

  function claimGift(){
    const index=state.giftList.findIndex(g=>g.uid===state.selectedGift);

    if(index<0){
      toast("Choose a gift first.");
      return;
    }

    const empty=findEmptyCell();

    if(empty<0){
      toast("Your board is full. Make space before placing a gift.");
      return;
    }

    const gift=state.giftList.splice(index,1)[0];

    board()[empty]={
      type:"gift",
      uid:gift.uid,
      giftId:gift.id,
      name:gift.name,
      icon:gift.icon,
      energy:gift.energy||0,
      coins:gift.coins||0,
      gems:gift.gems||0,
      openingUntil:0
    };

    state.selectedGift=null;

    $("gift-modal").classList.add("hidden");

    updateStats();
    renderBoard();
    renderGifts();
    save();

    toast("Gift placed on your board. Tap the box to open it.");
  }

  function openGiftBox(index){
    const gift=board()[index];

    if(!gift||gift.type!=="gift")return;

    if(gift.openingUntil>Date.now()){
      const seconds=Math.ceil((gift.openingUntil-Date.now())/1000);
      toast("Your gift is opening. "+seconds+" seconds remaining.");
      return;
    }

    if(gift.openingUntil===0){
      gift.openingUntil=Date.now()+GIFT_OPEN_MS;
      toast("Your gift is opening. Come back in 10 seconds!");
      renderBoard();
      save();

      setTimeout(()=>{
        finishGiftOpening(gift.uid);
      },GIFT_OPEN_MS+100);
    }
  }

  function finishGiftOpening(uid){
    const index=board().findIndex(cell=>
      cell&&typeof cell==="object"&&cell.type==="gift"&&cell.uid===uid
    );

    if(index<0)return;

    const gift=board()[index];

    if(gift.openingUntil>Date.now()){
      setTimeout(()=>finishGiftOpening(uid),gift.openingUntil-Date.now()+100);
      return;
    }

    // Give the currency rewards when the box is opened.
    state.energy=Math.min(state.maxEnergy,state.en.id===state.currentCustomer);
    toast("Order completed for "+customer.name+"! +"+reward+" coins");

    renderBoard();
    chooseCustomer();
    updateStats();
    save();
  }

  function refreshBoard(){
    if(state.energy<10){
      toast("You need 10 energy to refresh.");
      return;
    }
    state.energy-=10;
    buildBoard();
    updateStats();
    save();
  }

  function renderGifts(){
    const el=$("gift-list");
    el.innerHTML="";
    state.giftList.forEach(g=>{
      const button=document.createElement("button");
      button.className="gift-option"+(state.selectedGift===g.id?" selected":"");
      button.innerHTML=`<span class="gift-icon">${g.icon}</span>
        <span><b>${g.name}</b><small>${g.desc}</small></span>`;
      button.onclick=()=>{
        state.selectedGift=g.id;
        renderGifts();
      };
      el.appendChild(button);
    });
    if(!state.giftList.length)el.textContent="No unclaimed gifts right now. More visitors may bring surprises.";
  }

  function claimGift(){
    const index=state.giftList.findIndex(g=>g.id===state.selectedGift);
    if(index<0){
      toast("Choose a gift first.");
      return;
    }
    const gift=state.giftList.splice(index,1)[0];
    state.energy=Math.min(200,state.energy+(gift.energy||0));
    state.coins+=gift.coins||0;
    state.gems+=gift.gems||0;
    state.claimed.push(gift.id);
    state.selectedGift=null;
    updateStats();
    renderGifts();
    save();
    toast("Gift claimed! Your rewards have been added.");
  }

  function showGifts(){
    $("gift-modal").classList.remove("hidden");
    renderGifts();
  }

  function init(){
    load();
    if(!state.giftList.length && !state.claimed.length){
      gifts.slice(0,5).forEach(g=>state.giftList.push({...g}));
    }
    if(!Array.isArray(state.board)||state.board.length!==25)buildBoard();

    $("enter-business").onclick=()=>openBusiness("dessert");
    document.querySelectorAll(".tile").forEach(t=>{
      t.onclick=()=>t.dataset.panel==="story"?
        ( $("city-screen").classList.remove("active"),$("story-screen").classList.add("active")):
        openBusiness(t.dataset.panel);
    });

    $("back-city").onclick=()=>{
      $("business-screen").classList.remove("active");
      $("city-screen").classList.add("active");
    };
    $("story-back").onclick=()=>{
      $("story-screen").classList.remove("active");
      $("city-screen").classList.add("active");
    };
    $("story-continue").onclick=()=>openBusiness("dessert");
    document.querySelectorAll(".tab").forEach(t=>t.onclick=()=>switchBusiness(t.dataset.tab));

    $("open-gifts").onclick=showGifts;
    $("open-gifts-2").onclick=showGifts;
    $("close-gifts").onclick=()=>$("gift-modal").classList.add("hidden");
    $("claim-gift").onclick=claimGift;
    $("make-order").onclick=fulfilOrder;
    $("refresh-board").onclick=refreshBoard;

    updateStats();
    renderBoard();
    chooseCustomer();
    updateCollection();
    save();
  }

  window.addEventListener("DOMContentLoaded",init);
})();
