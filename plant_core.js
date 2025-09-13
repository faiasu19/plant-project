(function(){
  const plantNameEl = document.getElementById('plantName');
  const descEl = document.getElementById('desc');
  const lastWateredEl = document.getElementById('lastWatered');
  const intervalDaysEl = document.getElementById('intervalDays');
  const tempMinEl = document.getElementById('tempMin');
  const tempMaxEl = document.getElementById('tempMax');
  const calcBtn = document.getElementById('calcNext');
  const markNowBtn = document.getElementById('markNow');
  const resultBox = document.getElementById('resultBox');
  const resPlant = document.getElementById('resPlant');
  const nextDateText = document.getElementById('nextDateText');
  const intervalText = document.getElementById('intervalText');
  const tempText = document.getElementById('tempText');
  const qrImg = document.getElementById('qrImg');
  const downloadQrBtn = document.getElementById('downloadQr');
  const downloadIcsBtn = document.getElementById('downloadIcs');

  // Load saved data
  if(localStorage.getItem('plantName')) plantNameEl.value = localStorage.getItem('plantName');
  if(localStorage.getItem('desc')) descEl.value = localStorage.getItem('desc');
  if(localStorage.getItem('lastWatered')) lastWateredEl.value = localStorage.getItem('lastWatered');
  else lastWateredEl.value = new Date().toISOString().slice(0,10);
  if(localStorage.getItem('intervalDays')) intervalDaysEl.value = localStorage.getItem('intervalDays');
  if(localStorage.getItem('tempMin')) tempMinEl.value = localStorage.getItem('tempMin');
  if(localStorage.getItem('tempMax')) tempMaxEl.value = localStorage.getItem('tempMax');

  function formatDateReadable(d){
    return new Date(d).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
  }

  function calcNextDate(){
    const last=new Date(lastWateredEl.value);
    const days=Number(intervalDaysEl.value)||7;
    return new Date(last.getTime()+days*24*60*60*1000);
  }

  function buildShareLink(){
    return location.origin + location.pathname + '?plant=' + encodeURIComponent(plantNameEl.value);
  }

  function updateQR(){
    qrImg.src='https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=' + encodeURIComponent(buildShareLink());
  }

  function saveData(){
    localStorage.setItem('plantName', plantNameEl.value);
    localStorage.setItem('desc', descEl.value);
    localStorage.setItem('lastWatered', lastWateredEl.value);
    localStorage.setItem('intervalDays', intervalDaysEl.value);
    localStorage.setItem('tempMin', tempMinEl.value);
    localStorage.setItem('tempMax', tempMaxEl.value);
  }

  [plantNameEl, descEl, intervalDaysEl, tempMinEl, tempMaxEl, lastWateredEl].forEach(el=>{
    el.addEventListener('input',()=>{updateQR(); saveData();});
  });

  updateQR();

  calcBtn.addEventListener('click',function(){
    const next=calcNextDate();
    resPlant.textContent = plantNameEl.value;
    nextDateText.textContent = 'Next watering date: ' + formatDateReadable(next);
    intervalText.textContent = `Water every ${intervalDaysEl.value} days (Last watered: ${formatDateReadable(lastWateredEl.value)})`;
    tempText.textContent = `Optimal temperature: ${tempMinEl.value}°C — ${tempMaxEl.value}°C`;
    resultBox.style.display='block';
  });

  markNowBtn.addEventListener('click',function(){
    const nowISO=new Date().toISOString().slice(0,10);
    lastWateredEl.value=nowISO;
    updateQR();
    saveData();
    alert('Watering recorded: ' + formatDateReadable(nowISO));
  });

  downloadQrBtn.addEventListener('click',function(){
    const a=document.createElement('a');
    a.href=qrImg.src;
    a.download=(plantNameEl.value||'plant')+'-qr.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
  });

  downloadIcsBtn.addEventListener('click',function(){
    const occurrences=12;
    const last=new Date(lastWateredEl.value);
    const intervalDays=Number(intervalDaysEl.value)||7;
    const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//PlantCareLocal//EN'];
    for(let i=1;i<=occurrences;i++){
      const ev=new Date(last.getTime() + i*intervalDays*24*60*60*1000);
      const dt=ev.toISOString().slice(0,10).replace(/-/g,'');
      const uid=`${plantNameEl.value.replace(/\s+/g,'')||'plant'}-${i}@local`;
      const dtstamp=new Date().toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';
      lines.push(
        'BEGIN:VEVENT',
        'UID:'+uid,
        'DTSTAMP:'+dtstamp,
        'DTSTART;VALUE=DATE:'+dt,
        'SUMMARY:Watering Reminder - '+plantNameEl.value,
        'DESCRIPTION:'+descEl.value,
        'END:VEVENT'
      );
    }
    lines.push('END:VCALENDAR');
    const blob=new Blob([lines.join('\r\n')],{type:'text/calendar;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;
    a.download=(plantNameEl.value||'plant')+'-watering.ics';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });

})();
