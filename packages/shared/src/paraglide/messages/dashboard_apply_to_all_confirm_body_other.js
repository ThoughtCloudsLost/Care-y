/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Dashboard_Apply_To_All_Confirm_Body_OtherInputs */

const en_dashboard_apply_to_all_confirm_body_other = /** @type {(inputs: Dashboard_Apply_To_All_Confirm_Body_OtherInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} other sections have their own filters. Applying replaces them.`)
};

const es_dashboard_apply_to_all_confirm_body_other = /** @type {(inputs: Dashboard_Apply_To_All_Confirm_Body_OtherInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Otras ${i?.count} secciones tienen sus propios filtros. Aplicar los reemplaza.`)
};

const en_xa2_dashboard_apply_to_all_confirm_body_other = /** @type {(inputs: Dashboard_Apply_To_All_Confirm_Body_OtherInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count} òthèr sèctìòns hàvè thèìr òwn fìltèrs. Àpplyìng rèplàcès thèm. •••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "{count} other sections have their own filters. Applying replaces them." |
*
* @param {Dashboard_Apply_To_All_Confirm_Body_OtherInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_apply_to_all_confirm_body_other = /** @type {((inputs: Dashboard_Apply_To_All_Confirm_Body_OtherInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Apply_To_All_Confirm_Body_OtherInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_dashboard_apply_to_all_confirm_body_other(inputs)
	if (locale === "en-XA") return en_xa2_dashboard_apply_to_all_confirm_body_other(inputs)
	return en_dashboard_apply_to_all_confirm_body_other(inputs)
});