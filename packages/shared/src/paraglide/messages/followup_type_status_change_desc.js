/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Followup_Type_Status_Change_DescInputs */

const en_followup_type_status_change_desc = /** @type {(inputs: Followup_Type_Status_Change_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Open, closed, and reopened transitions`)
};

const es_followup_type_status_change_desc = /** @type {(inputs: Followup_Type_Status_Change_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Transiciones de abierto, cerrado y reabierto`)
};

/**
* | output |
* | --- |
* | "Open, closed, and reopened transitions" |
*
* @param {Followup_Type_Status_Change_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const followup_type_status_change_desc = /** @type {((inputs?: Followup_Type_Status_Change_DescInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Followup_Type_Status_Change_DescInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_followup_type_status_change_desc(inputs)
	return es_followup_type_status_change_desc(inputs)
});