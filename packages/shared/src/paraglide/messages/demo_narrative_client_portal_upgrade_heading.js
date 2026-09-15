/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Client_Portal_Upgrade_HeadingInputs */

const en_demo_narrative_client_portal_upgrade_heading = /** @type {(inputs: Demo_Narrative_Client_Portal_Upgrade_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Security upgrades`)
};

const es_demo_narrative_client_portal_upgrade_heading = /** @type {(inputs: Demo_Narrative_Client_Portal_Upgrade_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mejoras de seguridad`)
};

/**
* | output |
* | --- |
* | "Security upgrades" |
*
* @param {Demo_Narrative_Client_Portal_Upgrade_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_portal_upgrade_heading = /** @type {((inputs?: Demo_Narrative_Client_Portal_Upgrade_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Client_Portal_Upgrade_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_client_portal_upgrade_heading(inputs)
	return en_demo_narrative_client_portal_upgrade_heading(inputs)
});