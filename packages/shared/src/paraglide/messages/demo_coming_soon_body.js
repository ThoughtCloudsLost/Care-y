/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Coming_Soon_BodyInputs */

const en_demo_coming_soon_body = /** @type {(inputs: Demo_Coming_Soon_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`You can interact with this screen in the phone. It runs against the same in-browser database as the rest of the demo. A guided walkthrough for this area will be added in a future update.`)
};

const es_demo_coming_soon_body = /** @type {(inputs: Demo_Coming_Soon_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Puede interactuar con esta pantalla en el telefono. Funciona contra la misma base de datos del navegador que el resto del demo. Se agregara un recorrido guiado para esta area en una actualizacion futura.`)
};

/**
* | output |
* | --- |
* | "You can interact with this screen in the phone. It runs against the same in-browser database as the rest of the demo. A guided walkthrough for this area will..." |
*
* @param {Demo_Coming_Soon_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_coming_soon_body = /** @type {((inputs?: Demo_Coming_Soon_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Coming_Soon_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_coming_soon_body(inputs)
	return es_demo_coming_soon_body(inputs)
});