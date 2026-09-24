/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Vol_Protected_KeysInputs */

const en_vol_protected_keys = /** @type {(inputs: Vol_Protected_KeysInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your encryption keys are derived from your password. The server never holds them.`)
};

const es_vol_protected_keys = /** @type {(inputs: Vol_Protected_KeysInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tus claves de cifrado se derivan de tu contraseña. El servidor nunca las almacena.`)
};

const en_xa2_vol_protected_keys = /** @type {(inputs: Vol_Protected_KeysInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Yòùr èncryptìòn kèys àrè dèrìvèd fròm yòùr pàsswòrd. Thè sèrvèr nèvèr hòlds thèm. •••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Your encryption keys are derived from your password. The server never holds them." |
*
* @param {Vol_Protected_KeysInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const vol_protected_keys = /** @type {((inputs?: Vol_Protected_KeysInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Vol_Protected_KeysInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_vol_protected_keys(inputs)
	if (locale === "en-XA") return en_xa2_vol_protected_keys(inputs)
	return en_vol_protected_keys(inputs)
});