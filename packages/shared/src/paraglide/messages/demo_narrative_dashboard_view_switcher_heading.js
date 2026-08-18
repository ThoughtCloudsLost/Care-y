/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_View_Switcher_HeadingInputs */

const en_demo_narrative_dashboard_view_switcher_heading = /** @type {(inputs: Demo_Narrative_Dashboard_View_Switcher_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`View switcher`)
};

const es_demo_narrative_dashboard_view_switcher_heading = /** @type {(inputs: Demo_Narrative_Dashboard_View_Switcher_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Selector de vista`)
};

/**
* | output |
* | --- |
* | "View switcher" |
*
* @param {Demo_Narrative_Dashboard_View_Switcher_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_view_switcher_heading = /** @type {((inputs?: Demo_Narrative_Dashboard_View_Switcher_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Dashboard_View_Switcher_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_dashboard_view_switcher_heading(inputs)
	return es_demo_narrative_dashboard_view_switcher_heading(inputs)
});