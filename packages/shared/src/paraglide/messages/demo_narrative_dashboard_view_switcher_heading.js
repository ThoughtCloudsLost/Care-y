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

const en_xa2_demo_narrative_dashboard_view_switcher_heading = /** @type {(inputs: Demo_Narrative_Dashboard_View_Switcher_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Vìèw swìtchèr ••••⟧`)
};

/**
* | output |
* | --- |
* | "View switcher" |
*
* @param {Demo_Narrative_Dashboard_View_Switcher_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_view_switcher_heading = /** @type {((inputs?: Demo_Narrative_Dashboard_View_Switcher_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Dashboard_View_Switcher_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_dashboard_view_switcher_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_dashboard_view_switcher_heading(inputs)
	return en_demo_narrative_dashboard_view_switcher_heading(inputs)
});