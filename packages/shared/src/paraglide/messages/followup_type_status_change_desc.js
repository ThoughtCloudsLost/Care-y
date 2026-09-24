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

const en_xa2_followup_type_status_change_desc = /** @type {(inputs: Followup_Type_Status_Change_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òpèn, clòsèd, ànd rèòpènèd trànsìtìòns ••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Open, closed, and reopened transitions" |
*
* @param {Followup_Type_Status_Change_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const followup_type_status_change_desc = /** @type {((inputs?: Followup_Type_Status_Change_DescInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Followup_Type_Status_Change_DescInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_followup_type_status_change_desc(inputs)
	if (locale === "en-XA") return en_xa2_followup_type_status_change_desc(inputs)
	return en_followup_type_status_change_desc(inputs)
});