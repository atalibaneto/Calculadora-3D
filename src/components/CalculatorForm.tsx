import React from 'react';
import { RotateCcw } from 'lucide-react';
import {
  FILAMENT_PRESETS,
  PRINTER_MODELS,
  PrintQuoteBreakdown,
  PrintQuoteInputs,
  formatCurrency,
} from '../data/printers';

interface CalculatorFormProps {
  inputs: PrintQuoteInputs;
  breakdown: PrintQuoteBreakdown;
  currencySymbol: string;
  onChange: <K extends keyof PrintQuoteInputs>(field: K, value: PrintQuoteInputs[K]) => void;
  onSelectPrinterModel: (modelId: string) => void;
  onSyncPowerFromModel: () => void;
}

export const CalculatorForm: React.FC<CalculatorFormProps> = ({
  inputs,
  breakdown,
  currencySymbol,
  onChange,
  onSelectPrinterModel,
  onSyncPowerFromModel,
}) => {
  const selectedModel =
    PRINTER_MODELS.find((m) => m.id === inputs.printerModelId) ?? PRINTER_MODELS[2];

  const isPowerModified =
    inputs.printerModelId !== 'custom' &&
    inputs.powerWatts !== selectedModel.typicalPowerWatts;

  const sliderPercent = ((inputs.profitMarginPct - 30) / (200 - 30)) * 100;

  const handleNumberInput = (
    field: keyof PrintQuoteInputs,
    raw: string,
    opts?: { min?: number; max?: number; integer?: boolean }
  ) => {
    if (raw === '') {
      onChange(field, 0 as PrintQuoteInputs[typeof field]);
      return;
    }
    let parsed = opts?.integer ? parseInt(raw, 10) : parseFloat(raw);
    if (Number.isNaN(parsed)) parsed = 0;
    if (opts?.min !== undefined) parsed = Math.max(opts.min, parsed);
    if (opts?.max !== undefined) parsed = Math.min(opts.max, parsed);
    onChange(field, parsed as PrintQuoteInputs[typeof field]);
  };

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="rounded-xl border border-slate-200 bg-white"
      aria-label="Parâmetros de custo da impressão 3D"
    >
      {/* Seção 1: Material e Tempo de Impressão */}
      <div className="p-6 sm:p-7">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-base font-semibold text-slate-900">
            01. Material e Tempo de Impressão
          </h2>
          <span className="text-xs text-slate-500">
            Valor do carretel, peso da peça e duração
          </span>
        </div>

        <div className="space-y-5">
          {/* Nome do Projeto */}
          <div>
            <label
              htmlFor="job-name"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Nome da Peça ou Projeto
            </label>
            <input
              id="job-name"
              type="text"
              value={inputs.jobName}
              onChange={(e) => onChange('jobName', e.target.value)}
              placeholder="ex: Suporte de Fixação Personalizado"
              className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-600/15"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Preço do Filamento */}
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <label
                  htmlFor="filament-price"
                  className="text-sm font-medium text-slate-700"
                >
                  Preço do Filamento
                </label>
                <span className="text-xs text-slate-500">por rolo de 1 kg</span>
              </div>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 font-mono text-sm text-slate-500">
                  {currencySymbol}
                </span>
                <input
                  id="filament-price"
                  type="number"
                  min={0}
                  step="0.5"
                  value={inputs.filamentPricePerKg}
                  onChange={(e) =>
                    handleNumberInput('filamentPricePerKg', e.target.value, { min: 0 })
                  }
                  className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-14 font-mono text-sm text-slate-900 tabular-nums transition-colors focus:border-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-600/15"
                />
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-xs font-medium text-slate-400">
                  / kg
                </span>
              </div>

              {/* Atalhos Rápidos de Filamento */}
              <div
                className="mt-2.5 flex flex-wrap gap-1.5"
                role="group"
                aria-label="Preços sugeridos de filamento"
              >
                {FILAMENT_PRESETS.map((preset) => {
                  const active = Math.abs(inputs.filamentPricePerKg - preset.pricePerKg) < 0.01;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => onChange('filamentPricePerKg', preset.pricePerKg)}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        active
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                      }`}
                    >
                      {preset.label} · {currencySymbol} {preset.pricePerKg}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Peso em Gramas */}
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <label
                  htmlFor="weight-grams"
                  className="text-sm font-medium text-slate-700"
                >
                  Peso em Gramas
                </label>
                <span className="font-mono text-xs text-slate-500 tabular-nums">
                  {formatCurrency(breakdown.filamentCost, currencySymbol)} material
                </span>
              </div>
              <div className="relative">
                <input
                  id="weight-grams"
                  type="number"
                  min={0}
                  step="1"
                  value={inputs.weightGrams}
                  onChange={(e) =>
                    handleNumberInput('weightGrams', e.target.value, { min: 0 })
                  }
                  className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white py-2 pl-3.5 pr-16 font-mono text-sm text-slate-900 tabular-nums transition-colors focus:border-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-600/15"
                />
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-xs font-medium text-slate-400">
                  gramas
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Inclua suportes, borda (brim) e torre de purga do fatiador.
              </p>
            </div>
          </div>

          {/* Tempo de Impressão: Campos Separados de Horas e Minutos */}
          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-slate-700">
                Tempo de Impressão
              </span>
              <span className="font-mono text-xs text-slate-500 tabular-nums">
                {breakdown.totalHours.toFixed(2).replace('.', ',')} h no total
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="print-hours"
                  className="sr-only"
                >
                  Horas de Impressão
                </label>
                <div className="relative">
                  <input
                    id="print-hours"
                    type="number"
                    min={0}
                    step={1}
                    value={inputs.printHours}
                    onChange={(e) =>
                      handleNumberInput('printHours', e.target.value, {
                        min: 0,
                        integer: true,
                      })
                    }
                    className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white py-2 pl-3.5 pr-14 font-mono text-sm text-slate-900 tabular-nums transition-colors focus:border-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-600/15"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-xs font-medium text-slate-500">
                    horas
                  </span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="print-minutes"
                  className="sr-only"
                >
                  Minutos de Impressão
                </label>
                <div className="relative">
                  <input
                    id="print-minutes"
                    type="number"
                    min={0}
                    max={59}
                    step={1}
                    value={inputs.printMinutes}
                    onChange={(e) =>
                      handleNumberInput('printMinutes', e.target.value, {
                        min: 0,
                        max: 59,
                        integer: true,
                      })
                    }
                    className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white py-2 pl-3.5 pr-16 font-mono text-sm text-slate-900 tabular-nums transition-colors focus:border-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-600/15"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-xs font-medium text-slate-500">
                    minutos
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Divisor */}
      <div className="border-t border-slate-200" />

      {/* Seção 2: Depreciação da Impressora e Energia */}
      <div className="p-6 sm:p-7">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-base font-semibold text-slate-900">
            02. Depreciação da Impressora e Energia
          </h2>
          <span className="text-xs text-slate-500">
            Desgaste do equipamento e consumo elétrico
          </span>
        </div>

        <div className="space-y-5">
          {/* Modelo da Impressora */}
          <div>
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="printer-model"
                className="text-sm font-medium text-slate-700"
              >
                Modelo da Impressora (Depreciação)
              </label>
              <span className="font-mono text-xs text-slate-600 tabular-nums">
                {formatCurrency(breakdown.hourlyDepreciation, currencySymbol, 3)} / h
              </span>
            </div>

            <select
              id="printer-model"
              value={inputs.printerModelId}
              onChange={(e) => onSelectPrinterModel(e.target.value)}
              className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 transition-colors focus:border-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-600/15 cursor-pointer"
            >
              {PRINTER_MODELS.map((model) => {
                const hourly = model.purchasePrice / model.lifespanHours;
                return (
                  <option key={model.id} value={model.id}>
                    {model.name} — {currencySymbol} {hourly.toFixed(3).replace('.', ',')}/h ({model.typicalPowerWatts}W méd.)
                  </option>
                );
              })}
            </select>

            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
              <span>{selectedModel.notes}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {formatCurrency(breakdown.printerPurchasePrice, currencySymbol, 0)} ÷{' '}
                {breakdown.printerLifespanHours.toLocaleString('pt-BR')} h de vida útil
              </span>
            </div>

            {/* Campos Personalizados quando Impressora Personalizada está selecionada */}
            {inputs.printerModelId === 'custom' && (
              <div className="mt-4 grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="custom-printer-price"
                    className="mb-1.5 block text-xs font-medium text-slate-700"
                  >
                    Valor da Impressora
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 font-mono text-sm text-slate-500">
                      {currencySymbol}
                    </span>
                    <input
                      id="custom-printer-price"
                      type="number"
                      min={0}
                      step={50}
                      value={inputs.customPrinterPrice}
                      onChange={(e) =>
                        handleNumberInput('customPrinterPrice', e.target.value, { min: 0 })
                      }
                      className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-3.5 font-mono text-sm text-slate-900 tabular-nums transition-colors focus:border-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-600/15"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="custom-printer-lifespan"
                    className="mb-1.5 block text-xs font-medium text-slate-700"
                  >
                    Vida Útil Estimada (Horas)
                  </label>
                  <div className="relative">
                    <input
                      id="custom-printer-lifespan"
                      type="number"
                      min={1}
                      step={100}
                      value={inputs.customPrinterLifespan}
                      onChange={(e) =>
                        handleNumberInput('customPrinterLifespan', e.target.value, {
                          min: 1,
                          integer: true,
                        })
                      }
                      className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white py-2 pl-3.5 pr-14 font-mono text-sm text-slate-900 tabular-nums transition-colors focus:border-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-600/15"
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-xs font-medium text-slate-400">
                      horas
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Potência e Tarifa de Energia */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <label
                  htmlFor="printer-power"
                  className="text-sm font-medium text-slate-700"
                >
                  Potência da Impressora
                </label>
                {isPowerModified ? (
                  <button
                    type="button"
                    onClick={onSyncPowerFromModel}
                    className="inline-flex items-center gap-1 text-xs font-medium text-orange-700 hover:text-orange-800 cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" aria-hidden="true" />
                    <span>Usar {selectedModel.typicalPowerWatts}W</span>
                  </button>
                ) : (
                  <span className="font-mono text-xs text-slate-500 tabular-nums">
                    {breakdown.energyKwh.toFixed(2).replace('.', ',')} kWh gastos
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  id="printer-power"
                  type="number"
                  min={0}
                  step={5}
                  value={inputs.powerWatts}
                  onChange={(e) =>
                    handleNumberInput('powerWatts', e.target.value, { min: 0 })
                  }
                  className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white py-2 pl-3.5 pr-16 font-mono text-sm text-slate-900 tabular-nums transition-colors focus:border-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-600/15"
                />
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-xs font-medium text-slate-400">
                  Watts
                </span>
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <label
                  htmlFor="energy-price"
                  className="text-sm font-medium text-slate-700"
                >
                  Preço da Energia (kWh)
                </label>
                <span className="font-mono text-xs text-slate-500 tabular-nums">
                  {formatCurrency(breakdown.energyCost, currencySymbol)} energia
                </span>
              </div>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 font-mono text-sm text-slate-500">
                  {currencySymbol}
                </span>
                <input
                  id="energy-price"
                  type="number"
                  min={0}
                  step="0.01"
                  value={inputs.energyPricePerKwh}
                  onChange={(e) =>
                    handleNumberInput('energyPricePerKwh', e.target.value, { min: 0 })
                  }
                  className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-14 font-mono text-sm text-slate-900 tabular-nums transition-colors focus:border-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-600/15"
                />
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-xs font-medium text-slate-400">
                  / kWh
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Divisor */}
      <div className="border-t border-slate-200" />

      {/* Seção 3: Embalagem e Margem de Lucro */}
      <div className="p-6 sm:p-7">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-base font-semibold text-slate-900">
            03. Embalagem e Margem de Lucro
          </h2>
          <span className="text-xs text-slate-500">
            Custo de envio e margem sobre o custo total
          </span>
        </div>

        <div className="space-y-6">
          {/* Embalagem */}
          <div className="max-w-xs">
            <label
              htmlFor="packaging-cost"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Embalagem
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 font-mono text-sm text-slate-500">
                {currencySymbol}
              </span>
              <input
                id="packaging-cost"
                type="number"
                min={0}
                step="0.5"
                value={inputs.packagingCost}
                onChange={(e) =>
                  handleNumberInput('packagingCost', e.target.value, { min: 0 })
                }
                className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-16 font-mono text-sm text-slate-900 tabular-nums transition-colors focus:border-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-600/15"
              />
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-xs font-medium text-slate-400">
                / unid.
              </span>
            </div>
          </div>

          {/* Barra Deslizante de Margem de Lucro (30% a 200%) */}
          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <label
                  htmlFor="profit-margin-slider"
                  className="block text-sm font-medium text-slate-700"
                >
                  Margem de Lucro
                </label>
                <span className="text-xs text-slate-500">
                  Deslize entre 30% e 200% de acréscimo sobre o custo total
                </span>
              </div>

              <div className="relative w-28">
                <label htmlFor="profit-margin-input" className="sr-only">
                  Percentual da Margem de Lucro
                </label>
                <input
                  id="profit-margin-input"
                  type="number"
                  min={30}
                  max={200}
                  step={1}
                  value={inputs.profitMarginPct}
                  onChange={(e) =>
                    handleNumberInput('profitMarginPct', e.target.value, {
                      min: 30,
                      max: 200,
                      integer: true,
                    })
                  }
                  className="min-h-[40px] w-full rounded-lg border border-slate-300 bg-white py-1.5 pl-3 pr-8 text-right font-mono text-base font-semibold text-orange-700 tabular-nums transition-colors focus:border-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-600/15"
                />
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 font-mono text-sm font-medium text-slate-500">
                  %
                </span>
              </div>
            </div>

            <input
              id="profit-margin-slider"
              type="range"
              min={30}
              max={200}
              step={1}
              value={inputs.profitMarginPct}
              onChange={(e) =>
                onChange('profitMarginPct', Number(e.target.value))
              }
              style={{
                background: `linear-gradient(to right, #ea580c 0%, #ea580c ${sliderPercent}%, #e2e8f0 ${sliderPercent}%, #e2e8f0 100%)`,
              }}
              className="margin-slider"
            />

            <div className="mt-2 flex items-center justify-between font-mono text-xs text-slate-500 tabular-nums">
              <span>30%</span>
              <span>75%</span>
              <span>115%</span>
              <span>160%</span>
              <span>200%</span>
            </div>

            {/* Atalhos Rápidos de Margem */}
            <div
              className="mt-3 flex flex-wrap gap-1.5"
              role="group"
              aria-label="Atalhos de margem de lucro"
            >
              {[30, 50, 100, 150, 200].map((pct) => {
                const active = inputs.profitMarginPct === pct;
                return (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => onChange('profitMarginPct', pct)}
                    className={`rounded-md px-3 py-1.5 font-mono text-xs font-medium tabular-nums transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      active
                        ? 'bg-orange-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    {pct}%
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
