/* Realistic deterministic mock datasets for every ERP domain.
   UI must never import fake rows directly — consume via services. */

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260906);
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)];
const int = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
const money = (min: number, max: number) => Math.round((min + rand() * (max - min)) * 100) / 100;
const pad = (n: number, l = 4) => String(n).padStart(l, "0");
const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString();
const daysAhead = (d: number) => new Date(Date.now() + d * 86400000).toISOString();

/* ================= Domain types ================= */

export interface Customer { id: string; code: string; name: string; type: "company" | "individual"; email: string; phone: string; city: string; country: string; status: "active" | "inactive" | "prospect"; creditLimit: number; balance: number; totalOrders: number; totalRevenue: number; owner: string; createdAt: string; updatedAt: string; taxId: string; address: string; }
export interface Contact { id: string; customerId: string; customerName: string; firstName: string; lastName: string; email: string; phone: string; position: string; isPrimary: boolean; createdAt: string; }
export interface Lead { id: string; name: string; company: string; email: string; phone: string; source: string; status: string; value: number; owner: string; createdAt: string; updatedAt: string; }
export interface Opportunity { id: string; title: string; customer: string; stage: string; value: number; probability: number; expectedClose: string; owner: string; createdAt: string; updatedAt: string; }

export interface LineItem { id: string; product: string; sku: string; qty: number; unitPrice: number; discount: number; tax: number; total: number; }
export interface SalesDoc extends Record<string, unknown> {
  id: string; number: string; customer: string; customerId: string; date: string; dueDate?: string;
  status: string; subtotal: number; tax: number; discount: number; total: number; paidAmount: number;
  balance: number; salesperson: string; warehouse: string; notes?: string; createdAt: string; updatedAt: string;
  items: LineItem[];
}
export interface Payment { id: string; number: string; customer: string; invoiceNumber: string; date: string; amount: number; method: string; reference: string; status: string; createdAt: string; }

export interface Supplier { id: string; code: string; name: string; email: string; phone: string; city: string; country: string; status: string; balance: number; totalPurchases: number; totalOrders: number; rating: number; category: string; createdAt: string; updatedAt: string; }
export interface PurchaseDoc extends Record<string, unknown> {
  id: string; number: string; supplier: string; supplierId: string; date: string; expectedDate?: string;
  status: string; subtotal: number; tax: number; total: number; paidAmount: number; balance: number;
  requester: string; warehouse: string; createdAt: string; updatedAt: string; items: LineItem[];
}

export interface Product { id: string; sku: string; barcode: string; name: string; category: string; brand: string; supplier: string; costPrice: number; salePrice: number; taxRate: number; stock: number; reserved: number; available: number; reorderLevel: number; warehouse: string; status: string; valuation: number; createdAt: string; updatedAt: string; }
export interface Category { id: string; name: string; code: string; products: number; description: string; status: string; createdAt: string; }
export interface Warehouse { id: string; code: string; name: string; city: string; type: string; capacity: number; occupancy: number; products: number; value: number; manager: string; status: string; }
export interface Movement { id: string; number: string; date: string; product: string; sku: string; type: "in" | "out" | "transfer" | "adjustment"; qty: number; from: string; to: string; reference: string; user: string; createdAt: string; }
export interface Transfer { id: string; number: string; date: string; from: string; to: string; products: number; qty: number; status: string; requester: string; createdAt: string; }

export interface Account { id: string; code: string; name: string; type: "asset" | "liability" | "equity" | "revenue" | "expense"; parent?: string; balance: number; status: string; }
export interface JournalEntry { id: string; number: string; date: string; description: string; reference: string; total: number; status: string; createdBy: string; lines: { account: string; debit: number; credit: number }[]; createdAt: string; }
export interface Expense { id: string; number: string; date: string; category: string; vendor: string; amount: number; tax: number; total: number; status: string; requester: string; approver?: string; paymentMethod: string; createdAt: string; }

export interface Employee { id: string; code: string; firstName: string; lastName: string; email: string; phone: string; department: string; position: string; status: string; hireDate: string; salary: number; manager: string; location: string; createdAt: string; updatedAt: string; }
export interface Department { id: string; name: string; code: string; head: string; employees: number; budget: number; spent: number; status: string; }
export interface LeaveRequest { id: string; employee: string; employeeId: string; type: string; from: string; to: string; days: number; reason: string; status: string; approver?: string; createdAt: string; }
export interface PayrollRun { id: string; number: string; period: string; employees: number; gross: number; deductions: number; net: number; status: string; payDate: string; createdAt: string; }
export interface AttendanceRow { id: string; employee: string; employeeId: string; date: string; checkIn: string; checkOut: string; hours: number; status: string; department: string; }

export interface Project { id: string; code: string; name: string; client: string; manager: string; status: string; progress: number; budget: number; spent: number; startDate: string; endDate: string; members: number; tasksTotal: number; tasksDone: number; priority: string; createdAt: string; }
export interface Task { id: string; title: string; project: string; projectId: string; status: string; priority: string; assignee: string; dueDate: string; labels: string[]; comments: number; progress: number; createdAt: string; }
export interface Milestone { id: string; project: string; title: string; dueDate: string; status: string; progress: number; owner: string; }

export interface Asset { id: string; code: string; name: string; category: string; status: string; assignedTo?: string; location: string; purchaseDate: string; purchasePrice: number; currentValue: number; depreciation: number; condition: string; createdAt: string; }
export interface DocFile { id: string; name: string; folder: string; category: string; size: number; type: string; owner: string; version: number; tags: string[]; updatedAt: string; createdAt: string; }
export interface Approval { id: string; type: string; reference: string; title: string; requester: string; amount?: number; status: string; submittedAt: string; currentStep: string; history: { step: string; by: string; action: string; at: string; comment?: string }[]; }
export interface AuditLog { id: string; user: string; action: string; module: string; entity: string; entityId: string; date: string; ip: string; details: string; }

