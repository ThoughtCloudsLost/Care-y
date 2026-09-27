/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Dashboard_Apply_To_All_Confirm_Body_OneInputs */

const en_dashboard_apply_to_all_confirm_body_one = /** @type {(inputs: Dashboard_Apply_To_All_Confirm_Body_OneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`1 other section has its own filters. Applying replaces them.`)
};

const es_dashboard_apply_to_all_confirm_body_one = /** @type {(inputs: Dashboard_Apply_To_All_Confirm_Body_OneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Otra sección tiene sus propios filtros. Aplicar los reemplaza.`)
};

const en_xa2_dashboard_apply_to_all_confirm_body_one = /** @type {(inputs: Dashboard_Apply_To_All_Confirm_Body_OneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦1 òthèr sèctìòn hàs ìts òwn fìltèrs. Àpplyìng rèplàcès thèm. ••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "1 other section has its own filters. Applying replaces them." |
*
* @param {Dashboard_Apply_To_All_Confirm_Body_OneInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_apply_to_all_confirm_body_one = /** @type {((inputs?: Dashboard_Apply_To_All_Confirm_Body_OneInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Apply_To_All_Confirm_Body_OneInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_dashboard_apply_to_all_confirm_body_one(inputs)
	if (locale === "en-XA") return en_xa2_dashboard_apply_to_all_confirm_body_one(inputs)
	return en_dashboard_apply_to_all_confirm_body_one(inputs)
});