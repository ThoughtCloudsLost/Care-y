/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ tickets: NonNullable<unknown> }} Dashboard_Apply_To_All_LabelInputs */

const en_dashboard_apply_to_all_label = /** @type {(inputs: Dashboard_Apply_To_All_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Apply these filters to all ${i?.tickets} sections`)
};

const es_dashboard_apply_to_all_label = /** @type {(inputs: Dashboard_Apply_To_All_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Aplicar estos filtros a todas las secciones de ${i?.tickets}`)
};

const en_xa2_dashboard_apply_to_all_label = /** @type {(inputs: Dashboard_Apply_To_All_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Àpply thèsè fìltèrs tò àll  •••••••••${i?.tickets} sèctìòns •••⟧`)
};

/**
* | output |
* | --- |
* | "Apply these filters to all {tickets} sections" |
*
* @param {Dashboard_Apply_To_All_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_apply_to_all_label = /** @type {((inputs: Dashboard_Apply_To_All_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Apply_To_All_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_dashboard_apply_to_all_label(inputs)
	if (locale === "en-XA") return en_xa2_dashboard_apply_to_all_label(inputs)
	return en_dashboard_apply_to_all_label(inputs)
});