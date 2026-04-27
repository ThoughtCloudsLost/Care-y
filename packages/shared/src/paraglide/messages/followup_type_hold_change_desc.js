/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Followup_Type_Hold_Change_DescInputs */

const en_followup_type_hold_change_desc = /** @type {(inputs: Followup_Type_Hold_Change_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ticket placed on hold or resumed`)
};

const es_followup_type_hold_change_desc = /** @type {(inputs: Followup_Type_Hold_Change_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ticket puesto en espera o reanudado`)
};

/**
* | output |
* | --- |
* | "Ticket placed on hold or resumed" |
*
* @param {Followup_Type_Hold_Change_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const followup_type_hold_change_desc = /** @type {((inputs?: Followup_Type_Hold_Change_DescInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Followup_Type_Hold_Change_DescInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_followup_type_hold_change_desc(inputs)
	return es_followup_type_hold_change_desc(inputs)
});