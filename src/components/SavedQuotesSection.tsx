import React from 'react';
import { Download, Trash2 } from 'lucide-react';
import {
  PRINTER_MODELS,
  PrintQuoteBreakdown,
  PrintQuoteInputs,
  formatCurrency,
} from '../data/printers';

export interface SavedQuote {
  id: string;
  createdAt: string;
  currencySymbol: string;
  inputs: PrintQuoteInputs;
  breakdown: PrintQuoteBreakdown;
}

interface SavedQuotesSectionProps {
  quotes: SavedQuote[];
  onLoadQuote: (quote: SavedQuote) => void;
  onDeleteQuote: (id: string) => void;
  onSaveCurrentQuote: () => void;
}

export const SavedQuotesSection: React.FC<SavedQuotesSectionProps> = ({
  quotes,
  onLoadQuote,
  onDeleteQuote,
  onSaveCurrentQuote,
}) => {
  const handleExportCsv = () => {
    if (quotes.length === 0) return;

    const headers = [
      'Nome do Projeto',
      'Modelo da Impressora',
      'Peso (g)',
      'Horas',
      'Minutos',
      'Potência (W)',
      'Custo Filamento',
      'Custo Energia',
      'Custo Depreciação',
      'Custo Embalagem',
      'Custo Total',
      'Margem de Lucro (%)',
      'Preço Final de Venda',
    ];

    const rows = quotes.map((q) => {
      const printerName =
        PRINTER_MODELS.find((m) => m.id === q.inputs.printerModelId)?.name ??
        'Impressora Personalizada';
      return [
        `"${(q.inputs.jobName || 'Sem título').replace(/"/g, '""')}"`,
        `"${printerName}"`,
        q.inputs.weightGrams,
        q.inputs.printHours,
        q.inputs.printMinutes,
        q.inputs.powerWatts,
        q.breakdown.filamentCost.toFixed(2),
        q.breakdown.energyCost.toFixed(2),
        q.breakdown.depreciationCost.toFixed(2),
        q.breakdown.packagingCost.toFixed(2),
        q.breakdown.totalCost.toFixed(2),
        q.inputs.profitMarginPct,
        q.breakdown.finalRetailPrice.toFixed(2),
      ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'orcamentos-impressao-3d.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section id="saved-quotes" className="mt-12">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-slate-900">
            Histórico de Orçamentos Salvos
          </h2>
          <p className="mt-0.5 text-sm text-slate-600">
            Salve configurações para comparar preços de peças entre diferentes impressoras, materiais e margens.
          </p>
        </div>

        {quotes.length > 0 && (
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex min-h-[38px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Exportar CSV</span>
          </button>
        )}
      </div>

      {quotes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
          <p className="text-sm font-medium text-slate-900">
            Nenhum orçamento salvo ainda
          </p>
          <p className="mx-auto mt-1 max-w-md text-xs text-slate-500">
            Ajuste filamento, tempo de impressão, modelo da impressora e margem de lucro acima e salve um orçamento para comparar trabalhos lado a lado.
          </p>
          <button
            type="button"
            onClick={onSaveCurrentQuote}
            className="mt-4 inline-flex min-h-[40px] items-center rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-slate-800 cursor-pointer"
          >
            Salvar Orçamento Atual
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-medium text-slate-500">
                <th scope="col" className="px-4 py-3">
                  Peça / Impressora
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  Tempo · Peso
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  Custo Total
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  Margem
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  Preço de Venda
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quotes.map((quote) => {
                const printerName =
                  PRINTER_MODELS.find((m) => m.id === quote.inputs.printerModelId)
                    ?.name ?? 'Impressora Personalizada';
                return (
                  <tr
                    key={quote.id}
                    className="transition-colors hover:bg-slate-50/80"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">
                        {quote.inputs.jobName.trim() || 'Projeto sem título'}
                      </div>
                      <div className="text-xs text-slate-500">
                        {printerName} · {quote.createdAt}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-slate-700 tabular-nums">
                      {quote.inputs.printHours}h {quote.inputs.printMinutes}m ·{' '}
                      {quote.inputs.weightGrams}g
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-700 tabular-nums">
                      {formatCurrency(
                        quote.breakdown.totalCost,
                        quote.currencySymbol
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-700 tabular-nums">
                      {quote.inputs.profitMarginPct}%
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900 tabular-nums">
                      {formatCurrency(
                        quote.breakdown.finalRetailPrice,
                        quote.currencySymbol
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onLoadQuote(quote);
                            document
                              .getElementById('calculator')
                              ?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-900 hover:text-white cursor-pointer"
                        >
                          Carregar
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteQuote(quote.id)}
                          aria-label={`Excluir orçamento ${quote.inputs.jobName || 'sem título'}`}
                          className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
