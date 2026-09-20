/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_Getting_Started_HeadingInputs */

const en_demo_narrative_dashboard_getting_started_heading = /** @type {(inputs: Demo_Narrative_Dashboard_Getting_Started_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Getting started checklist`)
};

const es_demo_narrative_dashboard_getting_started_heading = /** @type {(inputs: Demo_Narrative_Dashboard_Getting_Started_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Lista de primeros pasos`)
};

const en_xa2_demo_narrative_dashboard_getting_started_heading = /** @type {(inputs: Demo_Narrative_Dashboard_Getting_Started_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Gèttìng stàrtèd chècklìst ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Getting started checklist" |
*
* @param {Demo_Narrative_Dashboard_Getting_Started_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_getting_started_heading = /** @type {((inputs?: Demo_Narrative_Dashboard_Getting_Started_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Dashboard_Getting_Started_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_dashboard_getting_started_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_dashboard_getting_started_heading(inputs)
	return en_demo_narrative_dashboard_getting_started_heading(inputs)
});