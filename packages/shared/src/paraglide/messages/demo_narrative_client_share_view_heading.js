/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Client_Share_View_HeadingInputs */

const en_demo_narrative_client_share_view_heading = /** @type {(inputs: Demo_Narrative_Client_Share_View_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Shared content`)
};

const es_demo_narrative_client_share_view_heading = /** @type {(inputs: Demo_Narrative_Client_Share_View_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Contenido compartido`)
};

const en_xa2_demo_narrative_client_share_view_heading = /** @type {(inputs: Demo_Narrative_Client_Share_View_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Shàrèd còntènt •••••⟧`)
};

/**
* | output |
* | --- |
* | "Shared content" |
*
* @param {Demo_Narrative_Client_Share_View_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_share_view_heading = /** @type {((inputs?: Demo_Narrative_Client_Share_View_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Client_Share_View_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_client_share_view_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_client_share_view_heading(inputs)
	return en_demo_narrative_client_share_view_heading(inputs)
});