/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Language_BodyInputs */

const en_demo_narrative_topic_language_body = /** @type {(inputs: Demo_Narrative_Topic_Language_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The interface language can be changed before signing in and at any point afterward, and the change takes effect immediately because both languages travel inside the app rather than arriving from the server at the moment of the switch.
**Privacy.** The user's language preference is stored on the server as ciphertext the server cannot read, so it reveals nothing about who is signing in. It is sent in plaintext once, when the account is created, because the server performs the sealing at that point, and the app applies the sealed copy again at each sign in.
**Supported languages.** English and Spanish are the two languages CARE-Y ships. Until someone picks one, the app follows the language the browser itself asks for, and English when the browser asks for neither.`)
};

const es_demo_narrative_topic_language_body = /** @type {(inputs: Demo_Narrative_Topic_Language_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El idioma de la interfaz puede cambiarse antes de iniciar sesión y en cualquier momento posterior, y el cambio surte efecto de inmediato porque ambos idiomas viajan dentro de la aplicación en lugar de llegar desde el servidor en el momento del cambio.
**Privacidad.** La preferencia de idioma de la persona usuaria se guarda en el servidor como texto cifrado que el servidor no puede leer, así que no revela nada sobre quién inicia sesión. Se envía en texto plano una sola vez, al crear la cuenta, porque el servidor realiza el sellado en ese momento, y la aplicación vuelve a aplicar esa copia sellada en cada inicio de sesión.
**Idiomas disponibles.** El inglés y el español son los dos idiomas que trae CARE-Y. Mientras nadie elija uno, la aplicación sigue el idioma que pide el propio navegador, y el inglés cuando el navegador no pide ninguno de los dos.`)
};

/**
* | output |
* | --- |
* | "The interface language can be changed before signing in and at any point afterward, and the change takes effect immediately because both languages travel ins..." |
*
* @param {Demo_Narrative_Topic_Language_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_language_body = /** @type {((inputs?: Demo_Narrative_Topic_Language_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Language_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_language_body(inputs)
	return en_demo_narrative_topic_language_body(inputs)
});