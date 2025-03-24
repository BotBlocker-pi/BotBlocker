import{R as m,d as r,j as t,L as X,u as z,b as Z,r as u,c as _}from"./unknownBadge-MV4VocS6.js";var q={color:void 0,size:void 0,className:void 0,style:void 0,attr:void 0},N=m.createContext&&m.createContext(q),ee=["attr","size","title"];function te(e,o){if(e==null)return{};var n=oe(e,o),i,a;if(Object.getOwnPropertySymbols){var c=Object.getOwnPropertySymbols(e);for(a=0;a<c.length;a++)i=c[a],!(o.indexOf(i)>=0)&&Object.prototype.propertyIsEnumerable.call(e,i)&&(n[i]=e[i])}return n}function oe(e,o){if(e==null)return{};var n={};for(var i in e)if(Object.prototype.hasOwnProperty.call(e,i)){if(o.indexOf(i)>=0)continue;n[i]=e[i]}return n}function C(){return C=Object.assign?Object.assign.bind():function(e){for(var o=1;o<arguments.length;o++){var n=arguments[o];for(var i in n)Object.prototype.hasOwnProperty.call(n,i)&&(e[i]=n[i])}return e},C.apply(this,arguments)}function R(e,o){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);o&&(i=i.filter(function(a){return Object.getOwnPropertyDescriptor(e,a).enumerable})),n.push.apply(n,i)}return n}function B(e){for(var o=1;o<arguments.length;o++){var n=arguments[o]!=null?arguments[o]:{};o%2?R(Object(n),!0).forEach(function(i){ne(e,i,n[i])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):R(Object(n)).forEach(function(i){Object.defineProperty(e,i,Object.getOwnPropertyDescriptor(n,i))})}return e}function ne(e,o,n){return o=re(o),o in e?Object.defineProperty(e,o,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[o]=n,e}function re(e){var o=ie(e,"string");return typeof o=="symbol"?o:o+""}function ie(e,o){if(typeof e!="object"||!e)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var i=n.call(e,o);if(typeof i!="object")return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return(o==="string"?String:Number)(e)}function F(e){return e&&e.map((o,n)=>m.createElement(o.tag,B({key:n},o.attr),F(o.child)))}function se(e){return o=>m.createElement(ae,C({attr:B({},e.attr)},o),F(e.child))}function ae(e){var o=n=>{var{attr:i,size:a,title:c}=e,p=te(e,ee),f=a||n.size||"1em",l;return n.className&&(l=n.className),e.className&&(l=(l?l+" ":"")+e.className),m.createElement("svg",C({stroke:"currentColor",fill:"currentColor",strokeWidth:"0"},n.attr,i,p,{className:l,style:B(B({color:e.color||n.color},n.style),e.style),height:f,width:f,xmlns:"http://www.w3.org/2000/svg"}),c&&m.createElement("title",null,c),e.children)};return N!==void 0?m.createElement(N.Consumer,null,n=>o(n)):o(q)}function ce(e){return se({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{d:"M487.4 315.7l-42.6-24.6c4.3-23.2 4.3-47 0-70.2l42.6-24.6c4.9-2.8 7.1-8.6 5.5-14-11.1-35.6-30-67.8-54.7-94.6-3.8-4.1-10-5.1-14.8-2.3L380.8 110c-17.9-15.4-38.5-27.3-60.8-35.1V25.8c0-5.6-3.9-10.5-9.4-11.7-36.7-8.2-74.3-7.8-109.2 0-5.5 1.2-9.4 6.1-9.4 11.7V75c-22.2 7.9-42.8 19.8-60.8 35.1L88.7 85.5c-4.9-2.8-11-1.9-14.8 2.3-24.7 26.7-43.6 58.9-54.7 94.6-1.7 5.4.6 11.2 5.5 14L67.3 221c-4.3 23.2-4.3 47 0 70.2l-42.6 24.6c-4.9 2.8-7.1 8.6-5.5 14 11.1 35.6 30 67.8 54.7 94.6 3.8 4.1 10 5.1 14.8 2.3l42.6-24.6c17.9 15.4 38.5 27.3 60.8 35.1v49.2c0 5.6 3.9 10.5 9.4 11.7 36.7 8.2 74.3 7.8 109.2 0 5.5-1.2 9.4-6.1 9.4-11.7v-49.2c22.2-7.9 42.8-19.8 60.8-35.1l42.6 24.6c4.9 2.8 11 1.9 14.8-2.3 24.7-26.7 43.6-58.9 54.7-94.6 1.5-5.5-.7-11.3-5.6-14.1zM256 336c-44.1 0-80-35.9-80-80s35.9-80 80-80 80 35.9 80 80-35.9 80-80 80z"},child:[]}]})(e)}const le=r.nav`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    background: linear-gradient(to right, #EAEDFA, #566C98);
    width: 100%;
    box-sizing: border-box;
    margin: 0;
`,de=r.img`
    height: 40px;
`,pe=r(ce)`
    font-size: 24px;
    color: white;
    cursor: pointer;

    &:hover {
        opacity: 0.8;
    }
`,U=()=>{const e=()=>{chrome.tabs.create({url:chrome.runtime.getURL("settings.html")})};return t.jsxs(le,{children:[t.jsx("div",{children:t.jsx(de,{src:X,alt:"Logo"})}),t.jsx("div",{children:t.jsx(pe,{onClick:e})})]})},ue="data:image/png;base64,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",ge=r.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 10px 5px 10px;
    margin: 0;
