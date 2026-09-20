/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Priority_Stamp_UrgentInputs */

const en_priority_stamp_urgent = /** @type {(inputs: Priority_Stamp_UrgentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Urgent`)
};

const es_priority_stamp_urgent = /** @type {(inputs: Priority_Stamp_UrgentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Urgente`)
};

const en_xa2_priority_stamp_urgent = /** @type {(inputs: Priority_Stamp_UrgentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ùrgènt ••⟧`)
};

/**
* | output |
* | --- |
* | "Urgent" |
*
* @param {Priority_Stamp_UrgentInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const priority_stamp_urgent = /** @type {((inputs?: Priority_Stamp_UrgentInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Priority_Stamp_UrgentInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_priority_stamp_urgent(inputs)
	if (locale === "en-XA") return en_xa2_priority_stamp_urgent(inputs)
	return en_priority_stamp_urgent(inputs)
});