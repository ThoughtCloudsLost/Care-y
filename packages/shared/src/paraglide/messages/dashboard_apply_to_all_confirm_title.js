/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Dashboard_Apply_To_All_Confirm_TitleInputs */

const en_dashboard_apply_to_all_confirm_title = /** @type {(inputs: Dashboard_Apply_To_All_Confirm_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Replace filters in other sections?`)
};

const es_dashboard_apply_to_all_confirm_title = /** @type {(inputs: Dashboard_Apply_To_All_Confirm_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`¿Reemplazar los filtros de otras secciones?`)
};

const en_xa2_dashboard_apply_to_all_confirm_title = /** @type {(inputs: Dashboard_Apply_To_All_Confirm_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèplàcè fìltèrs ìn òthèr sèctìòns? •••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Replace filters in other sections?" |
*
* @param {Dashboard_Apply_To_All_Confirm_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_apply_to_all_confirm_title = /** @type {((inputs?: Dashboard_Apply_To_All_Confirm_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Apply_To_All_Confirm_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_dashboard_apply_to_all_confirm_title(inputs)
	if (locale === "en-XA") return en_xa2_dashboard_apply_to_all_confirm_title(inputs)
	return en_dashboard_apply_to_all_confirm_title(inputs)
});