/* ================= Reference data ================= */

const FIRST = ["James", "Maria", "Robert", "Linda", "Michael", "Sarah", "David", "Emma", "Daniel", "Olivia", "Lucas", "Ava", "Noah", "Sofia", "Ethan", "Mia", "Alexander", "Yuki", "Priya", "Omar", "Fatima", "Chen", "Ingrid", "Pablo"];
const LAST = ["Smith", "Johnson", "Garcia", "Martinez", "Brown", "Davis", "Miller", "Wilson", "Okafor", "Chen", "Rossi", "Benali", "Khan", "Muller", "Dubois", "Sato", "Haddad", "Novak", "Silva", "Costa"];
const COMPANIES = ["Acme Corp", "Globex Ltd", "Initech", "Umbrella Co", "Stark Industries", "Wayne Enterprises", "Hooli", "Massive Dynamic", "Soylent Corp", "Cyberdyne", "Tyrell Corp", "Oscorp", "Virtucon", "Gringotts Bank", "Nakatomi Trading", "Wonka Foods", "Gekko & Co", "Sterling Cooper", "Dunder Mifflin", "Pied Piper", "Aperture Labs", "Black Mesa", "Blue Sun Corp", "Sirius Logistics", "Helios Energy", "Atlas Freight", "Beacon Retail", "Cobalt Health", "Drift Motors", "Ember Foods", "Fjord Design", "Granite Build", "Harbor Air", "Ion Labs", "Juniper Hotels", "Krypton Media", "Lumen Optics", "Meridian Bank", "Northwind Traders", "Ozone Travel", "Pinnacle Steel", "Quartz Mining", "Relay Telecom", "Summit Gear", "Tidewater Ports", "Union Pacific Foods", "Vertex Chips", "Willow Care"];
const CITIES: [string, string][] = [["New York", "USA"], ["San Francisco", "USA"], ["Chicago", "USA"], ["Austin", "USA"], ["London", "UK"], ["Paris", "France"], ["Berlin", "Germany"], ["Dubai", "UAE"], ["Riyadh", "Saudi Arabia"], ["Toronto", "Canada"]];
const OWNERS = ["Maya Chen", "Liam Carter", "Ava Stone", "Noah Benali", "Sofia Rossi", "Ethan Wright"];

/* ================= CRM ================= */

export const customers: Customer[] = COMPANIES.slice(0, 48).map((name, i) => {
  const [city, country] = CITIES[i % CITIES.length];
  const revenue = money(5000, 380000);
  return {
    id: `cus_${pad(i + 1)}`, code: `CUS-${pad(i + 1)}`, name, type: i % 7 === 0 ? "individual" : "company",
    email: `contact@${name.toLowerCase().replace(/[^a-z]/g, "")}.com`, phone: `+1${int(2000000000, 9899999999)}`,
    city, country, status: i % 13 === 0 ? "inactive" : i % 9 === 0 ? "prospect" : "active",
    creditLimit: money(10000, 150000), balance: money(0, 45000), totalOrders: int(1, 86), totalRevenue: revenue,
    owner: OWNERS[i % OWNERS.length], taxId: `TX-${int(100000, 999999)}`,
    address: `${int(10, 999)} Market Street, ${city}`, createdAt: daysAgo(int(30, 900)), updatedAt: daysAgo(int(0, 20)),
  };
});

export const contacts: Contact[] = customers.slice(0, 30).flatMap((c, i) => {
  const n = i % 3 === 0 ? 2 : 1;
  return Array.from({ length: n }, (_, k) => ({
    id: `con_${pad(i * 2 + k + 1)}`, customerId: c.id, customerName: c.name,
    firstName: FIRST[(i + k * 3) % FIRST.length], lastName: LAST[(i * 2 + k) % LAST.length],
    email: `contact${k > 0 ? k + 1 : ""}@${c.name.toLowerCase().replace(/[^a-z]/g, "")}.com`,
    phone: `+1${int(2000000000, 9899999999)}`, position: pick(["Purchasing Manager", "CFO", "Operations Lead", "CEO", "Accountant"] as const),
    isPrimary: k === 0, createdAt: daysAgo(int(10, 400)),
  }));
});

const LEAD_SOURCES = ["Website", "Referral", "Trade Show", "LinkedIn", "Cold Call", "Partner"];
const LEAD_STATUSES = ["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost"];
export const leads: Lead[] = Array.from({ length: 26 }, (_, i) => ({
  id: `led_${pad(i + 1)}`, name: `${FIRST[i % FIRST.length]} ${LAST[(i * 3) % LAST.length]}`,
  company: COMPANIES[(i + 12) % COMPANIES.length], email: `lead${i + 1}@example.com`, phone: `+1${int(2000000000, 9899999999)}`,
  source: LEAD_SOURCES[i % LEAD_SOURCES.length], status: LEAD_STATUSES[i % LEAD_STATUSES.length],
  value: money(2000, 120000), owner: OWNERS[i % OWNERS.length], createdAt: daysAgo(int(1, 120)), updatedAt: daysAgo(int(0, 10)),
}));

