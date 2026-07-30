/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Entry_DescInputs */

const en_demo_entry_desc = /** @type {(inputs: Demo_Entry_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`CARE-Y is a call intake system for people who cannot afford to be identified. This demo runs the real application in your browser, with a story alongside it that explains what each screen is doing.`)
};

const es_demo_entry_desc = /** @type {(inputs: Demo_Entry_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`CARE-Y es un sistema de recepcion de llamadas para personas que no pueden permitirse ser identificadas. Esta demostracion ejecuta la aplicacion real en tu navegador, junto a un relato que explica lo que hace cada pantalla.`)
};

/**
* | output |
* | --- |
* | "CARE-Y is a call intake system for people who cannot afford to be identified. This demo runs the real application in your browser, with a story alongside it ..." |
*
* @param {Demo_Entry_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_entry_desc = /** @type {((inputs?: Demo_Entry_DescInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Entry_DescInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_entry_desc(inputs)
	return es_demo_entry_desc(inputs)
});