
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

  const state = {
    energy:200,maxEnergy:200,coins:1500,gems:50,
    active:"dessert",board:[],order:null,
    discoveries:{dessert:[],weapons:[]},
    giftList:[],claimed:[],
    customerVisits:{},currentCustomer:null,
    selectedGift:null
  };

  function toast(message){
    const el=$("toast");
    el.textContent=message;
    el.classList.add("show");
    setTimeout(()=>el.classList.remove("show"),2400);
  }

  function save(){
    localStorage.setItem("mafiamerge-save-v2",JSON.stringify(state));
  }

  function load(){
    try{
      const saved=JSON.parse(localStorage.getItem("mafiamerge-save-v2"));
      if(saved) Object.assign(state,saved);
    }catch(e){}
  }

  function catalog(){return data[state.active];}
  function getItem(id){return catalog().items.find(x=>x.id===id);}

  function updateStats(){
    $("energy-value").textContent=state.energy+" / 200";
    $("energy-fill").style.width=(state.energy/200*100)+"%";
    $("cash-value").textContent=state.coins.toLocaleString();
    $("gem-value").textContent="💎 "+state.gems;
    $("gift-count").textContent=state.giftList.length;
  }

  function addGift(id){
    const gift=gifts.find(g=>g.id===id);
    if(!gift || state.giftList.some(g=>g.id===id) || state.claimed.includes(id)) return;
    state.giftList.push({...gift});
    updateStats();
    save();
  }

  function nextItem(id){
    const current=getItem(id);
    if(!current)return null;
    return catalog().items.find(x=>x.family===current.family && x.tier===current.tier+1);
  }

  function buildBoard(){
    const starters=catalog().starter;
    state.board=Array(25).fill(null);
    const positions=[0,1,3,4,6,7,10,11,13,14,16,17];
    positions.forEach((p,i)=>state.board[p]=starters[i%starters.length]);
    renderBoard();
    save();
  }

  function renderBoard(){
    const board=$("merge-board");
    board.innerHTML="";
    state.board.forEach((id,index)=>{
      const cell=document.createElement("div");
      cell.className="merge-cell"+(id?"":" empty");
      cell.dataset.index=index;
      if(id){
        const item=getItem(id);
        cell.innerHTML=`<span class="item-icon">${item.icon}</span><span class="item-name">${item.name}</span>`;
        cell.draggable=true;
        cell.addEventListener("dragstart",e=>{
          e.dataTransfer.setData("text/plain",String(index));
          cell.classList.add("dragging");
        });
        cell.addEventListener("dragend",()=>cell.classList.remove("dragging"));
      }
      cell.addEventListener("dragover",e=>e.preventDefault());
      cell.addEventListener("drop",e=>{
        e.preventDefault();
        const from=Number(e.dataTransfer.getData("text/plain"));
        moveItem(from,index);
      });
      addTouchDragging(cell,index);
      board.appendChild(cell);
    });
  }

  let touchSource=null;

  function addTouchDragging(cell,index){
    cell.addEventListener("pointerdown",e=>{
      if(!state.board[index])return;
      touchSource=index;
      cell.setPointerCapture(e.pointerId);
      cell.classList.add("dragging");
    });

    cell.addEventListener("pointerup",e=>{
      if(touchSource===null)return;
      const target=document.elementFromPoint(e.clientX,e.clientY);
      const destination=target?.closest(".merge-cell");
      const targetIndex=destination?Number(destination.dataset.index):touchSource;
      moveItem(touchSource,targetIndex);
      touchSource=null;
    });

    cell.addEventListener("pointercancel",()=>{
      touchSource=null;
      cell.classList.remove("dragging");
    });
  }

  function moveItem(from,to){
    if(from===to || !Number.isInteger(from) || !Number.isInteger(to))return;
    const first=state.board[from],second=state.board[to];
    if(!first)return;

    if(!second){
      state.board[to]=first;
      state.board[from]=null;
      renderBoard();
      save();
      return;
    }

    if(first!==second){
      toast("These items cannot be merged.");
      renderBoard();
      return;
    }

    if(state.energy<catalog().cost){
      toast("Not enough energy. Open your gifts.");
      return;
    }

    const upgraded=nextItem(first);
    if(!upgraded){
      toast("This item has reached its highest level.");
      return;
    }

    state.energy-=catalog().cost;
    state.board[from]=null;
    state.board[to]=upgraded.id;

    if(!state.discoveries[state.active].includes(upgraded.id)){
      state.discoveries[state.active].push(upgraded.id);
      toast("New discovery: "+upgraded.name);
    }

    renderBoard();
    updateStats();
    updateCollection();
    save();
  }

  function chooseCustomer(){
    const pool=customers.filter(c=>c.business===state.active);
    const customer=pool[Math.floor(Math.random()*pool.length)];
    state.currentCustomer=customer.id;
    state.customerVisits[customer.id]=(state.customerVisits[customer.id]||0)+1;

    const orders=catalog().orderPool;
    const order=orders[Math.floor(Math.random()*orders.length)];
    state.order={id:order[0],reward:order[1],desc:order[2]};

    if(customer.special && Math.random()<0.35){
      const giftId=customer.id==="don"?"gold":"vip";
      addGift(giftId);
      toast(customer.name+" has brought you a special gift!");
    }
    renderCustomer();
    renderCustomerList();
    renderOrder();
  }

  function renderCustomer(){
    const customer=customers.find(c=>c.id===state.currentCustomer);
    if(!customer)return;
    $("customer-card").innerHTML=
      `<div class="customer-avatar">${customer.portrait}</div>
       <div><b>${customer.name}</b><small>${customer.role}</small>
       <p>"${customer.dialogue}"</p></div>`;
  }

  function renderCustomerList(){
    const el=$("customer-list");
    el.innerHTML="";
    customers.filter(c=>c.business===state.active).forEach(c=>{
      const visits=state.customerVisits[c.id]||0;
      const row=document.createElement("div");
      row.className="customer-row";
      row.innerHTML=`<span class="customer-avatar small">${c.portrait}</span>
        <span><b>${c.name}</b><small>${c.role} • ${visits} visits</small></span>`;
      el.appendChild(row);
    });
  }

  function renderOrder(){
    if(!state.order)return;
    const item=getItem(state.order.id);
    $("order-name").textContent=item?item.name:"Customer request";
    $("order-desc").textContent=state.order.desc;
    $("order-reward").textContent=state.order.reward+" coins";
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
    if(!el.children.length)el.textContent="Your discoveries will appear here.";
  }

  function switchBusiness(name){
    state.active=name;
    document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("selected",t.dataset.tab===name));
    $("business-title").textContent=catalog().title;
    $("board-name").textContent=catalog().board;
    $("board-energy").textContent="⚡ "+catalog().cost+" ENERGY / MERGE";
    buildBoard();
    chooseCustomer();
    updateCollection();
  }

  function openBusiness(name){
    switchBusiness(name);
    $("city-screen").classList.remove("active");
    $("story-screen").classList.remove("active");
    $("business-screen").classList.add("active");
  }

  function fulfilOrder(){
    if(!state.order)return;
    const index=state.board.indexOf(state.order.id);
    if(index<0){
      toast("Create the requested item on the board first.");
      return;
    }

    const reward=state.order.reward;
    state.board[index]=null;
    state.coins+=reward;

    const customer=customers.find(c=>c.id===state.currentCustomer);
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
