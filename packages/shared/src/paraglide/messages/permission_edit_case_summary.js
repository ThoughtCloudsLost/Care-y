/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Edit_Case_SummaryInputs */

const en_permission_edit_case_summary = /** @type {(inputs: Permission_Edit_Case_SummaryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Edit case summary`)
};

const es_permission_edit_case_summary = /** @type {(inputs: Permission_Edit_Case_SummaryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Editar resumen del caso`)
};

const en_xa2_permission_edit_case_summary = /** @type {(inputs: Permission_Edit_Case_SummaryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èdìt càsè sùmmàry ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Edit case summary" |
*
* @param {Permission_Edit_Case_SummaryInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_edit_case_summary = /** @type {((inputs?: Permission_Edit_Case_SummaryInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Edit_Case_SummaryInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_edit_case_summary(inputs)
	if (locale === "en-XA") return en_xa2_permission_edit_case_summary(inputs)
	return en_permission_edit_case_summary(inputs)
});