/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Escrow_Hash_HintInputs */

const en_onboarding_escrow_hash_hint = /** @type {(inputs: Onboarding_Escrow_Hash_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This code is unique to the file you just downloaded. Write it down and store it separately from the backup file. To check the file has not been corrupted or tampered with, run "shasum -a 256 filename.json" on Mac/Linux or "certutil -hashfile filename.json SHA256" on Windows and confirm the output matches. If you download again, a new file with a different code will be generated.`)
};

const es_onboarding_escrow_hash_hint = /** @type {(inputs: Onboarding_Escrow_Hash_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este código es único para el archivo que acaba de descargar. Anotelo y guardelo por separado del archivo de respaldo. Para comprobar que el archivo no ha sido corrompido o alterado, ejecute "shasum -a 256 archivo.json" en Mac/Linux o "certutil -hashfile archivo.json SHA256" en Windows y confirme que la salida coincida. Si descarga de nuevo, se generara un archivo nuevo con un código diferente.`)
};

const en_xa2_onboarding_escrow_hash_hint = /** @type {(inputs: Onboarding_Escrow_Hash_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thìs còdè ìs ùnìqùè tò thè fìlè yòù jùst dòwnlòàdèd. Wrìtè ìt dòwn ànd stòrè ìt sèpàràtèly fròm thè bàckùp fìlè. Tò chèck thè fìlè hàs nòt bèèn còrrùptèd òr tàmpèrèd wìth, rùn "shàsùm -à 256 fìlènàmè.jsòn" òn Màc/Lìnùx òr "cèrtùtìl -hàshfìlè fìlènàmè.jsòn SHÀ256" òn Wìndòws ànd cònfìrm thè òùtpùt màtchès. Ìf yòù dòwnlòàd àgàìn, à nèw fìlè wìth à dìffèrènt còdè wìll bè gènèràtèd. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This code is unique to the file you just downloaded. Write it down and store it separately from the backup file. To check the file has not been corrupted or ..." |
*
* @param {Onboarding_Escrow_Hash_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_escrow_hash_hint = /** @type {((inputs?: Onboarding_Escrow_Hash_HintInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Escrow_Hash_HintInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_escrow_hash_hint(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_escrow_hash_hint(inputs)
	return en_onboarding_escrow_hash_hint(inputs)
});