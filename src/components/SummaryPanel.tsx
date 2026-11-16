import React, { useState } from 'react';
import { Copy, Check, RotateCcw, BookmarkPlus } from 'lucide-react';
import {
  PRINTER_MODELS,
  PrintQuoteBreakdown,
  PrintQuoteInputs,
  formatCurrency,
} from '../data/printers';

interface SummaryPanelProps {
  inputs: PrintQuoteInputs;
  breakdown: PrintQuoteBreakdown;
  currencySymbol: string;
  onSaveQuote: () => void;
  onReset: () => void;
  justSaved: boolean;
}

export const SummaryPanel: React.FC<SummaryPanelProps> = ({
  inputs,
  breakdown,
  currencySymbol,
  onSaveQuote,
  onReset,
  justSaved,
}) => {
  const [batchQty, setBatchQty] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);

  const selectedModel =
    PRINTER_MODELS.find((m) => m.id === inputs.printerModelId) ?? PRINTER_MODELS[2];

  const retailBase = Math.max(breakdown.finalRetailPrice, 0.0001);
  const segments = [
    {
      id: 'filament',
      label: 'Filamento',
      value: breakdown.filamentCost,
      pct: (breakdown.filamentCost / retailBase) * 100,
      color: 'bg-slate-800',
    },
    {
      id: 'energy',
      label: 'Energia',
      value: breakdown.energyCost,
      pct: (breakdown.energyCost / retailBase) * 100,
      color: 'bg-amber-500',
    },
    {
      id: 'depreciation',
      label: 'Depreciação',
      value: breakdown.depreciationCost,
      pct: (breakdown.depreciationCost / retailBase) * 100,
      color: 'bg-sky-600',
    },
    {
      id: 'packaging',
      label: 'Embalagem',
      value: breakdown.packagingCost,
      pct: (breakdown.packagingCost / retailBase) * 100,
      color: 'bg-slate-400',
    },
    {
      id: 'profit',
      label: 'Lucro',
      value: breakdown.profitAmount,
      pct: (breakdown.profitAmount / retailBase) * 100,
      color: 'bg-orange-600',
    },
  ];

  const handleCopySummary = async () => {
    const label = inputs.jobName.trim() || 'Orçamento de Impressão 3D';
    const text = [
      `${label} (${selectedModel.name})`,
      `Tempo de Impressão: ${inputs.printHours}h ${inputs.printMinutes}m (${breakdown.totalHours.toFixed(2).replace('.', ',')} h)`,
      `Peso: ${inputs.weightGrams} g @ ${formatCurrency(inputs.filamentPricePerKg, currencySymbol)}/kg`,
      `---`,
      `Filamento: ${formatCurrency(breakdown.filamentCost, currencySymbol)}`,
      `Energia Elétrica (${inputs.powerWatts}W @ ${formatCurrency(inputs.energyPricePerKwh, currencySymbol)}/kWh): ${formatCurrency(breakdown.energyCost, currencySymbol)}`,
      `Depreciação da Impressora: ${formatCurrency(breakdown.depreciationCost, currencySymbol)}`,
      `Embalagem: ${formatCurrency(breakdown.packagingCost, currencySymbol)}`,
      `Custo Total: ${formatCurrency(breakdown.totalCost, currencySymbol)}`,
      `Lucro (${inputs.profitMarginPct}%): ${formatCurrency(breakdown.profitAmount, currencySymbol)}`,
      `Preço Final de Venda: ${formatCurrency(breakdown.finalRetailPrice, currencySymbol)}`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback caso a área de transferência esteja bloqueada
    }
  };

  return (
    <aside
      aria-label="Resumo de Preço"
      className="rounded-xl border border-slate-200 bg-white lg:sticky lg:top-6"
    >
      {/* Cabeçalho com Totais Principais */}
      <div className="border-b border-slate-200 p-6 sm:p-7">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-display text-base font-semibold text-slate-900">
            Resumo do Orçamento
          </h2>
          <span className="truncate text-xs text-slate-500 max-w-[180px]">
            {inputs.jobName.trim() || 'Projeto sem título'}
          </span>
        </div>

        {/* KPI Principal: Custo Total e Preço Final de Venda */}
        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5">
          <div>
            <span className="block text-xs font-medium text-slate-500">
              Custo Total
            </span>
            <p className="mt-1 font-mono text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">
              {formatCurrency(breakdown.totalCost, currencySymbol)}
            </p>
            <span className="mt-1 block text-xs text-slate-500">
              Ponto de equilíbrio
            </span>
          </div>

          <div className="text-right">
            <span className="block text-xs font-medium text-orange-700">
              Preço Final de Venda
            </span>
            <p className="mt-1 font-mono text-3xl font-bold tracking-tight text-slate-900 tabular-nums sm:text-4xl">
              {formatCurrency(breakdown.finalRetailPrice, currencySymbol)}
            </p>
            <span className="mt-1 block font-mono text-xs text-slate-600 tabular-nums">
              +{formatCurrency(breakdown.profitAmount, currencySymbol)} lucro ({inputs.profitMarginPct}%)
            </span>
          </div>
        </div>
      </div>

      {/* Barra Empilhada de Composição do Preço */}
      <div className="border-b border-slate-200 px-6 py-5 sm:px-7">
        <div className="mb-2.5 flex items-center justify-between text-xs text-slate-600">
          <span className="font-medium text-slate-700">Composição do Preço</span>
          <span className="font-mono tabular-nums">
            {breakdown.grossMarginOnRetailPct.toFixed(1).replace('.', ',')}% margem bruta
          </span>
        </div>

        <div
          className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100"
          role="img"
          aria-label="Barra de composição de custos e lucro"
        >
          {segments.map((seg) =>
            seg.pct > 0 ? (
              <div
                key={seg.id}
                style={{ width: `${seg.pct}%` }}
                className={`${seg.color} transition-all duration-150`}
                title={`${seg.label}: ${formatCurrency(seg.value, currencySymbol)} (${seg.pct.toFixed(1).replace('.', ',')}%)`}
              />
            ) : null
          )}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs sm:grid-cols-3">
          {segments.map((seg) => (
            <div key={seg.id} className="flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className={`h-2 w-2 shrink-0 rounded-[2px] ${seg.color}`}
                  aria-hidden="true"
                />
                <span className="truncate text-slate-600">{seg.label}</span>
              </div>
              <span className="font-mono text-slate-800 tabular-nums">
                {breakdown.finalRetailPrice > 0 ? `${seg.pct.toFixed(0)}%` : '0%'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Detalhamento de Custos */}
      <div className="border-b border-slate-200 px-6 py-5 sm:px-7">
        <h3 className="mb-3 text-xs font-semibold tracking-wide text-slate-500">
          Detalhamento de Custos
        </h3>

        <dl className="space-y-2.5 text-sm">
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-slate-600">
              Filamento{' '}
              <span className="font-mono text-xs text-slate-400 tabular-nums">
                ({inputs.weightGrams}g @ {formatCurrency(inputs.filamentPricePerKg, currencySymbol)}/kg)
              </span>
            </dt>
            <dd className="font-mono font-medium text-slate-900 tabular-nums shrink-0">
              {formatCurrency(breakdown.filamentCost, currencySymbol)}
            </dd>
          </div>

          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-slate-600">
              Energia Elétrica{' '}
              <span className="font-mono text-xs text-slate-400 tabular-nums">
                ({breakdown.energyKwh.toFixed(2).replace('.', ',')} kWh @ {formatCurrency(inputs.energyPricePerKwh, currencySymbol)})
              </span>
            </dt>
            <dd className="font-mono font-medium text-slate-900 tabular-nums shrink-0">
              {formatCurrency(breakdown.energyCost, currencySymbol)}
            </dd>
          </div>

          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-slate-600">
              Depreciação{' '}
              <span className="font-mono text-xs text-slate-400 tabular-nums">
                ({breakdown.totalHours.toFixed(2).replace('.', ',')}h @ {formatCurrency(breakdown.hourlyDepreciation, currencySymbol, 3)}/h)
              </span>
            </dt>
            <dd className="font-mono font-medium text-slate-900 tabular-nums shrink-0">
              {formatCurrency(breakdown.depreciationCost, currencySymbol)}
            </dd>
          </div>

          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-slate-600">Embalagem</dt>
            <dd className="font-mono font-medium text-slate-900 tabular-nums shrink-0">
              {formatCurrency(breakdown.packagingCost, currencySymbol)}
            </dd>
          </div>

          <div className="flex items-baseline justify-between gap-4 border-t border-slate-200 pt-2.5 font-medium">
            <dt className="text-slate-900">Custo Total</dt>
            <dd className="font-mono text-slate-900 tabular-nums shrink-0">
              {formatCurrency(breakdown.totalCost, currencySymbol)}
            </dd>
          </div>

          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-slate-600">
              Margem de Lucro{' '}
              <span className="font-mono text-xs text-slate-400 tabular-nums">
                (+{inputs.profitMarginPct}%)
              </span>
            </dt>
            <dd className="font-mono font-medium text-orange-700 tabular-nums shrink-0">
              +{formatCurrency(breakdown.profitAmount, currencySymbol)}
            </dd>
          </div>

          <div className="flex items-baseline justify-between gap-4 border-t border-slate-200 pt-3">
            <dt className="font-display text-base font-semibold text-slate-900">
              Preço Final de Venda
            </dt>
            <dd className="font-mono text-lg font-bold text-slate-900 tabular-nums shrink-0">
              {formatCurrency(breakdown.finalRetailPrice, currencySymbol)}
            </dd>
          </div>
        </dl>
      </div>

      {/* Simulação de Lote e Ações */}
      <div className="p-6 sm:p-7">
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-slate-600">
            Simulação em Lote
          </span>
          <div
            className="flex items-center gap-1 rounded-lg bg-slate-100 p-1"
            role="group"
            aria-label="Multiplicador de lote"
          >
            {[1, 5, 10, 25].map((qty) => (
              <button
                key={qty}
                type="button"
                onClick={() => setBatchQty(qty)}
                className={`rounded-md px-2.5 py-1 font-mono text-xs font-medium tabular-nums transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  batchQty === qty
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {qty}×
              </button>
            ))}
          </div>
        </div>

        {batchQty > 1 && (
          <div className="mb-4 flex items-center justify-between rounded-lg bg-slate-50 px-3.5 py-2.5 text-xs">
            <span className="text-slate-600">
              {batchQty} unid. · Custo{' '}
              <span className="font-mono font-medium text-slate-900 tabular-nums">
                {formatCurrency(breakdown.totalCost * batchQty, currencySymbol)}
              </span>
            </span>
            <span className="font-mono font-semibold text-slate-900 tabular-nums">
              {formatCurrency(breakdown.finalRetailPrice * batchQty, currencySymbol)} venda
            </span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onSaveQuote}
            className="inline-flex min-h-[42px] flex-1 items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 whitespace-nowrap cursor-pointer"
          >
            {justSaved ? (
              <>
                <Check className="h-4 w-4" aria-hidden="true" />
                <span>Salvo no Histórico</span>
              </>
            ) : (
              <>
                <BookmarkPlus className="h-4 w-4" aria-hidden="true" />
                <span>Salvar Orçamento</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleCopySummary}
            className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                <span>Copiado</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" aria-hidden="true" />
                <span>Copiar</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onReset}
            aria-label="Restaurar valores padrão"
            title="Restaurar padrões"
            className="inline-flex min-h-[42px] items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors duration-150 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  );
};
