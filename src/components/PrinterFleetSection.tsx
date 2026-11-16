import React from 'react';
import { PRINTER_MODELS, formatCurrency } from '../data/printers';

interface PrinterFleetSectionProps {
  selectedPrinterId: string;
  currencySymbol: string;
  onSelectPrinter: (modelId: string) => void;
}

export const PrinterFleetSection: React.FC<PrinterFleetSectionProps> = ({
  selectedPrinterId,
  currencySymbol,
  onSelectPrinter,
}) => {
  const catalogPrinters = PRINTER_MODELS.filter((m) => m.id !== 'custom');

  return (
    <section id="printer-fleet" className="mt-12">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="font-display text-lg font-semibold text-slate-900">
            Tabela de Depreciação por Impressora
          </h2>
          <p className="mt-0.5 text-sm text-slate-600">
            Selecione qualquer modelo abaixo para aplicar sua taxa de depreciação por hora e consumo médio na calculadora.
          </p>
        </div>
        <span className="text-xs text-slate-500">
          {catalogPrinters.length} perfis de referência
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[680px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-medium text-slate-500">
              <th scope="col" className="px-4 py-3">
                Modelo da Impressora
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                Valor da Máquina
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                Vida Útil
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                Depreciação / h
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                Potência Média
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                Ação
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {catalogPrinters.map((model) => {
              const hourlyRate = model.purchasePrice / model.lifespanHours;
              const isSelected = model.id === selectedPrinterId;
              return (
                <tr
                  key={model.id}
                  className={`transition-colors ${
                    isSelected ? 'bg-orange-50/50' : 'hover:bg-slate-50/80'
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{model.name}</div>
                    <div className="text-xs text-slate-500">{model.notes}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-700 tabular-nums">
                    {formatCurrency(model.purchasePrice, currencySymbol, 0)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-700 tabular-nums">
                    {model.lifespanHours.toLocaleString('pt-BR')} h
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-medium text-slate-900 tabular-nums">
                    {formatCurrency(hourlyRate, currencySymbol, 3)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-700 tabular-nums">
                    {model.typicalPowerWatts} W
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectPrinter(model.id);
                        document
                          .getElementById('calculator')
                          ?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        isSelected
                          ? 'bg-orange-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-900 hover:text-white'
                      }`}
                    >
                      {isSelected ? 'Selecionada' : 'Usar Modelo'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};
