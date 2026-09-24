/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_Activity_HeadingInputs */

const en_demo_narrative_dashboard_activity_heading = /** @type {(inputs: Demo_Narrative_Dashboard_Activity_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Activity feed`)
};

const es_demo_narrative_dashboard_activity_heading = /** @type {(inputs: Demo_Narrative_Dashboard_Activity_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Feed de actividad`)
};

const en_xa2_demo_narrative_dashboard_activity_heading = /** @type {(inputs: Demo_Narrative_Dashboard_Activity_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àctìvìty fèèd ••••⟧`)
};

/**
* | output |
* | --- |
* | "Activity feed" |
*
* @param {Demo_Narrative_Dashboard_Activity_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_activity_heading = /** @type {((inputs?: Demo_Narrative_Dashboard_Activity_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Dashboard_Activity_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_dashboard_activity_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_dashboard_activity_heading(inputs)
	return en_demo_narrative_dashboard_activity_heading(inputs)
});