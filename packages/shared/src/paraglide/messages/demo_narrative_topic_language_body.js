/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Language_BodyInputs */

const en_demo_narrative_topic_language_body = /** @type {(inputs: Demo_Narrative_Topic_Language_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The interface language is changeable before sign in and at any time after, and the change is immediate because both languages ship inside the app with nothing fetched from the server at switch time. With no choice made, the app follows the browser's requested language and falls back to English when the browser asks for neither.
**Privacy.** The stored language preference is ciphertext the server cannot read, so it reveals nothing about who is signing in. It is sent in plaintext exactly once, at account creation, because the server performs the initial sealing at that point, and the sealed copy is reapplied at each sign in afterward.`)
};

const es_demo_narrative_topic_language_body = /** @type {(inputs: Demo_Narrative_Topic_Language_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El idioma de la interfaz se puede cambiar antes de iniciar sesión y en cualquier momento después, y el cambio es inmediato porque ambos idiomas se distribuyen dentro de la aplicación sin necesidad de solicitar nada al servidor en el momento del cambio. Sin una elección explícita, la aplicación sigue el idioma que solicita el navegador y recurre al inglés cuando el navegador no pide ninguno de los dos.
**Privacidad.** La preferencia de idioma almacenada es texto cifrado que el servidor no puede leer, de modo que no revela nada sobre quién inicia sesión. Se envía en texto plano exactamente una vez, al crear la cuenta, porque el servidor realiza el sellado inicial en ese momento, y la copia sellada se reaplica en cada inicio de sesión posterior.`)
};

const en_xa2_demo_narrative_topic_language_body = /** @type {(inputs: Demo_Narrative_Topic_Language_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè ìntèrfàcè làngùàgè ìs chàngèàblè bèfòrè sìgn ìn ànd àt àny tìmè àftèr, ànd thè chàngè ìs ìmmèdìàtè bècàùsè bòth làngùàgès shìp ìnsìdè thè àpp wìth nòthìng fètchèd fròm thè sèrvèr àt swìtch tìmè. Wìth nò chòìcè màdè, thè àpp fòllòws thè bròwsèr's rèqùèstèd làngùàgè ànd fàlls bàck tò Ènglìsh whèn thè bròwsèr àsks fòr nèìthèr.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Prìvàcy. •••** Thè stòrèd làngùàgè prèfèrèncè ìs cìphèrtèxt thè sèrvèr cànnòt rèàd, sò ìt rèvèàls nòthìng àbòùt whò ìs sìgnìng ìn. Ìt ìs sènt ìn plàìntèxt èxàctly òncè, àt àccòùnt crèàtìòn, bècàùsè thè sèrvèr pèrfòrms thè ìnìtìàl sèàlìng àt thàt pòìnt, ànd thè sèàlèd còpy ìs rèàpplìèd àt èàch sìgn ìn àftèrwàrd. ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The interface language is changeable before sign in and at any time after, and the change is immediate because both languages ship inside the app with nothin..." |
*
* @param {Demo_Narrative_Topic_Language_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_language_body = /** @type {((inputs?: Demo_Narrative_Topic_Language_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Language_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_language_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_language_body(inputs)
	return en_demo_narrative_topic_language_body(inputs)
});