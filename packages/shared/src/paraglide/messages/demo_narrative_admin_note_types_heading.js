/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Note_Types_HeadingInputs */

const en_demo_narrative_admin_note_types_heading = /** @type {(inputs: Demo_Narrative_Admin_Note_Types_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Note types`)
};

const es_demo_narrative_admin_note_types_heading = /** @type {(inputs: Demo_Narrative_Admin_Note_Types_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tipos de nota`)
};

const en_xa2_demo_narrative_admin_note_types_heading = /** @type {(inputs: Demo_Narrative_Admin_Note_Types_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nòtè typès •••⟧`)
};

/**
* | output |
* | --- |
* | "Note types" |
*
* @param {Demo_Narrative_Admin_Note_Types_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_note_types_heading = /** @type {((inputs?: Demo_Narrative_Admin_Note_Types_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Note_Types_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_note_types_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_note_types_heading(inputs)
	return en_demo_narrative_admin_note_types_heading(inputs)
});