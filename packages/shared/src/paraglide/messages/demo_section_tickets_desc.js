/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Tickets_DescInputs */

const en_demo_section_tickets_desc = /** @type {(inputs: Demo_Section_Tickets_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A ticket is one client's case file. Each client has at most one open ticket. Contact on any channel (call, SMS, email, web intake form, portal message, voicemail, or internal note) appears in a [unified case thread](#ticket-detail/conversation) per ticket. A closed ticket reopens when the client makes contact again. The Tickets page lists the org's tickets and routes them through queues. Titles, descriptions, and messages are encrypted. The server stores only encrypted data and cannot read ticket content. Sorting, filtering, and searching run locally in the browser after decryption.`)
};

const es_demo_section_tickets_desc = /** @type {(inputs: Demo_Section_Tickets_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un ticket es el expediente de un cliente. Cada cliente tiene como máximo un ticket abierto. Los contactos por cualquier canal (llamada, SMS, correo electrónico, formulario web, mensaje del portal, buzón de voz o nota interna) aparecen en un [hilo de caso unificado](#ticket-detail/conversation) por ticket. Un ticket cerrado se reabre cuando el cliente vuelve a comunicarse. La página de Tickets lista los tickets de la organización y los distribuye a través de colas. Los títulos, descripciones y mensajes están cifrados. El servidor almacena solo datos cifrados y no puede leer el contenido de los tickets. La ordenación, el filtrado y la búsqueda se ejecutan localmente en el navegador tras el descifrado.`)
};

const en_xa2_demo_section_tickets_desc = /** @type {(inputs: Demo_Section_Tickets_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦À tìckèt ìs ònè clìènt's càsè fìlè. Èàch clìènt hàs àt mòst ònè òpèn tìckèt. Còntàct òn àny chànnèl (càll, SMS, èmàìl, wèb ìntàkè fòrm, pòrtàl mèssàgè, vòìcèmàìl, òr ìntèrnàl nòtè) àppèàrs ìn à [ùnìfìèd càsè thrèàd](#tìckèt-dètàìl/cònvèrsàtìòn) pèr tìckèt. À clòsèd tìckèt rèòpèns whèn thè clìènt màkès còntàct àgàìn. Thè Tìckèts pàgè lìsts thè òrg's tìckèts ànd ròùtès thèm thròùgh qùèùès. Tìtlès, dèscrìptìòns, ànd mèssàgès àrè èncryptèd. Thè sèrvèr stòrès ònly èncryptèd dàtà ànd cànnòt rèàd tìckèt còntènt. Sòrtìng, fìltèrìng, ànd sèàrchìng rùn lòcàlly ìn thè bròwsèr àftèr dècryptìòn. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A ticket is one client's case file. Each client has at most one open ticket. Contact on any channel (call, SMS, email, web intake form, portal message, voice..." |
*
* @param {Demo_Section_Tickets_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_section_tickets_desc = /** @type {((inputs?: Demo_Section_Tickets_DescInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Tickets_DescInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_section_tickets_desc(inputs)
	if (locale === "en-XA") return en_xa2_demo_section_tickets_desc(inputs)
	return en_demo_section_tickets_desc(inputs)
});