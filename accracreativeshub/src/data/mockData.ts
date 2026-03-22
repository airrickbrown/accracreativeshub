// ── MOCK DATA ──
// All sample designers, orders, and messages live here.
// When you add a real backend (Supabase), replace this file
// with real API calls instead.

export const DESIGNERS = [
  { id:1, name:"Abena Kyei",    avatar:"AK", color:"#1a2a1a", category:"Logo Design",        tagline:"Brand identities that outlast trends",           location:"Accra, East Legon",    rating:4.9, reviews:134, orders:210, price:150,  responseTime:"< 2 hours",  tags:["Minimalist","Corporate","Luxury"],    badge:"top_rated", featured:true,  verified:true,  portrait:"https://picsum.photos/id/1005/400/500", portfolio:["https://picsum.photos/id/1/400/500","https://picsum.photos/id/20/400/500","https://picsum.photos/id/30/400/500"], earnings:12400, views:890,  referralCode:"ABENA20", referrals:8  },
  { id:2, name:"Kwesi Mensah",  avatar:"KM", color:"#1a1a2a", category:"Flyer & Social Media",tagline:"Designs that stop the scroll",                   location:"Kumasi, Adum",         rating:4.8, reviews:89,  orders:312, price:30,   responseTime:"< 1 hour",   tags:["Events","Church","Music"],            badge:"verified",  featured:true,  verified:true,  portrait:"https://picsum.photos/id/1012/400/500", portfolio:["https://picsum.photos/id/40/400/500","https://picsum.photos/id/50/400/500","https://picsum.photos/id/60/400/500"], earnings:6800,  views:1240, referralCode:"KWESI20", referrals:14 },
  { id:3, name:"Efua Asante",   avatar:"EA", color:"#2a1a2a", category:"Business Branding",   tagline:"Complete brand systems for serious businesses",  location:"Accra, Airport Res.",  rating:5.0, reviews:67,  orders:89,  price:800,  responseTime:"< 4 hours",  tags:["Startups","FMCG","Hospitality"],      badge:"elite",     featured:false, verified:true,  portrait:"https://picsum.photos/id/1027/400/500", portfolio:["https://picsum.photos/id/70/400/500","https://picsum.photos/id/80/400/500","https://picsum.photos/id/90/400/500"], earnings:48000, views:620,  referralCode:"EFUA20",  referrals:5  },
  { id:4, name:"Kofi Darkwa",   avatar:"KD", color:"#0a1a0a", category:"Logo Design",        tagline:"Symbols with meaning, marks with power",         location:"Takoradi",             rating:4.7, reviews:52,  orders:143, price:200,  responseTime:"< 3 hours",  tags:["Traditional","Modern","Tech"],         badge:"verified",  featured:false, verified:true,  portrait:"https://picsum.photos/id/1074/400/500", portfolio:["https://picsum.photos/id/100/400/500","https://picsum.photos/id/110/400/500","https://picsum.photos/id/120/400/500"],earnings:9200,  views:410,  referralCode:"KOFI20",  referrals:3  },
  { id:5, name:"Ama Boateng",   avatar:"AB", color:"#2a1a0a", category:"Flyer & Social Media",tagline:"Bold visuals for bold Ghanaian brands",           location:"Accra, Tema",          rating:4.9, reviews:201, orders:445, price:45,   responseTime:"< 30 mins",  tags:["Fast","Affordable","Creative"],        badge:"top_rated", featured:true,  verified:true,  portrait:"https://picsum.photos/id/1025/400/500", portfolio:["https://picsum.photos/id/130/400/500","https://picsum.photos/id/140/400/500","https://picsum.photos/id/150/400/500"],earnings:14200, views:1890, referralCode:"AMA20",   referrals:22 },
  { id:6, name:"Yaw Owusu",     avatar:"YO", color:"#0a0a2a", category:"Business Branding",   tagline:"From vision to visual identity",                 location:"Accra, Osu",           rating:4.8, reviews:43,  orders:61,  price:600,  responseTime:"< 6 hours",  tags:["Premium","Strategy","Packaging"],      badge:"new",       featured:false, verified:false, portrait:"https://picsum.photos/id/1062/400/500", portfolio:["https://picsum.photos/id/160/400/500","https://picsum.photos/id/170/400/500","https://picsum.photos/id/180/400/500"],earnings:0,     views:280,  referralCode:"YAW20",   referrals:0  },
]

export const ORDERS = [
  { id:301, client:"Kojo Foods",  designer:"Abena Kyei",  designerObj:DESIGNERS[0], project:"Restaurant Logo",    amount:150, commission:15, status:"in_progress", revisions:{used:1,total:3}, brief:"Modern logo for a Ghanaian food brand — green and gold, modern enough for packaging.", rush:false, deadline:"2 days"     },
  { id:302, client:"Grace Church",designer:"Ama Boateng", designerObj:DESIGNERS[4], project:"Anniversary Flyer",  amount:80,  commission:8,  status:"delivered",    revisions:{used:2,total:2}, brief:"Church 20th anniversary — Sunday 9am, Tema. Theme: 20 Years of Grace.",               rush:true,  deadline:"Delivered"  },
  { id:303, client:"TechStart GH",designer:"Efua Asante", designerObj:DESIGNERS[2], project:"Brand Identity",     amount:800, commission:80, status:"in_progress", revisions:{used:0,total:5}, brief:"Complete brand identity for a Ghanaian fintech startup.",                              rush:false, deadline:"7 days"     },
]

export const MESSAGES_DATA: Record<number, any[]> = {
  301: [
    { from:"designer", text:"Hello! I have reviewed your brief. The green and gold direction is perfect.", time:"10:32 AM" },
    { from:"client",   text:"Great! We need it modern enough for international packaging.",                time:"10:35 AM" },
    { from:"system",   text:"Revision 1 of 3 requested" },
    { from:"designer", text:"Here is the revised concept:", time:"2:14 PM", file:{ name:"KojoFoods_Logo_v2.pdf", size:"2.4 MB", type:"PDF" } },
  ],
  302: [
    { from:"client",   text:"Hi Ama, we need a flyer for our 20th anniversary this Sunday.", time:"Yesterday" },
    { from:"designer", text:"On it! Here is the first draft:", time:"Yesterday", file:{ name:"Anniversary_v1.jpg", size:"1.8 MB", type:"IMG" } },
    { from:"system",   text:"Project delivered · Awaiting client approval · Funds in escrow" },
  ],
}

export const PENDING_APPS = [
  { id:101, name:"Kwame Asare",    avatar:"KA", color:"#1a1a2a", category:"Logo Design",         appliedAt:"2 hours ago", portfolioCount:6, idVerified:true,  phone:"+233 24 123 4567" },
  { id:102, name:"Adwoa Frimpong", avatar:"AF", color:"#1a2a1a", category:"Flyer & Social Media", appliedAt:"5 hours ago", portfolioCount:8, idVerified:true,  phone:"+233 55 987 6543" },
  { id:103, name:"Fiifi Mensah",   avatar:"FM", color:"#2a1a1a", category:"Business Branding",    appliedAt:"1 day ago",   portfolioCount:4, idVerified:false, phone:"+233 20 456 7890" },
]

export const DISPUTES_DATA = [
  { id:201, client:"John Doe", designer:"Kwesi Mensah", project:"Event Flyer", amount:45, reason:"Design does not match the brief we agreed on", status:"open", raised:"1 hour ago" },
]
