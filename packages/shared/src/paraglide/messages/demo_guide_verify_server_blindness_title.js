/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Guide_Verify_Server_Blindness_TitleInputs */

const en_demo_guide_verify_server_blindness_title = /** @type {(inputs: Demo_Guide_Verify_Server_Blindness_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Verify what the server sees`)
};

const es_demo_guide_verify_server_blindness_title = /** @type {(inputs: Demo_Guide_Verify_Server_Blindness_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Verificar lo que ve el servidor`)
};

const en_xa2_demo_guide_verify_server_blindness_title = /** @type {(inputs: Demo_Guide_Verify_Server_Blindness_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Vèrìfy whàt thè sèrvèr sèès •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Verify what the server sees" |
*
* @param {Demo_Guide_Verify_Server_Blindness_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_verify_server_blindness_title = /** @type {((inputs?: Demo_Guide_Verify_Server_Blindness_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Guide_Verify_Server_Blindness_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_guide_verify_server_blindness_title(inputs)
	if (locale === "en-XA") return en_xa2_demo_guide_verify_server_blindness_title(inputs)
	return en_demo_guide_verify_server_blindness_title(inputs)
});