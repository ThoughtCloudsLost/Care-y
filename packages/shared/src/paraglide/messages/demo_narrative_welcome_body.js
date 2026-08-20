/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Welcome_BodyInputs */

const en_demo_narrative_welcome_body = /** @type {(inputs: Demo_Narrative_Welcome_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tap a feature in the list or use the tabs inside the CARE-Y simulator to explore. Every piece of data you see is encrypted on the client before it reaches the server. The server never holds your keys.`)
};

const es_demo_narrative_welcome_body = /** @type {(inputs: Demo_Narrative_Welcome_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Toca una función en la lista o usa las pestañas dentro del simulador CARE-Y para explorar. Cada dato que ves se cifra en el navegador antes de llegar al servidor. El servidor nunca tiene tus claves.`)
};

/**
* | output |
* | --- |
* | "Tap a feature in the list or use the tabs inside the CARE-Y simulator to explore. Every piece of data you see is encrypted on the client before it reaches th..." |
*
* @param {Demo_Narrative_Welcome_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_welcome_body = /** @type {((inputs?: Demo_Narrative_Welcome_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Welcome_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_welcome_body(inputs)
	return es_demo_narrative_welcome_body(inputs)
});