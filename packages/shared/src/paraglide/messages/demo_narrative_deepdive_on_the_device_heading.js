/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Deepdive_On_The_Device_HeadingInputs */

const en_demo_narrative_deepdive_on_the_device_heading = /** @type {(inputs: Demo_Narrative_Deepdive_On_The_Device_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`On the device`)
};

const es_demo_narrative_deepdive_on_the_device_heading = /** @type {(inputs: Demo_Narrative_Deepdive_On_The_Device_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`En el dispositivo`)
};

const en_xa2_demo_narrative_deepdive_on_the_device_heading = /** @type {(inputs: Demo_Narrative_Deepdive_On_The_Device_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òn thè dèvìcè ••••⟧`)
};

/**
* | output |
* | --- |
* | "On the device" |
*
* @param {Demo_Narrative_Deepdive_On_The_Device_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_deepdive_on_the_device_heading = /** @type {((inputs?: Demo_Narrative_Deepdive_On_The_Device_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Deepdive_On_The_Device_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_deepdive_on_the_device_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_deepdive_on_the_device_heading(inputs)
	return en_demo_narrative_deepdive_on_the_device_heading(inputs)
});