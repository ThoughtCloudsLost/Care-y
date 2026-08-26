/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Fs_Pill_LabelInputs */

const en_demo_fs_pill_label = /** @type {(inputs: Demo_Fs_Pill_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Simulator controls`)
};

const es_demo_fs_pill_label = /** @type {(inputs: Demo_Fs_Pill_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Controles del simulador`)
};

/**
* | output |
* | --- |
* | "Simulator controls" |
*
* @param {Demo_Fs_Pill_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_fs_pill_label = /** @type {((inputs?: Demo_Fs_Pill_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Fs_Pill_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_fs_pill_label(inputs)
	return es_demo_fs_pill_label(inputs)
});