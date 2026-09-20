/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Panel_UsersInputs */

const en_panel_users = /** @type {(inputs: Panel_UsersInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Users`)
};

const es_panel_users = /** @type {(inputs: Panel_UsersInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Usuarios`)
};

const en_xa2_panel_users = /** @type {(inputs: Panel_UsersInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ùsèrs ••⟧`)
};

/**
* | output |
* | --- |
* | "Users" |
*
* @param {Panel_UsersInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const panel_users = /** @type {((inputs?: Panel_UsersInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Panel_UsersInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_panel_users(inputs)
	if (locale === "en-XA") return en_xa2_panel_users(inputs)
	return en_panel_users(inputs)
});