const OPP_STAGES = ["discovery", "qualification", "proposal", "negotiation", "closed_won", "closed_lost"];
export const opportunities: Opportunity[] = Array.from({ length: 18 }, (_, i) => ({
  id: `opp_${pad(i + 1)}`, title: `${pick(["ERP Rollout", "Supply Contract", "Service Agreement", "Bulk Order", "Annual Plan"] as const)} — ${COMPANIES[i % COMPANIES.length]}`,
  customer: COMPANIES[i % COMPANIES.length], stage: OPP_STAGES[i % OPP_STAGES.length], value: money(15000, 450000),
  probability: int(10, 95), expectedClose: daysAhead(int(5, 120)), owner: OWNERS[i % OWNERS.length],
  createdAt: daysAgo(int(5, 200)), updatedAt: daysAgo(int(0, 8)),
}));

/* ================= Sales ================= */

const PRODUCT_NAMES = ["Ergo Chair Pro", "Standing Desk 160", "Laptop Docking Hub", "Wireless Headset X2", "4K Monitor 27in", "Mechanical Keyboard", "Office Suite License", "Server Rack 12U", "Network Switch 48P", "SSD 2TB NVMe", "Laser Printer A3", "Paper Shredder HD", "Conference Table Oak", "Filing Cabinet 4D", "LED Panel Light", "Air Purifier Max", "Coffee Machine Pro", "Water Dispenser", "Safety Helmet V2", "Tool Kit 108pc"];

function makeItems(n: number): LineItem[] {
  return Array.from({ length: n }, (_, k) => {
    const qty = int(1, 40);
    const unitPrice = money(25, 2400);
    const discount = rand() > 0.7 ? money(0, unitPrice * 0.15) : 0;
    const tax = Math.round((unitPrice * qty - discount) * 0.15 * 100) / 100;
    return {
      id: `li_${k}_${int(1000, 9999)}`, product: PRODUCT_NAMES[int(0, PRODUCT_NAMES.length - 1)],
      sku: `SKU-${int(100, 999)}-${int(10, 99)}`, qty, unitPrice,
      discount: Math.round(discount * 100) / 100, tax, total: Math.round((unitPrice * qty - discount + tax) * 100) / 100,
    };
  });
}

function totals(items: LineItem[]) {
  const subtotal = items.reduce((a, i) => a + i.unitPrice * i.qty, 0);
  const discount = items.reduce((a, i) => a + i.discount, 0);
  const tax = items.reduce((a, i) => a + i.tax, 0);
  const total = subtotal - discount + tax;
  return {
    subtotal: Math.round(subtotal * 100) / 100, discount: Math.round(discount * 100) / 100,
    tax: Math.round(tax * 100) / 100, total: Math.round(total * 100) / 100,
  };
}

function makeSalesDocs(prefix: string, count: number, statuses: string[], startNum: number): SalesDoc[] {
  return Array.from({ length: count }, (_, i) => {
    const c = customers[i % customers.length];
    const items = makeItems(int(1, 5));
    const t = totals(items);
    const status = statuses[i % statuses.length];
    const paid = status === "paid" ? t.total : status === "partially_paid" ? Math.round(t.total * 0.4 * 100) / 100 : 0;
    const date = daysAgo(int(1, 300));
    return {
      id: `${prefix.toLowerCase()}_${pad(i + 1)}`, number: `${prefix}-2026-${startNum + i}`,
      customer: c.name, customerId: c.id, date, dueDate: daysAhead(int(-30, 45)), status,
      ...t, paidAmount: paid, balance: Math.round((t.total - paid) * 100) / 100,
      salesperson: OWNERS[i % OWNERS.length], warehouse: pick(["WH-East", "WH-West", "WH-Central"] as const),
      notes: i % 4 === 0 ? "Priority customer — handle with care." : undefined,
      createdAt: date, updatedAt: daysAgo(int(0, 10)), items,
    };
  });
}

export const quotations = makeSalesDocs("QT", 30, ["draft", "sent", "accepted", "rejected", "expired", "converted"], 1101);
export const salesOrders = makeSalesDocs("SO", 36, ["draft", "pending_approval", "approved", "confirmed", "in_progress", "partially_fulfilled", "fulfilled", "delivered"], 2201);
export const deliveries = makeSalesDocs("DO", 20, ["draft", "in_progress", "delivered", "partially_fulfilled"], 3301);
export const invoices: SalesDoc[] = makeSalesDocs("INV", 60, ["draft", "sent", "viewed", "partially_paid", "paid", "overdue", "paid", "sent"], 1801);
export const creditNotes = makeSalesDocs("CN", 8, ["draft", "approved", "sent"], 4401);
export const salesReturns = makeSalesDocs("SR", 10, ["draft", "pending_approval", "approved", "completed"], 5501);

const PAY_METHODS = ["Bank Transfer", "Credit Card", "Cash", "Check", "Online"];
const PAY_STATUSES = ["completed", "completed", "completed", "pending", "refunded"];
export const payments: Payment[] = Array.from({ length: 50 }, (_, i) => {
  const inv = invoices[i % invoices.length];
  return {
    id: `pay_${pad(i + 1)}`, number: `PAY-2026-${6601 + i}`, customer: inv.customer, invoiceNumber: inv.number,
    date: daysAgo(int(0, 180)), amount: money(500, 60000), method: PAY_METHODS[i % PAY_METHODS.length],
    reference: `REF-${int(100000, 999999)}`, status: PAY_STATUSES[i % PAY_STATUSES.length], createdAt: daysAgo(int(0, 180)),
  };
});

/* ================= Purchases ================= */

