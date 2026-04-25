/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Followup_Type_Priority_ChangeInputs */

const en_followup_type_priority_change = /** @type {(inputs: Followup_Type_Priority_ChangeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Priority Changes`)
};

const es_followup_type_priority_change = /** @type {(inputs: Followup_Type_Priority_ChangeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cambios de prioridad`)
};

/**
* | output |
* | --- |
* | "Priority Changes" |
*
* @param {Followup_Type_Priority_ChangeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const followup_type_priority_change = /** @type {((inputs?: Followup_Type_Priority_ChangeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Followup_Type_Priority_ChangeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_followup_type_priority_change(inputs)
	return es_followup_type_priority_change(inputs)
});