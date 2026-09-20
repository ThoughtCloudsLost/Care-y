/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Client_Quick_Exit_HeadingInputs */

const en_demo_narrative_client_quick_exit_heading = /** @type {(inputs: Demo_Narrative_Client_Quick_Exit_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Quick exit`)
};

const es_demo_narrative_client_quick_exit_heading = /** @type {(inputs: Demo_Narrative_Client_Quick_Exit_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Salida rápida`)
};

const en_xa2_demo_narrative_client_quick_exit_heading = /** @type {(inputs: Demo_Narrative_Client_Quick_Exit_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Qùìck èxìt •••⟧`)
};

/**
* | output |
* | --- |
* | "Quick exit" |
*
* @param {Demo_Narrative_Client_Quick_Exit_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_quick_exit_heading = /** @type {((inputs?: Demo_Narrative_Client_Quick_Exit_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Client_Quick_Exit_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_client_quick_exit_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_client_quick_exit_heading(inputs)
	return en_demo_narrative_client_quick_exit_heading(inputs)
});