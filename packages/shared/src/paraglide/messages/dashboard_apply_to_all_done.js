/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Dashboard_Apply_To_All_DoneInputs */

const en_dashboard_apply_to_all_done = /** @type {(inputs: Dashboard_Apply_To_All_DoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Filters applied to all sections`)
};

const es_dashboard_apply_to_all_done = /** @type {(inputs: Dashboard_Apply_To_All_DoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Filtros aplicados a todas las secciones`)
};

const en_xa2_dashboard_apply_to_all_done = /** @type {(inputs: Dashboard_Apply_To_All_DoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fìltèrs àpplìèd tò àll sèctìòns ••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Filters applied to all sections" |
*
* @param {Dashboard_Apply_To_All_DoneInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_apply_to_all_done = /** @type {((inputs?: Dashboard_Apply_To_All_DoneInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Apply_To_All_DoneInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_dashboard_apply_to_all_done(inputs)
	if (locale === "en-XA") return en_xa2_dashboard_apply_to_all_done(inputs)
	return en_dashboard_apply_to_all_done(inputs)
});