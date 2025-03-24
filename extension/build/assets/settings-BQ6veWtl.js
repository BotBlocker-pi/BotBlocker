import{d as t,j as e,L as m,r as n,b as j,u as w,a as v,R as y}from"./unknownBadge-MV4VocS6.js";const C=t.nav`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    background: linear-gradient(to right, #EAEDFA, #566C98);
    width: 100%;
    box-sizing: border-box;
    margin: 0;
`,S=t.img`
    height: 40px;
`;t.button`
    background-color: #4a5b84;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
        background-color: #3a4a70;
    }

    &:active {
        background-color: #2d3a5a;
    }
`;const B=()=>e.jsx(C,{children:e.jsx("div",{children:e.jsx(S,{src:m,alt:"Logo"})})}),z=t.div`
    background-color: #f5f7fd;
    border-radius: 8px;
    padding: 24px;
    width: 100%;
`,M=t.h2`
    color: #000;
    font-size: 32px;
    font-weight: 600;
    margin-top: 0;
    margin-bottom: 16px;
`,I=t.div`
    margin: 24px 0;
`,A=t.p`
    color: #555;
    font-size: 20px;
    margin-bottom: 12px;
`,L=t.div`
    position: relative;
    width: 100%;
    margin-bottom: 8px;
`,D=t.div`
    background-color: #566C98;
    color: white;
    font-weight: 600;
    padding: 4px 8px;
    border-radius: 4px;
    position: absolute;
    top: -30px;
    left: ${o=>o.value}%;
    transform: translateX(-50%);
    font-size: 18px;
    opacity: ${o=>o.isVisible?1:0};
    transition: opacity 0.2s ease;
    pointer-events: none;
    &::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border-width: 5px;
        border-style: solid;
        border-color: #566C98 transparent transparent transparent;
    }
`,E=t.input`
    width: 100%;
    height: 8px;
    border-radius: 4px;
    background: linear-gradient(to right, #e0e5f6, #566C98);
    -webkit-appearance: none;
    appearance: none;
    outline: none;

    &::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: #566C98;
        cursor: pointer;
        border: 3px solid white;
        box-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
    }

    &::-moz-range-thumb {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #566C98;
        cursor: pointer;
        border: 3px solid white;
        box-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
    }
`,R=t.div`
    display: flex;
    justify-content: space-between;
    width: 100%;
    color: #777;
    font-size: 18px;
`,U=t.div`
    background-color: #fff;
    border-radius: 8px;
    padding: 20px;
    margin-top: 24px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
`,P=t.div`
    font-weight: 600;
    font-size: 18px;
    margin-bottom: 16px;
`,d=t.div`
    display: flex;
    align-items: center;
    margin-bottom: 16px;

    &:last-child {
        margin-bottom: 0;
    }
`,c=t.input`
    margin-right: 16px;
    width: 24px;
    height: 24px;
    cursor: pointer;

    &:checked {
        accent-color: #566C98;
    }
`,l=t.img`
    width: 32px;
    height: 32px;
    margin-right: 16px;
`,p=t.label`
    font-size: 18px;
    font-weight: 500;
`,F=t.div`
    display: flex;
    justify-content: flex-end;
    margin-top: 24px;
`,N=t.button`
    background-color: #566C98;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 10px 24px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;
`,O=()=>{const[o,x]=n.useState(70),[i,g]=n.useState(!0),[r,h]=n.useState(!0),[b,s]=n.useState(!1),u=k=>{x(Number(k.target.value))},f=()=>{s(!0)},a=()=>{s(!1)};return e.jsxs(z,{children:[e.jsx(M,{children:"Blocking Settings"}),e.jsxs(I,{children:[e.jsx(A,{children:"At what percentage do you want accounts to start getting blocked?"}),e.jsxs(L,{children:[e.jsxs(D,{value:o,isVisible:b,children:[o,"%"]}),e.jsx(E,{type:"range",min:"0",max:"100",value:o,onChange:u,onMouseDown:f,onMouseUp:a,onMouseLeave:a})]}),e.jsxs(R,{children:[e.jsx("span",{children:"0%"}),e.jsx("span",{children:"100%"})]})]}),e.jsxs(U,{children:[e.jsx(P,{children:"Block accounts verified such as:"}),e.jsxs(d,{children:[e.jsx(c,{type:"checkbox",checked:i,onChange:()=>g(!i),id:"block-ai"}),e.jsx(l,{src:j,alt:"AI Badge"}),e.jsx(p,{htmlFor:"block-ai",children:"AI"})]}),e.jsxs(d,{children:[e.jsx(c,{type:"checkbox",checked:r,onChange:()=>h(!r),id:"block-unverified"}),e.jsx(l,{src:w,alt:"Unknown Badge"}),e.jsx(p,{htmlFor:"block-unverified",children:"Without verification"})]})]}),e.jsx(F,{children:e.jsx(N,{children:"Save Changes"})})]})};function T(){return e.jsxs("div",{children:[e.jsx(B,{}),e.jsxs("div",{style:{display:"flex",width:"100%",padding:"0 20px"},children:[" ",e.jsxs("div",{style:{flex:1,padding:"20px 0"},children:[" ",e.jsx(O,{})]}),e.jsx("div",{style:{flex:1,padding:"20px 0"}})]})]})}v.createRoot(document.getElementById("settings-root")).render(e.jsx(y.StrictMode,{children:e.jsx(T,{})}));