const SUPPLIER_CATS = ["Office Supplies", "IT Equipment", "Furniture", "Raw Materials", "Logistics", "Services"];
export const suppliers: Supplier[] = Array.from({ length: 24 }, (_, i) => {
  const [city, country] = CITIES[(i + 2) % CITIES.length];
  return {
    id: `sup_${pad(i + 1)}`, code: `SUP-${pad(i + 1)}`, name: `${pick(["Prime", "Global", "United", "Apex", "Nova", "Delta", "Orion", "Summit"])} ${pick(["Supply", "Trade", "Goods", "Parts", "Source", "Line"])} ${i + 1}`,
    email: `sales@supplier${i + 1}.com`, phone: `+1${int(2000000000, 9899999999)}`, city, country,
    status: i % 11 === 0 ? "inactive" : "active", balance: money(0, 38000),
    totalPurchases: money(20000, 520000), totalOrders: int(3, 64), rating: Math.round((3 + rand() * 2) * 10) / 10,
    category: SUPPLIER_CATS[i % SUPPLIER_CATS.length], createdAt: daysAgo(int(60, 1000)), updatedAt: daysAgo(int(0, 15)),
  };
});

function makePurchaseDocs(prefix: string, count: number, statuses: string[], startNum: number): PurchaseDoc[] {
  return Array.from({ length: count }, (_, i) => {
    const s = suppliers[i % suppliers.length];
    const items = makeItems(int(1, 6));
    const t = totals(items);
    const status = statuses[i % statuses.length];
    const paid = status === "paid" ? t.total : status === "partially_paid" ? Math.round(t.total * 0.5 * 100) / 100 : 0;
    const date = daysAgo(int(1, 280));
    return {
      id: `${prefix.toLowerCase()}_${pad(i + 1)}`, number: `${prefix}-2026-${startNum + i}`,
      supplier: s.name, supplierId: s.id, date, expectedDate: daysAhead(int(-10, 40)), status,
      subtotal: t.subtotal, tax: t.tax, total: t.total, paidAmount: paid,
      balance: Math.round((t.total - paid) * 100) / 100, requester: OWNERS[(i + 2) % OWNERS.length],
      warehouse: pick(["WH-East", "WH-West", "WH-Central"] as const), createdAt: date, updatedAt: daysAgo(int(0, 8)), items,
    };
  });
}

export const purchaseRequests = makePurchaseDocs("PR", 16, ["draft", "pending_approval", "approved", "rejected"], 101);
export const purchaseQuotations = makePurchaseDocs("PQ", 12, ["draft", "sent", "accepted", "rejected"], 301);
export const purchaseOrders = makePurchaseDocs("PO", 30, ["draft", "pending_approval", "approved", "confirmed", "partially_fulfilled", "fulfilled"], 931);
export const goodsReceipts = makePurchaseDocs("GR", 24, ["draft", "partially_fulfilled", "fulfilled"], 1201);
export const supplierInvoices: PurchaseDoc[] = makePurchaseDocs("SI", 28, ["draft", "sent", "partially_paid", "paid", "overdue"], 1501);
export const purchaseReturns = makePurchaseDocs("PRET", 6, ["draft", "approved", "completed"], 1701);
export const supplierPayments: Payment[] = Array.from({ length: 24 }, (_, i) => {
  const inv = supplierInvoices[i % supplierInvoices.length];
  return {
    id: `spay_${pad(i + 1)}`, number: `SPAY-2026-${1801 + i}`, customer: inv.supplier, invoiceNumber: inv.number,
    date: daysAgo(int(0, 160)), amount: money(800, 48000), method: PAY_METHODS[i % PAY_METHODS.length],
    reference: `REF-${int(100000, 999999)}`, status: PAY_STATUSES[i % PAY_STATUSES.length], createdAt: daysAgo(int(0, 160)),
  };
});

/* ================= Inventory ================= */

const CATS = ["Furniture", "IT Equipment", "Office Supplies", "Electronics", "Stationery", "Cleaning", "Safety", "Kitchen", "Lighting", "Storage"];
const BRANDS = ["Nexora", "ErgoMax", "TechLine", "OfficePro", "BrightLux", "SafeGuard", "KitchWell", "StoreRite"];

export const categories: Category[] = CATS.map((name, i) => ({
  id: `cat_${pad(i + 1)}`, name, code: `CAT-${pad(i + 1, 3)}`, products: int(3, 12),
  description: `${name} and related items`, status: "active", createdAt: daysAgo(int(200, 800)),
}));

export const warehouses: Warehouse[] = [
  { id: "wh_001", code: "WH-East", name: "East Distribution Center", city: "New York", type: "main", capacity: 50000, occupancy: 68, products: 412, value: 1840000, manager: "Sofia Rossi", status: "active" },
  { id: "wh_002", code: "WH-West", name: "West Fulfillment Hub", city: "San Francisco", type: "regional", capacity: 30000, occupancy: 54, products: 286, value: 1120000, manager: "Ethan Wright", status: "active" },
  { id: "wh_003", code: "WH-Central", name: "Central Depot", city: "Chicago", type: "regional", capacity: 22000, occupancy: 71, products: 198, value: 860000, manager: "Lucas Meyer", status: "active" },
  { id: "wh_004", code: "WH-South", name: "South Transit Warehouse", city: "Austin", type: "transit", capacity: 12000, occupancy: 32, products: 74, value: 240000, manager: "Mia Torres", status: "active" },
];

