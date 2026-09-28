/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Dashboard_Apply_To_All_ConfirmInputs */

const en_dashboard_apply_to_all_confirm = /** @type {(inputs: Dashboard_Apply_To_All_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Replace`)
};

const es_dashboard_apply_to_all_confirm = /** @type {(inputs: Dashboard_Apply_To_All_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reemplazar`)
};

const en_xa2_dashboard_apply_to_all_confirm = /** @type {(inputs: Dashboard_Apply_To_All_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèplàcè •••⟧`)
};

/**
* | output |
* | --- |
* | "Replace" |
*
* @param {Dashboard_Apply_To_All_ConfirmInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_apply_to_all_confirm = /** @type {((inputs?: Dashboard_Apply_To_All_ConfirmInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Apply_To_All_ConfirmInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_dashboard_apply_to_all_confirm(inputs)
	if (locale === "en-XA") return en_xa2_dashboard_apply_to_all_confirm(inputs)
	return en_dashboard_apply_to_all_confirm(inputs)
});