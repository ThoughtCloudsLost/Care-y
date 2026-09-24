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

const en_xa2_demo_narrative_admin_phone_lines_heading = /** @type {(inputs: Demo_Narrative_Admin_Phone_Lines_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Phònè lìnès ••••⟧`)
};

/**
* | output |
* | --- |
* | "Phone lines" |
*
* @param {Demo_Narrative_Admin_Phone_Lines_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_phone_lines_heading = /** @type {((inputs?: Demo_Narrative_Admin_Phone_Lines_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Phone_Lines_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_phone_lines_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_phone_lines_heading(inputs)
	return en_demo_narrative_admin_phone_lines_heading(inputs)
});