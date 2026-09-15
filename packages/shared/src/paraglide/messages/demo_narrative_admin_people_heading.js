/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_People_HeadingInputs */

const en_demo_narrative_admin_people_heading = /** @type {(inputs: Demo_Narrative_Admin_People_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`User roster`)
};

const es_demo_narrative_admin_people_heading = /** @type {(inputs: Demo_Narrative_Admin_People_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Directorio de usuarios`)
};

/**
* | output |
* | --- |
* | "User roster" |
*
* @param {Demo_Narrative_Admin_People_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_people_heading = /** @type {((inputs?: Demo_Narrative_Admin_People_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_People_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_people_heading(inputs)
	return en_demo_narrative_admin_people_heading(inputs)
});