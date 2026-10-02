/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Viewer_SwitchingInputs */

const en_demo_viewer_switching = /** @type {(inputs: Demo_Viewer_SwitchingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Switching view`)
};

const es_demo_viewer_switching = /** @type {(inputs: Demo_Viewer_SwitchingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cambiando la vista`)
};

const en_xa2_demo_viewer_switching = /** @type {(inputs: Demo_Viewer_SwitchingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Swìtchìng vìèw •••••⟧`)
};

/**
* | output |
* | --- |
* | "Switching view" |
*
* @param {Demo_Viewer_SwitchingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_viewer_switching = /** @type {((inputs?: Demo_Viewer_SwitchingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Viewer_SwitchingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_viewer_switching(inputs)
	if (locale === "en-XA") return en_xa2_demo_viewer_switching(inputs)
	return en_demo_viewer_switching(inputs)
});