export const products: Product[] = Array.from({ length: 60 }, (_, i) => {
  const stock = int(0, 480);
  const reserved = int(0, Math.min(40, stock));
  const reorder = int(10, 60);
  const cost = money(8, 1500);
  const price = Math.round(cost * (1.25 + rand() * 0.6) * 100) / 100;
  const status = stock === 0 ? "out_of_stock" : stock <= reorder ? "low_stock" : i % 17 === 0 ? "on_order" : "in_stock";
  return {
    id: `prd_${pad(i + 1)}`, sku: `SKU-${pad(i + 1, 3)}-${int(10, 99)}`, barcode: `${int(100000000000, 999999999999)}`,
    name: `${PRODUCT_NAMES[i % PRODUCT_NAMES.length]}${i >= PRODUCT_NAMES.length ? ` Gen ${Math.floor(i / PRODUCT_NAMES.length) + 1}` : ""}`,
    category: CATS[i % CATS.length], brand: BRANDS[i % BRANDS.length], supplier: suppliers[i % suppliers.length].name,
    costPrice: cost, salePrice: price, taxRate: 15, stock, reserved, available: stock - reserved,
    reorderLevel: reorder, warehouse: pick(["WH-East", "WH-West", "WH-Central"] as const), status,
    valuation: Math.round(stock * cost * 100) / 100, createdAt: daysAgo(int(30, 700)), updatedAt: daysAgo(int(0, 6)),
  };
});

const MOV_TYPES: Movement["type"][] = ["in", "out", "transfer", "adjustment"];
export const movements: Movement[] = Array.from({ length: 90 }, (_, i) => {
  const p = products[i % products.length];
  const type = MOV_TYPES[i % MOV_TYPES.length];
  return {
    id: `mov_${pad(i + 1)}`, number: `MV-2026-${2001 + i}`, date: daysAgo(int(0, 120)),
    product: p.name, sku: p.sku, type, qty: int(1, 120),
    from: type === "in" ? "Supplier" : pick(["WH-East", "WH-West", "WH-Central"] as const),
    to: type === "out" ? "Customer" : pick(["WH-East", "WH-West", "WH-Central"] as const),
    reference: `${pick(["SO", "PO", "ADJ", "TR"])}-2026-${int(1000, 9999)}`, user: OWNERS[i % OWNERS.length], createdAt: daysAgo(int(0, 120)),
  };
});

export const transfers: Transfer[] = Array.from({ length: 14 }, (_, i) => ({
  id: `trf_${pad(i + 1)}`, number: `TR-2026-${3001 + i}`, date: daysAgo(int(0, 90)),
  from: "WH-East", to: i % 2 === 0 ? "WH-West" : "WH-Central", products: int(1, 8), qty: int(10, 400),
  status: pick(["draft", "pending_approval", "approved", "in_progress", "completed"] as const),
  requester: OWNERS[i % OWNERS.length], createdAt: daysAgo(int(0, 90)),
}));

/* ================= Accounting ================= */

export const accounts: Account[] = [
  { id: "acc_001", code: "1000", name: "Cash on Hand", type: "asset", balance: 48250, status: "active" },
  { id: "acc_002", code: "1010", name: "Bank — Operating", type: "asset", balance: 486200, status: "active" },
  { id: "acc_003", code: "1100", name: "Accounts Receivable", type: "asset", balance: 312840, status: "active" },
  { id: "acc_004", code: "1200", name: "Inventory", type: "asset", balance: 4060000, status: "active" },
  { id: "acc_005", code: "1300", name: "Prepaid Expenses", type: "asset", balance: 28400, status: "active" },
  { id: "acc_006", code: "1500", name: "Equipment", type: "asset", balance: 890000, status: "active" },
  { id: "acc_007", code: "1510", name: "Accumulated Depreciation", type: "asset", balance: -214000, status: "active" },
  { id: "acc_008", code: "2000", name: "Accounts Payable", type: "liability", balance: 198450, status: "active" },
  { id: "acc_009", code: "2100", name: "Accrued Expenses", type: "liability", balance: 42300, status: "active" },
  { id: "acc_010", code: "2200", name: "Tax Payable", type: "liability", balance: 67800, status: "active" },
  { id: "acc_011", code: "2300", name: "Short-term Loan", type: "liability", balance: 150000, status: "active" },
  { id: "acc_012", code: "3000", name: "Share Capital", type: "equity", balance: 2000000, status: "active" },
  { id: "acc_013", code: "3100", name: "Retained Earnings", type: "equity", balance: 1246800, status: "active" },
  { id: "acc_014", code: "4000", name: "Sales Revenue", type: "revenue", balance: 4820600, status: "active" },
  { id: "acc_015", code: "4100", name: "Service Revenue", type: "revenue", balance: 864300, status: "active" },
  { id: "acc_016", code: "4200", name: "Other Income", type: "revenue", balance: 42500, status: "active" },
  { id: "acc_017", code: "5000", name: "Cost of Goods Sold", type: "expense", balance: 2740800, status: "active" },
  { id: "acc_018", code: "5100", name: "Salaries & Wages", type: "expense", balance: 986000, status: "active" },
  { id: "acc_019", code: "5200", name: "Rent", type: "expense", balance: 144000, status: "active" },
  { id: "acc_020", code: "5300", name: "Utilities", type: "expense", balance: 38200, status: "active" },
  { id: "acc_021", code: "5400", name: "Marketing", type: "expense", balance: 96400, status: "active" },
  { id: "acc_022", code: "5500", name: "Depreciation", type: "expense", balance: 48200, status: "active" },
  { id: "acc_023", code: "5600", name: "Office Supplies", type: "expense", balance: 21800, status: "active" },
  { id: "acc_024", code: "5700", name: "Travel", type: "expense", balance: 56400, status: "active" },
];

export const journalEntries: JournalEntry[] = Array.from({ length: 40 }, (_, i) => {
  const total = money(500, 85000);
  return {
    id: `je_${pad(i + 1)}`, number: `JE-2026-${4001 + i}`, date: daysAgo(int(0, 200)),
    description: pick(["Monthly rent accrual", "Supplier payment", "Customer receipt", "Payroll posting", "Depreciation", "Inventory adjustment", "Tax provision", "Revenue recognition"] as const),
    reference: `REF-${int(10000, 99999)}`, total, status: i % 9 === 0 ? "draft" : "posted", createdBy: OWNERS[(i + 1) % OWNERS.length],
    lines: [
      { account: "1010 — Bank — Operating", debit: total, credit: 0 },
      { account: "4000 — Sales Revenue", debit: 0, credit: total },
    ],
    createdAt: daysAgo(int(0, 200)),
  };
});

