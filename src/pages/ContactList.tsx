import { useState, useEffect, useCallback } from 'react';
import EvaluationModal from '../components/EvaluationModal';
import { googleApi, AppContact, EvaluationHistory } from '../services/googleApi';
import { googleAuth } from '../services/googleAuth';

export default function ContactList() {
  const [contacts, setContacts] = useState<AppContact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<AppContact | null>(null);
  const [selectedSphere, setSelectedSphere] = useState<'PRIVAT' | 'BUSINESS'>('PRIVAT');

  const loadContacts = useCallback(async () => {
    if (!googleAuth.isAuthenticated()) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await googleApi.fetchContacts();
      setContacts(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Fehler beim Laden der Kontakte.');
      } else {
        setError('Fehler beim Laden der Kontakte.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadContacts();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadContacts]);

  const filteredContacts = [...contacts]
      .filter((contact) => {
        const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
        const email = contact.email.toLowerCase();
        const search = searchTerm.toLowerCase();
        return fullName.includes(search) || email.includes(search);
      })
      .sort((a, b) => {
        const nameA = `${a.firstName} ${a.lastName}`.trim().toLowerCase();
        const nameB = `${b.firstName} ${b.lastName}`.trim().toLowerCase();
        return nameA.localeCompare(nameB);
      });

  const openEvaluation = (contact: AppContact, sphere: 'PRIVAT' | 'BUSINESS') => {
    setSelectedContact(contact);
    setSelectedSphere(sphere);
    setModalOpen(true);
  };

  const handleSaveEvaluation = async (formData: Record<string, string | number>) => {
    if (!selectedContact) return;

    try {
      const values = Object.entries(formData)
          .filter(([key]) => key !== 'comment' && key !== 'interval' && key !== 'sphere' && key !== 'timestamp')
          .map(([, val]) => Number(val));

      const sum = values.reduce((a, b) => a + b, 0);
      const maxPossible = values.length * 5;
      const score = maxPossible > 0 ? Math.round((sum / maxPossible) * 100) : 50;

      let tier = 4;
      if (score >= 80) tier = 1;
      else if (score >= 60) tier = 2;
      else if (score >= 40) tier = 3;

      const newHistoryItem: EvaluationHistory = {
        timestamp: String(formData.timestamp),
        score,
        tier,
        sphere: formData.sphere as 'PRIVAT' | 'BUSINESS',
        comment: String(formData.comment),
        taskId: undefined
      };

      const contactName = `${selectedContact.firstName} ${selectedContact.lastName}`.trim();
      const taskId = await googleApi.createFollowUpTask(
          contactName,
          selectedContact.id,
          String(formData.comment),
          parseInt(String(formData.interval), 10)
      );

      newHistoryItem.taskId = taskId;

      const updatedHistory: EvaluationHistory[] = [newHistoryItem, ...selectedContact.evaluationHistory];
      const newEtag = await googleApi.updateContactHistory(selectedContact.id, selectedContact.etag, updatedHistory);

      setContacts(prev => prev.map(c => {
        if (c.id === selectedContact.id) {
          return { ...c, etag: newEtag, evaluationHistory: updatedHistory };
        }
        return c;
      }));

      setModalOpen(false);
      setSelectedContact(null);
    } catch (err) {
      console.error(err);
      alert('Fehler beim Speichern der Evaluierung. Bitte prüfen Sie die Console.');
    }
  };

  if (!googleAuth.isAuthenticated()) {
    return (
        <div className="hero min-h-[60vh] bg-base-100 rounded-3xl border border-base-300 shadow-sm mt-4">
          <div className="hero-content text-center max-w-2xl">
            <div>
              <span className="text-6xl block mb-6 animate-bounce">🔐</span>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                Login erforderlich
              </h1>
              <p className="py-6 text-lg text-base-content/70">
                Um auf Ihre Kontaktliste zuzugreifen und Evaluierungen starten zu können, müssen Sie sich zunächst sicher mit Ihrem Google-Konto authentifizieren.
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
            <h1 className="text-3xl font-extrabold tracking-tight">Google Kontakte</h1>
            <p className="text-base-content/70">
              Wählen Sie einen Kontakt aus, um eine neue Evaluierung (Fragebogen) zu starten.
            </p>
          </div>
          <button onClick={loadContacts} className="btn btn-outline btn-sm shadow-sm" disabled={isLoading}>
            {isLoading ? <span className="loading loading-spinner loading-xs"></span> : 'Kontakte synchronisieren'}
          </button>
        </div>

        {error && <div className="alert alert-error shadow-sm">{error}</div>}

        <div className="bg-base-100 p-6 rounded-2xl shadow-md border border-base-300 space-y-4">
          <div className="w-full max-w-md">
            <input
                type="text"
                placeholder="🔍 Kontakte nach Name oder E-Mail durchsuchen..."
                className="input input-bordered w-full bg-base-200/50 focus:bg-base-100 transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto w-full">
            <table className="table w-full">
              <thead>
              <tr className="text-sm border-b-2 border-base-300 bg-base-200/30">
                <th className="rounded-tl-lg">Name</th>
                <th>E-Mail-Adresse</th>
                <th>Letzte Evaluierung</th>
                <th className="text-right rounded-tr-lg">Aktionen (Fragebogen starten)</th>
              </tr>
              </thead>
              <tbody>
              {isLoading && contacts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-12">
                      <span className="loading loading-spinner loading-lg text-primary"></span>
                    </td>
                  </tr>
              ) : filteredContacts.length > 0 ? (
                  filteredContacts.map((contact) => {
                    const latestEval = contact.evaluationHistory[0];

                    return (
                        <tr key={contact.id} className="hover:bg-base-200/50 border-b border-base-200 transition-colors group">
                          <td>
                            <div className="font-bold text-base-content text-base">
                              {`${contact.firstName} ${contact.lastName}`.trim()}
                            </div>
                          </td>
                          <td className="text-base-content/70 font-mono text-sm">
                            {contact.email}
                          </td>
                          <td>
                            {latestEval ? (
                                <div className="flex flex-col items-start gap-1.5">
                            <span className={`badge font-bold py-3 px-3 shadow-xs whitespace-nowrap ${
                                latestEval.sphere === 'PRIVAT' ? 'badge-primary text-primary-content' : 'badge-secondary text-secondary-content'
                            }`}>
                              {latestEval.sphere === 'PRIVAT' ? '🤗 Privat' : '💼 Business'} - Stufe {latestEval.tier} ({latestEval.score}%)
                            </span>
                                  <span className="text-xs text-base-content/60 max-w-xs truncate italic" title={latestEval.comment}>
                              „{latestEval.comment}“
                            </span>
                                </div>
                            ) : (
                                <span className="badge badge-neutral badge-outline font-semibold py-3 px-3 whitespace-nowrap">Noch unbewertet</span>
                            )}
                          </td>
                          <td className="text-right align-middle">
                            <div className="inline-flex gap-2">
                              <button
                                  onClick={() => openEvaluation(contact, 'BUSINESS')}
                                  className="btn btn-sm btn-secondary btn-outline shadow-sm hover:scale-105 transition-transform"
                                  title="Business Netzwerk evaluieren"
                              >
                                <span>💼</span> Business evaluieren
                              </button>
                              <button
                                  onClick={() => openEvaluation(contact, 'PRIVAT')}
                                  className="btn btn-sm btn-primary btn-outline shadow-sm hover:scale-105 transition-transform"
                                  title="Privates Netzwerk evaluieren"
                              >
                                <span>🤗</span> Privat evaluieren
                              </button>
                            </div>
                          </td>
                        </tr>
                    );
                  })
              ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-base-content/50 italic bg-base-200/20">
                      Keine passenden Kontakte gefunden.
                    </td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>
        </div>

        {selectedContact && (
            <EvaluationModal
                isOpen={modalOpen}
                contactName={`${selectedContact.firstName} ${selectedContact.lastName}`.trim()}
                sphere={selectedSphere}
                onClose={() => {
                  setModalOpen(false);
                  setSelectedContact(null);
                }}
                onSave={handleSaveEvaluation}
            />
        )}
      </div>
  );
}