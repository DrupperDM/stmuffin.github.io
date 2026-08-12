const starField = document.getElementById('stars');
if(starField){
  for(let i=0;i<60;i++){
    const s = document.createElement('div');
    s.className = 'star';
    s.style.left = Math.random()*100 + 'vw';
    s.style.top = Math.random()*100 + 'vh';
    s.style.animationDelay = (Math.random()*3) + 's';
    starField.appendChild(s);
  }
}
