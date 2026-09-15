/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Client_Privacy_Notice_HeadingInputs */

const en_demo_narrative_client_privacy_notice_heading = /** @type {(inputs: Demo_Narrative_Client_Privacy_Notice_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Retention and rights`)
};

const es_demo_narrative_client_privacy_notice_heading = /** @type {(inputs: Demo_Narrative_Client_Privacy_Notice_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Retención y derechos`)
};

/**
* | output |
* | --- |
* | "Retention and rights" |
*
* @param {Demo_Narrative_Client_Privacy_Notice_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_privacy_notice_heading = /** @type {((inputs?: Demo_Narrative_Client_Privacy_Notice_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Client_Privacy_Notice_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_client_privacy_notice_heading(inputs)
	return en_demo_narrative_client_privacy_notice_heading(inputs)
});