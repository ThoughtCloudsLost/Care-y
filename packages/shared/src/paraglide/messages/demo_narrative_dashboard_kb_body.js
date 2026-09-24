/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_Kb_BodyInputs */

const en_demo_narrative_dashboard_kb_body = /** @type {(inputs: Demo_Narrative_Dashboard_Kb_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A preview of recently updated knowledge base articles.
**Encryption.** Article titles are encrypted with the organization key. The server stores ciphertext and cannot read them. The browser decrypts titles locally.
**When it is empty.** If the library contains no articles, this section displays a notice instead.`)
};

const es_demo_narrative_dashboard_kb_body = /** @type {(inputs: Demo_Narrative_Dashboard_Kb_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una vista previa de los artículos de la base de conocimiento actualizados recientemente.
**Cifrado.** Los títulos de los artículos están cifrados con la clave de la organización. El servidor almacena texto cifrado y no puede leerlos. El navegador descifra los títulos localmente.
**Cuando está vacío.** Si la biblioteca no contiene artículos, esta sección muestra un aviso en su lugar.`)
};

const en_xa2_demo_narrative_dashboard_kb_body = /** @type {(inputs: Demo_Narrative_Dashboard_Kb_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦À prèvìèw òf rècèntly ùpdàtèd knòwlèdgè bàsè àrtìclès.
 •••••••••••••••••**Èncryptìòn. ••••** Àrtìclè tìtlès àrè èncryptèd wìth thè òrgànìzàtìòn kèy. Thè sèrvèr stòrès cìphèrtèxt ànd cànnòt rèàd thèm. Thè bròwsèr dècrypts tìtlès lòcàlly.
 ••••••••••••••••••••••••••••••••••••••••••••**Whèn ìt ìs èmpty. ••••••** Ìf thè lìbràry còntàìns nò àrtìclès, thìs sèctìòn dìsplàys à nòtìcè ìnstèàd. ••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A preview of recently updated knowledge base articles. **Encryption.** Article titles are encrypted with the organization key. The server stores ciphertext a..." |
*
* @param {Demo_Narrative_Dashboard_Kb_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_kb_body = /** @type {((inputs?: Demo_Narrative_Dashboard_Kb_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Dashboard_Kb_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_dashboard_kb_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_dashboard_kb_body(inputs)
	return en_demo_narrative_dashboard_kb_body(inputs)
});