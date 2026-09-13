const catBtns=document.querySelectorAll(".catBtn");
const nhBtns=document.querySelectorAll(".nhBtn");
const cardsCat=document.querySelectorAll(".row.g-4>[data-category]");
const counter=document.getElementById("eventCount");
const selectBtn=document.querySelectorAll(".btnSelect");
const grid=document.querySelector(".row.g-4");

let activeCat="all";
let activeHood="all";

function eventCounter(){
    let count=0;
    for(var i=0; i<cardsCat.length; i++){
        var card=cardsCat[i];
        var flag1=activeCat==="all" || card.dataset.category===activeCat;
        var flag2=activeHood==="all" || card.dataset.neighborhood===activeHood;
        var flag=flag1&&flag2;
        card.classList.toggle("d-none", !flag);

        if(flag){
            count++;
        }
    }
    updateCounter(count);
    toggleEmptyMessage(count);
}

function updateCounter(count){
    counter.textContent=count;
}

function toggleEmptyMessage(count){
    let msg=document.getElementById("emptyMsg");
    if(count===0){
        if(!msg){
            msg=document.createElement("p");
            msg.id="emptyMsg";
            msg.className="emptyMessage";
            msg.textContent="No event!";
            grid.after(msg);
        }
        msg.classList.remove("d-none");
    } else if(msg){
        msg.classList.add("d-none");
    }
}

for(var i=0; i<catBtns.length; i++){
    catBtns[i].addEventListener("click", function(){
        for(var j=0; j<catBtns.length; j++){
            catBtns[j].classList.remove("active");
        }

        this.classList.add("active");
        activeCat=this.dataset.category;
        eventCounter();
    });
}

for(var i=0; i<nhBtns.length; i++){
    nhBtns[i].addEventListener("click", function(){
        var hood=this.dataset.neighborhood;
        if(activeHood===hood){
            this.classList.remove("active");
            activeHood="all";
        } else {
            for(var j=0; j<nhBtns.length; j++){
                nhBtns[j].classList.remove("active");
            }
            this.classList.add("active");
            activeHood=hood;
        }
        eventCounter();
    });
}

for(var i=0; i<selectBtn.length; i++){
    selectBtn[i].addEventListener("click", function(){
        for(var j=0; j<selectBtn.length; j++){
            selectBtn[j].classList.remove("active");
        }
        this.classList.add("active");
        var flag=this.dataset.view;
        var mapFlag=document.getElementById("mapView");
        var calFlag=document.getElementById("calendarView");

        grid.classList.add("d-none");
        mapFlag.classList.add("d-none");
        calFlag.classList.add("d-none");

        if(flag==="map"){
            mapFlag.classList.remove("d-none");
            mapPins();
            map.invalidateSize();
        } else if(flag==="calendar"){
            calFlag.classList.remove("d-none");
            calendar();
        } else {
            grid.classList.remove("d-none");
        }
    });
}

eventCounter();
var map = null;
var markers = [];

function mapPins() {
    if (map !== null) return;

    map = L.map("map").setView([41.9981, 21.4254], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap"
    }).addTo(map);

    for (var i = 0; i < cardsCat.length; i++) {
        var card = cardsCat[i];
        var lat = card.dataset.lat;
        var lng = card.dataset.lng;
        var title = card.querySelector(".card-title").textContent;
        var link = card.querySelector(".details").getAttribute("href");

        var popup = "<strong>" + title + "</strong><br>" +
            "<a href='" + link + "'>View Details</a>";

        var marker = L.marker([lat, lng]).addTo(map).bindPopup(popup);
        markers.push({ marker: marker, card: card });
    }
}

var calMonth = 10;
var calYear  = 2026;

var monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];


function calendar() {
    var container = document.getElementById("calendar");
    container.innerHTML = "";
    document.getElementById("calTitle").textContent =
        monthNames[calMonth - 1] + " " + calYear;
    var gridEl = document.createElement("div");
    gridEl.className = "calGrid";
    container.appendChild(gridEl);

    var dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    for (var d = 0; d < 7; d++) {
        var nameCell = document.createElement("div");
        nameCell.className = "calDay";
        nameCell.textContent = dayNames[d];
        gridEl.appendChild(nameCell);
    }

    var firstDay = new Date(calYear, calMonth - 1, 1).getDay();
    var blanks = (firstDay === 0) ? 6 : firstDay - 1;

    for (var b = 0; b < blanks; b++) {
        var empty = document.createElement("div");
        empty.className = "calCell calEmpty";
        gridEl.appendChild(empty);
    }

    var totalDays = new Date(calYear, calMonth, 0).getDate();
    for (var day = 1; day <= totalDays; day++) {
        var cell = document.createElement("div");
        cell.className = "calCell";
        var number = document.createElement("span");
        number.className = "calNumber";
        number.textContent = day;
        cell.appendChild(number);

        for (var i = 0; i < cardsCat.length; i++) {
            var card = cardsCat[i];
            if (!card.dataset.date) {
                continue;
            }

            var parts = card.dataset.date.split("-");   // "12-10-2026"
            var cardDay   = Number(parts[0]);
            var cardMonth = Number(parts[1]);
            var cardYear  = Number(parts[2]);

            if (cardDay === day && cardMonth === calMonth && cardYear === calYear) {
                var title = card.querySelector(".card-title").textContent;
                var link  = card.querySelector(".details").getAttribute("href");
                var evt = document.createElement("a");
                evt.className = "calEvent";
                evt.textContent = title;
                evt.href = link;
                cell.appendChild(evt);
            }
        }
        gridEl.appendChild(cell);
    }
}
document.getElementById("prevMonth").addEventListener("click", function () {
    calMonth--;
    if (calMonth < 1) {
        calMonth = 12;
        calYear--;
    }
    calendar();
});
document.getElementById("nextMonth").addEventListener("click", function () {
    calMonth++;
    if (calMonth > 12) {
        calMonth = 1;
        calYear++;
    }
    calendar();
});

const favBtns = document.querySelectorAll(".favBtn");
const FAV_KEY = "gatherings_favorites";

function getFavorites(){
    var stored = localStorage.getItem(FAV_KEY);
    return stored ? JSON.parse(stored) : [];
}

function saveFavorites(favorites){
    localStorage.setItem(FAV_KEY, JSON.stringify(favorites));
}

function isFavorite(id){
    return getFavorites().indexOf(id) !== -1;
}

function toggleFavorite(id){
    var favorites = getFavorites();
    var index = favorites.indexOf(id);
    if(index === -1){
        favorites.push(id);
    } else {
        favorites.splice(index, 1);
    }
    saveFavorites(favorites);
    return index === -1;
}

function updateFavIcon(btn, isFav){
    var icon = btn.querySelector("i");
    btn.classList.toggle("active", isFav);
    icon.classList.toggle("bi-heart", !isFav);
    icon.classList.toggle("bi-heart-fill", isFav);
}
for(var i=0; i<favBtns.length; i++){
    var btn = favBtns[i];
    var id = btn.dataset.id;
    updateFavIcon(btn, isFavorite(id));

    btn.addEventListener("click", function(e){
        e.stopPropagation();
        var nowFav = toggleFavorite(this.dataset.id);
        updateFavIcon(this, nowFav);
    });
}