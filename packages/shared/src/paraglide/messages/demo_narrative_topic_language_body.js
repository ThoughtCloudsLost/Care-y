/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Language_BodyInputs */

const en_demo_narrative_topic_language_body = /** @type {(inputs: Demo_Narrative_Topic_Language_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Volunteers can switch the interface language at the login screen or at any point after signing in. The switch happens instantly without a page reload because all translations are bundled in the app.
**Privacy.** The server does not know which language a volunteer is using because no language preference is transmitted. Language choice is private by default.
**Supported languages.** English and Spanish are currently included, and adding a new language requires only a translation file.`)
};

const es_demo_narrative_topic_language_body = /** @type {(inputs: Demo_Narrative_Topic_Language_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Las personas voluntarias pueden cambiar el idioma de la interfaz en la pantalla de inicio de sesión o en cualquier momento después de iniciar sesión. El cambio es instantáneo sin recargar la página porque todas las traducciones están incluidas en la aplicación.
**Privacidad.** El servidor no sabe qué idioma usa cada voluntario porque no se transmite ninguna preferencia de idioma. La elección de idioma es privada por defecto.
**Idiomas disponibles.** Actualmente se incluyen inglés y español, y añadir un nuevo idioma solo requiere un archivo de traducción.`)
};

/**
* | output |
* | --- |
* | "Volunteers can switch the interface language at the login screen or at any point after signing in. The switch happens instantly without a page reload because..." |
*
* @param {Demo_Narrative_Topic_Language_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_language_body = /** @type {((inputs?: Demo_Narrative_Topic_Language_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Language_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_language_body(inputs)
	return es_demo_narrative_topic_language_body(inputs)
});