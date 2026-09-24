/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Compose_SampleInputs */

const en_demo_compose_sample = /** @type {(inputs: Demo_Compose_SampleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Thank you for reaching out. Let me look into this for you.`)
};

const es_demo_compose_sample = /** @type {(inputs: Demo_Compose_SampleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Gracias por comunicarse. Permítame revisar esto por usted.`)
};

const en_xa2_demo_compose_sample = /** @type {(inputs: Demo_Compose_SampleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thànk yòù fòr rèàchìng òùt. Lèt mè lòòk ìntò thìs fòr yòù. ••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Thank you for reaching out. Let me look into this for you." |
*
* @param {Demo_Compose_SampleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_compose_sample = /** @type {((inputs?: Demo_Compose_SampleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Compose_SampleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_compose_sample(inputs)
	if (locale === "en-XA") return en_xa2_demo_compose_sample(inputs)
	return en_demo_compose_sample(inputs)
});