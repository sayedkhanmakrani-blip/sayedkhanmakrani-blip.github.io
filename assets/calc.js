/* Pure math functions (shared by pages and tests) */
(function(g){
const C={
 loan(P,ratePct,n){const r=ratePct/100/12;const m=r===0?P/n:P*r/(1-Math.pow(1+r,-n));
  const rows=[];let b=P;for(let i=1;i<=n;i++){const int=b*r;let pr=m-int;if(i===n)pr=b;b-=pr;rows.push([i,m,pr,int,Math.max(b,0)]);}
  return{monthly:m,total:m*n,interest:m*n-P,rows};},
 bmi(kg,m){return kg/(m*m);},
 bmiCat(b){return b<18.5?'Underweight':b<25?'Normal weight':b<30?'Overweight':b<35?'Obesity class I':b<40?'Obesity class II':'Obesity class III';},
 pctOf(x,y){return x*y/100;}, isPct(x,y){return x/y*100;}, pctChange(x,y){return (y-x)/Math.abs(x)*100;},
 age(dob,asOf){let y=asOf.getFullYear()-dob.getFullYear(),m=asOf.getMonth()-dob.getMonth(),d=asOf.getDate()-dob.getDate();
  const U=x=>Date.UTC(x.getFullYear(),x.getMonth(),x.getDate());
  /* anchor = dob + y years + m months; a day that does not exist in that month (e.g. Jan 31 -> Feb, Feb 29 -> non-leap) rolls to the 1st of the next month */
  const anc=(yy,mm)=>{const dim=new Date(yy,mm+1,0).getDate();return dob.getDate()>dim?new Date(yy,mm+1,1):new Date(yy,mm,dob.getDate());};
  m+=y*12;if(d<0)m--;let A=anc(dob.getFullYear(),dob.getMonth()+m);if(U(A)>U(asOf)){m--;A=anc(dob.getFullYear(),dob.getMonth()+m);}
  y=Math.floor(m/12);m-=y*12;d=Math.round((U(asOf)-U(A))/864e5);const total=Math.round((U(asOf)-U(dob))/864e5);
  let nb=new Date(asOf.getFullYear(),dob.getMonth(),dob.getDate());if(dob.getMonth()===1&&dob.getDate()===29&&nb.getMonth()!==1)nb=new Date(asOf.getFullYear(),2,1);
  if(U(nb)<U(asOf))nb=new Date(asOf.getFullYear()+1,dob.getMonth(),dob.getDate());
  return{y,m,d,total,toBday:Math.round((U(nb)-U(asOf))/864e5)};},
 words(t){const w=(t.match(/\S+/g)||[]).length;return{words:w,chars:[...t].length,noSpace:t.replace(/\s/g,'').length,
  sentences:(t.match(/[^.!?。！？]*[.!?。！？]+|[^.!?。！？]+$/g)||[]).filter(s=>/[\p{L}\p{N}]/u.test(s)).length,
  paragraphs:t.split(/\n\s*\n/).filter(p=>p.trim()).length,readMin:Math.ceil(w/238)};},
 title(t){return t.toLowerCase().replace(/(^|[\s\-"(\[“‘¿¡])(\p{L})/gu,(m,a,c)=>a+c.toUpperCase());},
 sentence(t){return t.toLowerCase().replace(/(^[\s"“‘(¿¡]*\p{L}|[.!?]\s+["“‘(¿¡]*\p{L})/gu,c=>c.toUpperCase());}
};

/* ---- unit conversion: factor to base unit (length m, weight kg, volume L, area m2, speed m/s); temperature handled separately ---- */
C.UNITS={
 length:{mm:['Millimeters',.001],cm:['Centimeters',.01],m:['Meters',1],km:['Kilometers',1000],in:['Inches',.0254],ft:['Feet',.3048],yd:['Yards',.9144],mi:['Miles',1609.344]},
 weight:{mg:['Milligrams',1e-6],g:['Grams',.001],kg:['Kilograms',1],t:['Metric tonnes',1000],oz:['Ounces',.028349523125],lb:['Pounds',.45359237],st:['Stone',6.35029318]},
 temperature:{c:['Celsius'],f:['Fahrenheit'],k:['Kelvin']},
 volume:{ml:['Milliliters',.001],l:['Liters',1],m3:['Cubic meters',1000],tsp:['US teaspoons',.00492892159375],tbsp:['US tablespoons',.0147867647812],floz:['US fluid ounces',.0295735295625],cup:['US cups',.2365882365],pt:['US pints',.473176473],qt:['US quarts',.946352946],gal:['US gallons',3.785411784],ukgal:['UK gallons',4.54609]},
 area:{cm2:['Square centimeters',1e-4],m2:['Square meters',1],km2:['Square kilometers',1e6],ha:['Hectares',1e4],in2:['Square inches',.00064516],ft2:['Square feet',.09290304],yd2:['Square yards',.83612736],ac:['Acres',4046.8564224],mi2:['Square miles',2589988.110336]},
 speed:{ms:['Meters per second',1],kmh:['Kilometers per hour',1/3.6],mph:['Miles per hour',.44704],kn:['Knots',1852/3600],fts:['Feet per second',.3048]}
};
C.convert=function(cat,v,from,to){
 if(cat==='temperature'){const k=from==='c'?v+273.15:from==='f'?(v-32)*5/9+273.15:v;return to==='c'?k-273.15:to==='f'?(k-273.15)*9/5+32:k;}
 const U=C.UNITS[cat];return v*U[from][1]/U[to][1];};
C.num=function(x){if(!isFinite(x))return '—';const a=Math.abs(x);if(a!==0&&(a>=1e15||a<1e-6))return x.toExponential(6);return Number(x.toPrecision(10)).toLocaleString('en-US',{maximumFractionDigits:8});};
/* ---- fractions (exact, integers only) ---- */
C.gcd=function(a,b){a=Math.abs(a);b=Math.abs(b);while(b){[a,b]=[b,a%b];}return a;};
C.frac=function(n,d){if(!d||!Number.isSafeInteger(n)||!Number.isSafeInteger(d))return null;if(d<0){n=-n;d=-d;}const g=C.gcd(n,d)||1;return[n/g,d/g];};
C.parseFrac=function(s){s=String(s).trim();let m;
 if(m=s.match(/^(-)?\s*(\d+)\s+(\d+)\s*\/\s*(\d+)$/))return C.frac((m[1]?-1:1)*(+m[2]*+m[4]+ +m[3]),+m[4]);
 if(m=s.match(/^(-?\d+)\s*\/\s*(-?\d+)$/))return C.frac(+m[1],+m[2]);
 if(m=s.match(/^(-?)(\d*)\.?(\d*)$/)){if(!m[2]&&!m[3])return null;const k=m[3].length;return C.frac((m[1]?-1:1)*+((m[2]||'0')+m[3]),Math.pow(10,k));}
 return null;};
C.fracOp=function(a,b,op){const[x,y]=a,[u,v]=b;
 if(op==='+')return C.frac(x*v+u*y,y*v);if(op==='-')return C.frac(x*v-u*y,y*v);if(op==='*')return C.frac(x*u,y*v);if(op==='/')return u===0?null:C.frac(x*v,y*u);return null;};
C.mixed=function(f){const[n,d]=f,s=n<0?'-':'',a=Math.abs(n),w=Math.floor(a/d),r=a%d;return d===1?s+a:w?s+w+' '+r+'/'+d+(r?'':''):s+r+'/'+d;};
/* ---- grades ---- */
C.GRADES={'A+':4,'A':4,'A-':3.7,'B+':3.3,'B':3,'B-':2.7,'C+':2.3,'C':2,'C-':1.7,'D+':1.3,'D':1,'D-':.7,'F':0};
C.gpa=function(rows,prevGpa,prevCr){let qp=0,cr=0;rows.forEach(r=>{if(r.credits>0&&r.grade in C.GRADES){qp+=r.credits*C.GRADES[r.grade];cr+=r.credits;}});
 const term=cr?qp/cr:NaN;let cum=term;if(prevCr>0&&prevGpa>=0)cum=(qp+prevGpa*prevCr)/(cr+prevCr);return{term,credits:cr,points:qp,cum};};
C.weighted=function(rows){let s=0,w=0;rows.forEach(r=>{if(r.weight>0&&isFinite(r.score)){s+=r.score*r.weight;w+=r.weight;}});return{avg:w?s/w:NaN,weight:w};};
C.needFinal=function(current,target,finalWeightPct){const w=finalWeightPct/100;return(target-current*(1-w))/w;};
C.letter=function(p){return p>=97?'A+':p>=93?'A':p>=90?'A-':p>=87?'B+':p>=83?'B':p>=80?'B-':p>=77?'C+':p>=73?'C':p>=70?'C-':p>=67?'D+':p>=63?'D':p>=60?'D-':'F';};
/* ---- time ---- */
C.clock=function(ms,cs){ms=Math.max(0,ms);const t=cs?Math.floor(ms/10):Math.ceil(ms/1000)*100,h=Math.floor(t/360000),m=Math.floor(t/6000)%60,s=Math.floor(t/100)%60,c=t%100,p=x=>String(x).padStart(2,'0');
 return(h?h+':'+p(m):p(m))+':'+p(s)+(cs?'.'+p(c):'');};
C.tzOffset=function(tz,date){const p=new Intl.DateTimeFormat('en-US',{timeZone:tz,hourCycle:'h23',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}).formatToParts(date);
 const g=t=>+p.find(x=>x.type===t).value;return Math.round((Date.UTC(g('year'),g('month')-1,g('day'),g('hour'),g('minute'),g('second'))-Math.floor(date.getTime()/1000)*1000)/60000);};
C.wallToDate=function(tz,y,mo,d,h,mi){const guess=Date.UTC(y,mo-1,d,h,mi);let t=guess-C.tzOffset(tz,new Date(guess))*60000;t=guess-C.tzOffset(tz,new Date(t))*60000;return new Date(t);};
C.fmtOffset=function(min){const s=min<0?'-':'+',a=Math.abs(min);return'UTC'+s+Math.floor(a/60)+(a%60?':'+String(a%60).padStart(2,'0'):'');};
/* ---- image sizing ---- */
C.fit=function(w,h,maxW,maxH){let r=1;if(maxW>0&&w>maxW)r=Math.min(r,maxW/w);if(maxH>0&&h>maxH)r=Math.min(r,maxH/h);return[Math.max(1,Math.round(w*r)),Math.max(1,Math.round(h*r))];};
C.bytes=function(b){return b<1024?b+' B':b<1048576?(b/1024).toFixed(1)+' KB':(b/1048576).toFixed(2)+' MB';};
/* ---- date math (calendar dates as UTC midnights: immune to DST) ---- */
C.ymd=function(s){const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s||''));if(!m)return null;const y=+m[1],mo=+m[2],d=+m[3],t=Date.UTC(y,mo-1,d),x=new Date(t);x.setUTCFullYear(y);return x.getUTCMonth()===mo-1&&x.getUTCDate()===d?[y,mo,d]:null;};
C.dayNum=function(a){const x=new Date(0);x.setUTCFullYear(a[0],a[1]-1,a[2]);return Math.round(x.getTime()/864e5);};
C.fromDayNum=function(n){const x=new Date(n*864e5);return[x.getUTCFullYear(),x.getUTCMonth()+1,x.getUTCDate()];};
C.isLeap=function(y){return y%4===0&&(y%100!==0||y%400===0);};
C.dim=function(y,m){return[31,C.isLeap(y)?29:28,31,30,31,30,31,31,30,31,30,31][m-1];};
C.weekday=function(a){return((C.dayNum(a)%7)+11)%7;};/* 0=Sunday */
C.daysBetween=function(a,b,inclusive){const d=C.dayNum(b)-C.dayNum(a);return d+(inclusive?(d>=0?1:-1):0);};
/* weekdays (Mon-Fri) from a up to b; end date counted only if inclusive. Works in either direction (sign follows). */
C.weekdaysBetween=function(a,b,inclusive){let s=C.dayNum(a),e=C.dayNum(b),sg=1;if(e<s){[s,e]=[e,s];sg=-1;}if(inclusive)e++;
 const n=e-s,full=Math.floor(n/7);let c=full*5;for(let i=s+full*7;i<e;i++){const w=((i%7)+11)%7;if(w!==0&&w!==6)c++;}return sg*c;};
/* add n units (day|week|month|year); month/year results that overflow clamp to the month end (Jan 31 + 1 month = Feb 28/29) */
C.addDate=function(a,n,unit){if(unit==='day'||unit==='week')return C.fromDayNum(C.dayNum(a)+n*(unit==='week'?7:1));
 let y=a[0],m=a[1]-1+(unit==='year'?n*12:n);y+=Math.floor(m/12);m=((m%12)+12)%12+1;return[y,m,Math.min(a[2],C.dim(y,m))];};
C.fmtYMD=function(a){return String(a[0]).padStart(4,'0')+'-'+String(a[1]).padStart(2,'0')+'-'+String(a[2]).padStart(2,'0');};
C.span=function(a,b){/* calendar difference a<=b: whole months (month-end clamped), then days */let mo=(b[0]-a[0])*12+b[1]-a[1],an=C.addDate(a,mo,'month');if(C.dayNum(an)>C.dayNum(b)){mo--;an=C.addDate(a,mo,'month');}return{y:Math.floor(mo/12),m:mo%12,d:C.daysBetween(an,b)};};
C.parts=function(ms){const neg=ms<0;ms=Math.abs(ms);const s=Math.floor(ms/1000);return{neg,d:Math.floor(s/86400),h:Math.floor(s/3600)%24,m:Math.floor(s/60)%60,s:s%60};};
/* next occurrence (today counts) of month/day on or after date a */
C.nextOn=function(a,mo,d){let y=a[0];if(a[1]>mo||(a[1]===mo&&a[2]>d))y++;return[y,mo,d];};
if(typeof module!=='undefined')module.exports=C;else g.Calc=C;
})(this);
