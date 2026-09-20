/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Chip_DismissInputs */

const en_demo_chip_dismiss = /** @type {(inputs: Demo_Chip_DismissInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Dismiss reading chip`)
};

const es_demo_chip_dismiss = /** @type {(inputs: Demo_Chip_DismissInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cerrar indicador de lectura`)
};

const en_xa2_demo_chip_dismiss = /** @type {(inputs: Demo_Chip_DismissInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dìsmìss rèàdìng chìp ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Dismiss reading chip" |
*
* @param {Demo_Chip_DismissInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_chip_dismiss = /** @type {((inputs?: Demo_Chip_DismissInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Chip_DismissInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_chip_dismiss(inputs)
	if (locale === "en-XA") return en_xa2_demo_chip_dismiss(inputs)
	return en_demo_chip_dismiss(inputs)
});