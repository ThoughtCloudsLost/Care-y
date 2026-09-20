/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Coming_Soon_DescInputs */

const en_demo_coming_soon_desc = /** @type {(inputs: Demo_Coming_Soon_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This screen is part of the full application, but its documentation has not been written yet.`)
};

const es_demo_coming_soon_desc = /** @type {(inputs: Demo_Coming_Soon_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Esta pantalla forma parte de la aplicación completa, pero su documentación aún no se ha escrito.`)
};

const en_xa2_demo_coming_soon_desc = /** @type {(inputs: Demo_Coming_Soon_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thìs scrèèn ìs pàrt òf thè fùll àpplìcàtìòn, bùt ìts dòcùmèntàtìòn hàs nòt bèèn wrìttèn yèt. ••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This screen is part of the full application, but its documentation has not been written yet." |
*
* @param {Demo_Coming_Soon_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_coming_soon_desc = /** @type {((inputs?: Demo_Coming_Soon_DescInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Coming_Soon_DescInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_coming_soon_desc(inputs)
	if (locale === "en-XA") return en_xa2_demo_coming_soon_desc(inputs)
	return en_demo_coming_soon_desc(inputs)
});