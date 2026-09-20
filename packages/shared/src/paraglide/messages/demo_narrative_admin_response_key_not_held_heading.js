/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Response_Key_Not_Held_HeadingInputs */

const en_demo_narrative_admin_response_key_not_held_heading = /** @type {(inputs: Demo_Narrative_Admin_Response_Key_Not_Held_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Unreadable response`)
};

const es_demo_narrative_admin_response_key_not_held_heading = /** @type {(inputs: Demo_Narrative_Admin_Response_Key_Not_Held_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Respuesta ilegible`)
};

const en_xa2_demo_narrative_admin_response_key_not_held_heading = /** @type {(inputs: Demo_Narrative_Admin_Response_Key_Not_Held_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ùnrèàdàblè rèspònsè ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Unreadable response" |
*
* @param {Demo_Narrative_Admin_Response_Key_Not_Held_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_response_key_not_held_heading = /** @type {((inputs?: Demo_Narrative_Admin_Response_Key_Not_Held_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Response_Key_Not_Held_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_response_key_not_held_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_response_key_not_held_heading(inputs)
	return en_demo_narrative_admin_response_key_not_held_heading(inputs)
});