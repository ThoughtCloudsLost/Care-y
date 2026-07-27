/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Credentials_BodyInputs */

const en_demo_narrative_topic_credentials_body = /** @type {(inputs: Demo_Narrative_Topic_Credentials_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`You type a username and password. The password never leaves your device in its original form. CARE-Y runs Argon2id, a memory-hard key stretching function, to transform it into a high-entropy value. This stretched output becomes the starting point for key derivation. Even if someone intercepts the network traffic, they get a value that is computationally impractical to reverse.`)
};

const es_demo_narrative_topic_credentials_body = /** @type {(inputs: Demo_Narrative_Topic_Credentials_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Escribes un nombre de usuario y contrasena. La contrasena nunca sale de tu dispositivo en su forma original. CARE-Y ejecuta Argon2id, una funcion de estiramiento de clave con uso intensivo de memoria, para transformarla en un valor de alta entropia. Este resultado estirado se convierte en el punto de partida para la derivacion de claves. Aunque alguien intercepte el trafico de red, obtiene un valor computacionalmente impracticable de revertir.`)
};

/**
* | output |
* | --- |
* | "You type a username and password. The password never leaves your device in its original form. CARE-Y runs Argon2id, a memory-hard key stretching function, to..." |
*
* @param {Demo_Narrative_Topic_Credentials_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_credentials_body = /** @type {((inputs?: Demo_Narrative_Topic_Credentials_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Credentials_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_credentials_body(inputs)
	return es_demo_narrative_topic_credentials_body(inputs)
});