`,xe=r.div`
    display: flex;
    align-items: center;
    padding-left: 15px;
`,he=r.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    margin: 0 20px;
`,fe=r.div`
    display: flex;
    align-items: center;
    padding-right: 15px;
`,be=r.img`
    width: 70px; 
    height: 70px;
    border-radius: 50%; 
`,me=r.span`
    font-size: 16px;
    font-weight: bold;
    color: #666; 
    margin-bottom: 10px; 
`,ye=r.span`
    font-size: 16px; 
    color: #666; 
`,Ae=r.img`
    width: 50px; 
    height: 50px;
    cursor: pointer; 

    &:hover {
        opacity: 0.8; 
    }
`,je=({imageUrl:e,accountType:o,username:n})=>t.jsxs(ge,{children:[t.jsx(xe,{children:t.jsx(be,{src:e,alt:"Profile"})}),t.jsxs(he,{children:[t.jsx(me,{children:o}),t.jsx(ye,{children:n})]}),t.jsx(fe,{children:t.jsx(Ae,{src:ue,alt:"Block"})})]}),we="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAAmCAYAAACoPemuAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAANNSURBVHgB7VdbSFRBGP7OJq54qcwSJIwto5A09aGHktgMQouQSLppED0EeaEeevDB6AJCL/ZShEgSXR6KiIqgjNIiS8OsICG0qIjSsszcIi2vp2/2nGz3OLt7dvcEPewH3+zOP//MfOefmf/MASKI4N9CgdWoVXNYrubIjditPHPbTqrpGEU+bGij7aGZYawVVqsms2wjHaRKNrtLYBlniuX/fv5moVTpCTSUDVZiAlW6KAHx0E6WTrcozZJEcfVQ1YABCT9ix9VMPl4huYW1TFN9VLxnWU9eRZnSAcuF1alpjNIrhIMJ5KJcaTWaw1vKCS5NEEiJA1LjDEYVc2S+4QlTMGzWVYi6Wwjc3wDMi/doUMdHZP5RCA4zyWIygxzFraOxWLMvYCdHAnBzPbB4BjA4CkyP9mi0TVvCssHYJ5g9JhTs18UBSQ6gkpkhIRnBiMq7BrT3eTiIFGJDAfPbY89+ZpfyIFkzKUqgqGaKqJzZwPZFclGffwL51w2iBLQUcsw4oZmldOjCvGGP96qmcfKGdQxkDBDNdWjo9hZV0gS09PqYQUG80WQmYhWQLfmFcsD1cbLa/wvoHuKTcsQ6JyOz0VtUY7fP8ft4uneGImylfLjXwOW/G9/F85l7Begc0MTNjdNEbbrtV5RIOUeYZJ+EIizBZ0tvl1d1eJz77BLw9IsmdDNFNX+Afyh4KTOb2WPitKRLW6Kip5iEOHHyUvh2fOFCYKiwy8xmInbWZ8vQgNT8fcSkKIFp+CY3B8YbaPtswZSWwX7gOXPjGNctJd2FKHsMzEDBV0bqNFnJ/XVH7mIOiSSzEJb7aD9F7uJ97CJ/i+BfVBdGkI09yrB/t+BQQm4ll+p975HnyRvu1np1Fl9U4raRqPuL0yEEZOn1HxBXo1LlbaCJAglbRW4jF5IHyBaJj9ineeRe8h0KqtpRWJ1KazN60YpDyhhOqNmcaS1TwyNUKE0wAV/CxBNXk2UGOxMAHpA9et/5uvgVBj/R9zA5BgshJjwH7c4eDmtgMXZYIOoPnQgRsjxWDOsQ8lgyYRmwDuY+TiSQCbPDOphLuBJY+11pIWTCrDziIY8lE9YJ69CBECFLsA5oKSMR4UHcxM6QnxBBBP8hfgMl8e+UdPm74gAAAABJRU5ErkJggg==",ve=r.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 5px;
    margin: 0;
