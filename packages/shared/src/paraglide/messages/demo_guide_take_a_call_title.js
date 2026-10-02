/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Guide_Take_A_Call_TitleInputs */

const en_demo_guide_take_a_call_title = /** @type {(inputs: Demo_Guide_Take_A_Call_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Take a call`)
};

const es_demo_guide_take_a_call_title = /** @type {(inputs: Demo_Guide_Take_A_Call_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tomar una llamada`)
};

const en_xa2_demo_guide_take_a_call_title = /** @type {(inputs: Demo_Guide_Take_A_Call_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tàkè à càll ••••⟧`)
};

/**
* | output |
* | --- |
* | "Take a call" |
*
* @param {Demo_Guide_Take_A_Call_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_take_a_call_title = /** @type {((inputs?: Demo_Guide_Take_A_Call_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Guide_Take_A_Call_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_guide_take_a_call_title(inputs)
	if (locale === "en-XA") return en_xa2_demo_guide_take_a_call_title(inputs)
	return en_demo_guide_take_a_call_title(inputs)
});