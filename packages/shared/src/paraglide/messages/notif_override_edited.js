/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Notif_Override_EditedInputs */

const en_notif_override_edited = /** @type {(inputs: Notif_Override_EditedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`edited`)
};

const es_notif_override_edited = /** @type {(inputs: Notif_Override_EditedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`editado`)
};

/**
* | output |
* | --- |
* | "edited" |
*
* @param {Notif_Override_EditedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const notif_override_edited = /** @type {((inputs?: Notif_Override_EditedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Notif_Override_EditedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_notif_override_edited(inputs)
	return es_notif_override_edited(inputs)
});