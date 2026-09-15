/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Client_Portal_Passphrase_HeadingInputs */

const en_demo_narrative_client_portal_passphrase_heading = /** @type {(inputs: Demo_Narrative_Client_Portal_Passphrase_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Passphrase entry`)
};

const es_demo_narrative_client_portal_passphrase_heading = /** @type {(inputs: Demo_Narrative_Client_Portal_Passphrase_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Entrada de frase de paso`)
};

/**
* | output |
* | --- |
* | "Passphrase entry" |
*
* @param {Demo_Narrative_Client_Portal_Passphrase_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_portal_passphrase_heading = /** @type {((inputs?: Demo_Narrative_Client_Portal_Passphrase_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Client_Portal_Passphrase_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_client_portal_passphrase_heading(inputs)
	return en_demo_narrative_client_portal_passphrase_heading(inputs)
});