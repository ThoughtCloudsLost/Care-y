/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Client_Merge_LockInputs */

const en_client_merge_lock = /** @type {(inputs: Client_Merge_LockInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Lock merge`)
};

const es_client_merge_lock = /** @type {(inputs: Client_Merge_LockInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Bloquear fusion`)
};

/**
* | output |
* | --- |
* | "Lock merge" |
*
* @param {Client_Merge_LockInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_merge_lock = /** @type {((inputs?: Client_Merge_LockInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Merge_LockInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_client_merge_lock(inputs)
	return es_client_merge_lock(inputs)
});