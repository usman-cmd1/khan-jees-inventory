import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "./supabase";
import Login from "./Login";


const BRANCHES = ["Khan Jee 1", "Khan Jee 2", "Khan Jee 3", "Central Kitchen", "Khan Foods"];
const CATEGORIES = [
  "Dall and Spices","Bori Items","Minum Items","Kitchen Items","Disposables","Drinks","Meat","Cold Room Items",
  "Store Rack Other Items","Cleaning Items","Cooking Oil"
];
const UNITS = ["Kg","g","Pcs","ltr","ml","Box","Bori","Bottle","Tray","Pack","Gallon","Ctn"];

const fmt       = (n) => "MYR " + Number(n || 0).toFixed(2);
const today     = () => new Date().toISOString().split("T")[0];
const thisMonth = () => new Date().toISOString().slice(0, 7);

const NAV = [
  { id:"dashboard",   label:"Dashboard",    icon:"ti-layout-dashboard" },
  { id:"items",       label:"Items",        icon:"ti-category" },
  { id:"receiving",   label:"Receiving",    icon:"ti-download" },
  { id:"dispatching", label:"Dispatching",  icon:"ti-upload" },
  { id:"closing",     label:"Daily Closing",icon:"ti-sun" },
  { id:"suppliers",   label:"Suppliers",    icon:"ti-truck" },
  { id:"demand",      label:"Daily Demand", icon:"ti-clipboard-list" },
  { id:"reports",     label:"Reports",      icon:"ti-file-report" },
];

const SEED_SUPPLIERS = [
  { company:"Al Madeenah Mart Meat", contact:"", phone:"0183141729", catalogueItems:[
    { name:"Mutton Shoulder 2inch", unit:"Kg" },{ name:"Mutton Shoulder 1.5inch", unit:"Kg" },
    { name:"Mutton Leg 1.3inch", unit:"Kg" },{ name:"Mutton Leg 2inch", unit:"Kg" },
    { name:"Boneless BB", unit:"CTN" },{ name:"Boneless BL", unit:"CTN" },
    { name:"Beef Topside 2inch", unit:"Kg" },{ name:"Beef NO CUT", unit:"Kg" },
  ]},
  { company:"Ravi Raj Sdn Bhd", contact:"", phone:"", catalogueItems:[] },
  
  { company:"Zama Star", contact:"", phone:"", catalogueItems:
    [
    { name:"Sampa Plastic", unit:"Bundles" },{ name:"Roti Paper", unit:"Bundles" },
    { name:"Plastic 40g", unit:"Goni" },{ name:"Plastic 30g", unit:"Goni" },
    { name:"Plastic 55g", unit:"Goni" },{ name:"Plastic 65g", unit:"Goni" },
    { name:"2 Kg plastic", unit:"Goni" },{ name:"Disposable Big Glass", unit:"CTN" },
    { name:"Disposable Small Glass", unit:"CTN" },{ name:"Tea Cup", unit:"CTN" },
    { name:"Tea Cup Cap", unit:"CTN" },{ name:"650ml Container", unit:"CTN" },
    { name:"250ml Container", unit:"CTN" },{ name:"1300/1500ml Container", unit:"CTN" },
    { name:"Chapli Box", unit:"CTN" },{ name:"Raita Takeaway", unit:"CTN" },
    { name:"R-20", unit:"CTN" },{ name:"Gloves Large", unit:"CTN" },
    { name:"Wrapping Roll Large", unit:"CTN" },{ name:"Wrapping Roll Small", unit:"CTN" },
    { name:"1000ml Container", unit:"CTN" },{ name:"GO-153 Container", unit:"CTN" },
    { name:"WK-Bottles with Cap 400ml", unit:"Bundle" },
  ]
},
  { company:"Al Madeenah Mart Store Goods", contact:"", phone:"0183141729", catalogueItems:[
    { name:"Susu Manis", unit:"Ctn" },{ name:"Susu Champ", unit:"Ctn" },
    { name:"NSK Tissue", unit:"CTN" },{ name:"Milo", unit:"CTN" },
    { name:"Surf", unit:"Ctn" },{ name:"Marjreen", unit:"Ctn" },
  ]},
  { company:"Vegetables", contact:"", phone:"", catalogueItems:[
    { name:"Palak", unit:"Kg" },{ name:"Bhindi", unit:"Kg" },{ name:"Karela", unit:"Kg" },
    { name:"Dhaniya", unit:"Kg" },{ name:"Mint", unit:"Kg" },{ name:"Shimla", unit:"Kg" },
    { name:"Bengan", unit:"Kg" },{ name:"Sabz Mirch", unit:"Ctn" },{ name:"Big Mirch", unit:"Kg" },
    { name:"Carrot", unit:"Ctn" },{ name:"Green Lemon", unit:"Ctn" },{ name:"Adrak", unit:"Kg" },
    { name:"Lemu Kasturi", unit:"Kg" },{ name:"Salad Patta", unit:"Kg" },{ name:"Tomato", unit:"Ctn" },
    { name:"Band Gobi", unit:"Kg" },{ name:"Lal Gobi", unit:"Kg" },{ name:"Phool Gobi", unit:"Kg" },
    { name:"Red Shimla", unit:"Kg" },{ name:"Yellow Shimla", unit:"Kg" },{ name:"Kheera", unit:"Kg" },
    { name:"Lesson", unit:"Kg" },{ name:"Green Onion", unit:"Kg" },{ name:"Torhii", unit:"Kg" },
    { name:"Kaddu", unit:"Kg" },{ name:"Papita", unit:"Kg" },{ name:"Indian Onion", unit:"Bori" },
    { name:"Aloo", unit:"Bori" },{ name:"Matter", unit:"Ctn" },{ name:"Mooli", unit:"Kg" },
    { name:"Chukander", unit:"Kg" },
  ]},
  { company:"Fruits", contact:"", phone:"", catalogueItems:[
    { name:"Yellow Lemon", unit:"Ctn" },{ name:"Black Grapes", unit:"Ctn" },
    { name:"Red Apple", unit:"CTN" },{ name:"Green Apple", unit:"Ctn" },
    { name:"Mango", unit:"Kg" },{ name:"Banana", unit:"Ctn" },{ name:"Orange", unit:"Ctn" },
    { name:"Pineapple", unit:"Pcs" },{ name:"Watermelon", unit:"Pcs" },
  ]},
  { company:"Zest", contact:"Zest Frozen Chowkit", phone:"0189119378", catalogueItems:[
    { name:"Beef Feet", unit:"Kg" },{ name:"Mutton Feet", unit:"Ctn" },
    { name:"Cheese", unit:"Ctn" },{ name:"Beef Mro Bone", unit:"Kg" },{ name:"Lamb Shank", unit:"Kg" },
  ]},
  { company:"Drinks", contact:"", phone:"", catalogueItems:[
    { name:"Coke 1.5l", unit:"Ctn" },{ name:"Sprite Tin", unit:"Ctn" },
    { name:"Coke Zero Tin", unit:"Ctn" },{ name:"Sprite 1.5l", unit:"Ctn" },
    { name:"100 plus Tin", unit:"Ctn" },
  ]},
];

