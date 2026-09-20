/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Change_Case_StatusInputs */

const en_permission_change_case_status = /** @type {(inputs: Permission_Change_Case_StatusInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Change case status`)
};

const es_permission_change_case_status = /** @type {(inputs: Permission_Change_Case_StatusInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cambiar estado del caso`)
};

/**
* | output |
* | --- |
* | "Change case status" |
*
* @param {Permission_Change_Case_StatusInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_change_case_status = /** @type {((inputs?: Permission_Change_Case_StatusInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Change_Case_StatusInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_change_case_status(inputs)
	return en_permission_change_case_status(inputs)
});