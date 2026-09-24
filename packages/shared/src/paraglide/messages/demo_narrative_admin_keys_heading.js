/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Keys_HeadingInputs */

const en_demo_narrative_admin_keys_heading = /** @type {(inputs: Demo_Narrative_Admin_Keys_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Encryption keys and escrow`)
};

const es_demo_narrative_admin_keys_heading = /** @type {(inputs: Demo_Narrative_Admin_Keys_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Claves de cifrado y custodia`)
};

const en_xa2_demo_narrative_admin_keys_heading = /** @type {(inputs: Demo_Narrative_Admin_Keys_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èncryptìòn kèys ànd èscròw ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Encryption keys and escrow" |
*
* @param {Demo_Narrative_Admin_Keys_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_keys_heading = /** @type {((inputs?: Demo_Narrative_Admin_Keys_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Keys_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_keys_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_keys_heading(inputs)
	return en_demo_narrative_admin_keys_heading(inputs)
});