/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Flow_Seam_BadgeInputs */

const en_demo_flow_seam_badge = /** @type {(inputs: Demo_Flow_Seam_BadgeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Scripted in the handbook`)
};

const es_demo_flow_seam_badge = /** @type {(inputs: Demo_Flow_Seam_BadgeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Recreado en el manual`)
};

const en_xa2_demo_flow_seam_badge = /** @type {(inputs: Demo_Flow_Seam_BadgeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Scrìptèd ìn thè hàndbòòk ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Scripted in the handbook" |
*
* @param {Demo_Flow_Seam_BadgeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_flow_seam_badge = /** @type {((inputs?: Demo_Flow_Seam_BadgeInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Seam_BadgeInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_flow_seam_badge(inputs)
	if (locale === "en-XA") return en_xa2_demo_flow_seam_badge(inputs)
	return en_demo_flow_seam_badge(inputs)
});