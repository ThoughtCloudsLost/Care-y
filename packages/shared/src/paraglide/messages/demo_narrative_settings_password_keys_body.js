/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Settings_Password_Keys_BodyInputs */

const en_demo_narrative_settings_password_keys_body = /** @type {(inputs: Demo_Narrative_Settings_Password_Keys_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Changing your password runs the full Argon2id stretch, OPRF exchange, and cryptographic key re-wrap pipeline. Your private key is re-encrypted under the new password without the server ever seeing the plaintext. In this demo the pipeline runs against the in-browser database and resets on restart.`)
};

const es_demo_narrative_settings_password_keys_body = /** @type {(inputs: Demo_Narrative_Settings_Password_Keys_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cambiar la contrasena ejecuta el proceso completo de estiramiento Argon2id, intercambio OPRF y re-envolvimiento criptografico de claves. Tu clave privada se vuelve a cifrar bajo la nueva contrasena sin que el servidor vea el texto plano. En este demo el proceso se ejecuta contra la base de datos en el navegador y se reinicia al recargar.`)
};

/**
* | output |
* | --- |
* | "Changing your password runs the full Argon2id stretch, OPRF exchange, and cryptographic key re-wrap pipeline. Your private key is re-encrypted under the new ..." |
*
* @param {Demo_Narrative_Settings_Password_Keys_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_settings_password_keys_body = /** @type {((inputs?: Demo_Narrative_Settings_Password_Keys_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Settings_Password_Keys_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_settings_password_keys_body(inputs)
	return es_demo_narrative_settings_password_keys_body(inputs)
});