const EXP_CATS = ["Travel", "Meals", "Office Supplies", "Software", "Fuel", "Accommodation", "Training", "Marketing"];
export const expenses: Expense[] = Array.from({ length: 36 }, (_, i) => {
  const amount = money(40, 6800);
  const tax = Math.round(amount * 0.15 * 100) / 100;
  return {
    id: `exp_${pad(i + 1)}`, number: `EXP-2026-${5001 + i}`, date: daysAgo(int(0, 120)),
    category: EXP_CATS[i % EXP_CATS.length], vendor: pick(COMPANIES), amount, tax, total: Math.round((amount + tax) * 100) / 100,
    status: pick(["draft", "pending_approval", "approved", "rejected", "paid"] as const),
    requester: `${FIRST[i % FIRST.length]} ${LAST[i % LAST.length]}`,
    approver: i % 3 === 0 ? "Ava Stone" : undefined, paymentMethod: PAY_METHODS[i % PAY_METHODS.length], createdAt: daysAgo(int(0, 120)),
  };
});

/* ================= HR ================= */

const DEPTS: [string, string][] = [["Executive", "EXE"], ["Finance", "FIN"], ["Sales", "SAL"], ["Human Resources", "HR"], ["Operations", "OPS"], ["Engineering", "ENG"], ["Marketing", "MKT"], ["Support", "SUP"]];
const POSITIONS = ["Manager", "Senior Specialist", "Specialist", "Coordinator", "Analyst", "Assistant", "Director", "Lead"];

export const departments: Department[] = DEPTS.map(([name, code], i) => ({
  id: `dep_${pad(i + 1)}`, name, code, head: `${FIRST[(i * 3) % FIRST.length]} ${LAST[(i * 5) % LAST.length]}`,
  employees: int(3, 18), budget: money(200000, 1500000), spent: money(80000, 900000), status: "active",
}));

const EMP_STATUSES = ["active", "active", "active", "active", "on_leave", "probation"];
export const employees: Employee[] = Array.from({ length: 42 }, (_, i) => ({
  id: `emp_${pad(i + 1)}`, code: `EMP-${pad(i + 1, 4)}`,
  firstName: FIRST[i % FIRST.length], lastName: LAST[(i * 7 + 3) % LAST.length],
  email: `employee${i + 1}@nexora.io`, phone: `+1${int(2000000000, 9899999999)}`,
  department: DEPTS[i % DEPTS.length][0], position: `${pick(DEPTS)[0]} ${POSITIONS[i % POSITIONS.length]}`,
  status: EMP_STATUSES[i % EMP_STATUSES.length], hireDate: daysAgo(int(30, 2400)),
  salary: money(2800, 14500), manager: "Ava Stone", location: CITIES[i % CITIES.length][0],
  createdAt: daysAgo(int(30, 2400)), updatedAt: daysAgo(int(0, 20)),
}));

const LEAVE_TYPES = ["Annual", "Sick", "Unpaid", "Maternity", "Emergency"];
export const leaveRequests: LeaveRequest[] = Array.from({ length: 24 }, (_, i) => {
  const e = employees[i % employees.length];
  const from = daysAhead(int(-20, 30));
  return {
    id: `lev_${pad(i + 1)}`, employee: `${e.firstName} ${e.lastName}`, employeeId: e.id,
    type: LEAVE_TYPES[i % LEAVE_TYPES.length], from, to: daysAhead(int(31, 45)), days: int(1, 12),
    reason: pick(["Family vacation", "Medical appointment", "Personal matters", "Rest and recovery", "Conference attendance"] as const),
    status: pick(["pending", "approved", "approved", "rejected", "cancelled"] as const),
    approver: "Noah Benali", createdAt: from,
  };
});

export const payrollRuns: PayrollRun[] = Array.from({ length: 8 }, (_, i) => {
  const gross = money(180000, 240000);
  const deductions = Math.round(gross * 0.24 * 100) / 100;
  const months = ["January", "February", "March", "April", "May", "June", "July", "August"];
  return {
    id: `pr_${pad(i + 1)}`, number: `PAYROLL-2026-${pad(i + 1, 2)}`, period: `${months[i]} 2026`,
    employees: 42, gross, deductions, net: Math.round((gross - deductions) * 100) / 100,
    status: i < 7 ? "paid" : "draft", payDate: daysAgo(i * 30), createdAt: daysAgo(i * 30),
  };
});

export const attendance: AttendanceRow[] = employees.slice(0, 30).map((e, i) => ({
  id: `att_${pad(i + 1)}`, employee: `${e.firstName} ${e.lastName}`, employeeId: e.id,
  date: daysAgo(i % 3), checkIn: `0${8 + (i % 2)}:${pad(int(5, 55), 2)}`, checkOut: `17:${pad(int(5, 55), 2)}`,
  hours: 8 + Math.round(rand() * 20) / 10, status: i % 11 === 0 ? "absent" : i % 7 === 0 ? "late" : i % 9 === 0 ? "leave" : "present",
  department: e.department,
}));

/* ================= Projects ================= */

