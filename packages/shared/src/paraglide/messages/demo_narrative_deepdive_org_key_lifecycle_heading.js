/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Deepdive_Org_Key_Lifecycle_HeadingInputs */

const en_demo_narrative_deepdive_org_key_lifecycle_heading = /** @type {(inputs: Demo_Narrative_Deepdive_Org_Key_Lifecycle_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The organization key lifecycle`)
};

const es_demo_narrative_deepdive_org_key_lifecycle_heading = /** @type {(inputs: Demo_Narrative_Deepdive_Org_Key_Lifecycle_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El ciclo de vida de la clave de la organización`)
};

const en_xa2_demo_narrative_deepdive_org_key_lifecycle_heading = /** @type {(inputs: Demo_Narrative_Deepdive_Org_Key_Lifecycle_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè òrgànìzàtìòn kèy lìfècyclè •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The organization key lifecycle" |
*
* @param {Demo_Narrative_Deepdive_Org_Key_Lifecycle_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_deepdive_org_key_lifecycle_heading = /** @type {((inputs?: Demo_Narrative_Deepdive_Org_Key_Lifecycle_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Deepdive_Org_Key_Lifecycle_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_deepdive_org_key_lifecycle_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_deepdive_org_key_lifecycle_heading(inputs)
	return en_demo_narrative_deepdive_org_key_lifecycle_heading(inputs)
});