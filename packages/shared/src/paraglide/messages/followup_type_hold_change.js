/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Followup_Type_Hold_ChangeInputs */

const en_followup_type_hold_change = /** @type {(inputs: Followup_Type_Hold_ChangeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Hold Changes`)
};

const es_followup_type_hold_change = /** @type {(inputs: Followup_Type_Hold_ChangeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cambios de espera`)
};

const en_xa2_followup_type_hold_change = /** @type {(inputs: Followup_Type_Hold_ChangeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Hòld Chàngès ••••⟧`)
};

/**
* | output |
* | --- |
* | "Hold Changes" |
*
* @param {Followup_Type_Hold_ChangeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const followup_type_hold_change = /** @type {((inputs?: Followup_Type_Hold_ChangeInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Followup_Type_Hold_ChangeInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_followup_type_hold_change(inputs)
	if (locale === "en-XA") return en_xa2_followup_type_hold_change(inputs)
	return en_followup_type_hold_change(inputs)
});