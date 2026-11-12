(() => {
 const $=id=>document.getElementById(id), data=window.MafiaData;
 const state={energy:200,maxEnergy:200,cash:1500,active:"dessert",selected:null,board:[],order:null,gifts:[
  {id:"welcome",icon:"🎁",name:"Welcome to Bellavita",desc:"A starter gift to help reopen your businesses.",reward:{energy:50,cash:250}},
  {id:"energy",icon:"⚡",name:"Energy Reserve",desc:"A generous energy refill.",reward:{energy:100}},
  {id:"mystery",icon:"🎀",name:"Mystery Gift",desc:"A surprise cash and energy bundle.",reward:{energy:35,cash:400}}
 ],claimed:[],giftSelected:"welcome",discoveries:{dessert:[],weapons:[]}};
 function toast(s){const t=$("toast");t.textContent=s;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2200)}
 function save(){try{localStorage.setItem("mafiamerge-save",JSON.stringify(state))}catch(e){}}
 function load(){try{const s=JSON.parse(localStorage.getItem("mafiamerge-save"));if(s){Object.assign(state,s);state.energy=Math.min(200,Math.max(0,state.energy||0));state.gifts=state.gifts||[];}}catch(e){}}
 function updateStats(){$("energy-value").textContent=`${state.energy} / 200`;$("energy-fill").style.width=(state.energy/200*100)+"%";$("cash-value").textContent="$"+state.cash.toLocaleString();$("gift-count").textContent=state.gifts.length}
 function catalog(){return data[state.active]}
 function item(id){return catalog().items.find(x=>x.id===id)}
 function newOrder(){const pool=catalog().orderPool;const o=pool[Math.floor(Math.random()*pool.length)];state.order={id:o[0],reward:o[1],desc:o[2]};$("order-name").textContent=item(o[0]).name;$("order-reward").textContent="$"+o[1];$("order-desc").textContent=o[2]}
 function buildBoard(){state.board=Array(25).fill(null);const starters=catalog().starter;let pairs=[[0,1],[3,4],[6,7],[10,11],[13,14],[16,17]];pairs.forEach((pair,i)=>{const id=starters[i%starters.length];state.board[pair[0]]=id;state.board[pair[1]]=id;});state.selected=null;renderBoard();newOrder();updateCollection();save()}
 function renderBoard(){const b=$("merge-board");b.innerHTML="";state.board.forEach((id,index)=>{const cell=document.createElement("button");cell.className="merge-cell"+(id?"":" empty")+(state.selected===index?" selected":"");cell.setAttribute("aria-label",id?item(id).name:"Empty cell");if(id){const it=item(id);cell.innerHTML=`<span class="item-icon">${it.icon}</span><span class="item-name">${it.name}</span>`}cell.addEventListener("click",()=>tapCell(index));b.appendChild(cell)})}
 function adjacent(a,b){const ar=Math.floor(a/5),ac=a%5,br=Math.floor(b/5),bc=b%5;return Math.abs(ar-br)+Math.abs(ac-bc)===1}
 function nextItem(id){const it=item(id);return catalog().items.find(x=>x.family===it.family&&x.tier===it.tier+1)}
 function tapCell(index){const id=state.board[index];if(state.selected===null){if(!id){toast("Choose an item first.");return}state.selected=index;renderBoard();return}
  const from=state.selected;state.selected=null;if(from===index){renderBoard();return}
  const first=state.board[from],second=id;
  if(!first||!second||first!==second||!adjacent(from,index)){toast("Choose an adjacent matching item.");renderBoard();return}
  if(state.energy<catalog().cost){toast("Not enough energy. Open your gifts or wait for a refill.");renderBoard();return}
  const upgraded=nextItem(first);if(!upgraded){toast("This item has reached its highest collection tier.");renderBoard();return}
  state.energy-=catalog().cost;state.board[from]=null;state.board[index]=upgraded.id;
  if(!state.discoveries[state.active].includes(upgraded.id)){state.discoveries[state.active].push(upgraded.id);toast("New discovery: "+upgraded.name)}
  renderBoard();updateStats();updateCollection();save();
 }
 function updateCollection(){const el=$("collection-list");el.innerHTML="";state.discoveries[state.active].forEach(id=>{const it=item(id);if(!it)return;const c=document.createElement("span");c.className="collection-chip discovered";c.textContent=it.icon+" "+it.name;el.appendChild(c)});if(!el.children.length)el.innerHTML='<span class="help">Your discoveries will appear here.</span>'}
 function switchBusiness(name){state.active=name;state.selected=null;document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("selected",t.dataset.tab===name));$("business-title").textContent=catalog().title;$("board-name").textContent=catalog().board;$("board-energy").textContent="⚡ "+catalog().cost+" ENERGY / MOVE";buildBoard()}
 function openBusiness(name){switchBusiness(name);$("city-screen").classList.remove("active");$("story-screen").classList.remove("active");$("business-screen").classList.add("active")}
 function giftModal(){$("gift-modal").classList.remove("hidden");renderGifts()}
 function renderGifts(){const list=$("gift-list");list.innerHTML="";state.gifts.forEach(g=>{const b=document.createElement("button");b.className="gift-option"+(state.giftSelected===g.id?" selected":"");b.innerHTML=`<span class="gift-icon">${g.icon}</span><span><b>${g.name}</b><small>${g.desc}</small></span>`;b.onclick=()=>{state.giftSelected=g.id;renderGifts()};list.appendChild(b)});if(!state.gifts.length)list.innerHTML='<p class="help">You have claimed every available gift. More gifts will arrive as you progress.</p>'}
 function claimGift(){const i=state.gifts.findIndex(g=>g.id===state.giftSelected);if(i<0){toast("Select an available gift.");return}const g=state.gifts.splice(i,1)[0];state.energy=Math.min(200,state.energy+(g.reward.energy||0));state.cash+=g.reward.cash||0;if(g.reward.item){state.board[1]=g.reward.item}state.claimed.push(g.id);updateStats();renderGifts();save();toast("Gift claimed. Your empire thanks you.")}
 function fulfil(){if(!state.order)return;const index=state.board.findIndex(x=>x===state.order.id);if(index<0){toast("Create the requested item on the board first.");return}state.board[index]=null;state.cash+=state.order.reward;const reward=state.order.reward;newOrder();renderBoard();updateStats();save();toast("Order fulfilled. +$"+reward)}
 function refresh(){if(state.energy<10){toast("You need 10 energy to refresh.");return}state.energy-=10;buildBoard();updateStats();toast("Board refreshed.")}
 function init(){load();updateStats();$("enter-business").onclick=()=>openBusiness("dessert");document.querySelectorAll(".tile").forEach(t=>t.onclick=()=>t.dataset.panel==="story"?( $("city-screen").classList.remove("active"),$("story-screen").classList.add("active")):openBusiness(t.dataset.panel));$("back-city").onclick=()=>{$("business-screen").classList.remove("active");$("city-screen").classList.add("active")};$("story-back").onclick=()=>{$("story-screen").classList.remove("active");$("city-screen").classList.add("active")};$("story-continue").onclick=()=>openBusiness("dessert");document.querySelectorAll(".tab").forEach(t=>t.onclick=()=>switchBusiness(t.dataset.tab));$("open-gifts").onclick=giftModal;$("open-gifts-2").onclick=giftModal;$("close-gifts").onclick=()=>$("gift-modal").classList.add("hidden");$("claim-gift").onclick=claimGift;$("make-order").onclick=fulfil;$("refresh-board").onclick=refresh;if(!Array.isArray(state.board)||state.board.length!==25||!state.board.some(Boolean))buildBoard();else{newOrder();renderBoard();updateCollection()}updateStats()}
 window.addEventListener("DOMContentLoaded",init);
})();