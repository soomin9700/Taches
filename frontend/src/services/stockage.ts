import { Preferences } from '@capacitor/preferences';

export async function lire<T>(cle: string, defaut: T, valide: (x: unknown) => x is T): Promise<T>{
    const { value } = await Preferences.get({ key: cle });
    if (value === null) {
        return defaut;
    }
    const parsed = JSON.parse(value);
    if (valide(parsed)) {
        return parsed;
    }
    return defaut;
}
export async function ecrire<T>(cle: string, valeur: T): Promise<void>{
    await Preferences.set({key :cle , value : JSON.stringify(valeur)});
}
    