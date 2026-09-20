/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Github_Link_LabelInputs */

const en_demo_github_link_label = /** @type {(inputs: Demo_Github_Link_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`View source on GitHub`)
};

const es_demo_github_link_label = /** @type {(inputs: Demo_Github_Link_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ver código fuente en GitHub`)
};

const en_xa2_demo_github_link_label = /** @type {(inputs: Demo_Github_Link_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Vìèw sòùrcè òn GìtHùb •••••••⟧`)
};

/**
* | output |
* | --- |
* | "View source on GitHub" |
*
* @param {Demo_Github_Link_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_github_link_label = /** @type {((inputs?: Demo_Github_Link_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Github_Link_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_github_link_label(inputs)
	if (locale === "en-XA") return en_xa2_demo_github_link_label(inputs)
	return en_demo_github_link_label(inputs)
});