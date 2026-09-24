/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Coming_Soon_TitleInputs */

const en_demo_coming_soon_title = /** @type {(inputs: Demo_Coming_Soon_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Coming soon`)
};

const es_demo_coming_soon_title = /** @type {(inputs: Demo_Coming_Soon_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Próximamente`)
};

const en_xa2_demo_coming_soon_title = /** @type {(inputs: Demo_Coming_Soon_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còmìng sòòn ••••⟧`)
};

/**
* | output |
* | --- |
* | "Coming soon" |
*
* @param {Demo_Coming_Soon_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_coming_soon_title = /** @type {((inputs?: Demo_Coming_Soon_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Coming_Soon_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_coming_soon_title(inputs)
	if (locale === "en-XA") return en_xa2_demo_coming_soon_title(inputs)
	return en_demo_coming_soon_title(inputs)
});