import type { Categorie, Commande, NouvelleCommande, Plat } from '@/types/gargote';

export class ErreurApi extends Error {
  constructor(
    message: string,
    public statut: number,
    public details: Record<string, string> = {},
  ) {
    super(message);
  }
}

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

async function requete<T>(chemin: string, options: RequestInit = {}): Promise<T> {
  const reponse = await fetch(BASE_URL + chemin, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const donnees = reponse.status === 204 ? null : await reponse.json();

  if (!reponse.ok) {
    throw new ErreurApi(donnees?.message ?? reponse.statusText, reponse.status, donnees?.details ?? {

    });
  }
  return donnees as T;
}

export default {

};
