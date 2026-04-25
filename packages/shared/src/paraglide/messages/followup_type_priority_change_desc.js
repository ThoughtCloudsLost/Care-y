/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Followup_Type_Priority_Change_DescInputs */

const en_followup_type_priority_change_desc = /** @type {(inputs: Followup_Type_Priority_Change_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Urgent, high, normal, low transitions`)
};

const es_followup_type_priority_change_desc = /** @type {(inputs: Followup_Type_Priority_Change_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Transiciones de urgente, alta, normal, baja`)
};

/**
* | output |
* | --- |
* | "Urgent, high, normal, low transitions" |
*
* @param {Followup_Type_Priority_Change_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const followup_type_priority_change_desc = /** @type {((inputs?: Followup_Type_Priority_Change_DescInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Followup_Type_Priority_Change_DescInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_followup_type_priority_change_desc(inputs)
	return es_followup_type_priority_change_desc(inputs)
});