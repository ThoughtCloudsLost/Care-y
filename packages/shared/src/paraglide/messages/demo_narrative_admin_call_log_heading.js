/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Call_Log_HeadingInputs */

const en_demo_narrative_admin_call_log_heading = /** @type {(inputs: Demo_Narrative_Admin_Call_Log_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Call history`)
};

const es_demo_narrative_admin_call_log_heading = /** @type {(inputs: Demo_Narrative_Admin_Call_Log_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Historial de llamadas`)
};

const en_xa2_demo_narrative_admin_call_log_heading = /** @type {(inputs: Demo_Narrative_Admin_Call_Log_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Càll hìstòry ••••⟧`)
};

/**
* | output |
* | --- |
* | "Call history" |
*
* @param {Demo_Narrative_Admin_Call_Log_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_call_log_heading = /** @type {((inputs?: Demo_Narrative_Admin_Call_Log_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Call_Log_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_call_log_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_call_log_heading(inputs)
	return en_demo_narrative_admin_call_log_heading(inputs)
});