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

const en_xa2_notif_override_edited = /** @type {(inputs: Notif_Override_EditedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦èdìtèd ••⟧`)
};

/**
* | output |
* | --- |
* | "edited" |
*
* @param {Notif_Override_EditedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const notif_override_edited = /** @type {((inputs?: Notif_Override_EditedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Notif_Override_EditedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_notif_override_edited(inputs)
	if (locale === "en-XA") return en_xa2_notif_override_edited(inputs)
	return en_notif_override_edited(inputs)
});