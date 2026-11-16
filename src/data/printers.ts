export interface PrinterModel {
  id: string;
  name: string;
  manufacturer: string;
  purchasePrice: number;
  lifespanHours: number;
  typicalPowerWatts: number;
  notes: string;
}

export interface FilamentPreset {
  id: string;
  label: string;
  pricePerKg: number;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  label: string;
}

export const CURRENCIES: CurrencyConfig[] = [
  { code: 'BRL', symbol: 'R$', label: 'BRL (R$)' },
  { code: 'USD', symbol: '$', label: 'USD ($)' },
  { code: 'EUR', symbol: '€', label: 'EUR (€)' },
  { code: 'GBP', symbol: '£', label: 'GBP (£)' },
];

export const FILAMENT_PRESETS: FilamentPreset[] = [
  { id: 'pla', label: 'PLA', pricePerKg: 100 },
  { id: 'petg', label: 'PETG', pricePerKg: 120 },
  { id: 'abs', label: 'ABS / ASA', pricePerKg: 135 },
  { id: 'tpu', label: 'TPU 95A', pricePerKg: 165 },
  { id: 'pacf', label: 'Nylon PA-CF', pricePerKg: 320 },
];

export const PRINTER_MODELS: PrinterModel[] = [
  {
    id: 'bambu-a1-mini',
    name: 'Bambu Lab A1 mini',
    manufacturer: 'Bambu Lab',
    purchasePrice: 2200,
    lifespanHours: 2500,
    typicalPowerWatts: 95,
    notes: 'Compacta aberta · 180×180×180 mm',
  },
  {
    id: 'bambu-a1',
    name: 'Bambu Lab A1',
    manufacturer: 'Bambu Lab',
    purchasePrice: 3200,
    lifespanHours: 3000,
    typicalPowerWatts: 120,
    notes: 'Aberta padrão · 256×256×256 mm',
  },
  {
    id: 'bambu-p1s',
    name: 'Bambu Lab P1S',
    manufacturer: 'Bambu Lab',
    purchasePrice: 5800,
    lifespanHours: 4000,
    typicalPowerWatts: 150,
    notes: 'CoreXY fechada · 256×256×256 mm',
  },
  {
    id: 'bambu-x1c',
    name: 'Bambu Lab X1 Carbon',
    manufacturer: 'Bambu Lab',
    purchasePrice: 9500,
    lifespanHours: 5000,
    typicalPowerWatts: 180,
    notes: 'CoreXY de engenharia · 256×256×256 mm',
  },
  {
    id: 'prusa-mk4s',
    name: 'Prusa MK4S',
    manufacturer: 'Prusa Research',
    purchasePrice: 7500,
    lifespanHours: 5000,
    typicalPowerWatts: 120,
    notes: 'Mesa móvel robusta · 250×210×220 mm',
  },
  {
    id: 'prusa-xl-5t',
    name: 'Prusa XL (5 Cabeçotes)',
    manufacturer: 'Prusa Research',
    purchasePrice: 26000,
    lifespanHours: 6000,
    typicalPowerWatts: 260,
    notes: 'CoreXY multimaterial · 360×360×360 mm',
  },
  {
    id: 'creality-ender3-v3',
    name: 'Creality Ender-3 V3',
    manufacturer: 'Creality',
    purchasePrice: 1800,
    lifespanHours: 2000,
    typicalPowerWatts: 110,
    notes: 'CoreXZ de entrada · 220×220×250 mm',
  },
  {
    id: 'creality-k1c',
    name: 'Creality K1C',
    manufacturer: 'Creality',
    purchasePrice: 4200,
    lifespanHours: 3000,
    typicalPowerWatts: 180,
    notes: 'Fechada de alta velocidade · 220×220×250 mm',
  },
  {
    id: 'voron-24-350',
    name: 'Voron 2.4 (350 mm)',
    manufacturer: 'Voron Design',
    purchasePrice: 9000,
    lifespanHours: 6000,
    typicalPowerWatts: 240,
    notes: 'CoreXY fechada customizada · 350×350×330 mm',
  },
  {
    id: 'custom',
    name: 'Impressora Personalizada',
    manufacturer: 'Personalizada',
    purchasePrice: 4000,
    lifespanHours: 4000,
    typicalPowerWatts: 150,
    notes: 'Informe o valor e a vida útil da sua máquina',
  },
];

