/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Scene_SearchInputs */

const en_demo_scene_search = /** @type {(inputs: Demo_Scene_SearchInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Search`)
};

const es_demo_scene_search = /** @type {(inputs: Demo_Scene_SearchInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Buscar`)
};

/**
* | output |
* | --- |
* | "Search" |
*
* @param {Demo_Scene_SearchInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_scene_search = /** @type {((inputs?: Demo_Scene_SearchInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Scene_SearchInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_scene_search(inputs)
	return es_demo_scene_search(inputs)
});