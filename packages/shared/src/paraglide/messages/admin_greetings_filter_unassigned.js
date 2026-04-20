/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Greetings_Filter_UnassignedInputs */

const en_admin_greetings_filter_unassigned = /** @type {(inputs: Admin_Greetings_Filter_UnassignedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Unassigned`)
};

const es_admin_greetings_filter_unassigned = /** @type {(inputs: Admin_Greetings_Filter_UnassignedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sin asignar`)
};

/**
* | output |
* | --- |
* | "Unassigned" |
*
* @param {Admin_Greetings_Filter_UnassignedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_filter_unassigned = /** @type {((inputs?: Admin_Greetings_Filter_UnassignedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Greetings_Filter_UnassignedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_greetings_filter_unassigned(inputs)
	return es_admin_greetings_filter_unassigned(inputs)
});