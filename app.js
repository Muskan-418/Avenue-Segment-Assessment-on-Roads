// app.js
// Simple dashboard logic with sample data. Replace sample segments with API fetches as needed.

// Sample dataset - replace with fetch('/api/segments') in real app
const SAMPLE_SEGMENTS = [
  { id:1, name:"Avenue 1 - Segment A", lat:17.447, lon:78.379, rci:8.5, condition:"Excellent", potholes:0, crack_density:1.2, last_inspected:"2025-10-20" },
  { id:2, name:"Avenue 1 - Segment B", lat:17.449, lon:78.381, rci:6.8, condition:"Good", potholes:1, crack_density:2.5, last_inspected:"2025-10-18" },
  { id:3, name:"Baker St - Segment 3", lat:17.451, lon:78.383, rci:4.2, condition:"Fair", potholes:3, crack_density:5.1, last_inspected:"2025-09-28" },
  { id:4, name:"Market Rd - Segment 2", lat:17.453, lon:78.384, rci:2.9, condition:"Poor", potholes:8, crack_density:9.0, last_inspected:"2025-09-20" },
  { id:5, name:"River Side - Segment X", lat:17.455, lon:78.386, rci:1.6, condition:"Critical", potholes:15, crack_density:18.3, last_inspected:"2025-08-15" }
];

let map, markers = [], chart;

// color map by condition
const CONDITION_COLOR = {
  "Excellent": "#2ecc71",
  "Good": "#27ae60",
  "Fair": "#f1c40f",
  "Poor": "#e67e22",
  "Critical": "#e74c3c"
};

function init() {
  initMap();
  renderSegments(SAMPLE_SEGMENTS);
  initChart(SAMPLE_SEGMENTS);
  wireEvents();
}

function initMap() {
  map = L.map('map', { zoomControl: true }).setView([17.449, 78.382], 14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
}

function renderSegments(segments) {
  // clear existing markers & list
  markers.forEach(m=>map.removeLayer(m.marker));
  markers = [];
  const list = document.getElementById('segment-list');
  list.innerHTML = "";

  segments.forEach(s=>{
    // create colored circle marker
    const color = CONDITION_COLOR[s.condition] || '#888';
    const marker = L.circleMarker([s.lat, s.lon], {
      radius: 9,
      color: '#333',
      weight: 1,
      fillColor: color,
      fillOpacity: 0.9
    }).addTo(map);

    marker.on('click', ()=>showDetails(s));
    markers.push({ id: s.id, marker });

    // list item
    const item = document.createElement('div');
    item.className = "segment-item";
    item.innerHTML = `<div>
      <strong>${s.name}</strong><br><small>RCI: ${s.rci} • ${s.condition}</small>
    </div><div style="text-align:right"><small>${s.last_inspected}</small></div>`;
    item.onclick = ()=>{ map.setView([s.lat, s.lon], 16); showDetails(s); };
    list.appendChild(item);
  });
}

function showDetails(s) {
  const panel = document.getElementById('segment-details');
  document.getElementById('detail-title').innerText = s.name;
  document.getElementById('detail-rci').innerText = s.rci;
  document.getElementById('detail-condition').innerText = s.condition;
  document.getElementById('detail-potholes').innerText = s.potholes;
  document.getElementById('detail-cracks').innerText = s.crack_density + " %";
  document.getElementById('detail-date').innerText = s.last_inspected;
  panel.classList.remove('hidden');
}

function closeDetails() {
  document.getElementById('segment-details').classList.add('hidden');
}

function initChart(segments) {
  const ctx = document.getElementById('summaryChart').getContext('2d');
  const counts = condCounts(segments);
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(counts),
      datasets: [{
        label: 'Segments',
        data: Object.values(counts),
        backgroundColor: Object.keys(counts).map(k => CONDITION_COLOR[k] || '#999')
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero:true, ticks:{precision:0} }
      }
    }
  });
}

function condCounts(segments) {
  const order = ["Excellent","Good","Fair","Poor","Critical"];
  const map = { "Excellent":0,"Good":0,"Fair":0,"Poor":0,"Critical":0 };
  segments.forEach(s=>{ if(map[s.condition] !== undefined) map[s.condition]++; });
  // return counts in that order to keep chart stable
  const out = {};
  order.forEach(k=>out[k]=map[k]);
  return out;
}

function applyFilter() {
  const val = document.getElementById('filter-condition').value;
  let filtered = SAMPLE_SEGMENTS;
  if (val !== "ALL") filtered = SAMPLE_SEGMENTS.filter(s=>s.condition === val);
  renderSegments(filtered);
  // update chart to reflect filtered set
  const counts = condCounts(filtered);
  chart.data.labels = Object.keys(counts);
  chart.data.datasets[0].data = Object.values(counts);
  chart.update();
}

function wireEvents() {
  document.getElementById('filter-condition').addEventListener('change', applyFilter);
  document.getElementById('refresh-btn').addEventListener('click', ()=>{
    // placeholder: in real app fetch('/api/segments') and re-render
    applyFilter();
    alert('Refreshed (demo data). Replace with API call in production.');
  });
  document.getElementById('close-details').addEventListener('click', closeDetails);
}

// Initialize on DOM ready
window.addEventListener('DOMContentLoaded', init);