const PROJ_STATUSES = ["planning", "active", "active", "active", "on_hold", "completed"];
export const projects: Project[] = Array.from({ length: 12 }, (_, i) => {
  const budget = money(50000, 800000);
  const spent = Math.round(budget * (0.2 + rand() * 0.7) * 100) / 100;
  const total = int(8, 40);
  const done = Math.floor(total * (0.2 + rand() * 0.7));
  return {
    id: `prj_${pad(i + 1)}`, code: `PRJ-${pad(i + 1, 3)}`,
    name: pick(["Atlas Rollout", "Phoenix Migration", "Orion Portal", "Beacon CRM", "Summit ERP", "Vertex Mobile", "Harbor Analytics", "Cobalt Cloud", "Drift IoT", "Ember POS", "Fjord Website", "Granite WMS"] as const),
    client: COMPANIES[i % COMPANIES.length], manager: OWNERS[i % OWNERS.length],
    status: PROJ_STATUSES[i % PROJ_STATUSES.length], progress: Math.round((done / total) * 100),
    budget, spent, startDate: daysAgo(int(30, 300)), endDate: daysAhead(int(10, 200)),
    members: int(3, 12), tasksTotal: total, tasksDone: done,
    priority: pick(["low", "medium", "high", "urgent"] as const), createdAt: daysAgo(int(30, 300)),
  };
});

const TASK_STATUSES = ["todo", "in_progress", "review", "completed", "completed", "blocked"];
export const tasks: Task[] = Array.from({ length: 64 }, (_, i) => {
  const p = projects[i % projects.length];
  return {
    id: `tsk_${pad(i + 1)}`, title: pick(["Design review", "API integration", "Database migration", "QA testing", "Client demo", "Documentation", "Bug fix", "Deployment", "Requirement analysis", "UI polish"] as const) + ` #${i + 1}`,
    project: p.name, projectId: p.id, status: TASK_STATUSES[i % TASK_STATUSES.length],
    priority: pick(["low", "medium", "high", "urgent"] as const),
    assignee: `${FIRST[(i * 2) % FIRST.length]} ${LAST[i % LAST.length]}`,
    dueDate: daysAhead(int(-10, 60)), labels: [pick(["frontend", "backend", "design", "qa", "devops"] as const)],
    comments: int(0, 9), progress: int(0, 100), createdAt: daysAgo(int(0, 90)),
  };
});

export const milestones: Milestone[] = projects.flatMap((p, i) =>
  [0, 1].map((k) => ({
    id: `ms_${pad(i * 2 + k + 1)}`, project: p.name, title: k === 0 ? "Phase 1 — Foundation" : "Phase 2 — Delivery",
    dueDate: k === 0 ? daysAgo(int(0, 60)) : daysAhead(int(5, 120)),
    status: k === 0 ? "completed" : pick(["todo", "in_progress", "review"] as const),
    progress: k === 0 ? 100 : int(10, 80), owner: p.manager,
  }))
);

/* ================= Assets / Documents ================= */

const ASSET_CATS = ["IT Equipment", "Furniture", "Vehicles", "Machinery", "Buildings"];
const ASSET_STATUSES = ["available", "assigned", "assigned", "in_maintenance", "retired"];
export const assets: Asset[] = Array.from({ length: 28 }, (_, i) => {
  const price = money(400, 68000);
  return {
    id: `ast_${pad(i + 1)}`, code: `AST-${pad(i + 1, 4)}`,
    name: pick(["MacBook Pro 16", "Dell Monitor 27", "Office Desk", "Forklift T3", "Delivery Van", "Server Dell R750", "Projector 4K", "AC Unit Central", "Generator 20kVA", "CNC Machine"] as const),
    category: ASSET_CATS[i % ASSET_CATS.length], status: ASSET_STATUSES[i % ASSET_STATUSES.length],
    assignedTo: i % 3 === 0 ? `${FIRST[i % FIRST.length]} ${LAST[i % LAST.length]}` : undefined,
    location: CITIES[i % CITIES.length][0], purchaseDate: daysAgo(int(60, 1500)), purchasePrice: price,
    currentValue: Math.round(price * (0.4 + rand() * 0.5) * 100) / 100, depreciation: pick([10, 15, 20, 25]),
    condition: pick(["excellent", "good", "fair", "needs_repair"] as const), createdAt: daysAgo(int(60, 1500)),
  };
});

const DOC_FOLDERS = ["Contracts", "Invoices", "HR", "Projects", "Legal", "Marketing"];
export const documents: DocFile[] = Array.from({ length: 30 }, (_, i) => {
  const ext = pick(["pdf", "pdf", "docx", "xlsx", "png", "csv"] as const);
  return {
    id: `doc_${pad(i + 1)}`, name: `${pick(["Contract", "Invoice", "Policy", "Report", "Proposal", "Manual", "Certificate", "Agreement"])}_${pad(i + 1)}.${ext}`,
    folder: DOC_FOLDERS[i % DOC_FOLDERS.length], category: pick(["Legal", "Finance", "HR", "Operations"] as const),
    size: int(50000, 12000000), type: ext, owner: OWNERS[i % OWNERS.length], version: int(1, 5),
    tags: [pick(["important", "2026", "signed", "draft", "archived"] as const)], updatedAt: daysAgo(int(0, 60)), createdAt: daysAgo(int(10, 400)),
  };
});

/* ================= Approvals / Audit ================= */

