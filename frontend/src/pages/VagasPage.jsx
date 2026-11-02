import Icon from '../components/Icon';
import LinkedInJobsSection from '../components/LinkedInJobsSection';

export default function VagasPage({
  usuario,
  vagasLinkedIn = [],
  analiseLinkedIn = null,
  onVagasLinkedInAtualizadas,
  onIrParaAnalisePerfil,
  onNotify,
}) {
  return (
    <div className="space-y-6">
      <section className="theme-surface border rounded-2xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full theme-badge-soft">
              <Icon name="link" className="w-3.5 h-3.5" />
              Integração Externa LinkedIn Jobs
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Vagas no LinkedIn
            </h1>
            <p className="text-sm theme-text-secondary max-w-2xl">
              Busque oportunidades reais de estágio, trainee e emprego diretamente no LinkedIn de
              acordo com seu curso, áreas de interesse e competências detectadas no seu perfil.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onIrParaAnalisePerfil}
              className="theme-btn-primary px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition cursor-pointer"
            >
              <Icon name="person" className="w-4 h-4" />
              <span>{analiseLinkedIn ? 'Meu Diagnóstico LinkedIn' : 'Analisar meu LinkedIn'}</span>
            </button>
          </div>
        </div>
      </section>

      <LinkedInJobsSection
        usuario={usuario}
        analiseLinkedIn={analiseLinkedIn}
        vagasLinkedIn={vagasLinkedIn}
        onVagasAtualizadas={onVagasLinkedInAtualizadas}
        onIrParaAnalisePerfil={onIrParaAnalisePerfil}
        onNotify={onNotify}
      />
    </div>
  );
}

