import { googleAuth } from './googleAuth';

const HISTORY_KEY = 'network_tracker_history';

export interface EvaluationHistory {
  timestamp: string;
  score: number;
  tier: number;
  sphere: 'PRIVAT' | 'BUSINESS';
  comment: string;
  taskId?: string;
}

export interface AppContact {
  id: string; // resourceName (e.g., people/c12345)
  etag: string;
  firstName: string;
  lastName: string;
  email: string;
  evaluationHistory: EvaluationHistory[];
}

interface GooglePerson {
  resourceName: string;
  etag: string;
  names?: { givenName?: string; familyName?: string; displayName?: string }[];
  emailAddresses?: { value?: string }[];
  userDefined?: { key: string; value: string }[];
}

export const googleApi = {
  async fetchContacts(): Promise<AppContact[]> {
    const token = googleAuth.getToken();
    if (!token) throw new Error('Not authenticated');

    // Fetch up to 1000 contacts for the MVP
    const response = await fetch(
      'https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,userDefined&pageSize=1000',
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch contacts from Google People API');
    }

    const data = await response.json();
    const connections = data.connections || [];

    return connections.map((person: GooglePerson) => {
      const names = person.names?.[0] || {};
      const emails = person.emailAddresses?.[0] || {};
      const userDefined = person.userDefined || [];

      let evaluationHistory: EvaluationHistory[] = [];
      const historyField = userDefined.find((field: { key: string; value: string }) => field.key === HISTORY_KEY);
      
      if (historyField && historyField.value) {
        try {
          evaluationHistory = JSON.parse(historyField.value);
        } catch (e: unknown) {
          console.warn('Could not parse evaluation history for', names.displayName, e);
        }
      }

      return {
        id: person.resourceName,
        etag: person.etag,
        firstName: names.givenName || '',
        lastName: names.familyName || '',
        email: emails.value || 'Keine E-Mail',
        evaluationHistory: evaluationHistory.sort(
          (a: EvaluationHistory, b: EvaluationHistory) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
      };
    });
  },

  async updateContactHistory(resourceName: string, etag: string, history: EvaluationHistory[]): Promise<string> {
    const token = googleAuth.getToken();
    if (!token) throw new Error('Not authenticated');

    // Stringify the history array for storage
    const historyString = JSON.stringify(history);

    // We must pass the existing userDefined fields, updating/adding our specific key
    const updateBody = {
      etag: etag,
      userDefined: [
        {
          key: HISTORY_KEY,
          value: historyString
        }
      ]
    };

    const response = await fetch(
      `https://people.googleapis.com/v1/${resourceName}:updateContact?updatePersonFields=userDefined`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateBody),
      }
    );

    if (!response.ok) {
      const err = await response.json();
      console.error('Update failed:', err);
      throw new Error('Failed to update contact history');
    }

    const data = await response.json();
    return data.etag; // Return new etag for state update
  },

  async createFollowUpTask(contactName: string, contactId: string, comment: string, months: number): Promise<string> {
    const token = googleAuth.getToken();
    if (!token) throw new Error('Not authenticated');

    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + months);

    const appUrl = `https://network.reisinger.pictures/contacts?id=${encodeURIComponent(contactId)}`;
    
    const taskBody = {
      title: `[Netzwerk-Re-Evaluierung] - ${contactName}`,
      notes: `Letzte Evaluierung: ${comment}\n\nLink zum Kontakt: ${appUrl}`,
      due: dueDate.toISOString(),
    };

    const response = await fetch('https://tasks.googleapis.com/v1/users/@me/lists/@default/tasks', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskBody),
    });

    if (!response.ok) {
      throw new Error('Failed to create Google Task');
    }

    const data = await response.json();
    return data.id; // Return the taskId
  }
}