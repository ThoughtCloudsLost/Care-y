/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Entry_Phone_HeadingInputs */

const en_demo_entry_phone_heading = /** @type {(inputs: Demo_Entry_Phone_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Move the phone wherever you like`)
};

const es_demo_entry_phone_heading = /** @type {(inputs: Demo_Entry_Phone_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mueve el telefono a donde quieras`)
};

/**
* | output |
* | --- |
* | "Move the phone wherever you like" |
*
* @param {Demo_Entry_Phone_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_entry_phone_heading = /** @type {((inputs?: Demo_Entry_Phone_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Entry_Phone_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_entry_phone_heading(inputs)
	return es_demo_entry_phone_heading(inputs)
});