export const approvals: Approval[] = [
  { id: "apr_001", type: "Purchase Order", reference: "PO-2026-0931", title: "IT equipment restock — $42,800", requester: "Sofia Rossi", amount: 42800, status: "pending", submittedAt: daysAgo(1), currentStep: "Finance Review", history: [{ step: "Manager Approval", by: "Ava Stone", action: "approved", at: daysAgo(1), comment: "Looks good." }] },
  { id: "apr_002", type: "Leave Request", reference: "LEV-2026-014", title: "Annual leave — Daniel Okafor (5 days)", requester: "Daniel Okafor", status: "pending", submittedAt: daysAgo(0), currentStep: "HR Review", history: [] },
  { id: "apr_003", type: "Expense", reference: "EXP-2026-5012", title: "Client dinner — $1,240", requester: "Maya Chen", amount: 1240, status: "pending", submittedAt: daysAgo(0), currentStep: "Manager Approval", history: [] },
  { id: "apr_004", type: "Sales Order", reference: "SO-2026-2214", title: "Bulk order — Globex Ltd ($86,400)", requester: "Maya Chen", amount: 86400, status: "pending", submittedAt: daysAgo(2), currentStep: "Sales Manager", history: [] },
  { id: "apr_005", type: "Invoice", reference: "INV-2026-1841", title: "Invoice approval — Acme Corp ($24,500)", requester: "Liam Carter", amount: 24500, status: "approved", submittedAt: daysAgo(4), currentStep: "Done", history: [{ step: "Finance Review", by: "Ava Stone", action: "approved", at: daysAgo(3) }] },
  { id: "apr_006", type: "Purchase Order", reference: "PO-2026-0928", title: "Furniture batch — $18,900", requester: "Lucas Meyer", amount: 18900, status: "changes_requested", submittedAt: daysAgo(5), currentStep: "Requester", history: [{ step: "Finance Review", by: "Liam Carter", action: "changes_requested", at: daysAgo(4), comment: "Please attach competing quotes." }] },
  { id: "apr_007", type: "Leave Request", reference: "LEV-2026-009", title: "Sick leave — Emma Wilson (2 days)", requester: "Emma Wilson", status: "approved", submittedAt: daysAgo(6), currentStep: "Done", history: [{ step: "HR Review", by: "Noah Benali", action: "approved", at: daysAgo(6) }] },
  { id: "apr_008", type: "Expense", reference: "EXP-2026-5004", title: "Travel — Dubai summit ($6,100)", requester: "Omar Haddad", amount: 6100, status: "rejected", submittedAt: daysAgo(8), currentStep: "Done", history: [{ step: "Manager Approval", by: "Ava Stone", action: "rejected", at: daysAgo(7), comment: "Over budget for Q3." }] },
];

const AUDIT_ACTIONS = ["created", "updated", "deleted", "approved", "rejected", "exported", "printed", "sent"];
const AUDIT_MODULES = ["sales", "purchases", "inventory", "accounting", "hr", "projects", "customers", "settings"];
export const auditLogs: AuditLog[] = Array.from({ length: 70 }, (_, i) => ({
  id: `aud_${pad(i + 1)}`, user: OWNERS[i % OWNERS.length], action: AUDIT_ACTIONS[i % AUDIT_ACTIONS.length],
  module: AUDIT_MODULES[i % AUDIT_MODULES.length], entity: pick(["Invoice", "Purchase Order", "Product", "Employee", "Customer", "Journal Entry", "Task"] as const),
  entityId: `REF-${int(1000, 9999)}`, date: daysAgo(int(0, 30) + rand() * 1),
  ip: `192.168.1.${int(2, 200)}`, details: `Record ${AUDIT_ACTIONS[i % AUDIT_ACTIONS.length]} via web console`,
}));

/* ================= Dashboard aggregates ================= */

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];
export const revenueSeries = MONTHS.map((m, i) => ({ month: m, revenue: 380000 + i * 42000 + int(-30000, 60000), expenses: 290000 + i * 26000 + int(-20000, 40000), profit: 0 })).map((r) => ({ ...r, profit: r.revenue - r.expenses }));
export const salesPurchaseSeries = MONTHS.map((m, i) => ({ month: m, sales: 320000 + i * 38000 + int(-25000, 50000), purchases: 210000 + i * 18000 + int(-20000, 35000) }));
export const cashFlowSeries = MONTHS.map((m, i) => ({ month: m, inflow: 350000 + i * 40000 + int(-30000, 55000), outflow: 280000 + i * 24000 + int(-20000, 40000) }));
export const inventoryByCategory = CATS.slice(0, 7).map((c) => ({ name: c, value: int(120000, 680000) }));
export const departmentPerformance = DEPTS.map(([name]) => ({ name, target: 100, actual: int(62, 118) }));
export const topCustomers = customers.slice(0, 6).map((c) => ({ name: c.name, revenue: c.totalRevenue, orders: c.totalOrders }));
export const topProducts = products.slice(0, 6).map((p) => ({ name: p.name, revenue: Math.round(p.salePrice * int(40, 300)), qty: int(40, 300) }));

export interface ActivityItem { id: string; user: string; action: string; entity: string; time: string; }
export const recentActivities: ActivityItem[] = Array.from({ length: 12 }, (_, i) => ({
  id: `act_${i + 1}`,
  user: OWNERS[i % OWNERS.length],
  action: pick(["created invoice", "approved PO", "added product", "updated employee", "received payment", "closed task", "submitted expense", "converted quotation"] as const),
  entity: `REF-${int(1000, 9999)}`,
  time: daysAgo(rand() * 2),
}));

export const dashboardKpis = {
  revenue: 4820600, revenueDelta: 12.4,
  expenses: 3982400, expensesDelta: 6.8,
  profit: 838200, profitDelta: 18.2,
  cashFlow: 214600, cashFlowDelta: -3.1,
  sales: 3120400, salesDelta: 9.6,
  purchases: 1980400, purchasesDelta: 4.2,
  outstandingInvoices: 312840, outstandingCount: 18,
  overdueInvoices: 68400, overdueCount: 6,
  inventoryValue: 4060000, lowStock: 9,
  employees: 42, attendanceRate: 94.2, leaveRequests: 5, pendingApprovals: 7,
};
