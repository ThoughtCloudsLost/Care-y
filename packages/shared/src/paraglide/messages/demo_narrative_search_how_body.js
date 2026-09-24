/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Search_How_BodyInputs */

const en_demo_narrative_search_how_body = /** @type {(inputs: Demo_Narrative_Search_How_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Global search runs in two tiers.
**Instant results.** The browser fuzzy matches the query against content it has already decrypted and cached. This returns results immediately with no network call.
**Full deep search.** When instant results are insufficient, the browser fetches encrypted data from the server, decrypts it locally, and matches the query against the plaintext. The server sends encrypted blobs but performs no text matching. All search terms stay on the device.
**Coverage indicator.** A line below the results shows how many records have been searched out of the total, so it is clear whether a full search would cover more.`)
};

const es_demo_narrative_search_how_body = /** @type {(inputs: Demo_Narrative_Search_How_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La búsqueda global funciona en dos niveles.
**Resultados instantáneos.** El navegador compara de forma aproximada la consulta contra el contenido que ya descifró y almacenó en caché. Los resultados aparecen inmediatamente sin llamada de red.
**Búsqueda profunda completa.** Cuando los resultados instantáneos son insuficientes, el navegador obtiene datos cifrados del servidor, los descifra localmente y compara la consulta contra el texto plano. El servidor envía bloques cifrados pero no realiza ninguna comparación de texto. Todos los términos de búsqueda permanecen en el dispositivo.
**Indicador de cobertura.** Una línea debajo de los resultados muestra cuántos registros se han buscado del total, dejando claro si una búsqueda completa cubriría más.`)
};

const en_xa2_demo_narrative_search_how_body = /** @type {(inputs: Demo_Narrative_Search_How_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Glòbàl sèàrch rùns ìn twò tìèrs.
 ••••••••••**Ìnstànt rèsùlts. •••••** Thè bròwsèr fùzzy màtchès thè qùèry àgàìnst còntènt ìt hàs àlrèàdy dècryptèd ànd càchèd. Thìs rètùrns rèsùlts ìmmèdìàtèly wìth nò nètwòrk càll.
 ••••••••••••••••••••••••••••••••••••••••••••**Fùll dèèp sèàrch. ••••••** Whèn ìnstànt rèsùlts àrè ìnsùffìcìènt, thè bròwsèr fètchès èncryptèd dàtà fròm thè sèrvèr, dècrypts ìt lòcàlly, ànd màtchès thè qùèry àgàìnst thè plàìntèxt. Thè sèrvèr sènds èncryptèd blòbs bùt pèrfòrms nò tèxt màtchìng. Àll sèàrch tèrms stày òn thè dèvìcè.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Còvèràgè ìndìcàtòr. ••••••** À lìnè bèlòw thè rèsùlts shòws hòw màny rècòrds hàvè bèèn sèàrchèd òùt òf thè tòtàl, sò ìt ìs clèàr whèthèr à fùll sèàrch wòùld còvèr mòrè. ••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Global search runs in two tiers. **Instant results.** The browser fuzzy matches the query against content it has already decrypted and cached. This returns r..." |
*
* @param {Demo_Narrative_Search_How_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_search_how_body = /** @type {((inputs?: Demo_Narrative_Search_How_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Search_How_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_search_how_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_search_how_body(inputs)
	return en_demo_narrative_search_how_body(inputs)
});