import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { googleApi, AppContact } from '../services/googleApi';
import { googleAuth } from '../services/googleAuth';

interface DashboardContact {
  id: string;
  name: string;
  score: number;
  tier: number;
}

export default function Dashboard() {
  const [activeSphere, setActiveSphere] = useState<'PRIVAT' | 'BUSINESS'>('PRIVAT');
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const [contacts, setContacts] = useState<AppContact[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchContacts = async () => {
      if (googleAuth.isAuthenticated()) {
        setIsLoading(true);
        try {
          const data = await googleApi.fetchContacts();
          setContacts(data);
        } catch (error) {
          console.error("Failed to load contacts for dashboard", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchContacts();
  }, []);

  const categorizedContacts = useMemo(() => {
    const result: Record<'PRIVAT' | 'BUSINESS', DashboardContact[]> = { PRIVAT: [], BUSINESS: [] };

    contacts.forEach(contact => {
      if (contact.evaluationHistory && contact.evaluationHistory.length > 0) {
        const latest = contact.evaluationHistory[0];
        const entry = {
          id: contact.id,
          name: `${contact.firstName} ${contact.lastName}`.trim(),
          score: latest.score,
          tier: latest.tier
        };

        if (latest.sphere === 'PRIVAT') result.PRIVAT.push(entry);
        else if (latest.sphere === 'BUSINESS') result.BUSINESS.push(entry);
      }
    });

    return result;
  }, [contacts]);

  const activeContacts = categorizedContacts[activeSphere];

  const getTierCount = (sphere: 'PRIVAT' | 'BUSINESS', tier: number) => {
    return categorizedContacts[sphere].filter(c => c.tier === tier).length;
  };

  const displayedContacts = selectedTier
      ? activeContacts.filter(c => c.tier === selectedTier)
      : activeContacts;

  const tierLabels: Record<number, {title: string, desc: string}> = {
    1: { title: 'Stufe 1: Kern-Netzwerk', desc: 'Absolute Vertrauenspersonen & Top-Multiplikatoren (Score ≥ 80%)' },
    2: { title: 'Stufe 2: Strategische Kontakte', desc: 'Wichtige Unterstützer & regelmäßiger Austausch (Score 60-79%)' },
    3: { title: 'Stufe 3: Erweitertes Netzwerk', desc: 'Gelegentlicher Kontakt & lose Synergien (Score 40-59%)' },
    4: { title: 'Stufe 4: Lose Bekanntschaften', desc: 'Reine Beobachter oder reaktivierte Kontakte (Score < 40%)' },
  };

  if (!googleAuth.isAuthenticated()) {
    return (
        <div className="hero min-h-[60vh] bg-base-100 rounded-3xl border border-base-300 shadow-sm mt-4">
          <div className="hero-content text-center max-w-2xl">
            <div>
              <span className="text-6xl block mb-6 animate-bounce">🕸️</span>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                Willkommen beim <span className="text-primary">Network Tracker</span>
              </h1>
              <p className="py-6 text-lg text-base-content/70">
                Analysiere, bewerte und pflege dein privates und berufliches Netzwerk systematisch.
                Verbinde dein Google-Konto, um deine echten Kontakte zu synchronisieren und intelligente Follow-up Erinnerungen direkt in Google Tasks zu erstellen.
              </p>
              <button
                  onClick={() => googleAuth.login()}
                  className="btn btn-primary btn-lg shadow-xl mt-4 font-bold"
              >
                Jetzt mit Google anmelden
              </button>
            </div>
          </div>
        </div>
    );
  }

  return (
      <div className="space-y-6">
        <div className="prose max-w-none flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Netzwerk-Dashboard</h1>
            <p className="text-base-content/70">
              Analysieren Sie die qualitative Verteilung Ihrer Beziehungen basierend auf echten Live-Daten.
            </p>
          </div>
        </div>

        {isLoading && (
            <div className="w-full flex justify-center py-12">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        )}

        {!isLoading && (
            <>
              <div className="tabs tabs-boxed w-full max-w-md bg-base-100 p-1 border border-base-300 shadow-sm">
                <button
                    onClick={() => { setActiveSphere('PRIVAT'); setSelectedTier(null); }}
                    className={`tab flex-1 font-bold text-sm transition-all h-10 ${activeSphere === 'PRIVAT' ? 'tab-active bg-primary text-primary-content' : ''}`}
                >
                  🤗 Privates Netzwerk
                </button>
                <button
                    onClick={() => { setActiveSphere('BUSINESS'); setSelectedTier(null); }}
                    className={`tab flex-1 font-bold text-sm transition-all h-10 ${activeSphere === 'BUSINESS' ? 'tab-active bg-secondary text-secondary-content' : ''}`}
                >
                  💼 Business Netzwerk
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                <div className="card bg-base-100 shadow-md p-6 border border-base-300 lg:col-span-7 flex flex-col items-center">
                  <h2 className="text-lg font-bold mb-6 text-left w-full border-b border-base-200 pb-2">
                    Visualisierung: {activeSphere === 'PRIVAT' ? 'Privat-Pyramide' : 'Business-Pyramide'}
                  </h2>

                  {/* Empty State Call to Action */}
                  {activeContacts.length === 0 && (
                      <div className="alert bg-base-200/50 border-dashed border-2 border-base-300 w-full mb-6 flex-col items-center text-center p-6">
                        <span className="text-4xl mb-2">🚀</span>
                        <h3 className="font-bold text-lg">Noch keine Daten vorhanden</h3>
                        <p className="text-sm text-base-content/70 mb-4">
                          Die Pyramide ist leer. Starten Sie jetzt Ihre erste Evaluierung, um Ihr Netzwerk zu visualisieren.
                        </p>
                        <Link to="/contacts" className={`btn ${activeSphere === 'PRIVAT' ? 'btn-primary' : 'btn-secondary'} btn-sm`}>
                          Zur Kontaktliste & Fragebogen starten
                        </Link>
                      </div>
                  )}

                  <div className="w-full max-w-md flex flex-col items-center gap-2 py-4">

                    <button
                        onClick={() => setSelectedTier(selectedTier === 1 ? null : 1)}
                        className={`w-1/3 transition-all transform hover:scale-105 p-3 font-bold text-center text-xs md:text-sm rounded-lg shadow-xs flex flex-col items-center justify-center border ${
                            selectedTier === 1
                                ? 'bg-neutral text-neutral-content border-neutral'
                                : activeSphere === 'PRIVAT' ? 'bg-primary text-primary-content border-primary/20' : 'bg-secondary text-secondary-content border-secondary/20'
                        }`}
                    >
                      <span>Stufe 1</span>
                      <span className="badge badge-sm bg-base-100/20 text-current border-none font-extrabold mt-0.5">
                    {getTierCount(activeSphere, 1)}
                  </span>
                    </button>

                    <button
                        onClick={() => setSelectedTier(selectedTier === 2 ? null : 2)}
                        className={`w-2/3 transition-all transform hover:scale-105 p-3 font-bold text-center text-xs md:text-sm rounded-lg shadow-xs flex flex-col items-center justify-center border ${
                            selectedTier === 2
                                ? 'bg-neutral text-neutral-content border-neutral'
                                : activeSphere === 'PRIVAT' ? 'bg-primary/80 text-primary-content border-primary/20' : 'bg-secondary/80 text-secondary-content border-secondary/20'
                        }`}
                    >
                      <span>Stufe 2</span>
                      <span className="badge badge-sm bg-base-100/20 text-current border-none font-extrabold mt-0.5">
                    {getTierCount(activeSphere, 2)}
                  </span>
                    </button>

                    <button
                        onClick={() => setSelectedTier(selectedTier === 3 ? null : 3)}
                        className={`w-11/12 transition-all transform hover:scale-105 p-3 font-bold text-center text-xs md:text-sm rounded-lg shadow-xs flex flex-col items-center justify-center border ${
                            selectedTier === 3
                                ? 'bg-neutral text-neutral-content border-neutral'
                                : activeSphere === 'PRIVAT' ? 'bg-primary/60 text-primary-content border-primary/20' : 'bg-secondary/60 text-secondary-content border-secondary/20'
                        }`}
                    >
                      <span>Stufe 3</span>
                      <span className="badge badge-sm bg-base-100/20 text-current border-none font-extrabold mt-0.5">
                    {getTierCount(activeSphere, 3)}
                  </span>
                    </button>

                    <button
                        onClick={() => setSelectedTier(selectedTier === 4 ? null : 4)}
                        className={`w-full transition-all transform hover:scale-105 p-3 font-bold text-center text-xs md:text-sm rounded-lg shadow-xs flex flex-col items-center justify-center border ${
                            selectedTier === 4
                                ? 'bg-neutral text-neutral-content border-neutral'
                                : activeSphere === 'PRIVAT' ? 'bg-primary/40 text-primary-content border-primary/20' : 'bg-secondary/40 text-secondary-content border-secondary/20'
                        }`}
                    >
                      <span>Stufe 4</span>
                      <span className="badge badge-sm bg-base-100/20 text-current border-none font-extrabold mt-0.5">
                    {getTierCount(activeSphere, 4)}
                  </span>
                    </button>

                  </div>

                  {selectedTier && (
                      <div className="mt-4 w-full text-center">
                        <button onClick={() => setSelectedTier(null)} className="btn btn-xs btn-ghost text-error font-semibold underline">
                          Filter zurücksetzen
                        </button>
                      </div>
                  )}
                </div>

                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-base-100 p-5 rounded-2xl border border-base-300 shadow-sm space-y-3">
                    <h3 className="font-bold text-md text-base-content flex items-center gap-2">
                      <span>📋</span>
                      {selectedTier ? `Kontakte in Stufe ${selectedTier}` : 'Alle kategorisierten Kontakte'}
                    </h3>

                    <p className="text-xs text-base-content/60 bg-base-200 p-2.5 rounded-lg border border-base-300/60 font-medium">
                      {selectedTier ? tierLabels[selectedTier].desc : 'Wählen Sie oben eine Pyramidenstufe aus, um die Details zu fokussieren.'}
                    </p>

                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                      {displayedContacts.length > 0 ? (
                          displayedContacts.map((contact) => (
                              <div
                                  key={contact.id}
                                  className="flex justify-between items-center p-3 rounded-xl border border-base-200 bg-base-200/20 hover:bg-base-200/50 transition-colors"
                              >
                                <div>
                                  <div className="font-semibold text-sm">{contact.name}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-mono font-bold text-base-content/60">{contact.score}%</span>
                                  <span className={`badge badge-xs p-2 font-bold text-xs ${
                                      contact.tier === 1 ? 'badge-error text-white' : contact.tier === 2 ? 'badge-warning text-warning-content' : 'badge-neutral'
                                  }`}>
                            S{contact.tier}
                          </span>
                                </div>
                              </div>
                          ))
                      ) : (
                          <div className="text-center text-xs py-8 text-base-content/40 italic">
                            Aktuell keine Kontakte in dieser Ansicht vorhanden.
                          </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
        )}
      </div>
  );
}