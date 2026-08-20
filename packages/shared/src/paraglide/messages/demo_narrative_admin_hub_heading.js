/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Hub_HeadingInputs */

const en_demo_narrative_admin_hub_heading = /** @type {(inputs: Demo_Narrative_Admin_Hub_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Hub navigation`)
};

const es_demo_narrative_admin_hub_heading = /** @type {(inputs: Demo_Narrative_Admin_Hub_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Navegación del centro`)
};

/**
* | output |
* | --- |
* | "Hub navigation" |
*
* @param {Demo_Narrative_Admin_Hub_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_hub_heading = /** @type {((inputs?: Demo_Narrative_Admin_Hub_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Hub_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_admin_hub_heading(inputs)
	return es_demo_narrative_admin_hub_heading(inputs)
});