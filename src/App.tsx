import { useEffect, useMemo, useState } from 'react';
import { CalculatorForm } from './components/CalculatorForm';
import { PrinterFleetSection } from './components/PrinterFleetSection';
import { SavedQuote, SavedQuotesSection } from './components/SavedQuotesSection';
import { SummaryPanel } from './components/SummaryPanel';
import { TopBar } from './components/TopBar';
import {
  CURRENCIES,
  DEFAULT_INPUTS,
  PRINTER_MODELS,
  PrintQuoteInputs,
  calculatePrintPricing,
} from './data/printers';

const STORAGE_KEY = 'printledger_saved_quotes_v1';

export default function App() {
  const [inputs, setInputs] = useState<PrintQuoteInputs>(DEFAULT_INPUTS);
  const [currencyCode, setCurrencyCode] = useState<string>('BRL');
  const [justSaved, setJustSaved] = useState<boolean>(false);
  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Ignora erro de leitura no armazenamento local
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedQuotes));
    } catch {
      // Ignora erro de escrita no armazenamento local
    }
  }, [savedQuotes]);

  const currency = useMemo(
    () => CURRENCIES.find((c) => c.code === currencyCode) ?? CURRENCIES[0],
    [currencyCode]
  );

  const breakdown = useMemo(() => calculatePrintPricing(inputs), [inputs]);

  const handleFieldChange = <K extends keyof PrintQuoteInputs>(
    field: K,
    value: PrintQuoteInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectPrinterModel = (modelId: string) => {
    const model = PRINTER_MODELS.find((m) => m.id === modelId);
    setInputs((prev) => ({
      ...prev,
      printerModelId: modelId,
      powerWatts: model ? model.typicalPowerWatts : prev.powerWatts,
    }));
  };

  const handleSyncPowerFromModel = () => {
    const model = PRINTER_MODELS.find((m) => m.id === inputs.printerModelId);
    if (model) {
      setInputs((prev) => ({ ...prev, powerWatts: model.typicalPowerWatts }));
    }
  };

  const handleReset = () => {
    setInputs(DEFAULT_INPUTS);
  };

  const handleSaveQuote = () => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

    const newQuote: SavedQuote = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: formattedDate,
      currencySymbol: currency.symbol,
      inputs: { ...inputs },
      breakdown: { ...breakdown },
    };

    setSavedQuotes((prev) => [newQuote, ...prev]);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1800);
  };

  const handleLoadQuote = (quote: SavedQuote) => {
    setInputs({ ...quote.inputs });
    const matchingCurrency = CURRENCIES.find(
      (c) => c.symbol === quote.currencySymbol
    );
    if (matchingCurrency) {
      setCurrencyCode(matchingCurrency.code);
    }
  };

  const handleDeleteQuote = (id: string) => {
    setSavedQuotes((prev) => prev.filter((q) => q.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#F5F6F8] text-slate-900">
      <TopBar
        onSaveQuote={handleSaveQuote}
        justSaved={justSaved}
        savedCount={savedQuotes.length}
      />

      <main className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 sm:py-10">
        {/* Título da Área de Trabalho e Seletor de Moeda */}
        <section id="calculator" className="mb-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl text-balance">
                Calculadora de Preço para Impressão 3D
              </h1>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                Calcule o custo real de produção e o preço final de venda considerando filamento, tempo de impressão, energia elétrica, depreciação da impressora, embalagem e margem de lucro.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-medium text-slate-500">Moeda</span>
              <div
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1"
                role="group"
                aria-label="Seletor de moeda"
              >
                {CURRENCIES.map((curr) => {
                  const active = curr.code === currencyCode;
                  return (
                    <button
                      key={curr.code}
                      type="button"
                      onClick={() => setCurrencyCode(curr.code)}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        active
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      {curr.code}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Grade Principal de 2 Colunas: Calculadora e Resumo */}
        <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <CalculatorForm
              inputs={inputs}
              breakdown={breakdown}
              currencySymbol={currency.symbol}
              onChange={handleFieldChange}
              onSelectPrinterModel={handleSelectPrinterModel}
              onSyncPowerFromModel={handleSyncPowerFromModel}
            />
          </div>

          <div className="lg:col-span-5">
            <SummaryPanel
              inputs={inputs}
              breakdown={breakdown}
              currencySymbol={currency.symbol}
              onSaveQuote={handleSaveQuote}
              onReset={handleReset}
              justSaved={justSaved}
            />
          </div>
        </div>

        <PrinterFleetSection
          selectedPrinterId={inputs.printerModelId}
          currencySymbol={currency.symbol}
          onSelectPrinter={handleSelectPrinterModel}
        />

        <SavedQuotesSection
          quotes={savedQuotes}
          onLoadQuote={handleLoadQuote}
          onDeleteQuote={handleDeleteQuote}
          onSaveCurrentQuote={handleSaveQuote}
        />
      </main>

      <footer className="mt-14 border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-4 py-5 text-xs text-slate-500 sm:px-6">
          <span>PrintLedger · Estimativa de Custo e Margem para Impressão 3D</span>
          <span>
            Fórmula: (Filamento + Energia + Depreciação + Embalagem) × (1 + Margem de Lucro %)
          </span>
        </div>
      </footer>
    </div>
  );
}
