import React from 'react';
import { BookmarkPlus, Check } from 'lucide-react';

interface TopBarProps {
  onSaveQuote: () => void;
  justSaved: boolean;
  savedCount: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  onSaveQuote,
  justSaved,
  savedCount,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-8 px-4 py-4 sm:px-6">
        <a
          href="#calculator"
          className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-600"
        >
          PrintLedger
        </a>

        <nav
          aria-label="Navegação principal"
          className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex"
        >
          <a
            href="#calculator"
            className="whitespace-nowrap shrink-0 transition-colors hover:text-slate-900 hover:underline hover:underline-offset-4"
          >
            Calculadora
          </a>
          <a
            href="#printer-fleet"
            className="whitespace-nowrap shrink-0 transition-colors hover:text-slate-900 hover:underline hover:underline-offset-4"
          >
            Impressoras
          </a>
          <a
            href="#saved-quotes"
            className="whitespace-nowrap shrink-0 transition-colors hover:text-slate-900 hover:underline hover:underline-offset-4"
          >
            Orçamentos Salvos{savedCount > 0 ? ` (${savedCount})` : ''}
          </a>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onSaveQuote}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {justSaved ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                <span>Salvo</span>
              </>
            ) : (
              <>
                <BookmarkPlus className="h-4 w-4" aria-hidden="true" />
                <span>Salvar Orçamento</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
