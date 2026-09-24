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

const en_xa2_demo_narrative_client_portal_upgrade_heading = /** @type {(inputs: Demo_Narrative_Client_Portal_Upgrade_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sècùrìty ùpgràdès ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Security upgrades" |
*
* @param {Demo_Narrative_Client_Portal_Upgrade_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_portal_upgrade_heading = /** @type {((inputs?: Demo_Narrative_Client_Portal_Upgrade_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Client_Portal_Upgrade_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_client_portal_upgrade_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_client_portal_upgrade_heading(inputs)
	return en_demo_narrative_client_portal_upgrade_heading(inputs)
});