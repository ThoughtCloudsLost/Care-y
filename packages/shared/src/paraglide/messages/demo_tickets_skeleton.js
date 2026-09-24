/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Tickets_SkeletonInputs */

const en_demo_tickets_skeleton = /** @type {(inputs: Demo_Tickets_SkeletonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Loading encrypted tickets`)
};

const es_demo_tickets_skeleton = /** @type {(inputs: Demo_Tickets_SkeletonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cargando tickets cifrados`)
};

const en_xa2_demo_tickets_skeleton = /** @type {(inputs: Demo_Tickets_SkeletonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Lòàdìng èncryptèd tìckèts ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Loading encrypted tickets" |
*
* @param {Demo_Tickets_SkeletonInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_tickets_skeleton = /** @type {((inputs?: Demo_Tickets_SkeletonInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Tickets_SkeletonInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_tickets_skeleton(inputs)
	if (locale === "en-XA") return en_xa2_demo_tickets_skeleton(inputs)
	return en_demo_tickets_skeleton(inputs)
});