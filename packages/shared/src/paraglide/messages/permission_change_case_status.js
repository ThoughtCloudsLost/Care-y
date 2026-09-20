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

const en_xa2_permission_change_case_status = /** @type {(inputs: Permission_Change_Case_StatusInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Chàngè càsè stàtùs ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Change case status" |
*
* @param {Permission_Change_Case_StatusInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_change_case_status = /** @type {((inputs?: Permission_Change_Case_StatusInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Change_Case_StatusInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_change_case_status(inputs)
	if (locale === "en-XA") return en_xa2_permission_change_case_status(inputs)
	return en_permission_change_case_status(inputs)
});