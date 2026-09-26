/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Admin_People_DescInputs */

const en_demo_section_admin_people_desc = /** @type {(inputs: Demo_Section_Admin_People_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The people section holds the account roster, queue configuration, client records, and the role and permission matrix. Display names, queue names, and client aliases are organization-key ciphertext that the browser decrypts. Client phone numbers and email addresses are encrypted with the server's operational key, because the server needs to read them to place a call or send a message. Each destination is gated by its own permission. [How encryption works](#deep-dive/how-encryption-works) covers the organization key, and [the trust boundary](#deep-dive/the-trust-boundary) covers what the server's operational key protects.`)
};

const es_demo_section_admin_people_desc = /** @type {(inputs: Demo_Section_Admin_People_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La sección de personas reúne el directorio de usuarios, la gestión de colas, los registros de clientes y la matriz de roles y permisos. Los nombres visibles, los nombres de cola y los alias de clientes son texto cifrado con la clave de la organización que el navegador descifra. Los números de teléfono y las direcciones de correo de los clientes se cifran con la clave operativa del servidor, porque el servidor necesita leerlos para realizar una llamada o enviar un mensaje. Cada destino tiene su propio permiso. [Cómo funciona el cifrado](#deep-dive/how-encryption-works) trata la clave de la organización, y [la frontera de confianza](#deep-dive/the-trust-boundary) trata lo que protege la clave operativa del servidor.`)
};

const en_xa2_demo_section_admin_people_desc = /** @type {(inputs: Demo_Section_Admin_People_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè pèòplè sèctìòn hòlds thè àccòùnt ròstèr, qùèùè cònfìgùràtìòn, clìènt rècòrds, ànd thè ròlè ànd pèrmìssìòn màtrìx. Dìsplày nàmès, qùèùè nàmès, ànd clìènt àlìàsès àrè òrgànìzàtìòn-kèy cìphèrtèxt thàt thè bròwsèr dècrypts. Clìènt phònè nùmbèrs ànd èmàìl àddrèssès àrè èncryptèd wìth thè sèrvèr's òpèràtìònàl kèy, bècàùsè thè sèrvèr nèèds tò rèàd thèm tò plàcè à càll òr sènd à mèssàgè. Èàch dèstìnàtìòn ìs gàtèd by ìts òwn pèrmìssìòn. [Hòw èncryptìòn wòrks](#dèèp-dìvè/hòw-èncryptìòn-wòrks) còvèrs thè òrgànìzàtìòn kèy, ànd [thè trùst bòùndàry](#dèèp-dìvè/thè-trùst-bòùndàry) còvèrs whàt thè sèrvèr's òpèràtìònàl kèy pròtècts. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The people section holds the account roster, queue configuration, client records, and the role and permission matrix. Display names, queue names, and client ..." |
*
* @param {Demo_Section_Admin_People_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_section_admin_people_desc = /** @type {((inputs?: Demo_Section_Admin_People_DescInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Admin_People_DescInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_section_admin_people_desc(inputs)
	if (locale === "en-XA") return en_xa2_demo_section_admin_people_desc(inputs)
	return en_demo_section_admin_people_desc(inputs)
});