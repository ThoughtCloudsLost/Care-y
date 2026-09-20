/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Followup_Type_Status_ChangeInputs */

const en_followup_type_status_change = /** @type {(inputs: Followup_Type_Status_ChangeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Status Changes`)
};

const es_followup_type_status_change = /** @type {(inputs: Followup_Type_Status_ChangeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cambios de estado`)
};

const en_xa2_followup_type_status_change = /** @type {(inputs: Followup_Type_Status_ChangeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Stàtùs Chàngès •••••⟧`)
};

/**
* | output |
* | --- |
* | "Status Changes" |
*
* @param {Followup_Type_Status_ChangeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const followup_type_status_change = /** @type {((inputs?: Followup_Type_Status_ChangeInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Followup_Type_Status_ChangeInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_followup_type_status_change(inputs)
	if (locale === "en-XA") return en_xa2_followup_type_status_change(inputs)
	return en_followup_type_status_change(inputs)
});