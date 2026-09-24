/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Hub_People_HeadingInputs */

const en_demo_narrative_admin_hub_people_heading = /** @type {(inputs: Demo_Narrative_Admin_Hub_People_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`People`)
};

const es_demo_narrative_admin_hub_people_heading = /** @type {(inputs: Demo_Narrative_Admin_Hub_People_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Personas`)
};

const en_xa2_demo_narrative_admin_hub_people_heading = /** @type {(inputs: Demo_Narrative_Admin_Hub_People_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Pèòplè ••⟧`)
};

/**
* | output |
* | --- |
* | "People" |
*
* @param {Demo_Narrative_Admin_Hub_People_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_hub_people_heading = /** @type {((inputs?: Demo_Narrative_Admin_Hub_People_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Hub_People_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_hub_people_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_hub_people_heading(inputs)
	return en_demo_narrative_admin_hub_people_heading(inputs)
});