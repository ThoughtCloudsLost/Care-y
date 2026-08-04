/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Flow_Band_TitleInputs */

const en_demo_flow_band_title = /** @type {(inputs: Demo_Flow_Band_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Data flow`)
};

const es_demo_flow_band_title = /** @type {(inputs: Demo_Flow_Band_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Flujo de datos`)
};

/**
* | output |
* | --- |
* | "Data flow" |
*
* @param {Demo_Flow_Band_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_band_title = /** @type {((inputs?: Demo_Flow_Band_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Band_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_flow_band_title(inputs)
	return es_demo_flow_band_title(inputs)
});