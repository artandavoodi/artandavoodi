/* Shared content motion; never intercepts input or controls scrolling. */
export function observeEntrances(targets){
  if(!('IntersectionObserver' in window))return ()=>{};
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>entry.target.toggleAttribute('data-content-visible',entry.isIntersecting));
  },{threshold:0.15,rootMargin:'0px 0px -8% 0px'});
  targets.forEach(target=>{
    target.setAttribute('data-content-reveal','');
    observer.observe(target);
  });
  return ()=>observer.disconnect();
}
