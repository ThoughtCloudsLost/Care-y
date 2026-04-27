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

/**
* | output |
* | --- |
* | "Status Changes" |
*
* @param {Followup_Type_Status_ChangeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const followup_type_status_change = /** @type {((inputs?: Followup_Type_Status_ChangeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Followup_Type_Status_ChangeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_followup_type_status_change(inputs)
	return es_followup_type_status_change(inputs)
});