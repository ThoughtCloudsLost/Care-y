/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Phone_Lines_HeadingInputs */

const en_demo_narrative_admin_phone_lines_heading = /** @type {(inputs: Demo_Narrative_Admin_Phone_Lines_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Phone lines`)
};

const es_demo_narrative_admin_phone_lines_heading = /** @type {(inputs: Demo_Narrative_Admin_Phone_Lines_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Líneas telefónicas`)
};

/**
* | output |
* | --- |
* | "Phone lines" |
*
* @param {Demo_Narrative_Admin_Phone_Lines_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_phone_lines_heading = /** @type {((inputs?: Demo_Narrative_Admin_Phone_Lines_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Phone_Lines_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_admin_phone_lines_heading(inputs)
	return es_demo_narrative_admin_phone_lines_heading(inputs)
});