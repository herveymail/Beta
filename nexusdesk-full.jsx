import { useState, useEffect, useCallback, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const FONT = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@350;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');`;
const CSS = `
*{box-sizing:border-box;margin:0;padding:0}
::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#2d3250;border-radius:4px}
@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideR{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
@keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
.fi{animation:fadeIn .3s ease both}.sr{animation:slideR .25s ease both}.sd{animation:slideDown .2s ease both}
.d1{animation-delay:.03s}.d2{animation-delay:.06s}.d3{animation-delay:.09s}.d4{animation-delay:.12s}
`;

const P={bg:"#1a1d2e",rail:"#141728",surface:"#1e2235",card:"#242842",cardHover:"#2a2f50",input:"#1a1d30",border:"#2d3250",borderHover:"#3d4270",text:"#e8eaf0",dim:"#8b90b0",muted:"#555a7a",blue:"#578AFF",blueHover:"#6B9AFF",blueBg:"rgba(87,138,255,.1)",blueBorder:"rgba(87,138,255,.25)",green:"#36B37E",greenBg:"rgba(54,179,126,.1)",red:"#FF5630",redBg:"rgba(255,86,48,.08)",amber:"#FFAB00",amberBg:"rgba(255,171,0,.08)",purple:"#9F8FEF",purpleBg:"rgba(159,143,239,.08)",cyan:"#00C7E6",cyanBg:"rgba(0,199,230,.08)"};

// ── Icons ──
const Ic={
  logo:s=><svg width={s||22} height={s||22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  home:s=><svg width={s||18} height={s||18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  search:s=><svg width={s||16} height={s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>,
  bell:s=><svg width={s||18} height={s||18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>,
  plus:s=><svg width={s||14} height={s||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
  x:s=><svg width={s||16} height={s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>,
  gear:s=><svg width={s||18} height={s||18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.32 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  help:s=><svg width={s||18} height={s||18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/></svg>,
  list:s=><svg width={s||16} height={s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>,
  board:s=><svg width={s||16} height={s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="5" height="18" rx="1"/><rect x="10" y="3" width="5" height="12" rx="1"/><rect x="17" y="3" width="5" height="15" rx="1"/></svg>,
  dot:c=><span style={{width:8,height:8,borderRadius:"50%",background:c,display:"inline-block",flexShrink:0}}/>,
};

// ── Data ──
const TICKETS=[
  {id:"TKT-1042",subj:"Exchange server unreachable",client:"Meridian Legal",pri:"P1",status:"Open",assignee:"Jake M.",sla:"14m",cat:"Infrastructure",time:"12m ago",desc:"Exchange on-prem server is not responding. Mail flow stopped for all users."},
  {id:"TKT-1041",subj:"Onboard 3 new workstations",client:"Atlas Financial",pri:"P3",status:"In Progress",assignee:"Sarah K.",sla:"2h",cat:"Onboarding",time:"45m ago",desc:"Three new hires starting Monday, need full workstation setup with standard image."},
  {id:"TKT-1040",subj:"Printer offline after patch",client:"Pinnacle Health",pri:"P4",status:"Open",assignee:"Unassigned",sla:"6h",cat:"Hardware",time:"1h ago",desc:"HP LaserJet in suite 200 stopped working after Windows update."},
  {id:"TKT-1039",subj:"CEO MFA lockout",client:"Vertex Labs",pri:"P2",status:"In Progress",assignee:"Jake M.",sla:"42m",cat:"Security",time:"1.5h ago",desc:"CEO cannot authenticate via Duo."},
  {id:"TKT-1038",subj:"Backup NAS volume full",client:"Meridian Legal",pri:"P2",status:"Open",assignee:"Carlos R.",sla:"58m",cat:"Backup/DR",time:"2h ago",desc:"Veeam backup jobs failing. Synology NAS at 98% capacity."},
  {id:"TKT-1037",subj:"VPN tunnel drops every 20m",client:"Greenfield Mfg",pri:"P3",status:"In Progress",assignee:"Sarah K.",sla:"3h",cat:"Network",time:"3h ago",desc:"Site-to-site tunnel between HQ and warehouse keeps dropping."},
  {id:"TKT-1036",subj:"Adobe CC license renewal",client:"Atlas Financial",pri:"P4",status:"Waiting",assignee:"Carlos R.",sla:"24h",cat:"Licensing",time:"5h ago",desc:"Renewal quote received, awaiting client approval."},
  {id:"TKT-1035",subj:"Phishing email investigation",client:"Vertex Labs",pri:"P1",status:"In Progress",assignee:"Jake M.",sla:"28m",cat:"Security",time:"6h ago",desc:"Multiple users received spoofed email from CEO."},
  {id:"TKT-1034",subj:"Wi-Fi dead zone in conf room B",client:"Summit RE",pri:"P3",status:"Resolved",assignee:"Carlos R.",sla:"—",cat:"Network",time:"8h ago",desc:"Conference room B has no Wi-Fi coverage."},
  {id:"TKT-1033",subj:"Quarterly access review",client:"Atlas Financial",pri:"P3",status:"Resolved",assignee:"Sarah K.",sla:"—",cat:"Compliance",time:"1d ago",desc:"HIPAA quarterly user access audit."},
];

const CLIENTS=[
  {id:1,name:"Meridian Legal Group",type:"Managed",mrr:4200,devices:47,online:42,health:72,flags:["VIP","SLA-Premium"],industry:"Legal",
    contacts:[{n:"Michael Chen",r:"IT Director",e:"m.chen@meridian.com",ph:"(555) 234-5678",primary:true},{n:"Lisa Park",r:"Office Manager",e:"l.park@meridian.com",ph:"(555) 234-5679"},{n:"David Kim",r:"CEO",e:"d.kim@meridian.com",ph:"(555) 234-5670"}],
    invoices:[{num:"INV-0091",amt:4200,status:"Paid",date:"Apr 1, 2026",due:"Apr 15, 2026"},{num:"INV-0078",amt:4200,status:"Paid",date:"Mar 1, 2026",due:"Mar 15, 2026"},{num:"INV-0065",amt:3800,status:"Paid",date:"Feb 1, 2026",due:"Feb 15, 2026"}],
    contracts:[{name:"Managed Services Agreement",start:"Jan 1, 2025",end:"Dec 31, 2026",value:"$50,400/yr",status:"Active"},{name:"SLA Premium Add-on",start:"Mar 1, 2025",end:"Dec 31, 2026",value:"$6,000/yr",status:"Active"}],
    notes:["VIP client — CEO expects direct contact for P1 issues","Considering Azure migration Q3 2026","Annual review scheduled June 15"]},
  {id:2,name:"Atlas Financial Services",type:"Managed",mrr:6800,devices:92,online:91,health:96,flags:["VIP","HIPAA"],industry:"Finance",
    contacts:[{n:"Amy Tran",r:"CTO",e:"a.tran@atlas.com",ph:"(555) 890-1234",primary:true},{n:"Ben Wallace",r:"Compliance Officer",e:"b.wallace@atlas.com",ph:"(555) 890-1235"}],
    invoices:[{num:"INV-0092",amt:6800,status:"Paid",date:"Apr 1, 2026",due:"Apr 15, 2026"},{num:"INV-0079",amt:6800,status:"Paid",date:"Mar 1, 2026",due:"Mar 15, 2026"}],
    contracts:[{name:"Managed + Compliance Package",start:"Jun 1, 2024",end:"May 31, 2027",value:"$81,600/yr",status:"Active"}],
    notes:["HIPAA BAA signed and filed","Quarterly compliance audits required"]},
  {id:3,name:"Pinnacle Health Partners",type:"Managed",mrr:5100,devices:63,online:61,health:88,flags:["HIPAA","BAA"],industry:"Healthcare",
    contacts:[{n:"Dr. Sarah Obi",r:"CIO",e:"s.obi@pinnacle.com",ph:"(555) 456-7890",primary:true}],
    invoices:[{num:"INV-0093",amt:5100,status:"Outstanding",date:"Apr 1, 2026",due:"Apr 15, 2026"}],
    contracts:[{name:"Healthcare IT Services",start:"Sep 1, 2024",end:"Aug 31, 2026",value:"$61,200/yr",status:"Active"}],
    notes:["BAA on file","EHR system integration in progress"]},
  {id:4,name:"Vertex Labs Inc",type:"Managed",mrr:3400,devices:31,online:23,health:42,flags:["At-Risk","Renewal"],industry:"Technology",
    contacts:[{n:"Tom West",r:"CEO",e:"t.west@vertex.com",ph:"(555) 321-0987",primary:true}],
    invoices:[{num:"INV-0094",amt:3400,status:"Overdue",date:"Mar 1, 2026",due:"Mar 15, 2026"},{num:"INV-0088",amt:3400,status:"Overdue",date:"Feb 1, 2026",due:"Feb 15, 2026"}],
    contracts:[{name:"Managed Services",start:"Jan 1, 2025",end:"Jun 30, 2026",value:"$40,800/yr",status:"Expiring"}],
    notes:["AT RISK — multiple overdue invoices","Contract expires Jun 30 — schedule renewal meeting","8 devices offline — needs site visit"]},
  {id:5,name:"Greenfield Manufacturing",type:"Break-Fix",mrr:1200,devices:24,online:20,health:67,flags:["Break-Fix"],industry:"Manufacturing",
    contacts:[{n:"Ray Liu",r:"Plant Manager",e:"r.liu@greenfield.com",ph:"(555) 654-3210",primary:true}],
    invoices:[{num:"INV-0085",amt:2400,status:"Paid",date:"Mar 15, 2026",due:"Mar 30, 2026"}],
    contracts:[],notes:["Break-fix only — upsell target for managed","Old infrastructure — needs assessment"]},
  {id:6,name:"Summit Real Estate",type:"Managed",mrr:2900,devices:28,online:28,health:99,flags:["New"],industry:"Real Estate",
    contacts:[{n:"Nina Cole",r:"Broker",e:"n.cole@summit.com",ph:"(555) 789-0123",primary:true}],
    invoices:[{num:"INV-0095",amt:2900,status:"Paid",date:"Apr 1, 2026",due:"Apr 15, 2026"}],
    contracts:[{name:"Managed IT Services",start:"Feb 1, 2026",end:"Jan 31, 2028",value:"$34,800/yr",status:"Active"}],
    notes:["New client onboarded Feb 2026","All systems green — excellent health"]},
];

const ASSETS=[
  {host:"MER-DC-01",type:"Server",client:"Meridian Legal",os:"Win Srv 2022",stat:"online",ip:"192.168.1.10",cpu:34,mem:62,disk:45},
  {host:"MER-EX-01",type:"Server",client:"Meridian Legal",os:"Exchange 2019",stat:"offline",ip:"192.168.1.15",cpu:0,mem:0,disk:78},
  {host:"MER-FW-01",type:"Firewall",client:"Meridian Legal",os:"FortiOS 7.4",stat:"online",ip:"192.168.1.1",cpu:12,mem:41,disk:22},
  {host:"ATL-WS-042",type:"Workstation",client:"Atlas Financial",os:"Win 11 Pro",stat:"online",ip:"10.0.2.42",cpu:28,mem:55,disk:61},
  {host:"ATL-FW-01",type:"Firewall",client:"Atlas Financial",os:"Palo Alto 11",stat:"online",ip:"10.0.0.1",cpu:22,mem:38,disk:18},
  {host:"VTX-DC-01",type:"Server",client:"Vertex Labs",os:"Win Srv 2022",stat:"warning",ip:"10.10.1.10",cpu:92,mem:87,disk:91},
  {host:"PIN-NAS-01",type:"NAS",client:"Pinnacle Health",os:"DSM 7.2",stat:"online",ip:"172.16.0.50",cpu:18,mem:73,disk:85},
  {host:"GRN-AP-03",type:"AP",client:"Greenfield Mfg",os:"UniFi 7.1",stat:"offline",ip:"192.168.5.13",cpu:0,mem:0,disk:0},
  {host:"SMT-DC-01",type:"Server",client:"Summit RE",os:"Win Srv 2022",stat:"online",ip:"10.20.1.10",cpu:15,mem:42,disk:33},
  {host:"MER-NAS-01",type:"NAS",client:"Meridian Legal",os:"DSM 7.2",stat:"warning",ip:"192.168.1.50",cpu:25,mem:60,disk:98},
];

const INTEGRATIONS=[
  {name:"ConnectWise Manage",cat:"PSA",stat:"ok",sync:"2m ago",calls:"1.2k/day",key:"cwm_••••a4f2"},{name:"Datto RMM",cat:"RMM",stat:"ok",sync:"30s ago",calls:"3.4k/day",key:"drm_••••8bc1"},
  {name:"Microsoft 365",cat:"Cloud",stat:"ok",sync:"5m ago",calls:"890/day",key:"m365_••••d3e5"},{name:"SentinelOne",cat:"EDR",stat:"ok",sync:"1m ago",calls:"2.1k/day",key:"s1_••••7fa9"},
  {name:"Acronis",cat:"Backup",stat:"ok",sync:"15m ago",calls:"340/day",key:"acr_••••2b1c"},{name:"Duo Security",cat:"MFA",stat:"ok",sync:"10m ago",calls:"560/day",key:"duo_••••e4d8"},
  {name:"QuickBooks",cat:"Billing",stat:"ok",sync:"1h ago",calls:"120/day",key:"qb_••••f1a3"},{name:"Hudu",cat:"Docs",stat:"err",sync:"FAILED",calls:"—",key:"—"},
  {name:"Slack",cat:"Comms",stat:"off",sync:"—",calls:"—",key:"—"},{name:"Auvik",cat:"Network",stat:"off",sync:"—",calls:"—",key:"—"},
  {name:"IT Glue",cat:"Docs",stat:"off",sync:"—",calls:"—",key:"—"},{name:"Proofpoint",cat:"Email Sec",stat:"off",sync:"—",calls:"—",key:"—"},
];

const INVOICES=[
  {num:"INV-0095",client:"Summit RE",amt:2900,status:"Paid",date:"Apr 1",due:"Apr 15",paid:"Apr 10"},
  {num:"INV-0094",client:"Vertex Labs",amt:3400,status:"Overdue",date:"Mar 1",due:"Mar 15",paid:"—"},
  {num:"INV-0093",client:"Pinnacle Health",amt:5100,status:"Outstanding",date:"Apr 1",due:"Apr 15",paid:"—"},
  {num:"INV-0092",client:"Atlas Financial",amt:6800,status:"Paid",date:"Apr 1",due:"Apr 15",paid:"Apr 8"},
  {num:"INV-0091",client:"Meridian Legal",amt:4200,status:"Paid",date:"Apr 1",due:"Apr 15",paid:"Apr 12"},
  {num:"INV-0090",client:"Greenfield Mfg",amt:1200,status:"Paid",date:"Apr 1",due:"Apr 15",paid:"Apr 14"},
  {num:"INV-0088",client:"Vertex Labs",amt:3400,status:"Overdue",date:"Feb 1",due:"Feb 15",paid:"—"},
];

const AUDIT_LOG=[
  {time:"12:04",user:"System",action:"Alert triggered: MER-EX-01 unreachable",cat:"Monitoring",sev:"critical"},
  {time:"12:02",user:"Jake M.",action:"Assigned TKT-1042 to self",cat:"Tickets",sev:"info"},
  {time:"11:58",user:"System",action:"Backup failed for MER-NAS-01",cat:"Backup",sev:"warning"},
  {time:"11:45",user:"Sarah K.",action:"Updated TKT-1041 status to In Progress",cat:"Tickets",sev:"info"},
  {time:"11:30",user:"Carlos R.",action:"Added note to Meridian Legal account",cat:"CRM",sev:"info"},
  {time:"11:15",user:"System",action:"MFA lockout detected: t.west@vertex.com",cat:"Security",sev:"warning"},
  {time:"11:00",user:"Jake M.",action:"Resolved TKT-1034",cat:"Tickets",sev:"info"},
  {time:"10:45",user:"System",action:"SentinelOne threat neutralized on ATL-WS-042",cat:"Security",sev:"warning"},
  {time:"10:30",user:"System",action:"SSL cert warning: GRN-WEB-01 expires in 7d",cat:"Certs",sev:"warning"},
  {time:"10:00",user:"Admin",action:"User login: Jake M. from 73.42.x.x",cat:"Auth",sev:"info"},
];

const NOTIFICATIONS=[
  {id:1,msg:"Exchange server MER-EX-01 unreachable",time:"12m ago",type:"critical",read:false},
  {id:2,msg:"Backup failed for Meridian Legal NAS",time:"58m ago",type:"warning",read:false},
  {id:3,msg:"Phishing campaign detected at Vertex Labs",time:"1.5h ago",type:"critical",read:false},
  {id:4,msg:"TKT-1034 resolved by Carlos R.",time:"8h ago",type:"info",read:true},
  {id:5,msg:"QuickBooks sync completed",time:"1h ago",type:"info",read:true},
];

const priC={P1:{c:P.red,bg:P.redBg},P2:{c:P.amber,bg:P.amberBg},P3:{c:P.blue,bg:P.blueBg},P4:{c:P.dim,bg:"rgba(139,144,176,.08)"}};
const statC={Open:P.blue,"In Progress":P.amber,Waiting:P.muted,Resolved:P.green};
const hC=h=>h>80?P.green:h>50?P.amber:P.red;
const fC=f=>({VIP:P.amber,"SLA-Premium":P.blue,HIPAA:P.purple,BAA:P.green,"At-Risk":P.red,Renewal:P.amber,"Break-Fix":P.dim,New:P.cyan}[f]||P.dim);
const invC={Paid:{c:P.green,bg:P.greenBg},Outstanding:{c:P.amber,bg:P.amberBg},Overdue:{c:P.red,bg:P.redBg},Draft:{c:P.dim,bg:"rgba(139,144,176,.08)"}};

const Pill=({c,bg,ch})=><span style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:4,background:bg||`${c}18`,color:c,whiteSpace:"nowrap",fontFamily:"'Inter'"}}>{ch}</span>;
const Bar=({p,c,h=4})=><div style={{width:"100%",height:h,borderRadius:h,background:P.border,overflow:"hidden"}}><div style={{height:"100%",borderRadius:h,width:`${Math.min(p,100)}%`,background:c,transition:"width .5s"}}/></div>;

function Btn({label,icon:Icon,onClick,ghost,color,small,style:sx}){
  return(<button onClick={onClick} style={{background:ghost?"transparent":(color||P.blue),color:ghost?(color||P.blue):"#fff",border:ghost?`1px solid ${P.border}`:"none",padding:small?"4px 10px":"7px 16px",borderRadius:6,cursor:"pointer",fontSize:small?11:12,fontWeight:600,fontFamily:"inherit",display:"flex",alignItems:"center",gap:5,transition:"all .15s",...sx}}
    onMouseEnter={e=>{if(ghost)e.currentTarget.style.background="rgba(87,138,255,.06)"}} onMouseLeave={e=>{if(ghost)e.currentTarget.style.background="transparent"}}>
    {Icon&&<Icon/>}{label}</button>);
}

function Field({label,placeholder,textarea,value,onChange}){const Tag=textarea?"textarea":"input";
  return(<div><label style={{display:"block",fontSize:11,color:P.muted,fontWeight:600,marginBottom:4}}>{label}</label>
    <Tag placeholder={placeholder} value={value} onChange={onChange} style={{width:"100%",padding:"8px 12px",borderRadius:6,border:`1px solid ${P.border}`,background:P.input,color:P.text,fontSize:13,fontFamily:"inherit",outline:"none",resize:textarea?"vertical":"none",...(textarea?{minHeight:70}:{})}}
      onFocus={e=>e.target.style.borderColor=P.blue} onBlur={e=>e.target.style.borderColor=P.border}/></div>);}
function Select({label,opts,value,onChange}){
  return(<div><label style={{display:"block",fontSize:11,color:P.muted,fontWeight:600,marginBottom:4}}>{label}</label>
    <select value={value} onChange={onChange} style={{width:"100%",padding:"8px 12px",borderRadius:6,border:`1px solid ${P.border}`,background:P.input,color:P.text,fontSize:13,fontFamily:"inherit",outline:"none",appearance:"none"}}>
      <option>Select…</option>{opts.map(o=><option key={o}>{o}</option>)}</select></div>);}

function Toggle({on,onToggle}){
  return(<button onClick={onToggle} style={{width:40,height:22,borderRadius:11,background:on?P.blue:P.border,border:"none",cursor:"pointer",padding:2,transition:"background .2s",flexShrink:0}}>
    <div style={{width:18,height:18,borderRadius:9,background:"#fff",transition:"margin .2s",marginLeft:on?18:0}}/></button>);}

// ═══════════════════════
//  MAIN APP
// ═══════════════════════
export default function App(){
  const[tab,setTab]=useState("dashboard");
  const[selTk,setSelTk]=useState(null);
  const[selCl,setSelCl]=useState(null);
  const[tFilter,setTFilter]=useState("all");
  const[tView,setTView]=useState("list");
  const[modal,setModal]=useState(null);
  const[notifOpen,setNotifOpen]=useState(false);
  const[searchOpen,setSearchOpen]=useState(false);
  const[searchQ,setSearchQ]=useState("");

  const tabs=[{id:"dashboard",label:"Dashboard"},{id:"tickets",label:"Tickets",count:5},{id:"clients",label:"Clients"},{id:"assets",label:"Assets"},{id:"integrations",label:"Integrations"},{id:"billing",label:"Billing"},{id:"reports",label:"Reports"},{id:"security",label:"Security"},{id:"settings",label:"Settings"}];
  const go=id=>{setTab(id);setSelTk(null);setSelCl(null);};

  // Search results
  const searchResults=useMemo(()=>{
    if(!searchQ.trim())return[];
    const q=searchQ.toLowerCase();
    const r=[];
    TICKETS.filter(t=>t.subj.toLowerCase().includes(q)||t.id.toLowerCase().includes(q)).forEach(t=>r.push({type:"Ticket",label:`${t.id} — ${t.subj}`,action:()=>{go("tickets");setSelTk(t);setSearchOpen(false);setSearchQ("")}}));
    CLIENTS.filter(c=>c.name.toLowerCase().includes(q)).forEach(c=>r.push({type:"Client",label:c.name,action:()=>{go("clients");setSelCl(c);setSearchOpen(false);setSearchQ("")}}));
    ASSETS.filter(a=>a.host.toLowerCase().includes(q)).forEach(a=>r.push({type:"Asset",label:`${a.host} — ${a.client}`,action:()=>{go("assets");setSearchOpen(false);setSearchQ("")}}));
    return r.slice(0,8);
  },[searchQ]);

  return(
    <div style={{fontFamily:"'Inter',sans-serif",background:P.bg,color:P.text,minHeight:"100vh",display:"flex",fontSize:13}}>
      <style>{FONT}{CSS}</style>

      {/* ═══ LEFT ICON RAIL ═══ */}
      <div style={{width:56,background:P.rail,borderRight:`1px solid ${P.border}`,display:"flex",flexDirection:"column",alignItems:"center",paddingTop:14,gap:4,position:"sticky",top:0,height:"100vh",flexShrink:0,zIndex:20}}>
        <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#578AFF,#9F8FEF)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",marginBottom:14,cursor:"pointer"}}>{Ic.logo(18)}</div>
        <RailBtn icon={Ic.home} active={tab==="dashboard"} onClick={()=>go("dashboard")} tip="Dashboard"/>
        <RailBtn icon={Ic.search} onClick={()=>setSearchOpen(true)} tip="Search"/>
        <RailBtn icon={()=><svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>} onClick={()=>setModal("ticket")} tip="Create"/>
        <div style={{flex:1}}/>
        <div style={{position:"relative"}}>
          <RailBtn icon={Ic.bell} onClick={()=>setNotifOpen(!notifOpen)} tip="Notifications" badge={NOTIFICATIONS.filter(n=>!n.read).length}/>
          {notifOpen&&<NotifPanel onClose={()=>setNotifOpen(false)}/>}
        </div>
        <RailBtn icon={Ic.help} onClick={()=>{}} tip="Help"/>
        <RailBtn icon={Ic.gear} onClick={()=>go("settings")} active={tab==="settings"} tip="Settings"/>
        <div style={{width:32,height:32,borderRadius:8,background:"linear-gradient(135deg,#578AFF,#9F8FEF)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:11,fontWeight:700,marginTop:4,marginBottom:14,cursor:"pointer"}}>JM</div>
      </div>

      {/* ═══ MAIN AREA ═══ */}
      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
        <div style={{background:P.surface,borderBottom:`1px solid ${P.border}`,display:"flex",alignItems:"stretch",height:44,paddingLeft:8,position:"sticky",top:0,zIndex:15}}>
          {tabs.map(t=>{const active=tab===t.id;return(
            <button key={t.id} onClick={()=>go(t.id)} style={{background:"transparent",border:"none",borderBottom:active?`2px solid ${P.blue}`:"2px solid transparent",color:active?P.text:P.dim,padding:"0 18px",cursor:"pointer",fontSize:13,fontWeight:active?600:450,fontFamily:"inherit",display:"flex",alignItems:"center",gap:6,transition:"all .12s",marginBottom:-1}}
              onMouseEnter={e=>{if(!active){e.currentTarget.style.color=P.text;e.currentTarget.style.background="rgba(87,138,255,.04)"}}}
              onMouseLeave={e=>{if(!active){e.currentTarget.style.color=P.dim;e.currentTarget.style.background="transparent"}}}>
              {t.label}{t.count&&<span style={{background:P.red,color:"#fff",borderRadius:10,padding:"0 6px",fontSize:10,fontWeight:700,lineHeight:"18px"}}>{t.count}</span>}
            </button>);})}
        </div>
        <div style={{flex:1,overflow:"auto",padding:"20px 24px"}}>
          {tab==="dashboard"&&<DashPage go={go} setSelTk={setSelTk} setSelCl={setSelCl}/>}
          {tab==="tickets"&&<TicketPage sel={selTk} setSel={setSelTk} filter={tFilter} setFilter={setTFilter} view={tView} setView={setTView} setModal={setModal}/>}
          {tab==="clients"&&<ClientPage sel={selCl} setSel={setSelCl}/>}
          {tab==="assets"&&<AssetPage/>}
          {tab==="integrations"&&<IntegPage/>}
          {tab==="billing"&&<BillingPage/>}
          {tab==="reports"&&<ReportPage/>}
          {tab==="security"&&<SecurityPage/>}
          {tab==="settings"&&<SettingsPage/>}
        </div>
      </div>

      {modal==="ticket"&&<NewTkModal onClose={()=>setModal(null)}/>}
      {modal==="invoice"&&<NewInvModal onClose={()=>setModal(null)}/>}
      {searchOpen&&<SearchModal q={searchQ} setQ={setSearchQ} results={searchResults} onClose={()=>{setSearchOpen(false);setSearchQ("")}}/>}
    </div>
  );
}

function RailBtn({icon:Icon,active,onClick,tip,badge}){
  return(<button onClick={onClick} title={tip} style={{width:40,height:36,borderRadius:8,border:"none",background:active?P.blueBg:"transparent",color:active?P.blue:P.dim,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",transition:"all .12s"}}
    onMouseEnter={e=>{if(!active){e.currentTarget.style.background="rgba(255,255,255,.04)";e.currentTarget.style.color=P.text}}}
    onMouseLeave={e=>{if(!active){e.currentTarget.style.background="transparent";e.currentTarget.style.color=P.dim}}}>
    <Icon/>{badge>0&&<span style={{position:"absolute",top:4,right:4,width:16,height:16,borderRadius:8,background:P.red,color:"#fff",fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",border:`2px solid ${P.rail}`}}>{badge}</span>}
  </button>);
}

// ── Notification Panel ──
function NotifPanel({onClose}){
  return(<div className="sd" style={{position:"absolute",left:50,top:-40,width:340,background:P.surface,border:`1px solid ${P.border}`,borderRadius:8,boxShadow:"0 12px 40px rgba(0,0,0,.4)",zIndex:50,overflow:"hidden"}}>
    <div style={{padding:"12px 16px",borderBottom:`1px solid ${P.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <span style={{fontWeight:700,fontSize:14}}>Notifications</span>
      <button onClick={onClose} style={{background:"transparent",border:"none",color:P.muted,cursor:"pointer"}}>{Ic.x()}</button>
    </div>
    {NOTIFICATIONS.map(n=>(
      <div key={n.id} style={{padding:"10px 16px",borderBottom:`1px solid ${P.border}`,background:n.read?"transparent":"rgba(87,138,255,.03)",display:"flex",gap:10,alignItems:"flex-start",cursor:"pointer",transition:"background .1s"}}
        onMouseEnter={e=>e.currentTarget.style.background=P.cardHover} onMouseLeave={e=>e.currentTarget.style.background=n.read?"transparent":"rgba(87,138,255,.03)"}>
        {Ic.dot(n.type==="critical"?P.red:n.type==="warning"?P.amber:P.blue)}
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:12,fontWeight:n.read?400:500,lineHeight:1.4}}>{n.msg}</div>
          <div style={{fontSize:11,color:P.muted,marginTop:2}}>{n.time}</div>
        </div>
        {!n.read&&<span style={{width:6,height:6,borderRadius:3,background:P.blue,marginTop:6,flexShrink:0}}/>}
      </div>
    ))}
  </div>);
}

// ── Search Modal ──
function SearchModal({q,setQ,results,onClose}){
  return(<div style={{position:"fixed",inset:0,background:"rgba(10,12,20,.6)",display:"flex",alignItems:"flex-start",justifyContent:"center",zIndex:100,paddingTop:100}} onClick={onClose}>
    <div className="sd" style={{width:520,background:P.surface,border:`1px solid ${P.border}`,borderRadius:10,boxShadow:"0 20px 60px rgba(0,0,0,.5)",overflow:"hidden"}} onClick={e=>e.stopPropagation()}>
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",borderBottom:`1px solid ${P.border}`}}>
        <span style={{color:P.muted}}>{Ic.search(18)}</span>
        <input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Search tickets, clients, assets…" style={{flex:1,background:"transparent",border:"none",color:P.text,fontSize:15,outline:"none",fontFamily:"inherit"}}/>
        <kbd style={{fontSize:10,padding:"2px 6px",borderRadius:4,background:P.card,color:P.muted,border:`1px solid ${P.border}`}}>ESC</kbd>
      </div>
      {results.length>0&&<div style={{maxHeight:300,overflow:"auto"}}>
        {results.map((r,i)=>(
          <div key={i} onClick={r.action} style={{padding:"10px 16px",borderBottom:`1px solid ${P.border}`,display:"flex",alignItems:"center",gap:10,cursor:"pointer",transition:"background .1s"}}
            onMouseEnter={e=>e.currentTarget.style.background=P.cardHover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <Pill c={P.dim} ch={r.type}/>
            <span style={{fontSize:13}}>{r.label}</span>
          </div>
        ))}
      </div>}
      {q&&results.length===0&&<div style={{padding:20,textAlign:"center",color:P.muted,fontSize:13}}>No results found</div>}
    </div>
  </div>);
}

// ══════════════════ DASHBOARD ══════════════════
function DashPage({go,setSelTk,setSelCl}){
  const stats=[{label:"Open Tickets",val:"23",sub:"+3 today",c:P.blue},{label:"Critical / SLA Risk",val:"4",sub:"2 breaching",c:P.red},{label:"Avg Response",val:"8m",sub:"Target: 15m",c:P.green},{label:"CSAT",val:"94%",sub:"+2% this week",c:P.green}];
  const chartData=[{m:"Nov",tickets:89,resolved:82},{m:"Dec",tickets:76,resolved:71},{m:"Jan",tickets:102,resolved:95},{m:"Feb",tickets:94,resolved:90},{m:"Mar",tickets:118,resolved:108},{m:"Apr",tickets:97,resolved:85}];
  return(
    <div>
      <div style={{marginBottom:20}}><h1 style={{fontSize:22,fontWeight:700,letterSpacing:-.3}}>Dashboard</h1><span style={{color:P.dim,fontSize:13}}>Overview of your MSP operations</span></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
        {stats.map((s,i)=>(<div key={i} className={`fi d${i+1}`} style={{background:P.surface,border:`1px solid ${P.border}`,borderRadius:8,padding:"16px 18px"}}><div style={{fontSize:12,color:P.dim,marginBottom:10}}>{s.label}</div><div style={{fontSize:28,fontWeight:800,color:s.c,letterSpacing:-.5,lineHeight:1}}>{s.val}</div><div style={{fontSize:11,color:P.muted,marginTop:4}}>{s.sub}</div></div>))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"5fr 3fr",gap:12,marginBottom:20}}>
        <div className="fi d2" style={{background:P.surface,border:`1px solid ${P.border}`,borderRadius:8,overflow:"hidden"}}>
          <div style={{padding:"12px 16px",borderBottom:`1px solid ${P.border}`,display:"flex",justifyContent:"space-between"}}><span style={{fontWeight:600,fontSize:14}}>Ticket Volume (6 months)</span></div>
          <div style={{padding:"12px 16px",height:200}}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}><XAxis dataKey="m" tick={{fill:P.dim,fontSize:11}} axisLine={false} tickLine={false}/><YAxis tick={{fill:P.muted,fontSize:11}} axisLine={false} tickLine={false} width={30}/>
                <Tooltip contentStyle={{background:P.card,border:`1px solid ${P.border}`,borderRadius:6,fontSize:12}} itemStyle={{color:P.text}}/><Bar dataKey="tickets" fill={P.blue} radius={[4,4,0,0]} barSize={16}/><Bar dataKey="resolved" fill={P.green} radius={[4,4,0,0]} barSize={16}/></BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="fi d3" style={{background:P.surface,border:`1px solid ${P.border}`,borderRadius:8,overflow:"hidden"}}>
          <div style={{padding:"12px 16px",borderBottom:`1px solid ${P.border}`}}><span style={{fontWeight:600,fontSize:14}}>Client Health</span></div>
          {CLIENTS.map(c=>(<div key={c.id} onClick={()=>{go("clients");setSelCl(c);}} style={{padding:"8px 16px",borderBottom:`1px solid ${P.border}`,display:"flex",alignItems:"center",gap:10,cursor:"pointer",transition:"background .1s"}}
            onMouseEnter={e=>e.currentTarget.style.background=P.cardHover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:500,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.name}</div><div style={{fontSize:11,color:P.muted}}>{c.online}/{c.devices} · ${c.mrr.toLocaleString()}/mo</div></div>
            <div style={{width:50,display:"flex",alignItems:"center",gap:6}}><Bar p={c.health} c={hC(c.health)}/><span style={{fontSize:12,fontWeight:600,color:hC(c.health),minWidth:24,textAlign:"right"}}>{c.health}</span></div>
          </div>))}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
        <div className="fi d3" style={{background:P.surface,border:`1px solid ${P.border}`,borderRadius:8,padding:"16px 18px"}}>
          <div style={{fontWeight:600,fontSize:14,marginBottom:12}}>Recent Tickets</div>
          {TICKETS.slice(0,4).map(tk=>(<div key={tk.id} onClick={()=>{go("tickets");setSelTk(tk);}} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",cursor:"pointer"}}>{Ic.dot(priC[tk.pri].c)}<span style={{flex:1,fontSize:12,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{tk.subj}</span><span style={{fontSize:11,color:P.muted}}>{tk.time}</span></div>))}
        </div>
        <div className="fi d4" style={{background:P.surface,border:`1px solid ${P.border}`,borderRadius:8,padding:"16px 18px"}}>
          <div style={{fontWeight:600,fontSize:14,marginBottom:12}}>Service Status</div>
          {[["DNS","online"],["Email Relay","degraded"],["VPN Gateway","online"],["Backup Agent","offline"],["RMM","online"],["M365","online"]].map(([n,s])=>(
            <div key={n} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 0"}}>{Ic.dot(s==="online"?P.green:s==="degraded"?P.amber:P.red)}<span style={{flex:1,fontSize:12}}>{n}</span><span style={{fontSize:10,fontFamily:"'JetBrains Mono'",color:s==="online"?P.green:s==="degraded"?P.amber:P.red,textTransform:"uppercase"}}>{s}</span></div>))}
        </div>
        <div className="fi d4" style={{background:P.surface,border:`1px solid ${P.border}`,borderRadius:8,padding:"16px 18px"}}>
          <div style={{fontWeight:600,fontSize:14,marginBottom:12}}>Revenue</div>
          {[["Monthly Revenue","$23,600"],["Outstanding","$4,200"],["Overdue","$6,800"],["Active Contracts","12"]].map(([l,v])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"5px 0"}}><span style={{color:P.dim,fontSize:12}}>{l}</span><span style={{fontWeight:600,fontFamily:"'JetBrains Mono'",fontSize:13}}>{v}</span></div>))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════ TICKETS + KANBAN ══════════════════
function TicketPage({sel,setSel,filter,setFilter,view,setView,setModal}){
  const fs=[["all","All"],["Open","Open"],["In Progress","In Progress"],["Waiting","Waiting"],["P1","P1"],["P2","P2"]];
  const list=filter==="all"?TICKETS:["P1","P2"].includes(filter)?TICKETS.filter(t=>t.pri===filter):TICKETS.filter(t=>t.status===filter);
  const kCols=["Open","In Progress","Waiting","Resolved"];
  return(
    <div style={{display:"flex",gap:0,height:"calc(100vh - 90px)"}}>
      <div style={{flex:sel?0.58:1,display:"flex",flexDirection:"column",transition:"flex .25s",paddingRight:sel?16:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}><h1 style={{fontSize:20,fontWeight:700}}>Tickets</h1>
            <div style={{display:"flex",background:P.card,borderRadius:6,border:`1px solid ${P.border}`,overflow:"hidden"}}>
              <button onClick={()=>setView("list")} style={{padding:"5px 10px",border:"none",background:view==="list"?P.blueBg:"transparent",color:view==="list"?P.blue:P.dim,cursor:"pointer",display:"flex",alignItems:"center"}}>{Ic.list()}</button>
              <button onClick={()=>setView("board")} style={{padding:"5px 10px",border:"none",background:view==="board"?P.blueBg:"transparent",color:view==="board"?P.blue:P.dim,cursor:"pointer",display:"flex",alignItems:"center"}}>{Ic.board()}</button>
            </div>
          </div>
          <Btn label="Create" icon={Ic.plus} onClick={()=>setModal("ticket")}/>
        </div>
        {view==="list"?(<>
          <div style={{display:"flex",gap:4,marginBottom:12}}>
            {fs.map(([k,l])=><button key={k} onClick={()=>setFilter(k)} style={{background:filter===k?P.blueBg:"transparent",color:filter===k?P.blue:P.dim,border:`1px solid ${filter===k?P.blueBorder:P.border}`,padding:"5px 14px",borderRadius:6,cursor:"pointer",fontSize:12,fontWeight:500,fontFamily:"inherit"}}>{l}</button>)}
          </div>
          <div style={{flex:1,background:P.surface,border:`1px solid ${P.border}`,borderRadius:8,overflow:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>{["","ID","Subject","Client","Status","Assignee","SLA","Cat"].map(h=><th key={h} style={{padding:"10px 12px",textAlign:"left",fontSize:11,color:P.muted,fontWeight:600,borderBottom:`1px solid ${P.border}`,whiteSpace:"nowrap",position:"sticky",top:0,background:P.surface,zIndex:1}}>{h}</th>)}</tr></thead>
              <tbody>{list.map(tk=>(<tr key={tk.id} onClick={()=>setSel(tk)} style={{cursor:"pointer",background:sel?.id===tk.id?P.blueBg:"transparent",transition:"background .1s",borderBottom:`1px solid ${P.border}`}}
                onMouseEnter={e=>{if(sel?.id!==tk.id)e.currentTarget.style.background=P.cardHover}} onMouseLeave={e=>{if(sel?.id!==tk.id)e.currentTarget.style.background="transparent"}}>
                <td style={{padding:"10px 12px",width:20}}>{Ic.dot(priC[tk.pri].c)}</td><td style={{padding:"10px 12px",fontFamily:"'JetBrains Mono'",fontSize:12,color:P.dim}}>{tk.id}</td>
                <td style={{padding:"10px 12px",fontSize:13,fontWeight:500}}>{tk.subj}</td><td style={{padding:"10px 12px",fontSize:12,color:P.dim}}>{tk.client}</td>
                <td style={{padding:"10px 12px"}}><Pill c={statC[tk.status]||P.dim} ch={tk.status}/></td><td style={{padding:"10px 12px",fontSize:12,color:P.dim}}>{tk.assignee}</td>
                <td style={{padding:"10px 12px",fontSize:12,fontFamily:"'JetBrains Mono'",color:parseInt(tk.sla)<30&&tk.sla.includes("m")?P.red:P.dim,fontWeight:500}}>{tk.sla}</td>
                <td style={{padding:"10px 12px",fontSize:12,color:P.muted}}>{tk.cat}</td></tr>))}</tbody></table>
          </div>
        </>):(<>
          {/* KANBAN BOARD */}
          <div style={{flex:1,display:"grid",gridTemplateColumns:`repeat(${kCols.length},1fr)`,gap:12,overflow:"auto"}}>
            {kCols.map(col=>{const items=TICKETS.filter(t=>t.status===col);return(
              <div key={col} style={{background:P.surface,border:`1px solid ${P.border}`,borderRadius:8,display:"flex",flexDirection:"column",overflow:"hidden"}}>
                <div style={{padding:"10px 14px",borderBottom:`1px solid ${P.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>{Ic.dot(statC[col]||P.dim)}<span style={{fontSize:12,fontWeight:600}}>{col}</span></div>
                  <span style={{fontSize:11,color:P.muted,fontFamily:"'JetBrains Mono'"}}>{items.length}</span>
                </div>
                <div style={{flex:1,overflow:"auto",padding:8,display:"flex",flexDirection:"column",gap:8}}>
                  {items.map(tk=>(
                    <div key={tk.id} onClick={()=>setSel(tk)} style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:6,padding:"10px 12px",cursor:"pointer",transition:"all .15s"}}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor=P.blue+"60";e.currentTarget.style.transform="translateY(-1px)"}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor=P.border;e.currentTarget.style.transform="none"}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><Pill c={priC[tk.pri].c} ch={tk.pri}/><span style={{fontSize:10,fontFamily:"'JetBrains Mono'",color:P.muted}}>{tk.id}</span></div>
                      <div style={{fontSize:13,fontWeight:500,marginBottom:6,lineHeight:1.3}}>{tk.subj}</div>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:11,color:P.muted}}>{tk.client}</span>
                        {tk.assignee!=="Unassigned"&&<div style={{width:22,height:22,borderRadius:6,background:P.blueBg,display:"flex",alignItems:"center",justifyContent:"center",color:P.blue,fontSize:9,fontWeight:700}}>{tk.assignee.split(" ").map(n=>n[0]).join("")}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );})}
          </div>
        </>)}
      </div>
      {sel&&<TkDetail tk={sel} onClose={()=>setSel(null)}/>}
    </div>
  );
}

function TkDetail({tk,onClose}){
  return(<div className="sr" style={{flex:0.42,background:P.surface,border:`1px solid ${P.border}`,borderRadius:8,display:"flex",flexDirection:"column",overflow:"hidden"}}>
    <div style={{padding:"14px 18px",borderBottom:`1px solid ${P.border}`,display:"flex",justifyContent:"space-between"}}>
      <div><div style={{display:"flex",gap:6,alignItems:"center",marginBottom:4}}><span style={{fontFamily:"'JetBrains Mono'",fontSize:12,color:P.muted}}>{tk.id}</span><Pill c={priC[tk.pri].c} ch={tk.pri}/><Pill c={statC[tk.status]||P.dim} ch={tk.status}/></div>
        <h2 style={{fontSize:16,fontWeight:600}}>{tk.subj}</h2></div>
      <button onClick={onClose} style={{background:"transparent",border:"none",color:P.muted,cursor:"pointer",padding:4}}>{Ic.x()}</button>
    </div>
    <div style={{flex:1,overflow:"auto",padding:"16px 18px"}}>
      <div style={{fontSize:13,color:P.dim,lineHeight:1.6,marginBottom:18,padding:"12px 14px",background:P.card,borderRadius:6,border:`1px solid ${P.border}`}}>{tk.desc}</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:18}}>
        {[["Client",tk.client],["Assignee",tk.assignee],["Category",tk.cat],["SLA",tk.sla],["Created",tk.time],["Priority",tk.pri]].map(([l,v])=>(<div key={l}><div style={{fontSize:10,color:P.muted,fontWeight:600,textTransform:"uppercase",letterSpacing:.5,marginBottom:2}}>{l}</div><div style={{fontSize:13,fontWeight:500}}>{v}</div></div>))}
      </div>
      <div style={{fontSize:10,color:P.muted,fontWeight:600,textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>Activity</div>
      <div style={{borderLeft:`2px solid ${P.border}`,paddingLeft:14,display:"flex",flexDirection:"column",gap:10}}>
        {[{w:"System",t:"Ticket created",a:tk.time},{w:"Jake M.",t:"Self-assigned",a:"10m ago"},{w:"Jake M.",t:`Priority → ${tk.pri}`,a:"8m ago"}].map((a,i)=>(<div key={i}><span style={{fontSize:12}}><strong>{a.w}</strong> — {a.t}</span><div style={{fontSize:11,color:P.muted}}>{a.a}</div></div>))}
      </div>
    </div>
    <div style={{padding:"12px 18px",borderTop:`1px solid ${P.border}`}}>
      <textarea placeholder="Add reply or note…" style={{width:"100%",minHeight:60,padding:10,borderRadius:6,border:`1px solid ${P.border}`,background:P.input,color:P.text,fontSize:12,fontFamily:"inherit",resize:"vertical",outline:"none",marginBottom:8}}/>
      <div style={{display:"flex",gap:6}}><Btn label="Reply"/><Btn label="Note" ghost/><div style={{flex:1}}/><Btn label="Resolve" color={P.green}/></div>
    </div>
  </div>);
}

// ══════════════════ CLIENTS / CRM ══════════════════
function ClientPage({sel,setSel}){
  const[cTab,setCTab]=useState("overview");
  if(sel){const tabs=["overview","contacts","invoices","contracts","tickets","notes"];return(
    <div className="fi">
      <Btn label="← Back" ghost onClick={()=>{setSel(null);setCTab("overview")}} style={{marginBottom:14}}/>
      <div style={{background:P.surface,border:`1px solid ${P.border}`,borderRadius:8,overflow:"hidden"}}>
        <div style={{padding:"18px 22px",borderBottom:`1px solid ${P.border}`,display:"flex",justifyContent:"space-between"}}>
          <div><h2 style={{fontSize:20,fontWeight:700,marginBottom:6}}>{sel.name}</h2><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{sel.flags.map(f=><Pill key={f} c={fC(f)} ch={f}/>)}<button style={{fontSize:11,padding:"2px 8px",borderRadius:4,background:"transparent",border:`1px dashed ${P.blue}40`,color:P.blue,cursor:"pointer",fontFamily:"inherit"}}>+ Flag</button></div></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:24,fontWeight:800,color:P.blue}}>${sel.mrr.toLocaleString()}</div><div style={{fontSize:11,color:P.muted}}>MRR</div></div>
        </div>
        <div style={{display:"flex",borderBottom:`1px solid ${P.border}`}}>
          {tabs.map(t=><button key={t} onClick={()=>setCTab(t)} style={{background:"transparent",border:"none",borderBottom:cTab===t?`2px solid ${P.blue}`:"2px solid transparent",color:cTab===t?P.text:P.dim,padding:"10px 18px",cursor:"pointer",fontSize:12,fontWeight:cTab===t?600:400,fontFamily:"inherit",textTransform:"capitalize",marginBottom:-1}}>{t}</button>)}
        </div>
        <div style={{padding:20}}>
          {cTab==="overview"&&<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>{[["Health",`${sel.health}%`,hC(sel.health)],["Devices",`${sel.online}/${sel.devices}`,P.blue],["Type",sel.type,P.dim],["Industry",sel.industry,P.dim]].map(([l,v,c])=>(<div key={l} style={{padding:"14px 16px",background:P.card,borderRadius:6,border:`1px solid ${P.border}`}}><div style={{fontSize:10,color:P.muted,fontWeight:600,textTransform:"uppercase",letterSpacing:.5,marginBottom:4}}>{l}</div><div style={{fontSize:18,fontWeight:700,color:c}}>{v}</div></div>))}</div>}
          {cTab==="contacts"&&<table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>{["Name","Role","Email","Phone",""].map(h=><th key={h} style={{padding:"8px 0",textAlign:"left",fontSize:11,color:P.muted,fontWeight:600,borderBottom:`1px solid ${P.border}`}}>{h}</th>)}</tr></thead>
            <tbody>{sel.contacts.map(c=>(<tr key={c.n} style={{borderBottom:`1px solid ${P.border}`}}><td style={{padding:"10px 0",fontSize:13,fontWeight:500}}>{c.n} {c.primary&&<Pill c={P.blue} ch="Primary"/>}</td><td style={{padding:"10px 0",fontSize:12,color:P.dim}}>{c.r}</td><td style={{padding:"10px 0",fontSize:12,fontFamily:"'JetBrains Mono'",color:P.dim}}>{c.e}</td><td style={{padding:"10px 0",fontSize:12,color:P.muted}}>{c.ph}</td><td style={{padding:"10px 0",textAlign:"right"}}><Btn label="Edit" ghost small/></td></tr>))}</tbody></table>}
          {cTab==="invoices"&&<table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>{["Invoice","Amount","Status","Issued","Due","Paid"].map(h=><th key={h} style={{padding:"8px 0",textAlign:"left",fontSize:11,color:P.muted,fontWeight:600,borderBottom:`1px solid ${P.border}`}}>{h}</th>)}</tr></thead>
            <tbody>{(sel.invoices||[]).map(inv=>(<tr key={inv.num} style={{borderBottom:`1px solid ${P.border}`}}><td style={{padding:"10px 0",fontFamily:"'JetBrains Mono'",fontSize:12}}>{inv.num}</td><td style={{padding:"10px 0",fontWeight:600}}>${inv.amt.toLocaleString()}</td><td style={{padding:"10px 0"}}><Pill c={invC[inv.status].c} ch={inv.status}/></td><td style={{padding:"10px 0",fontSize:12,color:P.dim}}>{inv.date}</td><td style={{padding:"10px 0",fontSize:12,color:P.dim}}>{inv.due}</td><td style={{padding:"10px 0",fontSize:12,color:P.muted}}>{inv.paid||"—"}</td></tr>))}</tbody></table>}
          {cTab==="contracts"&&<>{(sel.contracts||[]).length>0?(sel.contracts||[]).map(ct=>(<div key={ct.name} style={{padding:"14px 16px",background:P.card,borderRadius:6,border:`1px solid ${P.border}`,marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontSize:14,fontWeight:600}}>{ct.name}</span><Pill c={ct.status==="Active"?P.green:P.amber} ch={ct.status}/></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>{[["Start",ct.start],["End",ct.end],["Value",ct.value]].map(([l,v])=>(<div key={l}><div style={{fontSize:10,color:P.muted,fontWeight:600,textTransform:"uppercase",letterSpacing:.5}}>{l}</div><div style={{fontSize:13,fontWeight:500,marginTop:2}}>{v}</div></div>))}</div></div>)):<div style={{color:P.muted,fontSize:13}}>No contracts on file</div>}</>}
          {cTab==="tickets"&&<>{TICKETS.filter(t=>t.client===sel.name||t.client.includes(sel.name.split(" ")[0])).map(tk=>(<div key={tk.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:`1px solid ${P.border}`}}>{Ic.dot(priC[tk.pri].c)}<span style={{fontFamily:"'JetBrains Mono'",fontSize:12,color:P.muted}}>{tk.id}</span><span style={{flex:1,fontSize:13}}>{tk.subj}</span><Pill c={statC[tk.status]||P.dim} ch={tk.status}/><span style={{fontSize:11,color:P.muted}}>{tk.time}</span></div>))}</>}
          {cTab==="notes"&&<div style={{display:"flex",flexDirection:"column",gap:10}}>{(sel.notes||[]).map((n,i)=>(<div key={i} style={{padding:"10px 14px",background:P.card,borderRadius:6,border:`1px solid ${P.border}`,fontSize:13,lineHeight:1.5}}>📝 {n}</div>))}<textarea placeholder="Add a note…" style={{width:"100%",minHeight:60,padding:10,borderRadius:6,border:`1px solid ${P.border}`,background:P.input,color:P.text,fontSize:13,fontFamily:"inherit",resize:"vertical",outline:"none",marginTop:6}}/><Btn label="Save Note" style={{alignSelf:"flex-end"}}/></div>}
        </div>
      </div>
    </div>);}
  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><h1 style={{fontSize:20,fontWeight:700}}>Clients</h1><Btn label="Add client" icon={Ic.plus}/></div>
    <div style={{background:P.surface,border:`1px solid ${P.border}`,borderRadius:8,overflow:"hidden"}}><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>{["Client","Type","MRR","Devices","Health","Flags"].map(h=><th key={h} style={{padding:"10px 16px",textAlign:"left",fontSize:11,color:P.muted,fontWeight:600,borderBottom:`1px solid ${P.border}`}}>{h}</th>)}</tr></thead>
      <tbody>{CLIENTS.map(c=>(<tr key={c.id} onClick={()=>setSel(c)} style={{cursor:"pointer",borderBottom:`1px solid ${P.border}`,transition:"background .1s"}} onMouseEnter={e=>e.currentTarget.style.background=P.cardHover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
        <td style={{padding:"12px 16px"}}><div style={{fontSize:13,fontWeight:500}}>{c.name}</div><div style={{fontSize:11,color:P.muted}}>{c.industry}</div></td><td style={{padding:"12px 16px"}}><Pill c={c.type==="Managed"?P.blue:P.dim} ch={c.type}/></td>
        <td style={{padding:"12px 16px",fontWeight:600,fontFamily:"'JetBrains Mono'",fontSize:13}}>${c.mrr.toLocaleString()}</td><td style={{padding:"12px 16px",fontSize:13,color:P.dim}}>{c.online}/{c.devices}</td>
        <td style={{padding:"12px 16px"}}><div style={{display:"flex",alignItems:"center",gap:8,width:80}}><Bar p={c.health} c={hC(c.health)}/><span style={{fontSize:12,fontWeight:600,color:hC(c.health)}}>{c.health}</span></div></td>
        <td style={{padding:"12px 16px"}}><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{c.flags.map(f=><Pill key={f} c={fC(f)} ch={f}/>)}</div></td></tr>))}</tbody></table></div>
  </div>);
}

// ══════════════════ ASSETS ══════════════════
function AssetPage(){
  const sc={online:P.green,warning:P.amber,offline:P.red};
  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><h1 style={{fontSize:20,fontWeight:700}}>Assets</h1><Btn label="Add asset" icon={Ic.plus}/></div>
    <div className="fi" style={{background:P.surface,border:`1px solid ${P.border}`,borderRadius:8,overflow:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>{["Status","Hostname","Type","Client","OS","IP","CPU","MEM","Disk"].map(h=><th key={h} style={{padding:"10px 14px",textAlign:"left",fontSize:11,color:P.muted,fontWeight:600,borderBottom:`1px solid ${P.border}`}}>{h}</th>)}</tr></thead>
      <tbody>{ASSETS.map(a=>(<tr key={a.host} style={{borderBottom:`1px solid ${P.border}`,transition:"background .1s",cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background=P.cardHover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
        <td style={{padding:"10px 14px"}}><div style={{display:"flex",alignItems:"center",gap:6}}>{Ic.dot(sc[a.stat])}<span style={{fontSize:11,color:sc[a.stat],fontWeight:500,textTransform:"uppercase"}}>{a.stat}</span></div></td>
        <td style={{padding:"10px 14px",fontFamily:"'JetBrains Mono'",fontSize:13,fontWeight:600}}>{a.host}</td><td style={{padding:"10px 14px",fontSize:12,color:P.dim}}>{a.type}</td>
        <td style={{padding:"10px 14px",fontSize:12,color:P.dim}}>{a.client}</td><td style={{padding:"10px 14px",fontSize:12,color:P.muted}}>{a.os}</td><td style={{padding:"10px 14px",fontFamily:"'JetBrains Mono'",fontSize:12,color:P.muted}}>{a.ip}</td>
        <td style={{padding:"10px 14px",width:70}}><div style={{display:"flex",alignItems:"center",gap:4}}><Bar p={a.cpu} c={a.cpu>80?P.red:a.cpu>60?P.amber:P.green}/><span style={{fontSize:10,fontFamily:"'JetBrains Mono'",color:a.cpu>80?P.red:P.muted,width:28,textAlign:"right"}}>{a.cpu}%</span></div></td>
        <td style={{padding:"10px 14px",width:70}}><div style={{display:"flex",alignItems:"center",gap:4}}><Bar p={a.mem} c={a.mem>80?P.red:a.mem>60?P.amber:P.green}/><span style={{fontSize:10,fontFamily:"'JetBrains Mono'",color:a.mem>80?P.red:P.muted,width:28,textAlign:"right"}}>{a.mem}%</span></div></td>
        <td style={{padding:"10px 14px",width:70}}><div style={{display:"flex",alignItems:"center",gap:4}}><Bar p={a.disk} c={a.disk>90?P.red:a.disk>75?P.amber:P.green}/><span style={{fontSize:10,fontFamily:"'JetBrains Mono'",color:a.disk>90?P.red:P.muted,width:28,textAlign:"right"}}>{a.disk}%</span></div></td>
      </tr>))}</tbody></table></div>
  </div>);
}

// ══════════════════ INTEGRATIONS ══════════════════
function IntegPage(){
  const sc={ok:{c:P.green,l:"Connected"},err:{c:P.red,l:"Error"},off:{c:P.muted,l:"Disconnected"}};
  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><h1 style={{fontSize:20,fontWeight:700}}>Integrations</h1><Btn label="Connect new" icon={Ic.plus}/></div>
    <div className="fi" style={{background:P.surface,border:`1px solid ${P.border}`,borderRadius:8,overflow:"hidden"}}><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>{["Status","Name","Category","Last Sync","API Calls","API Key",""].map(h=><th key={h} style={{padding:"10px 14px",textAlign:"left",fontSize:11,color:P.muted,fontWeight:600,borderBottom:`1px solid ${P.border}`}}>{h}</th>)}</tr></thead>
      <tbody>{INTEGRATIONS.map(ig=>(<tr key={ig.name} style={{borderBottom:`1px solid ${P.border}`,transition:"background .1s"}} onMouseEnter={e=>e.currentTarget.style.background=P.cardHover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
        <td style={{padding:"10px 14px"}}><div style={{display:"flex",alignItems:"center",gap:6}}>{Ic.dot(sc[ig.stat].c)}<span style={{fontSize:12,color:sc[ig.stat].c,fontWeight:500}}>{sc[ig.stat].l}</span></div></td>
        <td style={{padding:"10px 14px",fontSize:13,fontWeight:500}}>{ig.name}</td><td style={{padding:"10px 14px"}}><Pill c={P.dim} ch={ig.cat}/></td>
        <td style={{padding:"10px 14px",fontSize:12,fontFamily:"'JetBrains Mono'",color:ig.sync==="FAILED"?P.red:P.muted}}>{ig.sync}</td>
        <td style={{padding:"10px 14px",fontSize:12,fontFamily:"'JetBrains Mono'",color:P.muted}}>{ig.calls}</td>
        <td style={{padding:"10px 14px",fontSize:11,fontFamily:"'JetBrains Mono'",color:P.muted}}>{ig.key}</td>
        <td style={{padding:"10px 14px",textAlign:"right"}}><Btn label={ig.stat==="ok"?"Configure":ig.stat==="err"?"Retry":"Connect"} ghost small/></td>
      </tr>))}</tbody></table></div>
    <div className="fi d2" style={{marginTop:16,background:P.surface,border:`1px solid ${P.border}`,borderRadius:8,padding:"16px 18px"}}>
      <div style={{fontWeight:600,fontSize:14,marginBottom:12}}>REST API Access</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
        {[["Base URL","https://api.nexusdesk.io/v1"],["API Key","nxd_live_•••••••k7f9"],["Webhook","https://api.nexusdesk.io/v1/hook"]].map(([l,v])=>(<div key={l} style={{padding:"10px 12px",background:P.card,borderRadius:6,border:`1px solid ${P.border}`}}><div style={{fontSize:10,color:P.muted,fontWeight:600,textTransform:"uppercase",letterSpacing:.5,marginBottom:4}}>{l}</div><div style={{fontSize:12,fontFamily:"'JetBrains Mono'",color:P.dim,wordBreak:"break-all"}}>{v}</div></div>))}
      </div>
      <div style={{marginTop:12,fontSize:12,color:P.dim}}>Documentation: <span style={{color:P.blue,cursor:"pointer"}}>https://docs.nexusdesk.io/api</span></div>
    </div>
  </div>);
}

// ══════════════════ BILLING ══════════════════
function BillingPage(){
  const[setModal]=useState(null);
  const totals={revenue:INVOICES.filter(i=>i.status==="Paid").reduce((s,i)=>s+i.amt,0),outstanding:INVOICES.filter(i=>i.status==="Outstanding").reduce((s,i)=>s+i.amt,0),overdue:INVOICES.filter(i=>i.status==="Overdue").reduce((s,i)=>s+i.amt,0)};
  const revenueData=[{m:"Nov",val:21200},{m:"Dec",val:22100},{m:"Jan",val:22800},{m:"Feb",val:23100},{m:"Mar",val:23600},{m:"Apr",val:23600}];
  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><h1 style={{fontSize:20,fontWeight:700}}>Billing & Invoicing</h1><Btn label="New Invoice" icon={Ic.plus}/></div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
      {[["Revenue (Paid)",`$${totals.revenue.toLocaleString()}`,P.green],["Outstanding",`$${totals.outstanding.toLocaleString()}`,P.amber],["Overdue",`$${totals.overdue.toLocaleString()}`,P.red],["Recurring Clients","5",P.blue]].map(([l,v,c],i)=>(<div key={l} className={`fi d${i+1}`} style={{background:P.surface,border:`1px solid ${P.border}`,borderRadius:8,padding:"16px 18px"}}><div style={{fontSize:12,color:P.dim,marginBottom:10}}>{l}</div><div style={{fontSize:28,fontWeight:800,color:c,letterSpacing:-.5}}>{v}</div></div>))}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:12,marginBottom:20}}>
      <div className="fi d2" style={{background:P.surface,border:`1px solid ${P.border}`,borderRadius:8,overflow:"hidden"}}>
        <div style={{padding:"12px 16px",borderBottom:`1px solid ${P.border}`}}><span style={{fontWeight:600,fontSize:14}}>Revenue Trend</span></div>
        <div style={{padding:"12px 16px",height:180}}>
          <ResponsiveContainer width="100%" height="100%"><LineChart data={revenueData}><XAxis dataKey="m" tick={{fill:P.dim,fontSize:11}} axisLine={false} tickLine={false}/><YAxis tick={{fill:P.muted,fontSize:11}} axisLine={false} tickLine={false} width={40}/><Tooltip contentStyle={{background:P.card,border:`1px solid ${P.border}`,borderRadius:6,fontSize:12}}/><Line type="monotone" dataKey="val" stroke={P.green} strokeWidth={2} dot={{fill:P.green,r:3}}/></LineChart></ResponsiveContainer>
        </div>
      </div>
      <div className="fi d3" style={{background:P.surface,border:`1px solid ${P.border}`,borderRadius:8,padding:"16px 18px"}}>
        <div style={{fontWeight:600,fontSize:14,marginBottom:12}}>By Status</div>
        <div style={{height:150}}><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={[{n:"Paid",v:totals.revenue},{n:"Outstanding",v:totals.outstanding},{n:"Overdue",v:totals.overdue}]} dataKey="v" nameKey="n" cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={4}><Cell fill={P.green}/><Cell fill={P.amber}/><Cell fill={P.red}/></Pie><Tooltip contentStyle={{background:P.card,border:`1px solid ${P.border}`,borderRadius:6,fontSize:12}}/></PieChart></ResponsiveContainer></div>
      </div>
    </div>
    <div className="fi d3" style={{background:P.surface,border:`1px solid ${P.border}`,borderRadius:8,overflow:"hidden"}}><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>{["Invoice","Client","Amount","Status","Issued","Due","Paid"].map(h=><th key={h} style={{padding:"10px 14px",textAlign:"left",fontSize:11,color:P.muted,fontWeight:600,borderBottom:`1px solid ${P.border}`}}>{h}</th>)}</tr></thead>
      <tbody>{INVOICES.map(inv=>(<tr key={inv.num} style={{borderBottom:`1px solid ${P.border}`,transition:"background .1s"}} onMouseEnter={e=>e.currentTarget.style.background=P.cardHover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
        <td style={{padding:"10px 14px",fontFamily:"'JetBrains Mono'",fontSize:12}}>{inv.num}</td><td style={{padding:"10px 14px",fontSize:13}}>{inv.client}</td>
        <td style={{padding:"10px 14px",fontWeight:600,fontFamily:"'JetBrains Mono'"}}>${inv.amt.toLocaleString()}</td><td style={{padding:"10px 14px"}}><Pill c={invC[inv.status].c} bg={invC[inv.status].bg} ch={inv.status}/></td>
        <td style={{padding:"10px 14px",fontSize:12,color:P.dim}}>{inv.date}</td><td style={{padding:"10px 14px",fontSize:12,color:P.dim}}>{inv.due}</td><td style={{padding:"10px 14px",fontSize:12,color:P.muted}}>{inv.paid}</td>
      </tr>))}</tbody></table></div>
  </div>);
}

// ══════════════════ REPORTS ══════════════════
function ReportPage(){
  const tktBycat=[{cat:"Infrastructure",count:34},{cat:"Security",count:28},{cat:"Network",count:22},{cat:"Hardware",count:18},{cat:"Backup/DR",count:15},{cat:"Onboarding",count:12},{cat:"Licensing",count:8}];
  const slaData=[{m:"Nov",compliance:94},{m:"Dec",compliance:97},{m:"Jan",compliance:92},{m:"Feb",compliance:96},{m:"Mar",compliance:93},{m:"Apr",compliance:96}];
  const techData=[{name:"Jake M.",resolved:42,avg:"3.2h"},{name:"Sarah K.",resolved:38,avg:"4.1h"},{name:"Carlos R.",resolved:31,avg:"5.0h"}];
  return(<div>
    <h1 style={{fontSize:20,fontWeight:700,marginBottom:16}}>Reports & Analytics</h1>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
      {[["Tickets Closed (30d)","147",P.green],["Avg Resolution","4.2h",P.blue],["SLA Compliance","96%",P.green],["First Response","8m",P.green]].map(([l,v,c],i)=>(<div key={l} className={`fi d${i+1}`} style={{background:P.surface,border:`1px solid ${P.border}`,borderRadius:8,padding:"16px 18px"}}><div style={{fontSize:12,color:P.dim,marginBottom:10}}>{l}</div><div style={{fontSize:28,fontWeight:800,color:c,letterSpacing:-.5}}>{v}</div></div>))}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
      <div className="fi d2" style={{background:P.surface,border:`1px solid ${P.border}`,borderRadius:8,overflow:"hidden"}}><div style={{padding:"12px 16px",borderBottom:`1px solid ${P.border}`}}><span style={{fontWeight:600,fontSize:14}}>Tickets by Category</span></div>
        <div style={{padding:"12px 16px",height:220}}><ResponsiveContainer width="100%" height="100%"><BarChart data={tktBycat} layout="vertical"><XAxis type="number" tick={{fill:P.muted,fontSize:11}} axisLine={false} tickLine={false}/><YAxis type="category" dataKey="cat" tick={{fill:P.dim,fontSize:11}} axisLine={false} tickLine={false} width={85}/><Tooltip contentStyle={{background:P.card,border:`1px solid ${P.border}`,borderRadius:6,fontSize:12}}/><Bar dataKey="count" fill={P.blue} radius={[0,4,4,0]} barSize={14}/></BarChart></ResponsiveContainer></div></div>
      <div className="fi d3" style={{background:P.surface,border:`1px solid ${P.border}`,borderRadius:8,overflow:"hidden"}}><div style={{padding:"12px 16px",borderBottom:`1px solid ${P.border}`}}><span style={{fontWeight:600,fontSize:14}}>SLA Compliance Trend</span></div>
        <div style={{padding:"12px 16px",height:220}}><ResponsiveContainer width="100%" height="100%"><LineChart data={slaData}><XAxis dataKey="m" tick={{fill:P.dim,fontSize:11}} axisLine={false} tickLine={false}/><YAxis domain={[88,100]} tick={{fill:P.muted,fontSize:11}} axisLine={false} tickLine={false} width={30}/><Tooltip contentStyle={{background:P.card,border:`1px solid ${P.border}`,borderRadius:6,fontSize:12}}/><Line type="monotone" dataKey="compliance" stroke={P.green} strokeWidth={2} dot={{fill:P.green,r:3}}/></LineChart></ResponsiveContainer></div></div>
    </div>
    <div className="fi d3" style={{background:P.surface,border:`1px solid ${P.border}`,borderRadius:8,overflow:"hidden"}}><div style={{padding:"12px 16px",borderBottom:`1px solid ${P.border}`}}><span style={{fontWeight:600,fontSize:14}}>Technician Performance (30d)</span></div>
      <table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>{["Technician","Resolved","Avg Resolution","Utilization"].map(h=><th key={h} style={{padding:"10px 14px",textAlign:"left",fontSize:11,color:P.muted,fontWeight:600,borderBottom:`1px solid ${P.border}`}}>{h}</th>)}</tr></thead>
        <tbody>{techData.map(t=>(<tr key={t.name} style={{borderBottom:`1px solid ${P.border}`}}><td style={{padding:"10px 14px",fontSize:13,fontWeight:500}}>{t.name}</td><td style={{padding:"10px 14px",fontWeight:600,fontFamily:"'JetBrains Mono'"}}>{t.resolved}</td><td style={{padding:"10px 14px",fontFamily:"'JetBrains Mono'",fontSize:12,color:P.dim}}>{t.avg}</td><td style={{padding:"10px 14px",width:120}}><Bar p={Math.round(t.resolved/42*100)} c={P.blue} h={6}/></td></tr>))}</tbody></table></div>
  </div>);
}

// ══════════════════ SECURITY ══════════════════
function SecurityPage(){
  const[secToggles,setSecToggles]=useState({mfa:true,sso:true,ipwl:false,enc:true,audit:true,rbac:true,session:false,rate:true,isolation:true,backup:true});
  const controls=[{k:"mfa",name:"Two-Factor Authentication",desc:"Enforce MFA for all team members",icon:"🔐"},{k:"sso",name:"SSO / SAML",desc:"Azure AD or Okta sign-on",icon:"🔑"},{k:"ipwl",name:"IP Whitelisting",desc:"Restrict to trusted IPs",icon:"🌐"},{k:"enc",name:"AES-256 at Rest",desc:"All stored data encrypted",icon:"🛡️"},{k:"audit",name:"Audit Logging",desc:"Full action trail",icon:"📋"},{k:"rbac",name:"RBAC Permissions",desc:"Granular role-based access",icon:"👥"},{k:"session",name:"Session Timeout",desc:"Auto-timeout & limits",icon:"⏱️"},{k:"rate",name:"API Rate Limiting",desc:"Request throttling",icon:"🚦"},{k:"isolation",name:"Data Isolation",desc:"Multi-tenant separation",icon:"🗄️"},{k:"backup",name:"Encrypted Backups",desc:"Off-site replication",icon:"💾"}];
  return(<div>
    <h1 style={{fontSize:20,fontWeight:700,marginBottom:16}}>Security Center</h1>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
      {[["Security Score","92 / 100",P.green],["Active Sessions","7",P.blue],["Failed Logins (24h)","3",P.amber]].map(([l,v,c],i)=>(<div key={l} className={`fi d${i+1}`} style={{background:P.surface,border:`1px solid ${P.border}`,borderRadius:8,padding:"16px 18px"}}><div style={{fontSize:12,color:P.dim,marginBottom:10}}>{l}</div><div style={{fontSize:28,fontWeight:800,color:c,letterSpacing:-.5}}>{v}</div></div>))}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
      {controls.map(ct=>(<div key={ct.k} style={{background:P.surface,border:`1px solid ${P.border}`,borderRadius:8,padding:"14px 18px",display:"flex",alignItems:"center",gap:14}}>
        <span style={{fontSize:22}}>{ct.icon}</span><div style={{flex:1}}><div style={{fontSize:13,fontWeight:600}}>{ct.name}</div><div style={{fontSize:11,color:P.muted}}>{ct.desc}</div></div>
        <Toggle on={secToggles[ct.k]} onToggle={()=>setSecToggles(p=>({...p,[ct.k]:!p[ct.k]}))}/>
      </div>))}
    </div>
    <div className="fi d3" style={{background:P.surface,border:`1px solid ${P.border}`,borderRadius:8,overflow:"hidden"}}><div style={{padding:"12px 16px",borderBottom:`1px solid ${P.border}`}}><span style={{fontWeight:600,fontSize:14}}>Audit Log</span></div>
      <table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>{["Time","User","Action","Category","Severity"].map(h=><th key={h} style={{padding:"10px 14px",textAlign:"left",fontSize:11,color:P.muted,fontWeight:600,borderBottom:`1px solid ${P.border}`}}>{h}</th>)}</tr></thead>
        <tbody>{AUDIT_LOG.map((a,i)=>(<tr key={i} style={{borderBottom:`1px solid ${P.border}`}}><td style={{padding:"10px 14px",fontFamily:"'JetBrains Mono'",fontSize:12,color:P.muted}}>{a.time}</td><td style={{padding:"10px 14px",fontSize:12,fontWeight:500}}>{a.user}</td><td style={{padding:"10px 14px",fontSize:12}}>{a.action}</td><td style={{padding:"10px 14px"}}><Pill c={P.dim} ch={a.cat}/></td><td style={{padding:"10px 14px"}}><Pill c={a.sev==="critical"?P.red:a.sev==="warning"?P.amber:P.dim} ch={a.sev}/></td></tr>))}</tbody></table></div>
  </div>);
}

// ══════════════════ SETTINGS ══════════════════
function SettingsPage(){
  const[sTab,setSTab]=useState("general");
  const tabs=["general","team","categories","notifications","deployment","api"];
  return(<div>
    <h1 style={{fontSize:20,fontWeight:700,marginBottom:16}}>Settings</h1>
    <div style={{display:"flex",gap:4,marginBottom:16}}>{tabs.map(t=><button key={t} onClick={()=>setSTab(t)} style={{background:sTab===t?P.blueBg:"transparent",color:sTab===t?P.blue:P.dim,border:`1px solid ${sTab===t?P.blueBorder:P.border}`,padding:"6px 16px",borderRadius:6,cursor:"pointer",fontSize:12,fontWeight:500,fontFamily:"inherit",textTransform:"capitalize"}}>{t}</button>)}</div>
    {sTab==="general"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <div style={{background:P.surface,border:`1px solid ${P.border}`,borderRadius:8,padding:"20px 22px"}}>
        <div style={{fontWeight:600,fontSize:14,marginBottom:16}}>Company Info</div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}><Field label="Company Name" placeholder="Your MSP Name" value="NexusDesk IT Solutions"/><Field label="Primary Domain" placeholder="yourdomain.com" value="nexusdesk.io"/><Field label="Support Email" placeholder="support@..." value="support@nexusdesk.io"/><Field label="Phone" placeholder="(555) ..." value="(555) 100-2000"/></div>
      </div>
      <div style={{background:P.surface,border:`1px solid ${P.border}`,borderRadius:8,padding:"20px 22px"}}>
        <div style={{fontWeight:600,fontSize:14,marginBottom:16}}>SLA Configuration</div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>{[["P1 — Critical Response","15 min"],["P2 — High Response","1 hour"],["P3 — Medium Response","4 hours"],["P4 — Low Response","8 hours"]].map(([l,v])=>(
          <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${P.border}`}}><span style={{fontSize:13}}>{l}</span><span style={{fontFamily:"'JetBrains Mono'",fontSize:13,fontWeight:600}}>{v}</span></div>))}
        </div>
      </div>
    </div>}
    {sTab==="team"&&<div style={{background:P.surface,border:`1px solid ${P.border}`,borderRadius:8,overflow:"hidden"}}><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>{["Name","Role","Email","Status",""].map(h=><th key={h} style={{padding:"10px 14px",textAlign:"left",fontSize:11,color:P.muted,fontWeight:600,borderBottom:`1px solid ${P.border}`}}>{h}</th>)}</tr></thead>
      <tbody>{[{name:"Jake Morrison",role:"Admin",email:"jake@nexusdesk.io",status:"Online"},{name:"Sarah Kim",role:"Technician",email:"sarah@nexusdesk.io",status:"Online"},{name:"Carlos Reyes",role:"Technician",email:"carlos@nexusdesk.io",status:"Away"},{name:"Maria Lopez",role:"Dispatcher",email:"maria@nexusdesk.io",status:"Offline"}].map(m=>(
        <tr key={m.name} style={{borderBottom:`1px solid ${P.border}`}}><td style={{padding:"12px 14px"}}><div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:30,height:30,borderRadius:8,background:P.blueBg,display:"flex",alignItems:"center",justifyContent:"center",color:P.blue,fontSize:11,fontWeight:700}}>{m.name.split(" ").map(n=>n[0]).join("")}</div><span style={{fontSize:13,fontWeight:500}}>{m.name}</span></div></td>
          <td style={{padding:"12px 14px"}}><Pill c={m.role==="Admin"?P.purple:P.dim} ch={m.role}/></td><td style={{padding:"12px 14px",fontFamily:"'JetBrains Mono'",fontSize:12,color:P.dim}}>{m.email}</td>
          <td style={{padding:"12px 14px"}}><Pill c={m.status==="Online"?P.green:m.status==="Away"?P.amber:P.dim} ch={m.status}/></td><td style={{padding:"12px 14px",textAlign:"right"}}><Btn label="Edit" ghost small/></td></tr>))}</tbody></table></div>}
    {sTab==="categories"&&<div style={{background:P.surface,border:`1px solid ${P.border}`,borderRadius:8,padding:"20px 22px"}}>
      <div style={{fontWeight:600,fontSize:14,marginBottom:16}}>Ticket Categories</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:8}}>{["Infrastructure","Network","Security","Hardware","Software","Onboarding","Offboarding","Backup/DR","Cloud","Licensing","Compliance","VoIP","Project Work","Consultation"].map(c=>(
        <span key={c} style={{fontSize:12,padding:"6px 14px",borderRadius:6,background:P.card,border:`1px solid ${P.border}`,color:P.dim,display:"flex",alignItems:"center",gap:6}}>{c}<button style={{background:"transparent",border:"none",color:P.muted,cursor:"pointer",fontSize:14,lineHeight:1}}>×</button></span>))}
        <button style={{fontSize:12,padding:"6px 14px",borderRadius:6,background:P.blueBg,border:`1px dashed ${P.blueBorder}`,color:P.blue,cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>+ Add</button>
      </div>
    </div>}
    {sTab==="notifications"&&<div style={{background:P.surface,border:`1px solid ${P.border}`,borderRadius:8,padding:"20px 22px"}}>
      <div style={{fontWeight:600,fontSize:14,marginBottom:16}}>Notification Preferences</div>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>{[["New ticket created",true],["Ticket assigned to me",true],["SLA breach warning",true],["Client health drops below 60%",true],["Security incidents",true],["Integration sync failures",true],["Daily summary digest",true],["Weekly reports",false],["Invoice overdue alerts",true],["Contract expiration warnings",true]].map(([label,on])=>(
        <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${P.border}`}}><span style={{fontSize:13}}>{label}</span><Toggle on={on} onToggle={()=>{}}/></div>))}
      </div>
    </div>}
    {sTab==="deployment"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <div style={{background:P.surface,border:`1px solid ${P.border}`,borderRadius:8,padding:"20px 22px"}}>
        <div style={{fontWeight:600,fontSize:14,marginBottom:16}}>Server Configuration</div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>{[["Platform","DigitalOcean VPS"],["Region","NYC3"],["Plan","4 vCPU / 8GB / 160GB SSD"],["OS","Ubuntu 24.04 LTS"],["Database","PostgreSQL 16.2"],["Cache","Redis 7.2"],["Web Server","Nginx 1.26 + Node.js 22 LTS"],["SSL","Let's Encrypt (Auto-Renew)"],["Firewall","UFW + Fail2Ban"],["Backups","Daily snapshots, 7-day retention"]].map(([l,v])=>(
          <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${P.border}`}}><span style={{color:P.dim,fontSize:13}}>{l}</span><span style={{fontWeight:500,fontFamily:"'JetBrains Mono'",fontSize:12}}>{v}</span></div>))}
        </div>
      </div>
      <div style={{background:P.surface,border:`1px solid ${P.border}`,borderRadius:8,padding:"20px 22px"}}>
        <div style={{fontWeight:600,fontSize:14,marginBottom:16}}>System Status</div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>{[["Uptime","99.97% (30d)"],["Last Deploy","Apr 26, 2026 14:32"],["App Version","2.4.1"],["DB Size","2.8 GB"],["Cache Hit Rate","94.2%"],["Avg Response","145ms"],["Active Connections","23"],["Cron Jobs","6 active"]].map(([l,v])=>(
          <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${P.border}`}}><span style={{color:P.dim,fontSize:13}}>{l}</span><span style={{fontWeight:500,fontFamily:"'JetBrains Mono'",fontSize:12,color:v.includes("99")?P.green:P.text}}>{v}</span></div>))}
        </div>
      </div>
    </div>}
    {sTab==="api"&&<div style={{background:P.surface,border:`1px solid ${P.border}`,borderRadius:8,padding:"20px 22px"}}>
      <div style={{fontWeight:600,fontSize:14,marginBottom:16}}>API Configuration</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
        <Field label="API Base URL" value="https://api.nexusdesk.io/v1"/><Field label="Webhook Endpoint" value="https://api.nexusdesk.io/v1/webhook"/>
      </div>
      <div style={{fontWeight:600,fontSize:13,marginBottom:10}}>API Keys</div>
      <table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>{["Key Name","Token","Created","Status",""].map(h=><th key={h} style={{padding:"8px 0",textAlign:"left",fontSize:11,color:P.muted,fontWeight:600,borderBottom:`1px solid ${P.border}`}}>{h}</th>)}</tr></thead>
        <tbody>{[{name:"Production",token:"nxd_live_•••••••k7f9",created:"Jan 12, 2026",active:true},{name:"Development",token:"nxd_test_•••••••m2c4",created:"Feb 3, 2026",active:true},{name:"Legacy (v1)",token:"nxd_v1_•••••••p8e2",created:"Sep 1, 2025",active:false}].map(k=>(
          <tr key={k.name} style={{borderBottom:`1px solid ${P.border}`}}><td style={{padding:"10px 0",fontSize:13,fontWeight:500}}>{k.name}</td><td style={{padding:"10px 0",fontFamily:"'JetBrains Mono'",fontSize:12,color:P.dim}}>{k.token}</td><td style={{padding:"10px 0",fontSize:12,color:P.muted}}>{k.created}</td><td style={{padding:"10px 0"}}><Pill c={k.active?P.green:P.dim} ch={k.active?"Active":"Revoked"}/></td><td style={{padding:"10px 0",textAlign:"right"}}><Btn label={k.active?"Revoke":"Regenerate"} ghost small/></td></tr>))}</tbody></table>
      <div style={{marginTop:16}}><Btn label="Generate New Key" icon={Ic.plus}/></div>
    </div>}
  </div>);
}

// ══════════════════ MODALS ══════════════════
function NewTkModal({onClose}){
  return(<div style={{position:"fixed",inset:0,background:"rgba(10,12,20,.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,backdropFilter:"blur(4px)"}} onClick={onClose}>
    <div className="fi" style={{background:P.surface,border:`1px solid ${P.border}`,borderRadius:10,width:520,boxShadow:"0 20px 60px rgba(0,0,0,.4)"}} onClick={e=>e.stopPropagation()}>
      <div style={{padding:"14px 20px",borderBottom:`1px solid ${P.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}><h2 style={{fontSize:16,fontWeight:700}}>Create Ticket</h2><button onClick={onClose} style={{background:"transparent",border:"none",color:P.muted,cursor:"pointer"}}>{Ic.x()}</button></div>
      <div style={{padding:"18px 20px",display:"flex",flexDirection:"column",gap:14}}>
        <Field label="Subject" placeholder="Brief description"/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><Select label="Client" opts={CLIENTS.map(c=>c.name)}/><Select label="Priority" opts={["P1 — Critical","P2 — High","P3 — Medium","P4 — Low"]}/><Select label="Category" opts={["Infrastructure","Network","Security","Hardware","Software","Onboarding","Backup/DR","Licensing","Compliance"]}/><Select label="Assign To" opts={["Jake M.","Sarah K.","Carlos R.","Auto-Assign"]}/></div>
        <Field label="Description" placeholder="Details, steps to reproduce…" textarea/>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><Btn label="Cancel" ghost onClick={onClose}/><Btn label="Create Ticket"/></div>
      </div>
    </div>
  </div>);
}

function NewInvModal({onClose}){
  return(<div style={{position:"fixed",inset:0,background:"rgba(10,12,20,.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,backdropFilter:"blur(4px)"}} onClick={onClose}>
    <div className="fi" style={{background:P.surface,border:`1px solid ${P.border}`,borderRadius:10,width:520,boxShadow:"0 20px 60px rgba(0,0,0,.4)"}} onClick={e=>e.stopPropagation()}>
      <div style={{padding:"14px 20px",borderBottom:`1px solid ${P.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}><h2 style={{fontSize:16,fontWeight:700}}>Create Invoice</h2><button onClick={onClose} style={{background:"transparent",border:"none",color:P.muted,cursor:"pointer"}}>{Ic.x()}</button></div>
      <div style={{padding:"18px 20px",display:"flex",flexDirection:"column",gap:14}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><Select label="Client" opts={CLIENTS.map(c=>c.name)}/><Field label="Amount" placeholder="$0.00"/><Field label="Issue Date" placeholder="Apr 28, 2026"/><Field label="Due Date" placeholder="May 12, 2026"/></div>
        <Field label="Line Items / Notes" placeholder="Managed services — April 2026" textarea/>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><Btn label="Cancel" ghost onClick={onClose}/><Btn label="Save Draft" ghost/><Btn label="Create & Send"/></div>
      </div>
    </div>
  </div>);
}
