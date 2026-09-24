/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Client_Merge_LockedInputs */

const en_client_merge_locked = /** @type {(inputs: Client_Merge_LockedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Locked`)
};

const es_client_merge_locked = /** @type {(inputs: Client_Merge_LockedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Bloqueado`)
};

const en_xa2_client_merge_locked = /** @type {(inputs: Client_Merge_LockedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Lòckèd ••⟧`)
};

/**
* | output |
* | --- |
* | "Locked" |
*
* @param {Client_Merge_LockedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const client_merge_locked = /** @type {((inputs?: Client_Merge_LockedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Merge_LockedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_client_merge_locked(inputs)
	if (locale === "en-XA") return en_xa2_client_merge_locked(inputs)
	return en_client_merge_locked(inputs)
});