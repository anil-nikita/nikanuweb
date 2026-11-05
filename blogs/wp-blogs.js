/* WordPress se blogs laata hai aur blogs-data.js ke blogs ke saath jod deta hai.
   WordPress site ka address badalna ho to sirf neeche WP_SITE badlo. */
(function(){
var WP_SITE='nikanuweb3.wordpress.com';
var API='https://public-api.wordpress.com/rest/v1.1/sites/'+WP_SITE+'/posts/?number=100&order_by=date&order=DESC&fields=ID,title,slug,date,excerpt,content,featured_image,categories,status';

function txt(h){var t=document.createElement('textarea');t.innerHTML=String(h==null?'':h);return t.value}
function plain(h){var d=document.createElement('div');d.innerHTML=String(h||'');return (d.textContent||'').replace(/\s+/g,' ').trim()}
function clean(html){
  var doc=new DOMParser().parseFromString('<div>'+String(html||'')+'</div>','text/html'),root=doc.body.firstChild;
  root.querySelectorAll('script,style,object,embed,link,meta,form').forEach(function(n){n.remove()});
  root.querySelectorAll('*').forEach(function(n){
    Array.prototype.slice.call(n.attributes).forEach(function(a){
      var k=a.name.toLowerCase(),v=String(a.value).trim().toLowerCase();
      if(k.indexOf('on')===0||((k==='href'||k==='src')&&v.indexOf('javascript:')===0))n.removeAttribute(a.name);
    });
  });
  root.querySelectorAll('img').forEach(function(i){i.removeAttribute('width');i.removeAttribute('height');i.removeAttribute('srcset');i.removeAttribute('sizes');i.setAttribute('loading','lazy')});
  return root.innerHTML;
}
function fmt(d){try{return new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}catch(e){return ''}}
function conv(p){
  var content=clean(p.content),words=plain(content).split(' ').filter(Boolean).length;
  var cats=Object.keys(p.categories||{}).filter(function(c){return c.toLowerCase()!=='uncategorized'});
  var img=p.featured_image||'';
  if(!img){var m=/<img[^>]+src="([^"]+)"/i.exec(content);if(m)img=m[1]}
  var ex=plain(p.excerpt);
  if(!ex)ex=plain(content).slice(0,170)+'...';
  return {slug:String(p.slug),title:txt(p.title),category:txt(cats[0]||''),date:fmt(p.date),readTime:Math.max(1,Math.round(words/200))+' min read',emoji:'',image:img,excerpt:ex,content:content,_t:+new Date(p.date)};
}
window.loadAllBlogs=function(){
  var local=(window.BLOGS||[]).slice();
  return fetch(API).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(j){
    var wp=(j.posts||[]).filter(function(p){return !p.status||p.status==='publish'}).map(conv);
    var have={};wp.forEach(function(b){have[b.slug]=1});
    return wp.concat(local.filter(function(b){return !have[b.slug]}));
  }).catch(function(){return local});
};
})();
