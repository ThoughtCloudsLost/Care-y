/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Entry_TitleInputs */

const en_demo_entry_title = /** @type {(inputs: Demo_Entry_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The CARE-Y handbook`)
};

const es_demo_entry_title = /** @type {(inputs: Demo_Entry_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El manual de CARE-Y`)
};

const en_xa2_demo_entry_title = /** @type {(inputs: Demo_Entry_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè CÀRÈ-Y hàndbòòk ••••••⟧`)
};

/**
* | output |
* | --- |
* | "The CARE-Y handbook" |
*
* @param {Demo_Entry_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_entry_title = /** @type {((inputs?: Demo_Entry_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Entry_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_entry_title(inputs)
	if (locale === "en-XA") return en_xa2_demo_entry_title(inputs)
	return en_demo_entry_title(inputs)
});