// ── MAIN APP ───────────────────────────────────────────────────
export default function App() {
  // ── Auth state ─────────────────────────────────────────────
  const [session, setSession]         = useState(null);
  const [profile, setProfile]         = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // ── Data state ─────────────────────────────────────────────
  const [items, setItemsState]        = useState([]);
  const [receiving, setRecState]      = useState([]);
  const [dispatching, setDispState]   = useState([]);
  const [suppliers, setSuppState]     = useState([]);
  const [demands, setDemState]        = useState([]);

  // Refs always hold the latest committed data — used inside the async
  // Supabase setters below so back-to-back calls (e.g. add then delete)
  // never diff against a stale snapshot.
  const itemsRef       = useRef(items);
  const receivingRef   = useRef(receiving);
  const dispatchingRef = useRef(dispatching);
  const suppliersRef   = useRef(suppliers);
  const demandsRef     = useRef(demands);
  useEffect(() => { itemsRef.current = items; }, [items]);
  useEffect(() => { receivingRef.current = receiving; }, [receiving]);
  useEffect(() => { dispatchingRef.current = dispatching; }, [dispatching]);
  useEffect(() => { suppliersRef.current = suppliers; }, [suppliers]);
  useEffect(() => { demandsRef.current = demands; }, [demands]);
  const [dataLoading, setDataLoading] = useState(false);
  const [alerts, setAlerts]           = useState([]);

  const [page, setPage]       = useState("dashboard");
  const [sideOpen, setSideOpen] = useState(true);

  // ── Auth setup ─────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else { setProfile(null); setAuthLoading(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    setProfile(data);
    setAuthLoading(false);
  };

  const handleSignOut = async () => { await supabase.auth.signOut(); };
  const isAdmin = profile?.role === "admin";

  // ── Load all data ──────────────────────────────────────────
  // Supabase fires onAuthStateChange (and creates a brand-new `session`
  // object) on routine token refreshes and on tab focus/visibility checks
  // -- not just on real sign-in. Depending on the whole `session` object
  // here would re-run loadAll() on every one of those, blowing away any
  // unsaved-to-DB local state. Track the signed-in user id instead, so
  // loadAll() only runs once per actual login.
  const loadedUserId = useRef(null);
  useEffect(() => {
    const uid = session?.user?.id || null;
    if (uid && loadedUserId.current !== uid) {
      loadedUserId.current = uid;
      loadAll();
    }
    if (!uid) loadedUserId.current = null;
  }, [session]);

  const loadAll = async () => {
    setDataLoading(true);
    await Promise.all([loadItems(), loadReceiving(), loadDispatching(), loadSuppliers(), loadDemands()]);
    setDataLoading(false);
  };

  // ── Loaders ────────────────────────────────────────────────
  const loadItems = async () => {
    const { data, error } = await supabase
      .from("stock").select("*").eq("branch", "__master__").order("created_at", { ascending: true });
    if (error) { console.error("items load:", error); return; }
    const parsed = (data || []).map(r => {
      const [name, thresh] = (r.item || "").split(":::");
      return {
        id:           r.id,
        name:         name || r.item,
        category:     r.category,
        unit:         r.unit,
        opening:      Number(r.quantity) || 0,
        rate:         Number(r.unit_cost) || 0,
        lowThreshold: Number(thresh) || 0,
      };
    });
    setItemsState(parsed);
  };

  const loadReceiving = async () => {
    const { data, error } = await supabase
      .from("stock").select("*").neq("branch", "__master__").eq("category", "__receiving__").order("date", { ascending: true });
    if (error) { console.error("receiving load:", error); return; }
    setRecState((data || []).map(r => ({
      id: r.id, date: r.date, itemId: r.unit,
      qty: Number(r.quantity), rate: Number(r.unit_cost),
      supplier: r.branch, notes: r.item,
    })));
  };

  const loadDispatching = async () => {
    const { data, error } = await supabase
      .from("stock").select("*").eq("category", "__dispatch__").order("date", { ascending: true });
    if (error) { console.error("dispatching load:", error); return; }
    setDispState((data || []).map(r => ({
      id: r.id, date: r.date, itemId: r.unit,
      branch: r.branch, qty: Number(r.quantity), notes: r.item,
    })));
  };

  const loadSuppliers = async () => {
    const { data, error } = await supabase
      .from("suppliers").select("*").order("created_at", { ascending: true });
    if (error) { console.error("suppliers load:", error); return; }
    if (!data || data.length === 0) { await seedSuppliers(); return; }
    setSuppState((data || []).map(s => ({
      id:             s.id,
      company:        s.name,
      contact:        s.contact || "",
      phone:          s.branch || "",
      catalogueItems: (s.items || []).map((raw, idx) => {
        const [name, unit] = raw.split(":::");
        return { id: idx + 1, name: name || raw, unit: unit || "Kg" };
      }),
    })));
  };

  const seedSuppliers = async () => {
    for (const s of SEED_SUPPLIERS) {
      const items = (s.catalogueItems || []).map(ci => `${ci.name}:::${ci.unit}`);
      await supabase.from("suppliers").insert({
        name: s.company, contact: s.contact, branch: s.phone,
        items, created_by: session?.user?.id,
      });
    }
    await loadSuppliers();
  };

  const loadDemands = async () => {
    const { data, error } = await supabase
      .from("demand").select("*").order("date", { ascending: false });
    if (error) { console.error("demands load:", error); return; }
    setDemState((data || []).map(d => ({
      id:         d.id,
      date:       d.date,
      supplier:   d.branch,
      supplierId: d.item,
      phone:      d.category,
      notes:      d.unit,
      lines:      (() => { try { return JSON.parse(d.quantity) || []; } catch { return []; } })(),
      createdAt:  new Date(d.created_at).toLocaleString(),
    })));
  };

  // ── Supabase setters ───────────────────────────────────────
  const setItems = async (newItems) => {
    const current = itemsRef.current;
    const oldIds = new Set(current.map(i => i.id));
    const newIds = new Set(newItems.map(i => i.id));
    for (const old of current) {
      if (!newIds.has(old.id)) {
        const { data: delData, error } = await supabase.from("stock").delete().eq("id", old.id).select();
        if (error) {
          console.error("Delete failed for item", old.id, error);
          alert(`Could not delete "${old.name}": ${error.message}`);
          return; // abort so local state doesn't drift from the database
        }
        if (!delData || delData.length === 0) {
          console.error("Delete blocked (0 rows affected) for item", old.id);
          alert(`"${old.name}" was not actually deleted. Supabase returned no error but removed 0 rows — this means a Row Level Security policy on the "stock" table is silently blocking the delete. Run the SQL fix to add a DELETE policy, then try again.`);
          return; // abort so local state doesn't drift from the database
        }
      }
    }
    for (const ni of newItems) {
      if (oldIds.has(ni.id)) {
        const old = current.find(i => i.id === ni.id);
        if (JSON.stringify(old) !== JSON.stringify(ni)) {
          await supabase.from("stock").update({
            item: `${ni.name}:::${ni.lowThreshold}`, category: ni.category,
            unit: ni.unit, quantity: ni.opening, unit_cost: ni.rate,
            updated_at: new Date().toISOString(),
          }).eq("id", ni.id);
        }
      }
    }
    for (let ni of newItems) {
      if (!oldIds.has(ni.id)) {
        const { data, error } = await supabase.from("stock").insert({
          branch: "__master__", item: `${ni.name}:::${ni.lowThreshold}`,
          category: ni.category, unit: ni.unit, quantity: ni.opening,
          unit_cost: ni.rate, created_by: session?.user?.id,
        }).select().single();
        if (error || !data) {
          console.error("Insert failed for item", ni.name, error);
          alert(`"${ni.name}" was NOT saved to the database (it will disappear on refresh). Error: ${error?.message || "no row returned — check Row Level Security INSERT policy on the \"stock\" table."}`);
          return; // abort so we don't show a fake "saved" state
        }
        newItems = newItems.map(i => i.id === ni.id ? { ...i, id: data.id } : i);
      }
    }
    itemsRef.current = newItems;
    setItemsState(newItems);
  };

  const setReceiving = async (newRec) => {
    const current = receivingRef.current;
    const oldIds = new Set(current.map(r => r.id));
    const newIds = new Set(newRec.map(r => r.id));
    for (const old of current) {
      if (!newIds.has(old.id)) {
        const { data: delData, error } = await supabase.from("stock").delete().eq("id", old.id).select();
        if (error) { console.error("Delete failed for receiving", old.id, error); alert(`Could not delete record: ${error.message}`); return; }
        if (!delData || delData.length === 0) {
          console.error("Delete blocked (0 rows affected) for receiving", old.id);
          alert(`That record was not actually deleted. Supabase removed 0 rows with no error — a Row Level Security policy on the "stock" table is silently blocking it. Run the SQL fix, then try again.`);
          return;
        }
      }
    }
    for (let nr of newRec) {
      if (!oldIds.has(nr.id)) {
        const { data, error } = await supabase.from("stock").insert({
          branch: nr.supplier || "", category: "__receiving__", item: nr.notes || "",
          unit: nr.itemId, quantity: nr.qty, unit_cost: nr.rate,
          date: nr.date, created_by: session?.user?.id,
        }).select().single();
        if (error || !data) {
          console.error("Insert failed for receiving", error);
          alert(`This receiving record was NOT saved to the database (it will disappear on refresh). Error: ${error?.message || "no row returned — check Row Level Security INSERT policy on the \"stock\" table."}`);
          return;
        }
        newRec = newRec.map(r => r.id === nr.id ? { ...r, id: data.id } : r);
      }
    }
    receivingRef.current = newRec;
    setRecState(newRec);
  };

  const setDisp = async (newDisp) => {
    const current = dispatchingRef.current;
    const oldIds = new Set(current.map(d => d.id));
    const newIds = new Set(newDisp.map(d => d.id));
    for (const old of current) {
      if (!newIds.has(old.id)) {
        const { data: delData, error } = await supabase.from("stock").delete().eq("id", old.id).select();
        if (error) { console.error("Delete failed for dispatch", old.id, error); alert(`Could not delete record: ${error.message}`); return; }
        if (!delData || delData.length === 0) {
          console.error("Delete blocked (0 rows affected) for dispatch", old.id);
          alert(`That record was not actually deleted. Supabase removed 0 rows with no error — a Row Level Security policy on the "stock" table is silently blocking it. Run the SQL fix, then try again.`);
          return;
        }
      }
    }
    for (let nd of newDisp) {
      if (!oldIds.has(nd.id)) {
        const { data, error } = await supabase.from("stock").insert({
          branch: nd.branch, category: "__dispatch__", item: nd.notes || "",
          unit: nd.itemId, quantity: nd.qty, unit_cost: 0,
          date: nd.date, created_by: session?.user?.id,
        }).select().single();
        if (error || !data) {
          console.error("Insert failed for dispatch", error);
          alert(`This dispatch record was NOT saved to the database (it will disappear on refresh). Error: ${error?.message || "no row returned — check Row Level Security INSERT policy on the \"stock\" table."}`);
          return;
        }
        newDisp = newDisp.map(d => d.id === nd.id ? { ...d, id: data.id } : d);
      }
    }
    dispatchingRef.current = newDisp;
    setDispState(newDisp);
  };

  const setSuppliers = async (newSupp) => {
    const current = suppliersRef.current;
    const oldIds = new Set(current.map(s => s.id));
    const newIds = new Set(newSupp.map(s => s.id));
    for (const old of current) {
      if (!newIds.has(old.id)) {
        const { data: delData, error } = await supabase.from("suppliers").delete().eq("id", old.id).select();
        if (error) { console.error("Delete failed for supplier", old.id, error); alert(`Could not delete "${old.company}": ${error.message}`); return; }
        if (!delData || delData.length === 0) {
          console.error("Delete blocked (0 rows affected) for supplier", old.id);
          alert(`"${old.company}" was not actually deleted. Supabase removed 0 rows with no error — a Row Level Security policy on the "suppliers" table is silently blocking it. Run the SQL fix, then try again.`);
          return;
        }
      }
    }
    for (let ns of newSupp) {
      const itemsList = (ns.catalogueItems || []).map(ci => `${ci.name}:::${ci.unit}`);
      if (oldIds.has(ns.id)) {
        await supabase.from("suppliers").update({
          name: ns.company, contact: ns.contact, branch: ns.phone, items: itemsList,
        }).eq("id", ns.id);
      } else {
        const { data, error } = await supabase.from("suppliers").insert({
          name: ns.company, contact: ns.contact, branch: ns.phone,
          items: itemsList, created_by: session?.user?.id,
        }).select().single();
        if (error || !data) {
          console.error("Insert failed for supplier", ns.company, error);
          alert(`"${ns.company}" was NOT saved to the database (it will disappear on refresh). Error: ${error?.message || "no row returned — check Row Level Security INSERT policy on the \"suppliers\" table."}`);
          return;
        }
        newSupp = newSupp.map(s => s.id === ns.id ? { ...s, id: data.id } : s);
      }
    }
    suppliersRef.current = newSupp;
    setSuppState(newSupp);
  };

  const setDemands = async (newDem) => {
    const current = demandsRef.current;
    const oldIds = new Set(current.map(d => String(d.id)));
    const newIds = new Set(newDem.map(d => String(d.id)));
    for (const old of current) {
      if (!newIds.has(String(old.id))) {
        const { data: delData, error } = await supabase.from("demand").delete().eq("id", old.id).select();
        if (error) { console.error("Delete failed for demand", old.id, error); alert(`Could not delete order: ${error.message}`); return; }
        if (!delData || delData.length === 0) {
          console.error("Delete blocked (0 rows affected) for demand", old.id);
          alert(`That order was not actually deleted. Supabase removed 0 rows with no error — a Row Level Security policy on the "demand" table is silently blocking it. Run the SQL fix, then try again.`);
          return;
        }
      }
    }
    for (let nd of newDem) {
      if (!oldIds.has(nd.id)) {
        const { data, error } = await supabase.from("demand").insert({
          branch: nd.supplier, item: String(nd.supplierId),
          category: nd.phone || "", unit: nd.notes || "",
          quantity: JSON.stringify(nd.lines), date: nd.date,
          created_by: session?.user?.id,
        }).select().single();
        if (error || !data) {
          console.error("Insert failed for demand order", error);
          alert(`This demand order was NOT saved to the database (it will disappear on refresh / page switch). Error: ${error?.message || "no row returned — check Row Level Security INSERT policy on the \"demand\" table."}`);
          return;
        }
        newDem = newDem.map(d => d.id === nd.id ? { ...d, id: data.id } : d);
      }
    }
    demandsRef.current = newDem;
    setDemState(newDem);
  };

  // ── Stock calculations ─────────────────────────────────────
  const getStockAsOf = useCallback((itemId, asOfDate) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return 0;
    const rec = receiving
      .filter(r => r.itemId === itemId && r.date <= asOfDate)
      .reduce((a, r) => a + Number(r.qty), 0);
    const dis = dispatching
      .filter(d => d.itemId === itemId && d.date <= asOfDate)
      .reduce((a, d) => a + Number(d.qty), 0);
    return Number(item.opening) + rec - dis;
  }, [items, receiving, dispatching]);

  const getStock = useCallback((itemId) => getStockAsOf(itemId, today()), [getStockAsOf]);

  const getRate = useCallback((itemId) => {
    const item = items.find(i => i.id === itemId);
    return item?.rate || 0;
  }, [items]);

  useEffect(() => {
    setAlerts(items.filter(i => getStock(i.id) <= i.lowThreshold && i.name));
  }, [items, receiving, dispatching, getStock]);

  // ── Auth guards ────────────────────────────────────────────
  if (authLoading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center",
      justifyContent:"center", background:"#0f172a", color:"#94a3b8", fontSize:16 }}>
      Loading…
    </div>
  );
  if (!session) return <Login />;
  if (dataLoading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center",
      justifyContent:"center", background:"#0f172a", color:"#94a3b8", fontSize:16 }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:24, marginBottom:12 }}>⏳</div>
        Loading inventory data…
      </div>
    </div>
  );

  // ── Shared styles ──────────────────────────────────────────
  const S = {
    app:      { display:"flex", height:"100vh", fontFamily:"var(--font-sans)", background:"var(--color-background-tertiary)", overflow:"hidden" },
    sidebar:  { width:sideOpen?220:60, background:"var(--color-background-primary)", borderRight:"0.5px solid var(--color-border-tertiary)", display:"flex", flexDirection:"column", transition:"width 0.2s", overflow:"hidden", flexShrink:0 },
    logo:     { padding:"16px 14px", borderBottom:"0.5px solid var(--color-border-tertiary)", display:"flex", alignItems:"center", gap:10, minHeight:56 },
    logoIcon: { width:30, height:30, borderRadius:8, background:"#1D9E75", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
    navItem:  (a) => ({ display:"flex", alignItems:"center", gap:10, padding:"9px 14px", cursor:"pointer", borderRadius:8, margin:"1px 6px", background:a?"#E1F5EE":"transparent", color:a?"#085041":"var(--color-text-secondary)", fontSize:13, fontWeight:a?500:400, whiteSpace:"nowrap", overflow:"hidden", transition:"background 0.15s" }),
    main:     { flex:1, display:"flex", flexDirection:"column", overflow:"hidden" },
    topbar:   { background:"var(--color-background-primary)", borderBottom:"0.5px solid var(--color-border-tertiary)", padding:"0 20px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 },
    content:  { flex:1, overflow:"auto", padding:20 },
    card:     { background:"var(--color-background-primary)", border:"0.5px solid var(--color-border-tertiary)", borderRadius:12, padding:"16px 20px", marginBottom:16 },
    h2:       { fontSize:16, fontWeight:500, margin:"0 0 14px", color:"var(--color-text-primary)" },
    grid2:    { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:12 },
    grid4:    { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:10, marginBottom:16 },
    metric:   { background:"var(--color-background-secondary)", borderRadius:8, padding:"12px 14px" },
    lbl:      { fontSize:12, color:"var(--color-text-secondary)", marginBottom:4 },
    fgrid:    { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:10, marginBottom:14 },
    btn:      { padding:"7px 14px", border:"0.5px solid var(--color-border-secondary)", borderRadius:8, background:"var(--color-background-primary)", color:"var(--color-text-primary)", fontSize:13, cursor:"pointer", display:"inline-flex", alignItems:"center", gap:6 },
    btnP:     { padding:"7px 14px", border:"none", borderRadius:8, background:"#1D9E75", color:"#fff", fontSize:13, cursor:"pointer", display:"inline-flex", alignItems:"center", gap:6, fontWeight:500 },
    btnD:     { padding:"5px 10px", border:"none", borderRadius:6, background:"#FCEBEB", color:"#A32D2D", fontSize:12, cursor:"pointer", display:"inline-flex", alignItems:"center", gap:4 },
    table:    { width:"100%", borderCollapse:"collapse", fontSize:13 },
    th:       { textAlign:"left",  padding:"8px 10px", borderBottom:"0.5px solid var(--color-border-tertiary)", fontSize:12, color:"var(--color-text-secondary)", fontWeight:500, whiteSpace:"nowrap" },
    td:       { padding:"8px 10px", borderBottom:"0.5px solid var(--color-border-tertiary)", color:"var(--color-text-primary)", verticalAlign:"middle" },
    thR:      { textAlign:"right", padding:"8px 10px", borderBottom:"0.5px solid var(--color-border-tertiary)", fontSize:12, color:"var(--color-text-secondary)", fontWeight:500, whiteSpace:"nowrap" },
    tdR:      { padding:"8px 10px", borderBottom:"0.5px solid var(--color-border-tertiary)", color:"var(--color-text-primary)", verticalAlign:"middle", textAlign:"right" },
    alertBox: { background:"#FAEEDA", border:"0.5px solid #EF9F27", borderRadius:8, padding:"8px 12px", fontSize:13, color:"#633806", display:"flex", alignItems:"center", gap:8, marginBottom:12 },
    badge:    (c) => ({ fontSize:11, padding:"2px 8px", borderRadius:6,
                background: c==="green"?"#E1F5EE":c==="red"?"#FCEBEB":c==="amber"?"#FAEEDA":c==="blue"?"#E6F1FB":c==="teal"?"#E1F5EE":"#EEEDFE",
                color:      c==="green"?"#085041":c==="red"?"#A32D2D":c==="amber"?"#633806":c==="blue"?"#0C447C":c==="teal"?"#085041":"#3C3489" }),
    tab:      (a) => ({ padding:"8px 16px", fontSize:13, cursor:"pointer", border:"none", background:"transparent", color:a?"#085041":"var(--color-text-secondary)", fontWeight:a?500:400, borderBottom:a?"2px solid #1D9E75":"2px solid transparent", marginBottom:-1 }),
    grandRow: { background:"#E1F5EE" },
    infoBox:  { background:"var(--color-background-secondary)", border:"0.5px solid var(--color-border-tertiary)", borderRadius:8, padding:"10px 14px", fontSize:13, color:"var(--color-text-secondary)", marginBottom:14, display:"flex", alignItems:"center", gap:8 },
  };

  // ── DASHBOARD ──────────────────────────────────────────────
  function Dashboard() {
    const totalRec   = receiving.filter(r => r.date === today()).reduce((a,r) => a+Number(r.qty), 0);
    const totalDis   = dispatching.filter(d => d.date === today()).reduce((a,d) => a+Number(d.qty), 0);
    const totalValue = items.reduce((a,i) => a + getStock(i.id)*(i.rate||0), 0);
    const branchTot  = BRANCHES.map(b => ({
      name:b,
      value:dispatching.filter(d=>d.branch===b).reduce((a,d)=>a+Number(d.qty)*(getRate(d.itemId)||0),0)
    }));
    const maxB = Math.max(...branchTot.map(b=>b.value),1);

    return (
      <div>
        {alerts.length > 0 && (
          <div style={S.alertBox}>
            <i className="ti ti-alert-triangle" style={{fontSize:16}}></i>
            <span><strong>{alerts.length} item{alerts.length>1?"s":""} low on stock:</strong> {alerts.map(a=>a.name).join(", ")}</span>
          </div>
        )}
        <div style={S.grid4}>
          {[
            { label:"Total items",            val:items.length,      icon:"ti-category", color:"#534AB7" },
            { label:"Received today",         val:totalRec+" units", icon:"ti-download", color:"#1D9E75" },
            { label:"Dispatched today",       val:totalDis+" units", icon:"ti-upload",   color:"#D85A30" },
            { label:"Current inventory value",val:fmt(totalValue),   icon:"ti-coin",     color:"#BA7517" },
          ].map((m,i)=>(
            <div key={i} style={S.metric}>
              <div style={{...S.lbl,display:"flex",alignItems:"center",gap:6}}>
                <i className={`ti ${m.icon}`} style={{fontSize:14,color:m.color}}></i>{m.label}
              </div>
              <div style={{fontSize:20,fontWeight:500}}>{m.val}</div>
            </div>
          ))}
        </div>
        <div style={S.grid2}>
          <div style={S.card}>
            <p style={S.h2}>Low stock alerts</p>
            {alerts.length===0
              ?<p style={{color:"var(--color-text-secondary)",fontSize:13}}>All items adequately stocked.</p>
              :<table style={S.table}><thead><tr>
                  <th style={S.th}>Item</th><th style={S.thR}>Current</th><th style={S.thR}>Threshold</th>
                </tr></thead>
                <tbody>{alerts.map(a=>(
                  <tr key={a.id}>
                    <td style={{...S.td,fontWeight:500}}>{a.name}</td>
                    <td style={{...S.tdR,color:"#A32D2D",fontWeight:500}}>{getStock(a.id)} {a.unit}</td>
                    <td style={S.tdR}>{a.lowThreshold} {a.unit}</td>
                  </tr>
                ))}</tbody>
              </table>
            }
          </div>
          <div style={S.card}>
            <p style={S.h2}>Supply value by branch (all time)</p>
            {branchTot.map(b=>(
              <div key={b.name} style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:4}}>
                  <span>{b.name}</span><span style={{fontWeight:500}}>{fmt(b.value)}</span>
                </div>
                <div style={{height:6,background:"var(--color-background-secondary)",borderRadius:4,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${(b.value/maxB)*100}%`,background:"#1D9E75",borderRadius:4,transition:"width 0.4s"}}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={S.card}>
          <p style={S.h2}>Recent dispatches</p>
          {dispatching.length===0
            ?<p style={{color:"var(--color-text-secondary)",fontSize:13}}>No dispatches yet.</p>
            :<div style={{overflowX:"auto"}}>
              <table style={S.table}><thead><tr>
                <th style={S.th}>Date</th><th style={S.th}>Item</th><th style={S.th}>Branch</th>
                <th style={S.thR}>Qty</th><th style={S.thR}>Value</th>
              </tr></thead>
              <tbody>{[...dispatching].reverse().slice(0,8).map((d,i)=>{
                const item=items.find(x=>x.id===d.itemId);
                return <tr key={i}>
                  <td style={S.td}>{d.date}</td>
                  <td style={{...S.td,fontWeight:500}}>{item?.name||"-"}</td>
                  <td style={S.td}><span style={S.badge("teal")}>{d.branch}</span></td>
                  <td style={S.tdR}>{d.qty} {item?.unit}</td>
                  <td style={{...S.tdR,fontWeight:500}}>{fmt(Number(d.qty)*(item?.rate||0))}</td>
                </tr>;
              })}</tbody>
              </table>
            </div>
          }
        </div>
      </div>
    );
  }

  // ── ITEMS ──────────────────────────────────────────────────
  function Items() {
    const blank = { name:"", category:CATEGORIES[0], unit:UNITS[0], opening:"", lowThreshold:"", rate:"" };
    const [form, setForm]   = useState(blank);
    const [editId, setEdit] = useState(null);
    const [search, setSrch] = useState("");
    const [catF, setCatF]   = useState("All");

    const filtered = items.filter(i=>
      (catF==="All"||i.category===catF) &&
      i.name.toLowerCase().includes(search.toLowerCase())
    );

    const save = () => {
      if (!form.name.trim()) return;
      const data = { ...form, opening:Number(form.opening), lowThreshold:Number(form.lowThreshold), rate:Number(form.rate)||0 };
      if (editId) { setItems(items.map(i=>i.id===editId?{...i,...data}:i)); setEdit(null); }
      else        { setItems([...items,{...data,id:`temp_${Date.now()}`}]); }
      setForm(blank);
    };

    return (
      <div>
        <div style={S.card}>
          <p style={S.h2}>{editId?"Edit item":"Add new item"}</p>
          <div style={S.fgrid}>
            <div><div style={S.lbl}>Item name</div><input placeholder="e.g. Basmati Rice" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></div>
            <div><div style={S.lbl}>Opening stock</div><input type="number" placeholder="0" value={form.opening} onChange={e=>setForm({...form,opening:e.target.value})} /></div>
            <div><div style={S.lbl}>Rate (MYR)</div><input type="number" placeholder="0.00" value={form.rate} onChange={e=>setForm({...form,rate:e.target.value})} /></div>
            <div><div style={S.lbl}>Low stock threshold</div><input type="number" placeholder="0" value={form.lowThreshold} onChange={e=>setForm({...form,lowThreshold:e.target.value})} /></div>
            <div><div style={S.lbl}>Category</div>
              <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
                {CATEGORIES.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div><div style={S.lbl}>Unit</div>
              <select value={form.unit} onChange={e=>setForm({...form,unit:e.target.value})}>
                {UNITS.map(u=><option key={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button style={S.btnP} onClick={save}>
              <i className={`ti ${editId?"ti-check":"ti-plus"}`}></i>{editId?"Save changes":"Add item"}
            </button>
            {editId&&<button style={S.btn} onClick={()=>{setEdit(null);setForm(blank);}}>Cancel</button>}
          </div>
        </div>
        <div style={S.card}>
          <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap"}}>
            <input style={{maxWidth:220}} placeholder="Search items..." value={search} onChange={e=>setSrch(e.target.value)} />
            <select style={{maxWidth:180}} value={catF} onChange={e=>setCatF(e.target.value)}>
              <option>All</option>{CATEGORIES.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={S.table}><thead><tr>
              <th style={S.th}>Item</th><th style={S.th}>Category</th><th style={S.th}>Unit</th>
              <th style={S.thR}>Rate (MYR)</th><th style={S.thR}>Opening</th>
              <th style={S.thR}>Current stock</th><th style={S.thR}>Stock value</th>
              <th style={S.th}>Threshold</th><th style={S.th}>Status</th><th style={S.th}>Actions</th>
            </tr></thead>
            <tbody>{filtered.map(item=>{
              const curr=getStock(item.id);
              const low=curr<=item.lowThreshold;
              return <tr key={item.id}>
                <td style={{...S.td,fontWeight:500}}>{item.name}</td>
                <td style={S.td}><span style={S.badge("purple")}>{item.category}</span></td>
                <td style={S.td}>{item.unit}</td>
                <td style={{...S.tdR,fontWeight:500,color:"#0F6E56"}}>{fmt(item.rate||0)}</td>
                <td style={S.tdR}>{item.opening}</td>
                <td style={{...S.tdR,fontWeight:500,color:low?"#A32D2D":"inherit"}}>{curr}</td>
                <td style={{...S.tdR,fontWeight:500}}>{fmt(curr*(item.rate||0))}</td>
                <td style={S.td}>{item.lowThreshold}</td>
                <td style={S.td}><span style={S.badge(low?"red":"green")}>{low?"Low stock":"OK"}</span></td>
                <td style={S.td}>
                  <div style={{display:"flex",gap:6}}>
                    <button style={S.btn} onClick={()=>{setForm({name:item.name,category:item.category,unit:item.unit,opening:item.opening,lowThreshold:item.lowThreshold,rate:item.rate||""});setEdit(item.id);}}>
                      <i className="ti ti-edit"></i>
                    </button>
                    <button style={S.btnD} onClick={()=>setItems(items.filter(i=>i.id!==item.id))}>
                      <i className="ti ti-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>;
            })}</tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ── RECEIVING ──────────────────────────────────────────────
  function Receiving() {
    const blank = { date:today(), itemId:items[0]?.id||"", qty:"", rate:"", supplier:"", notes:"" };
    const [form, setForm] = useState(blank);

    const handleItemChange = (itemId) => {
      const item=items.find(i=>String(i.id)===String(itemId));
      setForm(f=>({...f,itemId,rate:item?.rate||""}));
    };

    const save = () => {
      if (!form.itemId||!form.qty||!form.rate) return;
      const newRate=Number(form.rate);
      const itemId=form.itemId;
      setReceiving([...receiving,{...form,id:Date.now(),itemId,qty:Number(form.qty),rate:newRate}]);
      if (items.find(i=>String(i.id)===String(itemId))?.rate !== newRate) {
        setItems(items.map(i=>String(i.id)===String(itemId)?{...i,rate:newRate}:i));
      }
      setForm(blank);
    };

    const totalValue=receiving.reduce((a,r)=>a+r.qty*r.rate,0);
    const selectedItem=items.find(i=>String(i.id)===String(form.itemId));

    return (
      <div>
        <div style={S.card}>
          <p style={S.h2}>Record received stock (GRN)</p>
          <div style={S.fgrid}>
            <div><div style={S.lbl}>Date</div><input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} /></div>
            <div><div style={S.lbl}>Item</div>
              <select value={form.itemId} onChange={e=>handleItemChange(e.target.value)}>
                {items.map(i=><option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
            </div>
            <div><div style={S.lbl}>Qty received</div><input type="number" placeholder="0" value={form.qty} onChange={e=>setForm({...form,qty:e.target.value})} /></div>
            <div>
              <div style={S.lbl}>
                Buying rate (MYR)
                {selectedItem&&Number(form.rate)!==selectedItem.rate&&form.rate!==""&&
                  <span style={{marginLeft:6,fontSize:11,color:"#BA7517",fontWeight:500}}>⚠ will update item rate</span>
                }
              </div>
              <input type="number" placeholder="0.00" value={form.rate} onChange={e=>setForm({...form,rate:e.target.value})} />
              {selectedItem&&<div style={{fontSize:11,color:"var(--color-text-secondary)",marginTop:3}}>Current rate: {fmt(selectedItem.rate||0)}</div>}
            </div>
            <div><div style={S.lbl}>Supplier</div>
              <select value={form.supplier} onChange={e=>setForm({...form,supplier:e.target.value})}>
                <option value="">-- Select --</option>
                {suppliers.map(s=><option key={s.id}>{s.company}</option>)}
              </select>
            </div>
            <div><div style={S.lbl}>Notes</div><input placeholder="Optional" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} /></div>
          </div>
          {form.qty&&form.rate&&
            <p style={{fontSize:13,color:"var(--color-text-secondary)",marginBottom:12}}>
              Total value: <strong style={{color:"var(--color-text-primary)"}}>{fmt(Number(form.qty)*Number(form.rate))}</strong>
            </p>
          }
          <button style={S.btnP} onClick={save}><i className="ti ti-plus"></i>Record receiving</button>
        </div>
        <div style={S.card}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <p style={{...S.h2,margin:0}}>Receiving history</p>
            <span style={{fontSize:13,color:"var(--color-text-secondary)"}}>Total: <strong style={{color:"var(--color-text-primary)"}}>{fmt(totalValue)}</strong></span>
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={S.table}><thead><tr>
              <th style={S.th}>Date</th><th style={S.th}>Item</th><th style={S.th}>Qty</th>
              <th style={S.thR}>Rate</th><th style={S.thR}>Total</th>
              <th style={S.th}>Supplier</th><th style={S.th}>Notes</th><th style={S.th}></th>
            </tr></thead>
            <tbody>{[...receiving].reverse().map((r,i)=>{
              const item=items.find(x=>x.id===r.itemId);
              return <tr key={i}>
                <td style={S.td}>{r.date}</td>
                <td style={{...S.td,fontWeight:500}}>{item?.name||"-"}</td>
                <td style={S.td}>{r.qty} {item?.unit}</td>
                <td style={S.tdR}>{fmt(r.rate)}</td>
                <td style={{...S.tdR,fontWeight:500}}>{fmt(r.qty*r.rate)}</td>
                <td style={S.td}>{r.supplier||"-"}</td>
                <td style={S.td}>{r.notes||"-"}</td>
                <td style={S.td}><button style={S.btnD} onClick={()=>setReceiving(receiving.filter(x=>x.id!==r.id))}><i className="ti ti-trash"></i></button></td>
              </tr>;
            })}</tbody>
            </table>
          </div>
          {receiving.length===0&&<p style={{color:"var(--color-text-secondary)",fontSize:13}}>No receiving records yet.</p>}
        </div>
      </div>
    );
  }

  // ── DISPATCHING ────────────────────────────────────────────
  function Dispatching() {
    const blank = { date:today(), itemId:items[0]?.id||"", branch:BRANCHES[0], qty:"", notes:"" };
    const [form, setForm] = useState(blank);

    const save = () => {
      if (!form.itemId||!form.qty) return;
      const avail=getStock(form.itemId);
      if (Number(form.qty)>avail){alert(`Only ${avail} units available.`);return;}
      setDisp([...dispatching,{...form,id:Date.now(),itemId:form.itemId,qty:Number(form.qty)}]);
      setForm(blank);
    };

    return (
      <div>
        <div style={S.card}>
          <p style={S.h2}>Dispatch stock to branch</p>
          <div style={S.fgrid}>
            <div><div style={S.lbl}>Date</div><input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} /></div>
            <div><div style={S.lbl}>Item</div>
              <select value={form.itemId} onChange={e=>setForm({...form,itemId:e.target.value})}>
                {items.map(i=><option key={i.id} value={i.id}>{i.name} (avail: {getStock(i.id)} {i.unit})</option>)}
              </select>
            </div>
            <div><div style={S.lbl}>Branch</div>
              <select value={form.branch} onChange={e=>setForm({...form,branch:e.target.value})}>
                {BRANCHES.map(b=><option key={b}>{b}</option>)}
              </select>
            </div>
            <div><div style={S.lbl}>Qty to dispatch</div><input type="number" placeholder="0" value={form.qty} onChange={e=>setForm({...form,qty:e.target.value})} /></div>
            <div><div style={S.lbl}>Notes</div><input placeholder="Optional" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} /></div>
          </div>
          {form.itemId&&form.qty&&
            <p style={{fontSize:13,color:"var(--color-text-secondary)",marginBottom:12}}>
              Value: <strong style={{color:"var(--color-text-primary)"}}>{fmt(Number(form.qty)*(getRate(form.itemId)||0))}</strong>
              <span style={{marginLeft:8}}>@ {fmt(getRate(form.itemId))} / {items.find(i=>String(i.id)===String(form.itemId))?.unit}</span>
            </p>
          }
          <button style={S.btnP} onClick={save}><i className="ti ti-upload"></i>Dispatch</button>
        </div>
        <div style={S.card}>
          <p style={S.h2}>Dispatch history</p>
          <div style={{overflowX:"auto"}}>
            <table style={S.table}><thead><tr>
              <th style={S.th}>Date</th><th style={S.th}>Item</th><th style={S.th}>Branch</th>
              <th style={S.thR}>Qty</th><th style={S.thR}>Rate</th><th style={S.thR}>Value</th>
              <th style={S.th}>Notes</th><th style={S.th}></th>
            </tr></thead>
            <tbody>{[...dispatching].reverse().map((d,i)=>{
              const item=items.find(x=>x.id===d.itemId);
              return <tr key={i}>
                <td style={S.td}>{d.date}</td>
                <td style={{...S.td,fontWeight:500}}>{item?.name||"-"}</td>
                <td style={S.td}><span style={S.badge("teal")}>{d.branch}</span></td>
                <td style={S.tdR}>{d.qty} {item?.unit}</td>
                <td style={S.tdR}>{fmt(item?.rate||0)}</td>
                <td style={{...S.tdR,fontWeight:500}}>{fmt(Number(d.qty)*(item?.rate||0))}</td>
                <td style={S.td}>{d.notes||"-"}</td>
                <td style={S.td}><button style={S.btnD} onClick={()=>setDisp(dispatching.filter(x=>x.id!==d.id))}><i className="ti ti-trash"></i></button></td>
              </tr>;
            })}</tbody>
            </table>
          </div>
          {dispatching.length===0&&<p style={{color:"var(--color-text-secondary)",fontSize:13}}>No dispatches yet.</p>}
        </div>
      </div>
    );
  }

  // ── CLOSING STOCK ──────────────────────────────────────────
  function Closing({ items, receiving, dispatching }) {
    const [tab, setTab]         = useState("daily");
    const [selDate, setSelDate] = useState(today());
    const [selMonth, setSelMonth] = useState(thisMonth());

    const lastDayOfMonth = (ym) => {
      const [y, m] = ym.split("-").map(Number);
      return new Date(y, m, 0).toISOString().split("T")[0];
    };

    const buildRows = (asOf) => (items || []).map(item => {
      const rec = (receiving || [])
        .filter(r => r.itemId === item.id && r.date <= asOf)
        .reduce((a, r) => a + Number(r.qty), 0);
      const dis = (dispatching || [])
        .filter(d => d.itemId === item.id && d.date <= asOf)
        .reduce((a, d) => a + Number(d.qty), 0);
      const closing = Number(item.opening) + rec - dis;
      return {
        id: item.id, name: item.name, category: item.category,
        unit: item.unit, rate: item.rate || 0, opening: item.opening,
        received: rec, dispatched: dis, closing,
        value: closing * (item.rate || 0),
        isLow: closing <= item.lowThreshold,
      };
    });

    const asOf      = tab === "daily" ? selDate : lastDayOfMonth(selMonth);
    const rows      = buildRows(asOf);
    const totalVal  = rows.reduce((a, r) => a + r.value, 0);
    const totalClose= rows.reduce((a, r) => a + r.closing, 0);
    const lowCount  = rows.filter(r => r.isLow).length;

    const printClosing = () => {
      const label = tab === "daily"
        ? `Daily Closing — ${selDate}`
        : `Monthly Closing — ${new Date(asOf + "T00:00:00").toLocaleDateString("en-MY", { year:"numeric", month:"long" })}`;
      const w = window.open("", "_blank");
      w.document.write(`<!DOCTYPE html><html><head><title>${label}</title>
      <style>
        body{font-family:Arial,sans-serif;padding:30px;color:#000;max-width:900px;margin:0 auto}
        h1{font-size:18px;margin-bottom:2px}.meta{font-size:13px;color:#555;margin:2px 0}
        table{width:100%;border-collapse:collapse;margin-top:16px}
        th{background:#f0f0f0;padding:8px 10px;border:1px solid #ccc;font-size:12px;text-align:left}
        th.r,td.r{text-align:right}
        td{padding:7px 10px;border:1px solid #ccc;font-size:12px}
        .low{color:#A32D2D;font-weight:600}
        .grand{background:#E1F5EE;font-weight:700}
        @media print{.no-print{display:none}}
      </style></head><body>
        <h1>Khan Jees Warehouse — ${label}</h1>
        <p class="meta">Generated: ${new Date().toLocaleString()}</p>
        <p class="meta">Stock position as of: <strong>${asOf}</strong></p>
        <table>
          <thead><tr>
            <th>#</th><th>Item</th><th>Category</th><th>Unit</th>
            <th class="r">Rate (MYR)</th><th class="r">Opening</th>
            <th class="r">Total Received</th><th class="r">Total Dispatched</th>
            <th class="r">Closing Stock</th><th class="r">Value (MYR)</th>
          </tr></thead>
          <tbody>
            ${rows.map((r, i) => `
              <tr>
                <td>${i+1}</td><td>${r.name}</td><td>${r.category}</td><td>${r.unit}</td>
                <td class="r">${Number(r.rate).toFixed(2)}</td>
                <td class="r">${r.opening}</td>
                <td class="r">${r.received}</td>
                <td class="r">${r.dispatched}</td>
                <td class="r ${r.isLow?"low":""}">${r.closing}${r.isLow?" ⚠":""}</td>
                <td class="r">${Number(r.value).toFixed(2)}</td>
              </tr>`).join("")}
            <tr class="grand">
              <td colspan="8" style="text-align:right">WAREHOUSE TOTAL</td>
              <td class="r">${totalClose}</td>
              <td class="r">MYR ${Number(totalVal).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        <button class="no-print" onclick="window.print()" style="margin-top:20px;padding:9px 20px;background:#1D9E75;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:14px">
          Print / Save as PDF
        </button>
      </body></html>`);
      w.document.close();
    };

    return (
      <div>
        <div style={S.infoBox}>
          <i className="ti ti-info-circle" style={{fontSize:16,color:"#1D9E75",flexShrink:0}}></i>
          <span>Closing stock is <strong>calculated automatically</strong> from opening stock, all receiving, and all dispatching records as of the selected date. No manual entry needed.</span>
        </div>
        <div style={S.card}>
          <div style={{display:"flex",borderBottom:"0.5px solid var(--color-border-tertiary)",marginBottom:16}}>
            <button style={S.tab(tab==="daily")} onClick={()=>setTab("daily")}>
              <i className="ti ti-calendar-day" style={{marginRight:6}}></i>Daily Closing
            </button>
            <button style={S.tab(tab==="monthly")} onClick={()=>setTab("monthly")}>
              <i className="ti ti-calendar-month" style={{marginRight:6}}></i>Monthly Closing
            </button>
          </div>
          <div style={{display:"flex",gap:12,alignItems:"flex-end",marginBottom:16,flexWrap:"wrap"}}>
            {tab==="daily" ? (
              <div>
                <div style={S.lbl}>Select date</div>
                <input type="date" value={selDate} onChange={e=>setSelDate(e.target.value)}
                  style={{padding:"7px 10px",border:"0.5px solid var(--color-border-secondary)",borderRadius:8,fontSize:13,background:"var(--color-background-primary)",color:"var(--color-text-primary)"}} />
              </div>
            ) : (
              <div>
                <div style={S.lbl}>Select month</div>
                <input type="month" value={selMonth} onChange={e=>setSelMonth(e.target.value)}
                  style={{padding:"7px 10px",border:"0.5px solid var(--color-border-secondary)",borderRadius:8,fontSize:13,background:"var(--color-background-primary)",color:"var(--color-text-primary)"}} />
              </div>
            )}
            <button style={S.btnP} onClick={printClosing}>
              <i className="ti ti-printer"></i>Print / Save as PDF
            </button>
          </div>
          <div style={{...S.grid4,marginBottom:16}}>
            {[
              { label:"Stock position as of", val:asOf,        icon:"ti-calendar",       color:"#534AB7" },
              { label:"Total items tracked",  val:rows.length, icon:"ti-packages",       color:"#1D9E75" },
              { label:"Low stock items",      val:lowCount,    icon:"ti-alert-triangle", color:lowCount>0?"#D85A30":"#1D9E75" },
              { label:"Total warehouse value",val:fmt(totalVal),icon:"ti-coin",          color:"#BA7517" },
            ].map((m,i)=>(
              <div key={i} style={S.metric}>
                <div style={{...S.lbl,display:"flex",alignItems:"center",gap:6}}>
                  <i className={`ti ${m.icon}`} style={{fontSize:14,color:m.color}}></i>{m.label}
                </div>
                <div style={{fontSize:16,fontWeight:500}}>{m.val}</div>
              </div>
            ))}
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={S.table}>
              <thead><tr>
                <th style={S.th}>#</th><th style={S.th}>Item</th><th style={S.th}>Category</th>
                <th style={S.th}>Unit</th><th style={S.thR}>Rate (MYR)</th><th style={S.thR}>Opening</th>
                <th style={S.thR}>Total Received</th><th style={S.thR}>Total Dispatched</th>
                <th style={S.thR}>Closing Stock</th><th style={S.thR}>Value (MYR)</th>
              </tr></thead>
              <tbody>
                {rows.map((r,i)=>(
                  <tr key={r.id} style={{background:r.isLow?"#FFF8F8":"inherit"}}>
                    <td style={{...S.td,color:"var(--color-text-secondary)"}}>{i+1}</td>
                    <td style={{...S.td,fontWeight:500}}>{r.name}</td>
                    <td style={S.td}><span style={S.badge("purple")}>{r.category}</span></td>
                    <td style={S.td}>{r.unit}</td>
                    <td style={{...S.tdR,color:"#0F6E56",fontWeight:500}}>{fmt(r.rate)}</td>
                    <td style={S.tdR}>{r.opening}</td>
                    <td style={{...S.tdR,color:r.received>0?"#0F6E56":"var(--color-text-secondary)"}}>{r.received}</td>
                    <td style={{...S.tdR,color:r.dispatched>0?"#D85A30":"var(--color-text-secondary)"}}>{r.dispatched}</td>
                    <td style={{...S.tdR,fontWeight:700,color:r.isLow?"#A32D2D":"var(--color-text-primary)"}}>
                      {r.closing}
                      {r.isLow&&<span style={{marginLeft:6,fontSize:11,...S.badge("red")}}>Low</span>}
                    </td>
                    <td style={{...S.tdR,fontWeight:500}}>{fmt(r.value)}</td>
                  </tr>
                ))}
                <tr style={S.grandRow}>
                  <td colSpan={8} style={{...S.tdR,fontWeight:700,color:"#085041",padding:"10px"}}>WAREHOUSE TOTAL</td>
                  <td style={{...S.tdR,fontWeight:700,fontSize:14,color:"#085041"}}>{totalClose} units</td>
                  <td style={{...S.tdR,fontWeight:700,fontSize:14,color:"#085041"}}>{fmt(totalVal)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ── SUPPLIERS ──────────────────────────────────────────────
  function Suppliers() {
    const blank={company:"",contact:"",phone:""};
    const [form,setForm]=useState(blank);
    const [editId,setEdit]=useState(null);
    const [activeSupId,setActive]=useState(null);

    useEffect(()=>{
      if(suppliers.length>0 && !activeSupId) setActive(String(suppliers[0].id));
    },[suppliers]);
    const [catForm,setCatForm]=useState({name:"",unit:UNITS[0]});
    const activeSup=suppliers.find(s=>String(s.id)===String(activeSupId));
    const saveSupplier=()=>{
      if(!form.company.trim())return;
      if(editId){setSuppliers(suppliers.map(s=>s.id===editId?{...s,...form}:s));setEdit(null);}
      else{const ns={...form,id:Date.now(),catalogueItems:[]};setSuppliers([...suppliers,ns]);setActive(ns.id);}
      setForm(blank);
    };

    const addCat=()=>{
      if(!catForm.name.trim()||!activeSupId)return;
      setSuppliers(suppliers.map(s=>s.id===activeSupId?{...s,catalogueItems:[...(s.catalogueItems||[]),{id:Date.now(),name:catForm.name,unit:catForm.unit}]}:s));
      setCatForm({name:"",unit:UNITS[0]});
    };

    const removeCat=(supId,catId)=>{
      setSuppliers(suppliers.map(s=>s.id===supId?{...s,catalogueItems:s.catalogueItems.filter(c=>c.id!==catId)}:s));
    };

    return (
      <div>
        <div style={S.card}>
          <p style={S.h2}>{editId?"Edit supplier":"Add supplier / vendor"}</p>
          <div style={S.fgrid}>
            {[["Company name","company"],["Contact person","contact"],["Phone / WhatsApp","phone"]].map(([lbl,key])=>(
              <div key={key}><div style={S.lbl}>{lbl}</div><input placeholder={lbl} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} /></div>
            ))}
          </div>
          <div style={{display:"flex",gap:8}}>
            <button style={S.btnP} onClick={saveSupplier}><i className={`ti ${editId?"ti-check":"ti-plus"}`}></i>{editId?"Save changes":"Add supplier"}</button>
            {editId&&<button style={S.btn} onClick={()=>{setEdit(null);setForm(blank);}}>Cancel</button>}
          </div>
        </div>
        <div style={S.grid2}>
          {suppliers.map(sup=>(
            <div key={sup.id} style={{...S.card,border:activeSupId===sup.id?"1.5px solid #1D9E75":"0.5px solid var(--color-border-tertiary)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div style={{display:"flex",gap:10,alignItems:"center",cursor:"pointer"}} onClick={()=>setActive(String(sup.id))}>
                  <div style={{width:36,height:36,borderRadius:8,background:"#E1F5EE",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <i className="ti ti-truck" style={{fontSize:18,color:"#0F6E56"}}></i>
                  </div>
                  <div>
                    <p style={{fontSize:14,fontWeight:500,margin:0}}>{sup.company}</p>
                    <p style={{fontSize:12,color:"var(--color-text-secondary)",margin:0}}>{sup.contact}</p>
                  </div>
                </div>
                <div style={{display:"flex",gap:6}}>
                  <button style={S.btn} onClick={()=>{setForm({company:sup.company,contact:sup.contact,phone:sup.phone});setEdit(sup.id);}}><i className="ti ti-edit"></i></button>
                  <button style={S.btnD} onClick={()=>setSuppliers(suppliers.filter(x=>x.id!==sup.id))}><i className="ti ti-trash"></i></button>
                </div>
              </div>
              <p style={{fontSize:13,margin:"0 0 6px"}}><i className="ti ti-phone" style={{fontSize:13,marginRight:4,color:"var(--color-text-secondary)"}}></i>{sup.phone}</p>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span style={{fontSize:12,color:"var(--color-text-secondary)"}}>{(sup.catalogueItems||[]).length} catalogue items</span>
                <button style={{...S.btn,fontSize:12,padding:"4px 10px"}} onClick={()=>setActive(String(sup.id))}><i className="ti ti-list"></i> Manage items</button>
              </div>
            </div>
          ))}
        </div>
        {activeSup&&(
          <div style={S.card}>
            <p style={{...S.h2,marginBottom:12}}><i className="ti ti-list" style={{marginRight:6,color:"#1D9E75"}}></i>Item catalogue — {activeSup.company}</p>
            <div style={{display:"flex",gap:8,marginBottom:14,alignItems:"flex-end",flexWrap:"wrap"}}>
              <div style={{flex:2,minWidth:140}}><div style={S.lbl}>Item name</div><input placeholder="e.g. Basmati Rice" value={catForm.name} onChange={e=>setCatForm({...catForm,name:e.target.value})} onKeyDown={e=>e.key==="Enter"&&addCat()} /></div>
              <div style={{flex:1,minWidth:100}}><div style={S.lbl}>Unit</div><select value={catForm.unit} onChange={e=>setCatForm({...catForm,unit:e.target.value})}>{UNITS.map(u=><option key={u}>{u}</option>)}</select></div>
              <button style={S.btnP} onClick={addCat}><i className="ti ti-plus"></i>Add to catalogue</button>
            </div>
            {(activeSup.catalogueItems||[]).length===0
              ?<p style={{color:"var(--color-text-secondary)",fontSize:13}}>No items yet. Add above — they appear as a checklist in Daily Demand.</p>
              :<table style={S.table}><thead><tr><th style={S.th}>#</th><th style={S.th}>Item name</th><th style={S.th}>Unit</th><th style={S.th}></th></tr></thead>
                <tbody>{(activeSup.catalogueItems||[]).map((ci,i)=>(
                  <tr key={ci.id}>
                    <td style={{...S.td,color:"var(--color-text-secondary)"}}>{i+1}</td>
                    <td style={{...S.td,fontWeight:500}}>{ci.name}</td>
                    <td style={S.td}>{ci.unit}</td>
                    <td style={S.td}><button style={S.btnD} onClick={()=>removeCat(activeSup.id,ci.id)}><i className="ti ti-trash"></i></button></td>
                  </tr>
                ))}</tbody>
              </table>
            }
          </div>
        )}
      </div>
    );
  }

  // ── DAILY DEMAND ───────────────────────────────────────────
function Demand() {
    const [supplierId,setSupplierId]=useState("");
    const [date,setDate]=useState(today());
    const [notes,setNotes]=useState("");
    const [checklist,setChecklist]=useState({});
    const [extras,setExtras]=useState([{itemName:"",qty:"",unit:UNITS[0]}]);
    const [lastSaved,setLast]=useState(null);

    // sync supplierId once suppliers load from Supabase
    useEffect(()=>{
      if(suppliers.length>0 && !supplierId){
        setSupplierId(String(suppliers[0].id));
      }
    },[suppliers]);

    // match by string comparison since Supabase IDs are UUIDs (strings)
    const activeSup=suppliers.find(s=>String(s.id)===String(supplierId));
    const catalogue=activeSup?.catalogueItems||[];

    useEffect(()=>{
      if(!supplierId) return;
      const init={};
      catalogue.forEach(ci=>{init[ci.id]={checked:false,qty:""};});
      setChecklist(init);
    },[supplierId, suppliers]);

    const toggle=(id)=>setChecklist(p=>({...p,[id]:{...p[id],checked:!p[id]?.checked}}));
    const setQty=(id,v)=>setChecklist(p=>({...p,[id]:{...p[id],qty:v}}));
    const allChecked = catalogue.length>0 && catalogue.every(ci=>checklist[ci.id]?.checked);
    const toggleAll=()=>{
      setChecklist(p=>{
        const next={...p};
        catalogue.forEach(ci=>{ next[ci.id]={...next[ci.id], checked: !allChecked}; });
        return next;
      });
    };
    const addEx=()=>setExtras([...extras,{itemName:"",qty:"",unit:UNITS[0]}]);
    const updEx=(i,k,v)=>setExtras(extras.map((e,idx)=>idx===i?{...e,[k]:v}:e));
    const remEx=(i)=>setExtras(extras.filter((_,idx)=>idx!==i));

    const saveDemand=()=>{
      if(!activeSup)return;
      const catLines=catalogue.filter(ci=>checklist[ci.id]?.checked).map(ci=>({itemName:ci.name,qty:checklist[ci.id]?.qty||"",unit:ci.unit}));
      const extraLines=extras.filter(e=>e.itemName.trim());
      const allLines=[...catLines,...extraLines];
      if(allLines.length===0){alert("Please select at least one item.");return;}
     const entry={id:Date.now(),date,supplierId:String(activeSup.id),supplier:activeSup.company,phone:activeSup.phone,notes,lines:allLines,createdAt:new Date().toLocaleString()};
      setDemands([...demands,entry]);
      setLast(entry);
    };

    const printDemand=(d)=>{
      const w=window.open("","_blank");
      w.document.write(`<!DOCTYPE html><html><head><title>Daily Demand — ${d.date}</title>
      <style>body{font-family:Arial,sans-serif;padding:30px;color:#000;max-width:700px;margin:0 auto}
      h1{font-size:20px;margin-bottom:2px}.meta{font-size:13px;color:#555;margin:2px 0}
      table{width:100%;border-collapse:collapse;margin-top:20px}
      th{background:#f0f0f0;padding:9px 12px;border:1px solid #ccc;font-size:13px;text-align:left}
      td{padding:8px 12px;border:1px solid #ccc;font-size:13px}
      .sigs{margin-top:50px;display:flex;justify-content:space-between}
      .sig{text-align:center;width:180px}.sig-line{border-top:1px solid #000;margin-bottom:6px}
      @media print{.no-print{display:none}}</style></head><body>
      <h1>Daily Demand Order</h1><p class="meta"><strong>Restaurant Khan Jees</strong></p>
      <p class="meta">Date: ${d.date}</p><p class="meta">Supplier: ${d.supplier}</p>
      <p class="meta">Phone: ${d.phone}</p>${d.notes?`<p class="meta">Notes: ${d.notes}</p>`:""}
      <table><thead><tr><th>#</th><th>Item</th><th>Qty</th><th>Unit</th><th>Remarks</th></tr></thead>
      <tbody>${d.lines.map((l,i)=>`<tr><td>${i+1}</td><td>${l.itemName}</td><td>${l.qty}</td><td>${l.unit}</td><td></td></tr>`).join("")}</tbody></table>
      <div class="sigs"><div class="sig"><div class="sig-line"></div>Prepared by</div><div class="sig"><div class="sig-line"></div>Approved by</div><div class="sig"><div class="sig-line"></div>Supplier signature</div></div>
      <button class="no-print" onclick="window.print()" style="margin-top:20px;padding:9px 20px;background:#1D9E75;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:14px">Print / Save as PDF</button>
      </body></html>`);
      w.document.close();
    };

    return (
      <div>
        <div style={S.card}>
          <p style={S.h2}>Create daily demand / purchase order</p>
          <div style={S.fgrid}>
            <div><div style={S.lbl}>Date</div><input type="date" value={date} onChange={e=>setDate(e.target.value)} /></div>
            <div><div style={S.lbl}>Supplier</div>
              <select value={supplierId} onChange={e=>setSupplierId(e.target.value)}>
                {suppliers.map(s=><option key={s.id} value={String(s.id)}>{s.company}</option>)}
              </select>
            </div>
            <div><div style={S.lbl}>Notes</div><input placeholder="Optional" value={notes} onChange={e=>setNotes(e.target.value)} /></div>
          </div>
          {catalogue.length>0&&(
            <div style={{marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",margin:"0 0 10px"}}>
                <p style={{fontSize:13,fontWeight:500,margin:0}}>
                  <i className="ti ti-list-check" style={{marginRight:6,color:"#1D9E75"}}></i>
                  {activeSup?.company} catalogue — tick items needed today
                </p>
                <button type="button" onClick={toggleAll} style={{...S.btn,padding:"5px 12px",fontSize:12}}>
                  <i className={allChecked?"ti ti-square-off":"ti ti-checks"}></i>{allChecked?"Unselect all":"Select all"}
                </button>
              </div>
              <div style={{border:"0.5px solid var(--color-border-tertiary)",borderRadius:8,overflow:"hidden"}}>
                {catalogue.map((ci,idx)=>{
                  const checked=checklist[ci.id]?.checked||false;
                  const qty=checklist[ci.id]?.qty||"";
                  return (
                    <div key={ci.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",borderBottom:idx<catalogue.length-1?"0.5px solid var(--color-border-tertiary)":"none",background:checked?"#F0FBF7":"var(--color-background-primary)",transition:"background 0.15s"}}>
                      <input type="checkbox" checked={checked} onChange={()=>toggle(ci.id)} style={{width:16,height:16,cursor:"pointer",accentColor:"#1D9E75",flexShrink:0}} />
                      <span style={{flex:2,fontSize:13,fontWeight:checked?500:400,color:checked?"var(--color-text-primary)":"var(--color-text-secondary)"}}>{ci.name}</span>
                      <span style={{...S.badge("blue"),flexShrink:0}}>{ci.unit}</span>
                      <div style={{width:100,flexShrink:0}}>
                        <input type="number" placeholder="Qty" disabled={!checked} value={qty} onChange={e=>setQty(ci.id,e.target.value)}
                          style={{width:"100%",padding:"5px 8px",border:"0.5px solid var(--color-border-secondary)",borderRadius:6,fontSize:13,background:checked?"var(--color-background-primary)":"var(--color-background-secondary)",color:checked?"var(--color-text-primary)":"var(--color-text-secondary)",opacity:checked?1:0.5}} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <p style={{fontSize:12,color:"var(--color-text-secondary)",marginTop:6}}>{Object.values(checklist).filter(v=>v.checked).length} of {catalogue.length} items selected</p>
            </div>
          )}
          {catalogue.length===0&&(
            <div style={{...S.alertBox,marginBottom:14}}>
              <i className="ti ti-info-circle" style={{fontSize:15}}></i>
              <span>No catalogue items for this supplier. Go to <strong>Suppliers → Manage items</strong> to add them.</span>
            </div>
          )}
          <p style={{fontSize:13,fontWeight:500,margin:"0 0 8px"}}><i className="ti ti-plus" style={{marginRight:4,color:"#1D9E75"}}></i>Additional items</p>
          {extras.map((ex,i)=>(
            <div key={i} style={{display:"flex",gap:8,marginBottom:8,alignItems:"center"}}>
              <div style={{flex:2}}><input placeholder="Item name" value={ex.itemName} onChange={e=>updEx(i,"itemName",e.target.value)} /></div>
              <div style={{flex:1}}><input type="number" placeholder="Qty" value={ex.qty} onChange={e=>updEx(i,"qty",e.target.value)} /></div>
              <div style={{flex:1}}><select value={ex.unit} onChange={e=>updEx(i,"unit",e.target.value)}>{UNITS.map(u=><option key={u}>{u}</option>)}</select></div>
              {extras.length>1&&<button style={S.btnD} onClick={()=>remEx(i)}><i className="ti ti-x"></i></button>}
            </div>
          ))}
          <div style={{display:"flex",gap:8,marginTop:12}}>
            <button style={S.btn} onClick={addEx}><i className="ti ti-plus"></i>Add row</button>
            <button style={S.btnP} onClick={saveDemand}><i className="ti ti-check"></i>Save order</button>
            {lastSaved&&<button style={S.btn} onClick={()=>printDemand(lastSaved)}><i className="ti ti-printer"></i>Print last saved</button>}
          </div>
        </div>
        <div style={S.card}>
          <p style={S.h2}>Saved demand orders</p>
          {demands.length===0&&<p style={{color:"var(--color-text-secondary)",fontSize:13}}>No demand orders yet.</p>}
          {[...demands].reverse().map((d,i)=>(
            <div key={i} style={{borderBottom:"0.5px solid var(--color-border-tertiary)",padding:"10px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <p style={{margin:0,fontWeight:500,fontSize:13}}>{d.date} — {d.supplier}</p>
                <p style={{margin:0,fontSize:12,color:"var(--color-text-secondary)"}}>{d.lines.length} items · {d.createdAt}</p>
              </div>
              <div style={{display:"flex",gap:6}}>
                <button style={S.btn} onClick={()=>printDemand(d)}><i className="ti ti-printer"></i>Print / PDF</button>
                <button style={S.btnD} onClick={()=>setDemands(demands.filter(x=>x.id!==d.id))}><i className="ti ti-trash"></i></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── REPORTS ────────────────────────────────────────────────
  function Reports() {
    const [type,setType]=useState("branch");
    const [period,setPeriod]=useState("daily");
    const [branch,setBranch]=useState("All");
    const [fromD,setFromD]=useState(today());
    const [toD,setToD]=useState(today());

    const getRange=()=>{
      const now=new Date();
      if(period==="daily")  return{from:today(),to:today()};
      if(period==="weekly") {const d=new Date(now);d.setDate(d.getDate()-6);return{from:d.toISOString().split("T")[0],to:today()};}
      if(period==="monthly"){const d=new Date(now.getFullYear(),now.getMonth(),1);return{from:d.toISOString().split("T")[0],to:today()};}
      return{from:fromD,to:toD};
    };
    const inRange=(date)=>{const r=getRange();return date>=r.from&&date<=r.to;};
    const filteredDis=dispatching.filter(d=>inRange(d.date)&&(branch==="All"||d.branch===branch));

    const buildBranchReport=()=>{
      const result={};
      BRANCHES.forEach(b=>{result[b]=[];});
      filteredDis.forEach(d=>{
        const item=items.find(x=>x.id===d.itemId);
        if(!item)return;
        const existing=result[d.branch].find(r=>r.itemId===d.itemId);
        if(existing){existing.qty+=Number(d.qty);existing.value=existing.qty*existing.rate;}
        else result[d.branch].push({itemId:d.itemId,itemName:item.name,unit:item.unit,qty:Number(d.qty),rate:item.rate||0,value:Number(d.qty)*(item.rate||0)});
      });
      return result;
    };

    const buildStockReport=()=>items.map(item=>{
      const rec=receiving.filter(r=>inRange(r.date)&&r.itemId===item.id).reduce((a,r)=>a+r.qty,0);
      const recVal=receiving.filter(r=>inRange(r.date)&&r.itemId===item.id).reduce((a,r)=>a+r.qty*r.rate,0);
      const dis=dispatching.filter(d=>inRange(d.date)&&d.itemId===item.id).reduce((a,d)=>a+d.qty,0);
      return{...item,rec,dis,closing:item.opening+rec-dis,value:recVal};
    });

    const branchData=buildBranchReport();
    const stockRows=buildStockReport();
    const branchGrandTotals=BRANCHES.map(b=>({branch:b,totalValue:(branchData[b]||[]).reduce((a,r)=>a+r.value,0),itemCount:(branchData[b]||[]).length}));

    const printReport=()=>{
      const r=getRange();
      const w=window.open("","_blank");
      let bodyHtml="";
      if(type==="branch"){
        const branchesToShow=branch==="All"?BRANCHES:[branch];
        branchesToShow.forEach(b=>{
          const rows=branchData[b]||[];
          const bTotal=rows.reduce((a,r)=>a+r.value,0);
          bodyHtml+=`<h2 style="font-size:15px;margin:24px 0 6px;color:#085041;border-bottom:2px solid #1D9E75;padding-bottom:4px">${b}</h2>
          ${rows.length===0?`<p style="font-size:13px;color:#888">No dispatches in this period.</p>`:`
          <table><thead><tr><th>#</th><th>Item</th><th>Unit</th><th style="text-align:right">Qty</th><th style="text-align:right">Rate (MYR)</th><th style="text-align:right">Value (MYR)</th></tr></thead>
          <tbody>${rows.map((row,i)=>`<tr><td>${i+1}</td><td>${row.itemName}</td><td>${row.unit}</td><td style="text-align:right">${row.qty}</td><td style="text-align:right">${Number(row.rate).toFixed(2)}</td><td style="text-align:right">${Number(row.value).toFixed(2)}</td></tr>`).join("")}
          <tr style="background:#f5f5f5;font-weight:600"><td colspan="5" style="text-align:right">Branch Total</td><td style="text-align:right">MYR ${Number(bTotal).toFixed(2)}</td></tr>
          </tbody></table>`}`;
        });
        if(branch==="All"){
          const gTotal=branchGrandTotals.reduce((a,b2)=>a+b2.totalValue,0);
          bodyHtml+=`<h2 style="font-size:15px;margin:30px 0 6px;border-bottom:2px solid #333;padding-bottom:4px">Grand Summary — All Branches</h2>
          <table><thead><tr><th>Branch</th><th style="text-align:right">Items Supplied</th><th style="text-align:right">Total Value (MYR)</th></tr></thead>
          <tbody>${branchGrandTotals.map(b2=>`<tr><td>${b2.branch}</td><td style="text-align:right">${b2.itemCount}</td><td style="text-align:right">${Number(b2.totalValue).toFixed(2)}</td></tr>`).join("")}
          <tr style="background:#E1F5EE;font-weight:700"><td>GRAND TOTAL</td><td></td><td style="text-align:right">MYR ${Number(gTotal).toFixed(2)}</td></tr>
          </tbody></table>`;
        }
      } else {
        const gTotal=stockRows.reduce((a,r)=>a+r.value,0);
        bodyHtml=`<table><thead><tr><th>Item</th><th>Category</th><th>Unit</th><th style="text-align:right">Rate</th><th style="text-align:right">Opening</th><th style="text-align:right">Received</th><th style="text-align:right">Dispatched</th><th style="text-align:right">Closing</th><th style="text-align:right">Value (MYR)</th></tr></thead>
        <tbody>${stockRows.map(r=>`<tr><td>${r.name}</td><td>${r.category}</td><td>${r.unit}</td><td style="text-align:right">${Number(r.rate||0).toFixed(2)}</td><td style="text-align:right">${r.opening}</td><td style="text-align:right">${r.rec}</td><td style="text-align:right">${r.dis}</td><td style="text-align:right">${r.closing}</td><td style="text-align:right">${Number(r.value).toFixed(2)}</td></tr>`).join("")}
        <tr style="background:#E1F5EE;font-weight:700"><td colspan="8" style="text-align:right">GRAND TOTAL VALUE</td><td style="text-align:right">MYR ${Number(gTotal).toFixed(2)}</td></tr>
        </tbody></table>`;
      }
      w.document.write(`<!DOCTYPE html><html><head><title>Khan Jees Report</title>
      <style>body{font-family:Arial,sans-serif;padding:30px;color:#000}h1{font-size:18px;margin-bottom:4px}.meta{font-size:13px;margin:2px 0;color:#555}
      table{width:100%;border-collapse:collapse;margin-top:10px;margin-bottom:6px}th{background:#f0f0f0;padding:8px 10px;border:1px solid #ccc;font-size:12px}td{padding:7px 10px;border:1px solid #ccc;font-size:12px}
      @media print{.no-print{display:none}}</style></head><body>
      <h1>Khan Jees — ${type==="branch"?"Branch Supply Report":"Stock Valuation Report"}</h1>
      <p class="meta">Period: ${period.charAt(0).toUpperCase()+period.slice(1)} (${r.from} to ${r.to})</p>
      ${type==="branch"?`<p class="meta">Branch filter: ${branch}</p>`:""}
      <p class="meta">Generated: ${new Date().toLocaleString()}</p>
      ${bodyHtml}
      <button class="no-print" onclick="window.print()" style="margin-top:20px;padding:9px 20px;background:#1D9E75;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:14px">Print / Save as PDF</button>
      </body></html>`);
      w.document.close();
    };

    const branchesToShow=branch==="All"?BRANCHES:[branch];

    return (
      <div>
        <div style={S.card}>
          <p style={S.h2}>Report filters</p>
          <div style={S.fgrid}>
            <div><div style={S.lbl}>Report type</div>
              <select value={type} onChange={e=>setType(e.target.value)}>
                <option value="branch">Branch supply report</option>
                <option value="stock">Stock valuation report</option>
              </select>
            </div>
            <div><div style={S.lbl}>Period</div>
              <select value={period} onChange={e=>setPeriod(e.target.value)}>
                <option value="daily">Daily (today)</option>
                <option value="weekly">Weekly (last 7 days)</option>
                <option value="monthly">Monthly (this month)</option>
                <option value="custom">Custom range</option>
              </select>
            </div>
            {type==="branch"&&<div><div style={S.lbl}>Branch</div>
              <select value={branch} onChange={e=>setBranch(e.target.value)}>
                <option>All</option>{BRANCHES.map(b=><option key={b}>{b}</option>)}
              </select>
            </div>}
            {period==="custom"&&<>
              <div><div style={S.lbl}>From</div><input type="date" value={fromD} onChange={e=>setFromD(e.target.value)} /></div>
              <div><div style={S.lbl}>To</div><input type="date" value={toD} onChange={e=>setToD(e.target.value)} /></div>
            </>}
          </div>
          <button style={S.btnP} onClick={printReport}><i className="ti ti-printer"></i>Print / Save as PDF</button>
        </div>
        {type==="branch"?(
          <>
            {branchesToShow.map(b=>{
              const rows=branchData[b]||[];
              const bTotal=rows.reduce((a,r)=>a+r.value,0);
              return (
                <div key={b} style={S.card}>
                  <p style={{...S.h2,color:"#085041",borderBottom:"2px solid #1D9E75",paddingBottom:8}}>
                    <i className="ti ti-building-store" style={{marginRight:6}}></i>{b}
                  </p>
                  {rows.length===0
                    ?<p style={{color:"var(--color-text-secondary)",fontSize:13}}>No dispatches in this period.</p>
                    :<div style={{overflowX:"auto"}}>
                      <table style={S.table}><thead><tr>
                        <th style={S.th}>#</th><th style={S.th}>Item</th><th style={S.th}>Unit</th>
                        <th style={S.thR}>Qty</th><th style={S.thR}>Rate (MYR)</th><th style={S.thR}>Value (MYR)</th>
                      </tr></thead>
                      <tbody>
                        {rows.map((row,i)=>(
                          <tr key={i}>
                            <td style={{...S.td,color:"var(--color-text-secondary)"}}>{i+1}</td>
                            <td style={{...S.td,fontWeight:500}}>{row.itemName}</td>
                            <td style={S.td}>{row.unit}</td>
                            <td style={S.tdR}>{row.qty}</td>
                            <td style={S.tdR}>{fmt(row.rate)}</td>
                            <td style={{...S.tdR,fontWeight:500}}>{fmt(row.value)}</td>
                          </tr>
                        ))}
                        <tr style={{background:"var(--color-background-secondary)",fontWeight:600}}>
                          <td colSpan={5} style={{...S.tdR,fontWeight:600}}>Branch Total</td>
                          <td style={{...S.tdR,fontWeight:700,color:"#085041",fontSize:14}}>{fmt(bTotal)}</td>
                        </tr>
                      </tbody>
                      </table>
                    </div>
                  }
                </div>
              );
            })}
            {branch==="All"&&(
              <div style={S.card}>
                <p style={S.h2}><i className="ti ti-sigma" style={{marginRight:6,color:"#1D9E75"}}></i>Grand summary — all branches</p>
                <div style={{overflowX:"auto"}}>
                  <table style={S.table}><thead><tr>
                    <th style={S.th}>Branch</th><th style={S.thR}>Items supplied</th><th style={S.thR}>Total value (MYR)</th>
                  </tr></thead>
                  <tbody>
                    {branchGrandTotals.map((b2,i)=>(
                      <tr key={i}>
                        <td style={{...S.td,fontWeight:500}}><span style={S.badge("teal")}>{b2.branch}</span></td>
                        <td style={S.tdR}>{b2.itemCount} items</td>
                        <td style={{...S.tdR,fontWeight:600}}>{fmt(b2.totalValue)}</td>
                      </tr>
                    ))}
                    <tr style={S.grandRow}>
                      <td style={{...S.td,fontWeight:700,color:"#085041"}}>GRAND TOTAL</td>
                      <td style={S.tdR}></td>
                      <td style={{...S.tdR,fontWeight:700,fontSize:15,color:"#085041"}}>{fmt(branchGrandTotals.reduce((a,b2)=>a+b2.totalValue,0))}</td>
                    </tr>
                  </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ):(
          <div style={S.card}>
            <p style={S.h2}>Stock valuation report — {period}</p>
            <div style={{overflowX:"auto"}}>
              <table style={S.table}><thead><tr>
                <th style={S.th}>Item</th><th style={S.th}>Category</th><th style={S.th}>Unit</th>
                <th style={S.thR}>Rate</th><th style={S.thR}>Opening</th>
                <th style={S.thR}>Received</th><th style={S.thR}>Dispatched</th>
                <th style={S.thR}>Closing</th><th style={S.thR}>Value (MYR)</th>
              </tr></thead>
              <tbody>
                {stockRows.map((r,i)=>(
                  <tr key={i}>
                    <td style={{...S.td,fontWeight:500}}>{r.name}</td>
                    <td style={S.td}><span style={S.badge("purple")}>{r.category}</span></td>
                    <td style={S.td}>{r.unit}</td>
                    <td style={{...S.tdR,color:"#0F6E56",fontWeight:500}}>{fmt(r.rate||0)}</td>
                    <td style={S.tdR}>{r.opening}</td>
                    <td style={{...S.tdR,color:r.rec>0?"#0F6E56":"inherit"}}>{r.rec}</td>
                    <td style={{...S.tdR,color:r.dis>0?"#D85A30":"inherit"}}>{r.dis}</td>
                    <td style={{...S.tdR,fontWeight:500}}>{r.closing}</td>
                    <td style={{...S.tdR,fontWeight:500}}>{fmt(r.value)}</td>
                  </tr>
                ))}
                <tr style={S.grandRow}>
                  <td colSpan={8} style={{...S.tdR,fontWeight:700,color:"#085041"}}>GRAND TOTAL VALUE</td>
                  <td style={{...S.tdR,fontWeight:700,fontSize:15,color:"#085041"}}>{fmt(stockRows.reduce((a,r)=>a+r.value,0))}</td>
                </tr>
              </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── SHELL ──────────────────────────────────────────────────
  const pageMap = {
    dashboard:   <Dashboard />,
    items:       <Items />,
    receiving:   <Receiving />,
    dispatching: <Dispatching />,
    closing:     <Closing items={items} receiving={receiving} dispatching={dispatching} />,
    suppliers:   <Suppliers />,
    demand:      <Demand />,
    reports:     <Reports />,
  };

  return (
    <div style={S.app}>
      <aside style={S.sidebar}>
       <div style={S.logo}>
          {/* Show logo image when sidebar is open, icon when collapsed */}
          {sideOpen ? (
            <img
              src="/logo.jpeg"
              alt="Khan Jee"
              style={{
                height: 36,
                width: "auto",
                objectFit: "contain",
                maxWidth: 160,
              }}
            />
          ) : (
            <div style={S.logoIcon}>
              <i className="ti ti-building-store" style={{color:"#fff",fontSize:16}}></i>
            </div>
          )}
        </div>
        <nav style={{flex:1,padding:"8px 0",overflowY:"auto"}}>
          {NAV.map(n=>(
            <div key={n.id} style={S.navItem(page===n.id)} onClick={()=>setPage(n.id)}>
              <i className={`ti ${n.icon}`} style={{fontSize:16,flexShrink:0}}></i>
              {sideOpen&&<span>{n.label}</span>}
              {sideOpen&&n.id==="items"&&alerts.length>0&&
                <span style={{marginLeft:"auto",background:"#E24B4A",color:"#fff",fontSize:10,borderRadius:10,padding:"1px 6px"}}>{alerts.length}</span>
              }
            </div>
          ))}
        </nav>
        <div style={{padding:"10px 6px",borderTop:"0.5px solid var(--color-border-tertiary)"}}>
          {/* User info + sign out */}
          {sideOpen && (
            <div style={{padding:"8px 8px 6px",marginBottom:4}}>
              <p style={{margin:0,fontSize:12,color:"var(--color-text-secondary)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                {profile?.full_name || session.user.email}
              </p>
              {isAdmin && <span style={{fontSize:10,color:"#f59e0b",fontWeight:500}}>[Admin]</span>}
            </div>
          )}
          <div style={{...S.navItem(false),justifyContent:sideOpen?"flex-start":"center",color:"#A32D2D"}} onClick={handleSignOut}>
            <i className="ti ti-logout" style={{fontSize:16}}></i>
            {sideOpen&&<span>Sign out</span>}
          </div>
          <div style={{...S.navItem(false),justifyContent:sideOpen?"flex-start":"center"}} onClick={()=>setSideOpen(!sideOpen)}>
            <i className={`ti ${sideOpen?"ti-chevron-left":"ti-chevron-right"}`} style={{fontSize:16}}></i>
            {sideOpen&&<span>Collapse</span>}
          </div>
        </div>
      </aside>
      <main style={S.main}>
        <header style={S.topbar}>
          <div>
            <p style={{margin:0,fontSize:15,fontWeight:500}}>{NAV.find(n=>n.id===page)?.label}</p>
            <p style={{margin:0,fontSize:12,color:"var(--color-text-secondary)"}}>
              Khan Jees Warehouse · {new Date().toLocaleDateString("en-MY",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}
            </p>
          </div>
          {alerts.length>0&&
            <div style={{background:"#FAEEDA",border:"0.5px solid #EF9F27",borderRadius:8,padding:"6px 12px",fontSize:12,color:"#633806",cursor:"pointer"}} onClick={()=>setPage("items")}>
              <i className="ti ti-alert-triangle" style={{fontSize:13,marginRight:4}}></i>
              {alerts.length} low stock alert{alerts.length>1?"s":""}
            </div>
          }
        </header>
        <div style={S.content}>{pageMap[page]}</div>
      </main>
    </div>
  );
}