/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_UnlockingInputs */

const en_portal_unlocking = /** @type {(inputs: Portal_UnlockingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Unlocking your messages...`)
};

const es_portal_unlocking = /** @type {(inputs: Portal_UnlockingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Desbloqueando tus mensajes...`)
};

/**
* | output |
* | --- |
* | "Unlocking your messages..." |
*
* @param {Portal_UnlockingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_unlocking = /** @type {((inputs?: Portal_UnlockingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_UnlockingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_portal_unlocking(inputs)
	return es_portal_unlocking(inputs)
});