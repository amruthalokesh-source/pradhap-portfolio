(function(){
  const stage=document.querySelector('.flight-stage');
  const path=document.querySelector('.path-progress');
  const base=document.querySelector('.path-base');
  const drone=document.querySelector('.drone-cursor');
  const story=document.querySelector('.flight-story');
  const sections=[...document.querySelectorAll('.story-section')];
  if(!stage||!path||!base||!drone||!story)return;

  let length=0;
  const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setup(){
    length=base.getTotalLength();
    path.setAttribute('d',base.getAttribute('d'));
    path.style.strokeDasharray=`${length} ${length}`;
    path.style.strokeDashoffset=length;
  }

  function update(){
    const stageRect=stage.getBoundingClientRect();
    const storyRect=story.getBoundingClientRect();
    const viewportH=window.innerHeight;

    // Progress is based only on the scrollable story region. This keeps the
    // drone synchronized with the exact path point instead of viewport coords.
    const start=storyRect.top - viewportH*0.15;
    const end=storyRect.bottom - viewportH*0.85;
    const progress=Math.min(1,Math.max(0,(0-start)/Math.max(1,end-start)));

    path.style.strokeDashoffset=length*(1-progress);

    sections.forEach((section,i)=>{
      const threshold=i/(sections.length-1)*0.92;
      section.classList.toggle('is-visible',progress>=threshold-0.06);
    });

    // IMPORTANT: getPointAtLength returns coordinates in the SVG viewBox.
    // Convert them to the rendered SVG/stage dimensions, then position the
    // drone relative to the stage (not the viewport). This makes the drone
    // physically follow the visible blue path at every scroll position.
    const svg=base.ownerSVGElement;
    const vb=svg.viewBox.baseVal;
    const point=base.getPointAtLength(length*progress);
    const next=base.getPointAtLength(Math.min(length,length*progress+10));
    const svgWidth=svg.getBoundingClientRect().width;
    const svgHeight=svg.getBoundingClientRect().height;
    const scaleX=svgWidth/vb.width;
    const scaleY=svgHeight/vb.height;

    const x=point.x*scaleX;
    const y=point.y*scaleY;
    const nx=next.x*scaleX;
    const ny=next.y*scaleY;
    const angle=Math.atan2(ny-y,nx-x)*180/Math.PI;

    const w=drone.offsetWidth||200;
    const h=drone.offsetHeight||130;
    drone.style.transform=`translate3d(${x-w/2}px,${y-h/2}px,0) rotate(${angle}deg)`;
  }

  setup();
  update();

  let ticking=false;
  function requestUpdate(){
    if(ticking)return;
    ticking=true;
    requestAnimationFrame(()=>{update();ticking=false;});
  }
  window.addEventListener('scroll',requestUpdate,{passive:true});
  window.addEventListener('resize',()=>{setup();requestUpdate()},{passive:true});
  if(reduceMotion) drone.style.transition='none';
})();
