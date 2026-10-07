
let DATA = null;


function money(value) {

if (
value === null ||
value === undefined ||
isNaN(value)
) {

return "-";

}

return "$" +
Number(value).toFixed(4);

}


function compact(value) {

if (
value === null ||
value === undefined ||
isNaN(value)
) {

return "-";

}

value = Number(value);


if (Math.abs(value) >= 1000000000) {

return (
value / 1000000000
).toFixed(2) + "B";

}


if (Math.abs(value) >= 1000000) {

return (
value / 1000000
).toFixed(2) + "M";

}


if (Math.abs(value) >= 1000) {

return (
value / 1000
).toFixed(1) + "K";

}


return value.toLocaleString();

}


async function loadData() {

const response =
await fetch(
"data/atch_data.json?" +
Date.now()
);

DATA =
await response.json();

render();

}


function render() {

const q =
DATA.quote || {};

const ai =
DATA.ai || {};

const s =
DATA.short_interest || {};


document.getElementById(
"price"
).textContent =
money(q.price);


const change =
document.getElementById(
"change"
);


change.textContent =

(q.change >= 0 ? "+" : "") +

money(q.change) +

" (" +

(q.change_pct >= 0 ? "+" : "") +

Number(
q.change_pct || 0
).toFixed(2) +

"%)";


change.style.color =

q.change >= 0
? "#0b9b68"
: "#e34b4b";


document.getElementById(
"volume"
).textContent =
compact(q.volume);


document.getElementById(
"high52"
).textContent =
money(q.high52);


document.getElementById(
"low52"
).textContent =
money(q.low52);


document.getElementById(
"marketCap"
).textContent =
compact(q.market_cap);


document.getElementById(
"updated"
).textContent =

"마지막 갱신 · " +

(DATA.updated_at || "-");


document.getElementById(
"footerTime"
).textContent =
DATA.updated_at || "-";


document.getElementById(
"statusText"
).textContent =
"데이터 정상";


document.getElementById(
"prediction"
).textContent =
money(ai.next_price);


document.getElementById(
"predictionChange"
).textContent =

(ai.change_pct >= 0 ? "+" : "") +

Number(
ai.change_pct || 0
).toFixed(2) +

"%";


document.getElementById(
"mae"
).textContent =
money(ai.mae);


document.getElementById(
"rmse"
).textContent =
money(ai.rmse);


document.getElementById(
"shortShares"
).textContent =
compact(s.shares);


document.getElementById(
"shortPct"
).textContent =

s.percent == null
? "-"
:
Number(
s.percent
).toFixed(2) + "%";


document.getElementById(
"dtc"
).textContent =

s.days_to_cover == null
? "-"
:
Number(
s.days_to_cover
).toFixed(2);


document.getElementById(
"shortDate"
).textContent =
s.date || "-";


drawPrice(1825);

drawPrediction();

drawFinancials();

drawFilings();

}


function drawPrice(days) {

const rows =
(DATA.history || [])
.slice(-days);


const dates =
rows.map(
row => row.date
);


const prices =
rows.map(
row => row.close
);


Plotly.newPlot(

"priceChart",

[{

x: dates,

y: prices,

type: "scatter",

mode: "lines",

line: {
width: 2
},

name: "종가"

}],

{

margin: {
l:45,
r:15,
t:10,
b:35
},

paper_bgcolor:
"transparent",

plot_bgcolor:
"transparent",

xaxis: {
gridcolor:
"#edf0f3"
},

yaxis: {
gridcolor:
"#edf0f3",

tickprefix:
"$"
},

showlegend:false

}

);

}


function drawPrediction() {

const rows =
DATA.prediction_history || [];


if (!rows.length) {

document.getElementById(
"predictionChart"
).innerHTML =

"<div class='notice'>" +

"예측 검증 데이터가 없습니다." +

"</div>";

return;

}


Plotly.newPlot(

"predictionChart",

[

{

x:
rows.map(
r => r.date
),

y:
rows.map(
r => r.actual
),

type:
"scatter",

mode:
"lines",

name:
"실제"

},

{

x:
rows.map(
r => r.date
),

y:
rows.map(
r => r.predicted
),

type:
"scatter",

mode:
"lines",

name:
"LSTM 예측"

}

],

{

margin: {
l:45,
r:15,
t:10,
b:35
},

paper_bgcolor:
"transparent",

plot_bgcolor:
"transparent",

xaxis: {
gridcolor:
"#283344"
},

yaxis: {
gridcolor:
"#283344",

tickprefix:
"$"
},

font: {
color:"#fff"
},

legend: {
orientation:"h"
}

}

);

}


function drawFinancials() {

const body =
document.getElementById(
"financialBody"
);

body.innerHTML = "";


(DATA.financials || [])
.forEach(row => {

body.innerHTML += `

<tr>

<td>
${row.period}
</td>

<td>
${compact(row.revenue)}
</td>

<td>
${compact(row.operating_income)}
</td>

<td>
${compact(row.net_income)}
</td>

<td>
${compact(row.assets)}
</td>

<td>
${compact(row.liabilities)}
</td>

</tr>

`;

});

}


function drawFilings() {

const container =
document.getElementById(
"filings"
);

container.innerHTML = "";


(DATA.filings || [])
.slice(0,12)
.forEach(filing => {

container.innerHTML += `

<div class="filing">

<div>

<b>
${filing.form}
</b>

·

${filing.date}

<br>

<span class="muted">

${filing.description || ""}

</span>

</div>


<a
href="${filing.url}"
target="_blank"
rel="noopener">

SEC 열기 →

</a>

</div>

`;

});

}


document
.querySelectorAll(
".periods button"
)
.forEach(button => {

button.onclick = () => {

document
.querySelectorAll(
".periods button"
)
.forEach(
b => b.classList.remove(
"active"
)
);


button.classList.add(
"active"
);


drawPrice(
Number(
button.dataset.days
)
);

};

});


document.getElementById(
"refreshBtn"
).onclick = () => {

loadData().catch(
error => {

console.error(error);

alert(
"데이터를 불러오지 못했습니다."
);

}

);

};


loadData().catch(
error => {

console.error(error);

document.getElementById(
"statusText"
).textContent =
"데이터 오류";

}
);
