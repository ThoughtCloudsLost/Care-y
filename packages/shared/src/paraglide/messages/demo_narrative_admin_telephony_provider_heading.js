/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Telephony_Provider_HeadingInputs */

const en_demo_narrative_admin_telephony_provider_heading = /** @type {(inputs: Demo_Narrative_Admin_Telephony_Provider_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Provider connection`)
};

const es_demo_narrative_admin_telephony_provider_heading = /** @type {(inputs: Demo_Narrative_Admin_Telephony_Provider_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Conexión con el proveedor`)
};

/**
* | output |
* | --- |
* | "Provider connection" |
*
* @param {Demo_Narrative_Admin_Telephony_Provider_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_telephony_provider_heading = /** @type {((inputs?: Demo_Narrative_Admin_Telephony_Provider_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Telephony_Provider_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_admin_telephony_provider_heading(inputs)
	return es_demo_narrative_admin_telephony_provider_heading(inputs)
});