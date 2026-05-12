/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Escrow_Hash_HintInputs */

const en_onboarding_escrow_hash_hint = /** @type {(inputs: Onboarding_Escrow_Hash_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Write this down and keep it separate from the backup file. To verify the file later, run "shasum -a 256 filename.json" on Mac/Linux or "certutil -hashfile filename.json SHA256" on Windows and check that the output matches this code.`)
};

const es_onboarding_escrow_hash_hint = /** @type {(inputs: Onboarding_Escrow_Hash_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Anotalo y guardalo por separado del archivo de respaldo. Para verificar el archivo despues, ejecuta "shasum -a 256 archivo.json" en Mac/Linux o "certutil -hashfile archivo.json SHA256" en Windows y comprueba que la salida coincida con este codigo.`)
};

/**
* | output |
* | --- |
* | "Write this down and keep it separate from the backup file. To verify the file later, run \"shasum -a 256 filename.json\" on Mac/Linux or \"certutil -hashfile fi..." |
*
* @param {Onboarding_Escrow_Hash_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_escrow_hash_hint = /** @type {((inputs?: Onboarding_Escrow_Hash_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Escrow_Hash_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_escrow_hash_hint(inputs)
	return es_onboarding_escrow_hash_hint(inputs)
});