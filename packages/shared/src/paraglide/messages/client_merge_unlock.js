/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Client_Merge_UnlockInputs */

const en_client_merge_unlock = /** @type {(inputs: Client_Merge_UnlockInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Unlock merge`)
};

const es_client_merge_unlock = /** @type {(inputs: Client_Merge_UnlockInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Desbloquear fusión`)
};

const en_xa2_client_merge_unlock = /** @type {(inputs: Client_Merge_UnlockInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ùnlòck mèrgè ••••⟧`)
};

/**
* | output |
* | --- |
* | "Unlock merge" |
*
* @param {Client_Merge_UnlockInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const client_merge_unlock = /** @type {((inputs?: Client_Merge_UnlockInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Merge_UnlockInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_client_merge_unlock(inputs)
	if (locale === "en-XA") return en_xa2_client_merge_unlock(inputs)
	return en_client_merge_unlock(inputs)
});