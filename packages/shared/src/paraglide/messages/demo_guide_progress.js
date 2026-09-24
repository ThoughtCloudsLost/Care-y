/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ done: NonNullable<unknown>, total: NonNullable<unknown> }} Demo_Guide_ProgressInputs */

const en_demo_guide_progress = /** @type {(inputs: Demo_Guide_ProgressInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.done} of ${i?.total}`)
};

const es_demo_guide_progress = /** @type {(inputs: Demo_Guide_ProgressInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.done} de ${i?.total}`)
};

const en_xa2_demo_guide_progress = /** @type {(inputs: Demo_Guide_ProgressInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.done} òf  ••${i?.total}⟧`)
};

/**
* | output |
* | --- |
* | "{done} of {total}" |
*
* @param {Demo_Guide_ProgressInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_progress = /** @type {((inputs: Demo_Guide_ProgressInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Guide_ProgressInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_guide_progress(inputs)
	if (locale === "en-XA") return en_xa2_demo_guide_progress(inputs)
	return en_demo_guide_progress(inputs)
});