`,ke=r.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
`,Se=r.span`
    font-size: 24px;
    font-weight: bold;
    color: #333;
`,Ce=r.span`
    font-size: 14px;
    color: #666;
`,J=r.div`
    position: relative;
    display: inline-block;
`,Be=r.img`
    width: 50px;
    height: 50px;
    cursor: pointer; 
`,Oe=r.div`
    visibility: hidden;
    width: 120px;
    background-color: #566C98;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 8px;
    position: absolute;
    z-index: 1;
    bottom: 90%;
    left: 50%;
    transform: translateX(-70%); 
    opacity: 0;
    transition: opacity 0.3s;

    ${J}:hover & {
        visibility: visible;
        opacity: 1;
    }
`,Ie=({botPercentage:e,numberVotes:o,badge:n})=>{let i,a;switch(n){case"bot":i=Z,a="Our specialists verified this account as a bot.";break;case"human":i=we,a="Our specialists verified this account as a human.";break;case"empty":i=z,a="The status of this account is unknown.";break;default:i=z,a="The status of this account is unknown."}return t.jsxs(ve,{children:[t.jsxs(ke,{children:[t.jsxs(Se,{children:[e,"% chance of being AI"]}),t.jsxs(Ce,{children:["(",o," votes)"]})]}),t.jsxs(J,{children:[t.jsx(Be,{src:i,alt:"Badge"}),t.jsx(Oe,{children:a})]})]})},V="http://localhost/api",Pe=async e=>{try{console.log("URL recebida para análise:",e);const o=`${V}/get_probability/?url=${encodeURIComponent(e)}`;console.log("Fazendo requisição para:",o);const n=await fetch(o,{method:"GET",headers:{"Content-Type":"application/json"}});if(!n.ok)throw console.error(`API Error: ${n.status} - ${n.statusText}`),new Error(`API Error: ${n.statusText}`);const i=await n.json();return console.log("Dados retornados da API:",i),i}catch(o){return console.error("Error getting profile data:",o),null}},Ee=async e=>{const o=localStorage.getItem("access_token");if(!o)return alert("The user is not authenticated"),null;try{const n=await fetch(`${V}/avaliacao/`,{method:"POST",headers:{Authorization:`Bearer ${o}`,"Content-Type":"application/json"},body:JSON.stringify(e)});if(!n.ok)throw new Error("Failed to submit evaluation");return await n.json()}catch(n){return console.error("Error submitting evaluation:",n),null}},Le=r.div`
    text-align: center;
    margin-top: 20px;
`,ze=r.p`
    font-size: 20px;
    color: #333;
    margin-bottom: 15px;
    font-weight: bold;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding-left: 20px;
`,A=r.label`
    display: flex;
    align-items: center;
    padding: 10px 20px;
    font-size: 14px;
    color: black;
    background-color: #f0f0f0;
    border: 1px solid #ccc;
    border-radius: 5px;
    cursor: pointer;
    margin: 5px;
    transition: background-color 0.3s ease;
    text-align: left;

    &:hover {
        background-color: #ddd;
    }
`,j=r.input`
    margin-right: 10px;
`,Ne=r.input`
    padding: 10px;
    font-size: 14px;
    border: 1px solid #ccc;
    border-radius: 5px;
    margin-top: 10px;
    width: 80%;
`,Re=r.button`
  padding: 10px 20px;
  font-size: 16px;
  color: white;
  background-color: #007bff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #0056b3;
  }
`,Ue=({onSubmit:e})=>{const[o,n]=u.useState([]),[i,a]=u.useState(""),c=l=>{o.includes(l)?n(o.filter(h=>h!==l)):n([...o,l])},p=l=>{a(l.target.value)},f=()=>{if(o.includes("Other")&&i.trim()===""){alert("Please specify the reason for selecting 'Other'.");return}const l=o.includes("Other")?[...o.filter(h=>h!=="Other"),`Other: ${i}`]:o;e(l)};return t.jsxs(Le,{children:[t.jsx(ze,{children:"Why do you think this profile is AI?"}),t.jsxs(A,{children:[t.jsx(j,{type:"checkbox",checked:o.includes("Inconsistency"),onChange:()=>c("Inconsistency")}),"Inconsistency"]}),t.jsxs(A,{children:[t.jsx(j,{type:"checkbox",checked:o.includes("Unnatural posting patterns"),onChange:()=>c("Unnatural posting patterns")}),"Unnatural posting patterns"]}),t.jsxs(A,{children:[t.jsx(j,{type:"checkbox",checked:o.includes("Lacking quality and uniqueness"),onChange:()=>c("Lacking quality and uniqueness")}),"Lacking quality and uniqueness"]}),t.jsxs(A,{children:[t.jsx(j,{type:"checkbox",checked:o.includes("Lack of engagement"),onChange:()=>c("Lack of engagement")}),"Lack of engagement"]}),t.jsxs(A,{children:[t.jsx(j,{type:"checkbox",checked:o.includes("Other"),onChange:()=>c("Other")}),"Other"]}),o.includes("Other")&&t.jsx(Ne,{type:"text",placeholder:"Please specify the reason...",value:i,onChange:p}),t.jsx(Re,{onClick:f,children:"Submit"})]})},Te=r.div`
    text-align: center;
    margin-top: 20px;
`,De=r.p`
    font-size: 20px;
    color: #333;
    margin-bottom: 15px;
    font-weight: bold;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding-left: 20px;
`,w=r.label`
  display: flex;
  align-items: center;
  padding: 10px 20px;
  font-size: 14px;
  color: black;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 5px;
  cursor: pointer;
  margin: 5px;
  transition: background-color 0.3s ease;
  text-align: left;

    &:hover {
        background-color: #ddd;
    }
`,v=r.input`
    margin-right: 10px;
`,Qe=r.button`
  padding: 10px 20px;
  font-size: 16px;
  color: white;
  background-color: #007bff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #0056b3;
  }
`,Ye=({onSubmit:e})=>{const[o,n]=u.useState([]),i=c=>{o.includes(c)?n(o.filter(p=>p!==c)):n([...o,c])},a=()=>{if(o.includes("Other")&&otherReason.trim()===""){alert("Please specify the reason for selecting 'Other'.");return}const c=o.includes("Other")?[...o.filter(p=>p!=="Other"),`Other: ${otherReason}`]:o;e(c)};return t.jsxs(Te,{children:[t.jsx(De,{children:"Reason?"}),t.jsxs(w,{children:[t.jsx(v,{type:"checkbox",checked:o.includes("I know this person"),onChange:()=>i("I know this person")}),"I know this person"]}),t.jsxs(w,{children:[t.jsx(v,{type:"checkbox",checked:o.includes("Natural posting patterns"),onChange:()=>i("Natural posting patterns")}),"Natural posting patterns"]}),t.jsxs(w,{children:[t.jsx(v,{type:"checkbox",checked:o.includes("Acts in a very natural way"),onChange:()=>i("Acts in a very natural way")}),"Acts in a very natural way"]}),t.jsxs(w,{children:[t.jsx(v,{type:"checkbox",checked:o.includes("Consistency"),onChange:()=>i("Consistency")}),"Consistency"]}),t.jsxs(w,{children:[t.jsx(v,{type:"checkbox",checked:o.includes("Other"),onChange:()=>i("Other")}),"Other"]}),t.jsx(Qe,{onClick:a,children:"Submit"})]})},$="http://localhost:8000",qe=async(e,o)=>{try{const n=await fetch(`${$}/api/token/`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:e,password:o})});if(!n.ok)throw new Error("Credenciais inválidas");return await n.json()}catch(n){return console.error("Error logging in:",n),null}},G=async()=>{const e=localStorage.getItem("access_token");if(!e)return!1;console.log(1);try{console.log(1);const o=await fetch(`${$}/api/protected/`,{method:"GET",headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"}});return console.log(1),o.ok}catch(o){return console.log(11),console.error("Error checking authentication:",o),!1}},K=()=>{localStorage.removeItem("access_token"),localStorage.removeItem("refresh_token")},d={primary:"#4361ee",primaryHover:"#3a56d4",error:"#ef476f",success:"#06d6a0",background:"#ffffff",backgroundSecondary:"#f8f9fa",text:"#2b2d42",transition:"all 0.3s ease",borderRadius:"12px"},Fe=r.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px 16px;
  font-family: "Arial", sans-serif;
`,M=r.div`
  background-color: ${d.background};
  border-radius: ${d.borderRadius};
  width: 100%;
  overflow: hidden;
`,Je=r(M)`
  text-align: center;
  padding: 24px;
`,Ve=r.h2`
  color: ${d.text};
  margin-bottom: 20px;
  text-align: center;
  font-weight: 700;
  font-size: 24px;
`,$e=r.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0 16px 24px;
`,T=r.div`
  position: relative;
`,D=r.input`
  width: 100%;
  padding: 14px 16px;
  border-radius: 8px;
  border: 1px solid ${e=>e.$error?d.error:"#e9ecef"};
  font-size: 16px;
  background-color: ${d.backgroundSecondary};
  transition: ${d.transition};
  outline: none;
  box-sizing: border-box;

  &:focus {
    border-color: ${d.primary};
    box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.2);
  }

  &::placeholder {
    color: #adb5bd;
  }
`,P=r.button`
  padding: 14px 24px;
  border-radius: 8px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: ${d.transition};

  &:hover {
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`,Ge=r(P)`
  padding: 14px;
  background-color: ${d.primary};
  color: white;
  margin-top: 8px;
  box-shadow: 0 4px 10px rgba(67, 97, 238, 0.3);

  &:hover {
    background-color: ${d.primaryHover};
    box-shadow: 0 6px 15px rgba(67, 97, 238, 0.4);
  }
`,Ke=r(P)`
  background-color: ${d.error};
  color: white;
  margin-top: 16px;
  box-shadow: 0 4px 10px rgba(239, 71, 111, 0.3);

  &:hover {
    background-color: #e5364d;
    box-shadow: 0 6px 15px rgba(239, 71, 111, 0.4);
  }
`,Me=r(P)`
  background-color: ${d.primary};
  color: white;
  margin-top: 16px;
  margin-right: 12px;
  box-shadow: 0 4px 10px rgba(67, 97, 238, 0.3);

  &:hover {
    background-color: ${d.primaryHover};
    box-shadow: 0 6px 15px rgba(67, 97, 238, 0.4);
  }
`,He=r.div`
  display: flex;
  justify-content: center;
  margin-top: 8px;
`,We=r.div`
  text-align: center;
  padding: 12px;
  margin: 16px;
  border-radius: 8px;
  font-weight: 500;
  background-color: ${e=>e.$success?"rgba(6, 214, 160, 0.1)":"rgba(239, 71, 111, 0.1)"};
  color: ${e=>e.$success?d.success:d.error};
`,Xe=r.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: ${d.success};
  margin-bottom: 16px;
`,Ze=r.span`
  font-size: 22px;
  color: ${d.success};
`,_e=r.div`
  width: 100%;
  height: 1px;
  background-color: #e9ecef;
  margin: 8px 0;
`,et=r.div`
  background-color: ${d.backgroundSecondary};
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
`,tt=({onBackToHome:e,onAuthChange:o})=>{const[n,i]=u.useState(""),[a,c]=u.useState(""),[p,f]=u.useState(""),[l,h]=u.useState(!1);u.useEffect(()=>{(async()=>{const y=await G();h(y)})()},[]);const O=async x=>{x.preventDefault(),f("");const y=await qe(n,a);y?(localStorage.setItem("access_token",y.access),f("✅ Login successful!"),h(!0),o&&o(!0)):f("❌ Invalid credentials.")},k=async x=>{x.preventDefault(),K(),h(!1),o&&o(!1),i(""),c("")},I=x=>{x.preventDefault(),e&&typeof e=="function"&&e()};return t.jsx(Fe,{children:l?t.jsxs(Je,{children:[t.jsxs(Xe,{children:[t.jsx(Ze,{children:"✓"}),"Authenticated User"]}),t.jsx(et,{children:"You are currently logged in to your account."}),t.jsx(_e,{}),t.jsxs(He,{children:[t.jsx(Me,{onClick:I,children:"Back to Home"}),t.jsx(Ke,{onClick:k,children:"Logout"})]})]}):t.jsxs(M,{children:[t.jsx(Ve,{children:"Account Login"}),p&&t.jsx(We,{$success:p.includes("✅"),children:p}),t.jsxs($e,{onSubmit:O,children:[t.jsx(T,{children:t.jsx(D,{type:"text",placeholder:"Username",value:n,onChange:x=>i(x.target.value),required:!0,$error:p.includes("❌")})}),t.jsx(T,{children:t.jsx(D,{type:"password",placeholder:"Password",value:a,onChange:x=>c(x.target.value),required:!0,$error:p.includes("❌")})}),t.jsx(Ge,{type:"submit",children:"Sign In"})]})]})})},s={primary:"#4361ee",primaryHover:"#3a56d4",secondary:"#f72585",error:"#ef476f",background:"#ffffff",backgroundSecondary:"#f8f9fa",text:"#2b2d42",lightText:"#6c757d",boxShadow:"0 8px 30px rgba(0, 0, 0, 0.08)",transition:"all 0.3s ease",borderRadius:"12px"},Q=r.div`
  background-color: ${s.background};
  border-radius: ${s.borderRadius};
  box-shadow: ${s.boxShadow};
  padding-bottom: 24px;
  max-width: 400px;
  width: 100%;
  margin: 0 auto;
  overflow: hidden;
  transition: ${s.transition};
`,ot=r.button`
  background-color: ${s.primary};
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 30px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  margin: 24px auto;
  display: block;
  transition: ${s.transition};
  box-shadow: 0 4px 10px rgba(67, 97, 238, 0.3);

  &:hover {
    background-color: ${s.primaryHover};
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(67, 97, 238, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`,H=r.p`
  font-size: 14px;
  color: ${s.primary};
  text-decoration: underline;
  margin: 0;
  text-align: center;
  padding: 16px 0;
  cursor: pointer;
  transition: ${s.transition};

  &:hover {
    color: ${s.primaryHover};
  }
`;r(H)`
  padding-top: 10px;
  margin-bottom: 15px;
`;const nt=r.div`
  text-align: center;
  margin: 24px 16px;
  padding: 16px;
  background-color: ${s.backgroundSecondary};
  border-radius: ${s.borderRadius};
`,rt=r.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  padding-top: 20px;
`,Y=r.button`
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  color: ${s.text};
  background-color: transparent;
  border: 2px solid ${e=>e.$vote==="Yes"?s.secondary:s.primary};
  border-radius: 100px;
  cursor: pointer;
  width: 120px;
  transition: ${s.transition};

  &:hover {
    background-color: ${e=>e.$vote==="Yes"?s.secondary:s.primary};
    color: white;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`,it=r.div`
  font-size: 22px;
  font-weight: 700;
  color: ${s.text};
  margin-bottom: 8px;
`,st=r.div`
  padding: 0 16px;
`,at=r.div`
  height: 1px;
  background-color: #e9ecef;
  margin: 12px 0;
`,ct=r.div`
  padding: 20px;
  text-align: center;
  color: ${s.lightText};
`,lt=r.button`
  background-color: ${s.error};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 30px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  margin: 12px auto 0;
  display: block;
  transition: ${s.transition};
  box-shadow: 0 4px 10px rgba(239, 71, 111, 0.3);

  &:hover {
    background-color: #e5364d;
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(239, 71, 111, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`,dt=r.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 12px;
  padding: 8px;
  border-radius: ${s.borderRadius};
  background-color: ${s.backgroundSecondary};
`,pt=r.div`
  font-size: 14px;
  color: ${s.text};
  margin-bottom: 8px;
  font-weight: 500;
`,ut=()=>{const[e,o]=u.useState(null),[n,i]=u.useState(!1),[a,c]=u.useState(null),[p,f]=u.useState(!1),[l,h]=u.useState(!1),[O,k]=u.useState(!0);u.useEffect(()=>{const g=async()=>{try{const S=await G();h(S),localStorage.setItem("isAuthenticated",JSON.stringify(S))}catch(S){console.error("Error checking auth status:",S)}},b=localStorage.getItem("isAuthenticated");b&&h(JSON.parse(b)),g()},[]);const I=g=>{h(g),localStorage.setItem("isAuthenticated",JSON.stringify(g))},x=g=>{console.log(`User voted: ${g}`),i(!0),c(g)},y=()=>{K(),h(!1),localStorage.removeItem("isAuthenticated")},E=g=>{console.log(`Selected reason: ${g}`);const b={profile:e.perfil_name,rede_social:e.plataform,is_bot:a==="Yes",notas:g.join(", "),created_at:new Date().toISOString()};Ee(b),i(!1),c(null)},W=()=>{f(!0)},L=()=>{f(!1)};return u.useEffect(()=>{p||(k(!0),chrome.tabs.query({active:!0,currentWindow:!0},async g=>{if(g.length>0){console.log("URL atual:",g[0].url);try{console.log("Fazendo requisição para obter dados do perfil...");const b=await Pe(g[0].url);console.log("Dados recebidos da API:",b),o(b)}catch(b){console.error("Erro ao obter dados do perfil:",b)}finally{k(!1)}}}))},[p]),p?t.jsxs(Q,{children:[t.jsx(U,{onBack:L,showBackButton:!0}),t.jsx(tt,{onBackToHome:L,onAuthChange:I})]}):t.jsxs(Q,{children:[t.jsx(U,{}),t.jsx(H,{children:"Visit our website for more details on this account."}),t.jsxs(st,{children:[O?t.jsx(ct,{children:"Loading profile data..."}):e&&t.jsxs(t.Fragment,{children:[t.jsx(je,{imageUrl:"https://via.placeholder.com/50",accountType:e.plataform,username:e.perfil_name}),t.jsx(at,{}),t.jsx(Ie,{botPercentage:e.probability,numberVotes:e.numberOfEvaluations,badge:e.badge})]}),l?n?a==="Yes"?t.jsx(Ue,{onSubmit:E}):t.jsx(Ye,{onSubmit:E}):t.jsxs(nt,{children:[t.jsx(it,{children:"Is this profile AI?"}),t.jsxs(rt,{children:[t.jsx(Y,{$vote:"Yes",onClick:()=>x("Yes"),children:"Yes"}),t.jsx(Y,{$vote:"No",onClick:()=>x("No"),children:"No"})]})]}):t.jsx("div",{style:{textAlign:"center",margin:"24px 0"},children:t.jsx(ot,{onClick:W,children:"Login to Continue"})}),l&&t.jsxs(dt,{children:[t.jsx(pt,{children:"✓ You are currently logged in"}),t.jsx(lt,{onClick:y,children:"Logout"})]})]})]})},gt=()=>t.jsx("div",{style:{width:"100%",height:"100%"},children:t.jsx(ut,{})});_.createRoot(document.getElementById("root")).render(t.jsx(u.StrictMode,{children:t.jsx(gt,{})}));
