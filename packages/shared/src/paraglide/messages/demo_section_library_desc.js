/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Library_DescInputs */

const en_demo_section_library_desc = /** @type {(inputs: Demo_Section_Library_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The library holds articles written and organized by the organization for its own reference. Article titles, excerpts and bodies are encrypted with the organization key in the browser before storage. The server keeps each article's category, the author's account identifier, vote tallies, rating and timestamps in plaintext. The author's display name is encrypted separately. Reading requires the View knowledge base permission. [How encryption works](#deep-dive/how-encryption-works) covers the organization key.`)
};

const es_demo_section_library_desc = /** @type {(inputs: Demo_Section_Library_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La biblioteca contiene artículos escritos y organizados por la organización para su propia referencia. Los títulos, extractos y cuerpos de los artículos se cifran con la clave de la organización en el navegador antes de almacenarse. El servidor conserva la categoría, el identificador de cuenta del autor, los conteos de votos, la calificación y las marcas de tiempo de cada artículo en texto plano. El nombre visible del autor se cifra por separado. La lectura requiere el permiso Ver base de conocimiento. [Cómo funciona el cifrado](#deep-dive/how-encryption-works) trata la clave de la organización.`)
};

const en_xa2_demo_section_library_desc = /** @type {(inputs: Demo_Section_Library_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè lìbràry hòlds àrtìclès wrìttèn ànd òrgànìzèd by thè òrgànìzàtìòn fòr ìts òwn rèfèrèncè. Àrtìclè tìtlès, èxcèrpts ànd bòdìès àrè èncryptèd wìth thè òrgànìzàtìòn kèy ìn thè bròwsèr bèfòrè stòràgè. Thè sèrvèr kèèps èàch àrtìclè's càtègòry, thè àùthòr's àccòùnt ìdèntìfìèr, vòtè tàllìès, ràtìng ànd tìmèstàmps ìn plàìntèxt. Thè àùthòr's dìsplày nàmè ìs èncryptèd sèpàràtèly. Rèàdìng rèqùìrès thè Vìèw knòwlèdgè bàsè pèrmìssìòn. [Hòw èncryptìòn wòrks](#dèèp-dìvè/hòw-èncryptìòn-wòrks) còvèrs thè òrgànìzàtìòn kèy. ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The library holds articles written and organized by the organization for its own reference. Article titles, excerpts and bodies are encrypted with the organi..." |
*
* @param {Demo_Section_Library_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_section_library_desc = /** @type {((inputs?: Demo_Section_Library_DescInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Library_DescInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_section_library_desc(inputs)
	if (locale === "en-XA") return en_xa2_demo_section_library_desc(inputs)
	return en_demo_section_library_desc(inputs)
});