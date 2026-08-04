/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Flow_Seam_BadgeInputs */

const en_demo_flow_seam_badge = /** @type {(inputs: Demo_Flow_Seam_BadgeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Scripted in this demo`)
};

const es_demo_flow_seam_badge = /** @type {(inputs: Demo_Flow_Seam_BadgeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Recreado en este demo`)
};

/**
* | output |
* | --- |
* | "Scripted in this demo" |
*
* @param {Demo_Flow_Seam_BadgeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_seam_badge = /** @type {((inputs?: Demo_Flow_Seam_BadgeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Seam_BadgeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_flow_seam_badge(inputs)
	return es_demo_flow_seam_badge(inputs)
});