export interface PrintQuoteInputs {
  jobName: string;
  filamentPricePerKg: number;
  weightGrams: number;
  printHours: number;
  printMinutes: number;
  powerWatts: number;
  energyPricePerKwh: number;
  printerModelId: string;
  customPrinterPrice: number;
  customPrinterLifespan: number;
  packagingCost: number;
  profitMarginPct: number;
}

export interface PrintQuoteBreakdown {
  totalHours: number;
  filamentCost: number;
  energyKwh: number;
  energyCost: number;
  printerPurchasePrice: number;
  printerLifespanHours: number;
  hourlyDepreciation: number;
  depreciationCost: number;
  packagingCost: number;
  totalCost: number;
  profitAmount: number;
  finalRetailPrice: number;
  grossMarginOnRetailPct: number;
}

export const DEFAULT_INPUTS: PrintQuoteInputs = {
  jobName: 'Suporte de Fixação Personalizado',
  filamentPricePerKg: 110,
  weightGrams: 145,
  printHours: 4,
  printMinutes: 30,
  powerWatts: 150,
  energyPricePerKwh: 0.85,
  printerModelId: 'bambu-p1s',
  customPrinterPrice: 4000,
  customPrinterLifespan: 4000,
  packagingCost: 5.0,
  profitMarginPct: 100,
};

export function calculatePrintPricing(inputs: PrintQuoteInputs): PrintQuoteBreakdown {
  const safeFilamentPrice = Math.max(0, Number(inputs.filamentPricePerKg) || 0);
  const safeWeightGrams = Math.max(0, Number(inputs.weightGrams) || 0);
  const safeHours = Math.max(0, Number(inputs.printHours) || 0);
  const safeMinutes = Math.max(0, Math.min(59, Number(inputs.printMinutes) || 0));
  const safePowerWatts = Math.max(0, Number(inputs.powerWatts) || 0);
  const safeEnergyPrice = Math.max(0, Number(inputs.energyPricePerKwh) || 0);
  const safePackaging = Math.max(0, Number(inputs.packagingCost) || 0);
  const safeMarginPct = Math.max(30, Math.min(200, Number(inputs.profitMarginPct) || 30));

  const totalHours = safeHours + safeMinutes / 60;

  const filamentCost = (safeFilamentPrice / 1000) * safeWeightGrams;
  const energyKwh = (safePowerWatts / 1000) * totalHours;
  const energyCost = energyKwh * safeEnergyPrice;

  const selectedModel =
    PRINTER_MODELS.find((m) => m.id === inputs.printerModelId) ?? PRINTER_MODELS[2];

  const printerPurchasePrice =
    inputs.printerModelId === 'custom'
      ? Math.max(0, Number(inputs.customPrinterPrice) || 0)
      : selectedModel.purchasePrice;

  const printerLifespanHours =
    inputs.printerModelId === 'custom'
      ? Math.max(1, Number(inputs.customPrinterLifespan) || 1)
      : selectedModel.lifespanHours;

  const hourlyDepreciation = printerPurchasePrice / printerLifespanHours;
  const depreciationCost = hourlyDepreciation * totalHours;

  const totalCost = filamentCost + energyCost + depreciationCost + safePackaging;
  const profitAmount = totalCost * (safeMarginPct / 100);
  const finalRetailPrice = totalCost + profitAmount;
  const grossMarginOnRetailPct =
    finalRetailPrice > 0 ? (profitAmount / finalRetailPrice) * 100 : 0;

  return {
    totalHours,
    filamentCost,
    energyKwh,
    energyCost,
    printerPurchasePrice,
    printerLifespanHours,
    hourlyDepreciation,
    depreciationCost,
    packagingCost: safePackaging,
    totalCost,
    profitAmount,
    finalRetailPrice,
    grossMarginOnRetailPct,
  };
}

export function formatCurrency(amount: number, symbol: string, decimals = 2): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  return `${symbol} ${safe.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}
