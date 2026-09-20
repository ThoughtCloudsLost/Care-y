/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Presets_Body_PlaceholderInputs */

const en_admin_presets_body_placeholder = /** @type {(inputs: Admin_Presets_Body_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The message body...`)
};

const es_admin_presets_body_placeholder = /** @type {(inputs: Admin_Presets_Body_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El cuerpo del mensaje...`)
};

/**
* | output |
* | --- |
* | "The message body..." |
*
* @param {Admin_Presets_Body_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_presets_body_placeholder = /** @type {((inputs?: Admin_Presets_Body_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Presets_Body_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_presets_body_placeholder(inputs)
	return en_admin_presets_body_placeholder(inputs)
});