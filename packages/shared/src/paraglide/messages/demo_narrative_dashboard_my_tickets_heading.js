/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_My_Tickets_HeadingInputs */

const en_demo_narrative_dashboard_my_tickets_heading = /** @type {(inputs: Demo_Narrative_Dashboard_My_Tickets_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`My tickets`)
};

const es_demo_narrative_dashboard_my_tickets_heading = /** @type {(inputs: Demo_Narrative_Dashboard_My_Tickets_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mis tickets`)
};

/**
* | output |
* | --- |
* | "My tickets" |
*
* @param {Demo_Narrative_Dashboard_My_Tickets_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_my_tickets_heading = /** @type {((inputs?: Demo_Narrative_Dashboard_My_Tickets_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Dashboard_My_Tickets_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_dashboard_my_tickets_heading(inputs)
	return es_demo_narrative_dashboard_my_tickets_heading(inputs)
});